import { Platform } from 'react-native';
import Config from 'react-native-config';
import { GENERATED_APP_VERSION } from './appVersion.generated';

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
 * 현재 앱 버전 — 버전 게이트(강제/권장 업데이트) 비교 기준값.
 *
 * 단일 관리 지점 = package.json "version".
 *  - 빌드 시 scripts/gen-version.cjs 가 그 값을 appVersion.generated.ts 로 주입한다.
 *  - Codemagic 이 같은 값으로 네이티브 MARKETING_VERSION 도 설정한다.
 * → 릴리즈 때 package.json version 만 올리면 앱 버전·스토어 버전이 함께 갱신되어
 *   APP_VERSION 을 손으로 올리다 빠뜨리는 실수(무한 업데이트 루프)를 없앤다.
 *
 * 형식이 이상하면(예: 빈 값) 게이트 오작동을 막기 위해 '1.0.0' 로 폴백한다.
 */
export const APP_VERSION = /^\d+(\.\d+)*$/.test(GENERATED_APP_VERSION)
  ? GENERATED_APP_VERSION
  : '1.0.0';

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
