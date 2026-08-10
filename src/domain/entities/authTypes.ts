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

/** 백엔드 /app/auth/social 응답의 user 구조와 일치해야 한다 */
export interface AuthUser {
  id: string;
  nickname: string | null;
  email: string | null;
  provider: AuthProvider;
  role: AccountRole;
  activeRole?: AccountRole;
  roles?: AccountRole[];
  profileImage?: string | null;
  onboarded: boolean;
  language?: string;
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
