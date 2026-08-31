import { Platform } from 'react-native';
import Config from 'react-native-config';

const read = (key: string): string | undefined => {
  const value = (Config as Record<string, string | undefined>)?.[key];
  return value && value.length > 0 ? value : undefined;
};

export const ENV = {
  googleWebClientId: read('GOOGLE_WEB_CLIENT_ID'),
  googleIosClientId: read('GOOGLE_IOS_CLIENT_ID'),
  googleIosUrlScheme: read('GOOGLE_IOS_URL_SCHEME'),
  kakaoNativeAppKey: read('KAKAO_NATIVE_APP_KEY'),
};

/**
 * 현재 앱 버전. 버전 게이트(강제/권장 업데이트) 비교 기준값.
 * ⚠ 릴리즈마다 네이티브 버전과 반드시 동기화할 것:
 *   - Android: android/app/build.gradle 의 versionName
 *   - iOS: MARKETING_VERSION (codemagic 이 주입)
 * 네이티브 의존성 없이 JS 상수로 관리 → 빌드/재빌드 리스크 없음.
 */
export const APP_VERSION = '1.0.0';

/**
 * 키가 비어 있으면 해당 소셜 로그인은 비활성으로 취급한다.
 * iOS 는 iosClientId, Android 는 webClientId 로 동작한다.
 */
export const isProviderConfigured = {
  google: () =>
    Platform.OS === 'ios'
      ? !!(ENV.googleIosClientId || ENV.googleWebClientId)
      : !!ENV.googleWebClientId,
  kakao: () => !!ENV.kakaoNativeAppKey,
  apple: () => true,
};
