import { NativeModules, Platform } from 'react-native';

export type AppLanguage = 'ko' | 'en';
export const SUPPORTED_LANGUAGES: AppLanguage[] = ['ko', 'en'];
export const FALLBACK_LANGUAGE: AppLanguage = 'en';

const normalize = (raw?: string | null): AppLanguage | null => {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.startsWith('ko')) return 'ko';
  if (lower.startsWith('en')) return 'en';
  return null;
};

// Hermes Intl → NativeModules 순으로 시도. 네이티브 의존성 없이 기기 언어를 읽는다.
const readRawLocale = (): string | null => {
  try {
    const intlLocale = Intl?.DateTimeFormat?.().resolvedOptions?.().locale;
    if (intlLocale) return intlLocale;
  } catch {
    // Intl 미지원 런타임 → NativeModules fallback
  }

  try {
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      return settings?.AppleLocale ?? settings?.AppleLanguages?.[0] ?? null;
    }
    return NativeModules.I18nManager?.localeIdentifier ?? null;
  } catch {
    return null;
  }
};

export const getDeviceLanguage = (): AppLanguage =>
  normalize(readRawLocale()) ?? FALLBACK_LANGUAGE;

export const isKoreanDevice = (): boolean => getDeviceLanguage() === 'ko';
