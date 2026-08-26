import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDeviceLanguage, translate, type AppLanguage, type TranslationKey,
} from '../../infrastructure/i18n';

const STORAGE_KEY = '@troot/language';
// 'system' = 저장된 선택 없음 → 기기 언어를 따라간다
export type LanguagePreference = AppLanguage | 'system';

interface LanguageStore {
  preference: LanguagePreference;
  language: AppLanguage;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setPreference: (pref: LanguagePreference) => Promise<void>;
  // TranslationKey union is large → widen to string so call-sites don't need `as any`.
  // The underlying translate() still falls back gracefully for unknown keys.
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
}

const resolveLanguage = (pref: LanguagePreference): AppLanguage =>
  pref === 'system' ? getDeviceLanguage() : pref;

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  preference: 'system',
  language: getDeviceLanguage(),
  isHydrated: false,

  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const pref: LanguagePreference =
        saved === 'ko' || saved === 'en' ? saved : 'system';
      set({ preference: pref, language: resolveLanguage(pref), isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  setPreference: async (pref) => {
    set({ preference: pref, language: resolveLanguage(pref) });
    try {
      if (pref === 'system') {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, pref);
      }
    } catch {
      // 저장 실패해도 이번 세션 언어는 유지
    }
  },

  t: (key, params) => translate(get().language, key as TranslationKey, params),
}));

/** 컴포넌트에서 t()와 현재 언어를 함께 구독 */
export const useTranslation = () => {
  const language = useLanguageStore((s) => s.language);
  const t = useLanguageStore((s) => s.t);
  return { t, language };
};
