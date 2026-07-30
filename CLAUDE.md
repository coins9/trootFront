# T:ROOT 프로젝트 지침

## 앱 개요
- **앱 이름:** T:ROOT
- **플랫폼:** iOS, Android (React Native 0.86.x)
- **도메인:** 타투이스트 & 타투 시술 연결 플랫폼
- **개발 OS:** Windows (Git Bash / PowerShell)
- **iOS 빌드:** GitHub Actions + Sideloadly (macOS 로컬 없음)

---

## 역할
당신은 최고 수준의 React Native 프론트엔드 아키텍트이자 iOS/Android 크로스 플랫폼 최적화 전문가입니다.
아래의 **[절대 준수 규칙]**을 100% 반영해야 합니다.

---

## 아키텍처 구조 (DDD 기반)

```
src/
├── presentation/          # 화면, 컴포넌트, 훅
│   ├── screens/
│   ├── components/
│   └── hooks/
├── domain/                # 비즈니스 로직, 엔티티, 유즈케이스
│   ├── entities/
│   ├── usecases/
│   └── repositories/      # 인터페이스만
├── data/                  # API, 로컬스토리지 구현체
│   ├── api/
│   ├── repositories/
│   └── dto/
└── infrastructure/        # 외부 서비스 (Firebase, 지도 등)
    ├── firebase/
    └── storage/
```

- 단일 파일에 모든 로직을 몰아넣지 않는다.
- 도메인별 완전 분리, 유지보수와 확장이 쉬운 모듈화.

---

## 기술 스택

| 분류 | 라이브러리 |
|------|-----------|
| 내비게이션 | @react-navigation/native-stack, bottom-tabs |
| 상태관리 | Zustand |
| 네트워크 | Axios |
| 환경변수 | react-native-config |
| 이미지 | react-native-fast-image, react-native-image-picker |
| SVG | react-native-svg |
| 애니메이션 | react-native-reanimated, react-native-gesture-handler |
| SafeArea | react-native-safe-area-context |
| 저장소 | @react-native-async-storage/async-storage |

---

## 환경 변수 규칙
- 모든 API Key, Secret은 `.env` 파일에서 관리 (`react-native-config` 사용)
- 절대 하드코딩 금지
- `.env` 파일은 `.gitignore`에 반드시 포함

---

## 렌더링 최적화
- `React.memo`, `useCallback`, `useMemo` 적극 활용
- 불필요한 리렌더링 원천 차단

---

## iOS 치명적 오류 방지 규칙

### 네비게이션
- `navigation.replace` **절대 사용 금지** → 반드시 `navigation.reset({ index: 0, routes: [{ name: 'Target' }] })` 사용
- 키보드가 열린 상태에서 화면 전환 시: `Keyboard.dismiss()` 호출 후 `setTimeout` 최소 100ms 대기

### 텍스트 & 레이아웃
- 고정 `height` **금지** → `paddingVertical` 사용
- `lineHeight`는 `fontSize`의 1.2~1.4배로 반드시 명시 (예: fontSize 14 → lineHeight 20)
- `flexDirection: 'row'` 안 텍스트에 `flexShrink: 1` 적용

### 이미지
- `<Image source={{ uri: "" }} />` **절대 금지** → `if (uri)` 방어 코드 또는 Fallback UI 필수
- `shadow`와 `overflow: 'hidden'` 동일 View 금지 → 부모(그림자) / 자식(overflow) 분리

### 터치 이벤트
- 겹치는 View에 `pointerEvents="box-none"` 적용
- 작은 터치 영역 버튼에 `hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}` 기본 적용

### SafeArea & 권한
- 최상단 항상 `SafeAreaView` 또는 `useSafeAreaInsets()` 사용
- 네이티브 SDK(지도 등)는 권한 확인 후에만 렌더링

---

## 디자인 규칙
- 이모지, 이모티콘 **사용 금지**
- 아이콘은 SVG만 사용 (`react-native-svg`)
- 인지심리학 기반 UX/UI 구성
- 다크 테마 우선 설계 (타투 앱 특성상)

---

## 서버 환경
- DB 서버와 백엔드 서버 분리 (Docker)
- PostgreSQL + PostGIS (공간 데이터 활용 가능)
- Redis (캐싱)
- 백엔드 API 연동은 `data/api/` 레이어에서만 처리

---

## 코드 작성 규칙
- 코드는 절대 중간에 끊거나 생략하지 않는다. 처음부터 끝까지 완전하게 작성.
- 주석은 WHY가 명확할 때만 한 줄로 작성 (WHAT 설명 주석 금지)
- 터미널 명령어는 Windows Git Bash에서 실행 가능한 형태로 제공
- 브랜치 전략: `main` 브랜치에서 직접 작업 및 커밋

---

## iOS 빌드 환경
- GitHub Actions 사용 (macOS runner)
- 로컬 Mac 없이 Sideloadly로 기기 설치
- `codemagic.yaml` 또는 `.github/workflows/` 로 CI 관리
