import type { AppLanguage } from '../../infrastructure/i18n';

export type DocumentSlug =
  | 'privacy-policy'
  | 'terms-of-service'
  | 'account-deletion'
  | 'community-guidelines'
  | 'safety-policy'
  | 'youth-policy'
  | 'support';

export interface LegalDocument {
  slug: DocumentSlug;
  locale: AppLanguage;
  title: string;
  body: string;
  version: number;
  effectiveAt: string | null;
  updatedAt: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

const API_BASE = 'https://api.tattooroot.com/api/v1';
const TIMEOUT_MS = 8000;

/** 웹사이트에서도 동일한 문서를 노출하므로 앱 내 링크로 대체 가능 */
export const WEB_LEGAL_URL = (slug: DocumentSlug) => `https://tattooroot.com/legal/${slug}`;

/**
 * 약관·정책 문서 조회.
 * 실패 시 null 을 반환하고, 화면은 웹 링크로 폴백하도록 한다.
 */
export const fetchLegalDocument = async (
  slug: DocumentSlug,
  lang: AppLanguage,
): Promise<LegalDocument | null> => {
  // RN 런타임에는 AbortSignal.timeout 이 없어 직접 타이머로 중단시킨다
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/public/contents/${slug}?lang=${lang}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const json = (await res.json()) as ApiEnvelope<LegalDocument>;
    return json?.data?.body ? json.data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};
