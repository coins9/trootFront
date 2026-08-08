const API_BASE = 'https://api.tattooroot.com/api/v1';
const TIMEOUT_MS = 8000;

export interface PublicSettings {
  kakaoChannelUrl: string;
  kakaoChannelId: string;
  supportEmail: string;
  supportHours: string;
  noticeBanner: string;
}

/** 서버 응답 전이나 실패 시에도 문의 경로가 끊기지 않도록 하는 기본값 */
export const DEFAULT_SETTINGS: PublicSettings = {
  kakaoChannelUrl: '',
  kakaoChannelId: '',
  supportEmail: 'contact@tattooroot.com',
  supportHours: '평일 10:00 ~ 18:00 (주말 · 공휴일 휴무)',
  noticeBanner: '',
};

export const fetchPublicSettings = async (): Promise<PublicSettings> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/public/settings`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) return DEFAULT_SETTINGS;

    const json = (await res.json()) as { success: boolean; data: PublicSettings };
    return json?.data ? { ...DEFAULT_SETTINGS, ...json.data } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  } finally {
    clearTimeout(timer);
  }
};
