import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDeviceLanguage, translate, type AppLanguage, type TranslationKey,
} from '../../infrastructure/i18n';

const STORAGE_KEY = '@troot/language';
export type LanguagePreference = AppLanguage | 'system';

interface LanguageStore {
  preference: LanguagePreference;
  language: AppLanguage;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setPreference: (pref: LanguagePreference) => Promise<void>;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
}

const resolveLanguage = (pref: LanguagePreference): AppLanguage =>
  pref === 'system' ? getDeviceLanguage() : pref;

// 언어별 새 함수 참조를 만들어 useMemo deps 변경 감지를 보장
const makeTFn = (lang: AppLanguage): LanguageStore['t'] =>
  (key, params) => translate(lang, key as TranslationKey, params);

const initialLang = getDeviceLanguage();

export const useLanguageStore = create<LanguageStore>((set) => ({
  preference: 'system',
  language: initialLang,
  isHydrated: false,
  t: makeTFn(initialLang),

  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const pref: LanguagePreference =
        saved === 'ko' || saved === 'en' ? saved : 'system';
      const lang = resolveLanguage(pref);
      set({ preference: pref, language: lang, t: makeTFn(lang), isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  setPreference: async (pref) => {
    const lang = resolveLanguage(pref);
    set({ preference: pref, language: lang, t: makeTFn(lang) });
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
}));

/** 컴포넌트에서 t()와 현재 언어를 함께 구독 */
export const useTranslation = () => {
  const language = useLanguageStore((s) => s.language);
  const t = useLanguageStore((s) => s.t);
  return { t, language };
};
