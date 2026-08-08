import { ko, type TranslationSchema } from './locales/ko';
import { en } from './locales/en';
import type { AppLanguage } from './deviceLocale';

export { getDeviceLanguage, isKoreanDevice, SUPPORTED_LANGUAGES, FALLBACK_LANGUAGE } from './deviceLocale';
export type { AppLanguage } from './deviceLocale';

export const resources: Record<AppLanguage, TranslationSchema> = { ko, en };

// "auth.login" 처럼 중첩 키를 문자열로 안전하게 표현하기 위한 타입
type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Leaves<T[K]>}`;
}[keyof T & string];

export type TranslationKey = Leaves<TranslationSchema>;

const resolve = (lang: AppLanguage, key: string): string | undefined => {
  const parts = key.split('.');
  let node: unknown = resources[lang];
  for (const part of parts) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
};

const interpolate = (template: string, params?: Record<string, string | number>): string => {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    params[name] !== undefined ? String(params[name]) : match,
  );
};

export const translate = (
  lang: AppLanguage,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string => {
  // 선택 언어 → 한국어 → 키 자체 순으로 폴백
  const raw = resolve(lang, key) ?? resolve('ko', key) ?? key;
  return interpolate(raw, params);
};
