# T:ROOT iOS 홈 위젯 (T14)

오늘·다가오는 예약을 홈 화면 위젯(작은/중간 크기)으로 보여주고, 탭하면 앱의 예약 관리로 이동합니다.

## 동작 구조
```
RN(예약 관리 화면) --syncWidget()--> WidgetBridge(네이티브) --write--> App Group UserDefaults
                                                                          │
                                                          TRootWidget(WidgetKit) --read--> 렌더
탭(troot://calendar) --> App.tsx Linking --> ArtistReservation 화면
```
- 위젯은 네트워크/인증을 하지 않습니다. 앱이 로케일에 맞춰 만든 일정 스냅샷(JSON)만 읽습니다.
- 데이터 갱신: 타투이스트가 **예약 관리 화면을 열 때** 최신 일정으로 위젯을 새로고침합니다.

## 파일
- `ios/TRootWidget/TRootWidget.swift` — 위젯(TimelineProvider + SwiftUI)
- `ios/TRootWidget/Info.plist`, `TRootWidget.entitlements` — 확장 설정 + App Group
- `ios/TRootApp/WidgetBridge.swift` / `.m` — RN→App Group 네이티브 브리지
- `src/infrastructure/widget/widgetSync.ts` — RN 래퍼(위젯 미포함 빌드/안드로이드에서 무해하게 무시)
- `ios/scripts/add_widget_target.rb` — 빌드 시 Xcode 프로젝트에 위젯 타깃을 주입(멱등·비파괴)

## 안전장치 (중요)
- 기본적으로 위젯은 **빌드에 포함되지 않습니다.** `codemagic.yaml` 의 주입 단계는 `ENABLE_WIDGET=true` 일 때만 실행됩니다.
- 주입 스크립트는 실패해도 `project.save` 를 하지 않고 `exit 0` → **메인 앱은 항상 정상 빌드**(위젯만 빠짐).
- RN 쪽도 네이티브 모듈이 없으면 아무 것도 하지 않습니다. → 위젯 미포함 빌드에 영향 0.

## 활성화 방법 (직접 해야 하는 부분)
아래 3개는 Apple/Codemagic 계정 권한이 필요해 코드로 대신할 수 없습니다.

### 1) Apple Developer 포털
- **App Groups** 에 `group.com.troot.app` 생성.
- 메인 App ID `com.troot.app` 편집 → App Groups 활성화 → 위 그룹 포함.
- 새 App ID `com.troot.app.TRootWidget` 생성 → App Groups 활성화 → 위 그룹 포함.
- 두 App ID의 **프로비저닝 프로파일 재생성**(App Group 반영).

### 2) Codemagic
- iOS 워크플로우 환경변수에 `ENABLE_WIDGET = true` 추가.
- TestFlight 워크플로우는 위젯 프로파일(`com.troot.app.TRootWidget`)도 자동으로 가져오도록 이미 수정돼 있습니다(포털 설정만 되어 있으면 됨).

### 3) 빌드·확인
- Codemagic로 재빌드 → TestFlight 설치 → 홈 화면 위젯 추가에서 "T:ROOT 일정" 선택.
- 예약 관리 화면을 한 번 열면 위젯에 오늘/다가오는 일정이 채워집니다.

## 되돌리기
- `ENABLE_WIDGET` 을 지우면(또는 false) 다음 빌드부터 위젯이 빠지고 메인 앱만 빌드됩니다. 코드 롤백 불필요.

## 검증 상태(정직)
- 소스·설정·자동화는 모두 작성했으나, 이 개발 환경에는 macOS/Xcode가 없어 **Swift 컴파일·위젯 런타임은 여기서 검증하지 못했습니다.** 최초 활성 빌드에서 온디바이스 확인이 필요합니다.
