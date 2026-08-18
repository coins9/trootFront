import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWith, signOutSocial } from '../../data/auth/socialAuth';
import {
  SocialAuthCancelled, type AuthProvider, type AuthSession, type AccountRole,
} from '../../domain/entities/authTypes';
import { adaptyService } from '../../infrastructure/adapty/adaptyService';
import { logNet } from '../../infrastructure/debug/netLog';

const SESSION_KEY = '@troot/session';
const API_BASE = 'https://api.tattooroot.com/api/v1';
const TIMEOUT_MS = 15_000;

interface AuthStore {
  session: AuthSession | null;
  isHydrated: boolean;
  pendingProvider: AuthProvider | null;
  hydrate: () => Promise<void>;
  loginWith: (provider: AuthProvider) => Promise<{ isNewUser: boolean }>;
  completeOnboarding: (nickname: string, role: AccountRole) => Promise<void>;
  /** 역할 승격 후 새 토큰으로 세션 갱신 */
  refresh: () => Promise<void>;
  /** 토큰 갱신 결과 반영 (api 클라이언트가 호출) */
  applyTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  /** 갱신 실패 시 세션 폐기 */
  forceLogout: () => Promise<void>;
  logout: () => Promise<void>;
}

const persist = async (session: AuthSession | null) => {
  if (session) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else await AsyncStorage.removeItem(SESSION_KEY);
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  isHydrated: false,
  pendingProvider: null,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      set({ session: raw ? (JSON.parse(raw) as AuthSession) : null, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  loginWith: async (provider) => {
    set({ pendingProvider: provider });
    try {
      const credential = await signInWith(provider);

      // 소셜 토큰을 백엔드가 검증하고 자체 세션을 발급한다
      const reqBody = JSON.stringify({ provider, token: credential.token });
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const started = Date.now();

      let res: Response;
      try {
        res = await fetch(`${API_BASE}/app/auth/social`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: reqBody,
          signal: controller.signal,
        });
      } catch (cause) {
        logNet({
          method: 'POST', path: '/app/auth/social', status: 0, ok: false,
          durationMs: Date.now() - started, errorCode: 'NETWORK_ERROR',
          reqBody, resBody: String(cause),
        });
        throw new Error('NETWORK_ERROR');
      } finally {
        clearTimeout(timer);
      }

      const json = (await res.json().catch(() => null)) as
        | { success: true; data: AuthSession }
        | { success: false; error: { code: string; message: string; details?: unknown } }
        | null;

      const errorCode = (json as { error?: { code?: string } } | null)?.error?.code;

      if (!res.ok || !json || json.success === false) {
        logNet({
          method: 'POST', path: '/app/auth/social', status: res.status, ok: false,
          durationMs: Date.now() - started, errorCode,
          reqBody, resBody: json,
        });
        throw new Error(errorCode ?? 'SOCIAL_LOGIN_FAILED');
      }

      logNet({
        method: 'POST', path: '/app/auth/social', status: res.status, ok: true,
        durationMs: Date.now() - started, reqBody,
      });

      const session = json.data;
      await persist(session);
      set({ session });
      // 구독이 기기가 아닌 계정에 귀속되도록 Adapty에 userId 연결
      adaptyService.identify(session.user.id).catch(() => {});
      // nickname이 있으면 기존 회원 — onboarded 플래그가 DB에 미갱신된 경우 대비
      return { isNewUser: !session.user.onboarded && !session.user.nickname };
    } finally {
      set({ pendingProvider: null });
    }
  },

  completeOnboarding: async (nickname, role) => {
    const current = get().session;
    if (!current) return;

    const res = await fetch(`${API_BASE}/app/users/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${current.accessToken}`,
      },
      body: JSON.stringify({ nickname, role }),
    });

    const json = (await res.json().catch(() => null)) as
      | { success: true; data: { nickname: string; activeRole: AccountRole } }
      | { success: false; error: { code: string } }
      | null;

    if (!res.ok || !json || json.success === false) {
      throw new Error(
        (json as { error?: { code?: string } } | null)?.error?.code ?? 'ONBOARDING_FAILED',
      );
    }

    const session: AuthSession = {
      ...current,
      user: { ...current.user, nickname, role, onboarded: true },
    };
    await persist(session);
    set({ session });
  },

  refresh: async () => {
    const current = get().session;
    if (!current) return;
    try {
      const res = await fetch(`${API_BASE}/app/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });
      const json = (await res.json().catch(() => null)) as
        | { success: true; data: AuthSession }
        | { success: false }
        | null;
      if (!res.ok || !json || json.success === false) return;
      await persist(json.data);
      set({ session: json.data });
    } catch { /* 실패해도 기존 세션 유지 */ }
  },

  applyTokens: async (accessToken, refreshToken) => {
    const current = get().session;
    if (!current) return;

    const session: AuthSession = { ...current, accessToken, refreshToken };
    await persist(session);
    set({ session });
  },

  forceLogout: async () => {
    await persist(null);
    set({ session: null });
  },

  logout: async () => {
    const session = get().session;
    if (session) {
      // 서버 리프레시 토큰 폐기 — 실패해도 로컬 로그아웃은 진행한다
      await fetch(`${API_BASE}/app/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      }).catch(() => undefined);

      await signOutSocial(session.user.provider);
      adaptyService.logout().catch(() => {});
    }
    await persist(null);
    set({ session: null });
  },
}));

export { SocialAuthCancelled };
