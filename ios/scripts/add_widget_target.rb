#!/usr/bin/env ruby
# frozen_string_literal: true
#
# T14 홈 위젯 타깃을 Xcode 프로젝트에 주입한다(빌드 시점, Codemagic Mac에서 실행).
#
# 안전 설계:
#  - 이 스크립트는 ENABLE_WIDGET=true 일 때만 codemagic 에서 호출된다.
#  - Xcodeproj 변경은 project.save 전까지 메모리에만 존재하므로, 도중 예외가 나면
#    아무 것도 저장하지 않고 exit 0 → 메인 앱은 평소대로 빌드된다(위젯만 빠짐).
#  - 리포에 커밋된 pbxproj 는 손대지 않는다(CI 워크스페이스에서만 변형).
#
# 요구: gem 'xcodeproj' (CocoaPods 의존성이라 Codemagic Mac 에 기본 설치됨).

require 'xcodeproj'

MAIN         = 'TRootApp'
WIDGET       = 'TRootWidget'
GROUP_ID     = 'group.com.troot.app'
WIDGET_BUNDLE = 'com.troot.app.TRootWidget'
IOS_MIN      = '15.1'

ios_dir      = File.expand_path('..', __dir__)                    # .../ios
project_path = File.join(ios_dir, "#{MAIN}.xcodeproj")
main_ent     = File.join(ios_dir, MAIN, "#{MAIN}.entitlements")

begin
  project = Xcodeproj::Project.open(project_path)
  main_target = project.targets.find { |t| t.name == MAIN }
  raise "main target #{MAIN} not found" unless main_target

  if project.targets.any? { |t| t.name == WIDGET }
    puts "[widget] '#{WIDGET}' target already present — skipping injection"
    exit 0
  end

  # 절대 경로로 참조를 만들면 xcodeproj 가 그룹 기준 상대경로/소스트리를 알아서 계산한다.
  ref = lambda { |rel| project.main_group.new_reference(File.join(ios_dir, rel)) }

  # 1) 위젯 확장 타깃 생성
  widget_target = project.new_target(:app_extension, WIDGET, :ios, IOS_MIN)

  # 2) 위젯 소스/plist/entitlements 파일 참조
  swift_ref = ref.call("#{WIDGET}/#{WIDGET}.swift")
  ref.call("#{WIDGET}/Info.plist")
  ref.call("#{WIDGET}/#{WIDGET}.entitlements")
  widget_target.add_file_references([swift_ref])

  # 3) 위젯 빌드 설정
  widget_target.build_configurations.each do |config|
    bs = config.build_settings
    bs['INFOPLIST_FILE'] = "#{WIDGET}/Info.plist"
    bs['GENERATE_INFOPLIST_FILE'] = 'NO'
    bs['PRODUCT_BUNDLE_IDENTIFIER'] = WIDGET_BUNDLE
    bs['PRODUCT_NAME'] = '$(TARGET_NAME)'
    bs['CODE_SIGN_ENTITLEMENTS'] = "#{WIDGET}/#{WIDGET}.entitlements"
    bs['IPHONEOS_DEPLOYMENT_TARGET'] = IOS_MIN
    bs['SWIFT_VERSION'] = '5.0'
    bs['TARGETED_DEVICE_FAMILY'] = '1,2'
    bs['SKIP_INSTALL'] = 'YES'
    bs['CURRENT_PROJECT_VERSION'] = '1'
    bs['MARKETING_VERSION'] = '1.0'
    bs['CLANG_ENABLE_MODULES'] = 'YES'
    bs['LD_RUNPATH_SEARCH_PATHS'] = [
      '$(inherited)', '@executable_path/Frameworks', '@executable_path/../../Frameworks'
    ]
  end

  # 4) 네이티브 브리지(WidgetBridge)를 메인 타깃 소스에 추가
  bridge_swift = ref.call("#{MAIN}/WidgetBridge.swift")
  bridge_m     = ref.call("#{MAIN}/WidgetBridge.m")
  main_target.add_file_references([bridge_swift, bridge_m])

  # 5) 메인 앱 entitlements 에 App Group 추가(멱등)
  ent = (File.exist?(main_ent) ? Xcodeproj::Plist.read_from_path(main_ent) : nil) || {}
  groups = ent['com.apple.security.application-groups'] || []
  ent['com.apple.security.application-groups'] = (groups + [GROUP_ID]).uniq
  Xcodeproj::Plist.write_to_path(ent, main_ent)

  # 6) 위젯을 메인 앱에 임베드(Embed App Extensions) + 의존성
  main_target.add_dependency(widget_target)
  embed = main_target.copy_files_build_phases.find { |ph| ph.symbol_dst_subfolder_spec == :plug_ins }
  unless embed
    embed = main_target.new_copy_files_build_phase('Embed App Extensions')
    embed.symbol_dst_subfolder_spec = :plug_ins
  end
  unless embed.files_references.include?(widget_target.product_reference)
    bf = embed.add_file_reference(widget_target.product_reference)
    bf.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
  end

  project.save
  puts "[widget] injected '#{WIDGET}' target + WidgetBridge + App Group #{GROUP_ID}"
rescue => e
  # 실패 시 아무 것도 저장하지 않았으므로 프로젝트는 원본 그대로 → 메인 앱 빌드는 정상.
  warn "[widget] injection skipped (non-fatal): #{e.class}: #{e.message}"
  exit 0
end
