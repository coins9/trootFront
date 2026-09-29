import Foundation
import WidgetKit

// RN(JS) → App Group UserDefaults 로 위젯 일정 스냅샷을 저장하고 위젯을 새로고침한다.
// 프로미스/React 타입을 쓰지 않아 브리징 헤더가 필요 없다(설치 표면 최소화).
@objc(WidgetBridge)
class WidgetBridge: NSObject {
  private let appGroupId = "group.com.troot.app"
  private let scheduleKey = "widgetSchedule"

  @objc static func requiresMainQueueSetup() -> Bool { false }

  /// json: WidgetSchedule 형태의 문자열(JSON). 위젯이 그대로 디코드해 렌더한다.
  @objc(setSchedule:)
  func setSchedule(_ json: NSString) {
    guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
    defaults.set(json as String, forKey: scheduleKey)
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }

  /// 로그아웃 등에서 위젯 데이터를 비운다.
  @objc(clear)
  func clear() {
    guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
    defaults.removeObject(forKey: scheduleKey)
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}
