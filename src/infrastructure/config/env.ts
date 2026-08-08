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
