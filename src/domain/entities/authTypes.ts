export type AuthProvider = 'kakao' | 'google' | 'apple';

export type AccountRole = 'USER' | 'TATTOOIST';

export interface SocialCredential {
  provider: AuthProvider;
  /** 백엔드에 넘겨 검증할 토큰 (Apple은 identityToken) */
  token: string;
  /** Apple은 최초 1회만 내려주므로 즉시 저장 필요 */
  email?: string;
  displayName?: string;
  providerUserId?: string;
}

export interface AuthUser {
  id: string;
  nickname: string;
  email?: string;
  provider: AuthProvider;
  role: AccountRole;
  profileImage?: string;
  isNewUser: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export class SocialAuthCancelled extends Error {
  constructor() {
    super('SOCIAL_AUTH_CANCELLED');
    this.name = 'SocialAuthCancelled';
  }
}

export const PROVIDER_LABEL_KEY: Record<AuthProvider, string> = {
  kakao: 'auth.providerKakao',
  google: 'auth.providerGoogle',
  apple: 'auth.providerApple',
};
