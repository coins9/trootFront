import { Platform } from 'react-native';
import { login as kakaoLogin, logout as kakaoLogout } from '@react-native-seoul/kakao-login';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import {
  SocialAuthCancelled, type AuthProvider, type SocialCredential,
} from '../../domain/entities/authTypes';

/**
 * 네이티브 SDK 초기화. App 진입 시 1회 호출.
 * 키는 .env(react-native-config)에서 주입 — 하드코딩 금지.
 */
export const initSocialAuth = (config: {
  googleWebClientId?: string;
  googleIosClientId?: string;
}) => {
  // iOS 는 iosClientId 만으로도 동작하므로 둘 중 하나라도 있으면 설정한다.
  if (config.googleWebClientId || config.googleIosClientId) {
    GoogleSignin.configure({
      webClientId: config.googleWebClientId,
      iosClientId: config.googleIosClientId,
      // 서버에서 토큰 갱신이 필요할 때만 유효 (webClientId 필수)
      offlineAccess: !!config.googleWebClientId,
    });
  }
};

const isCancelled = (e: unknown): boolean => {
  const msg = String((e as Error)?.message ?? '').toLowerCase();
  const code = String((e as { code?: string | number })?.code ?? '');
  const codeLower = code.toLowerCase();
  return (
    msg.includes('cancel') ||
    msg.includes('user_cancel') ||
    codeLower.includes('cancel') ||
    // iOS KakaoSDK 취소 코드
    code === '-5' ||
    code === '1001' ||
    // Android KakaoSDK 취소 코드
    code === 'E_KAKAO_AUTH' && msg.includes('cancel')
  );
};

const signInKakao = async (): Promise<SocialCredential> => {
  const res = await kakaoLogin();
  return { provider: 'kakao', token: res.accessToken };
};

const signInGoogle = async (): Promise<SocialCredential> => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const res = await GoogleSignin.signIn();
  const idToken = (res as { data?: { idToken?: string } }).data?.idToken;
  if (!idToken) throw new SocialAuthCancelled();
  const user = (res as { data?: { user?: { email?: string; name?: string; id?: string } } }).data?.user;
  return {
    provider: 'google',
    token: idToken,
    email: user?.email,
    displayName: user?.name ?? undefined,
    providerUserId: user?.id,
  };
};

const signInApple = async (): Promise<SocialCredential> => {
  if (Platform.OS !== 'ios') throw new Error('APPLE_IOS_ONLY');

  const res = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });
  if (!res.identityToken) throw new SocialAuthCancelled();

  // Apple은 이름/이메일을 최초 로그인 1회만 제공한다.
  const fullName = [res.fullName?.familyName, res.fullName?.givenName]
    .filter(Boolean)
    .join('');

  return {
    provider: 'apple',
    token: res.identityToken,
    email: res.email ?? undefined,
    displayName: fullName || undefined,
    providerUserId: res.user,
  };
};

export const signInWith = async (provider: AuthProvider): Promise<SocialCredential> => {
  try {
    switch (provider) {
      case 'kakao': return await signInKakao();
      case 'google': return await signInGoogle();
      case 'apple': return await signInApple();
    }
  } catch (e) {
    if (e instanceof SocialAuthCancelled) throw e;
    if (isCancelled(e)) throw new SocialAuthCancelled();
    throw e;
  }
};

export const signOutSocial = async (provider: AuthProvider): Promise<void> => {
  try {
    if (provider === 'kakao') await kakaoLogout();
    if (provider === 'google') await GoogleSignin.signOut();
    // Apple은 앱 측 로그아웃 API가 없다 — 세션 토큰만 폐기
  } catch {
    // 소셜 세션 해제 실패는 앱 로그아웃을 막지 않는다
  }
};

export const isAppleSignInSupported = (): boolean =>
  Platform.OS === 'ios' && appleAuth.isSupported;
