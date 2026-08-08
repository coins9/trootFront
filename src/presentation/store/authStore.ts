import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWith, signOutSocial } from '../../data/auth/socialAuth';
import {
  SocialAuthCancelled, type AuthProvider, type AuthSession, type AuthUser, type AccountRole,
} from '../../domain/entities/authTypes';

const SESSION_KEY = '@troot/session';

interface AuthStore {
  session: AuthSession | null;
  isHydrated: boolean;
  pendingProvider: AuthProvider | null;
  hydrate: () => Promise<void>;
  loginWith: (provider: AuthProvider) => Promise<{ isNewUser: boolean }>;
  completeOnboarding: (nickname: string, role: AccountRole) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * 백엔드 연동 전 임시 세션 발급.
 * TODO: data/api/authApi.ts 의 POST /auth/social 로 교체 (credential.token 검증)
 */
const mockExchange = (
  provider: AuthProvider,
  displayName?: string,
  email?: string,
): AuthSession => {
  const user: AuthUser = {
    id: `${provider}_${Date.now()}`,
    nickname: displayName ?? '',
    email,
    provider,
    role: 'USER',
    isNewUser: true,
  };
  return { accessToken: `mock_${provider}_access`, refreshToken: `mock_${provider}_refresh`, user };
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
      const session = mockExchange(provider, credential.displayName, credential.email);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      set({ session });
      return { isNewUser: session.user.isNewUser };
    } finally {
      set({ pendingProvider: null });
    }
  },

  completeOnboarding: async (nickname, role) => {
    const current = get().session;
    if (!current) return;
    const session: AuthSession = {
      ...current,
      user: { ...current.user, nickname, role, isNewUser: false },
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    set({ session });
  },

  logout: async () => {
    const provider = get().session?.user.provider;
    if (provider) await signOutSocial(provider);
    await AsyncStorage.removeItem(SESSION_KEY);
    set({ session: null });
  },
}));

export { SocialAuthCancelled };
