const API_BASE = 'https://api.tattooroot.com/api/v1';
const TIMEOUT_MS = 8000;

export interface PublicSettings {
  kakaoChannelUrl: string;
  kakaoChannelId: string;
  supportEmail: string;
  supportHours: string;
  noticeBanner: string;
  /** 왈라(Walla) 링크아웃 배너 — 비면 앱 내부 등록으로 폴백 */
  bannerBeginnerUrl: string;
  bannerSupplyUrl: string;
  bannerMediaUrl: string;
  bannerBoothUrl: string;
  /** 타투이스트 광고/입점 문의 배너 링크 (AdStats 프로모 배너 2종) */
  adInquiryUrl: string;
  partnerInquiryUrl: string;
  /** 홈 상단 루트 배너 (관리자 편집) */
  homeBannerTitle: string;
  homeBannerSubtitle: string;
  homeBannerUrl: string;
  homeBannerImage: string;
  /** 샵&매칭 탭별 배너 이미지 */
  shopBoothBannerImage: string;
  shopBoothBannerUrl: string;
  shopModelBannerImage: string;
  shopModelBannerUrl: string;
  shopMediaBannerImage: string;
  shopMediaBannerUrl: string;
  /** 용품샵 배너 */
  suppliesBannerImage: string;
  suppliesBannerUrl: string;
}

/** 서버 응답 전이나 실패 시에도 문의 경로가 끊기지 않도록 하는 기본값 */
export const DEFAULT_SETTINGS: PublicSettings = {
  kakaoChannelUrl: '',
  kakaoChannelId: '',
  supportEmail: 'contact@tattooroot.com',
  supportHours: '평일 10:00 ~ 18:00 (주말 · 공휴일 휴무)',
  noticeBanner: '',
  bannerBeginnerUrl: '',
  bannerSupplyUrl: '',
  bannerMediaUrl: '',
  bannerBoothUrl: '',
  // 관리자 미설정 시 현행 폼(Tally)으로 폴백
  adInquiryUrl: 'https://tally.so/r/troot-ads',
  partnerInquiryUrl: 'https://tally.so/r/troot-ads',
  homeBannerTitle: '',
  homeBannerSubtitle: '',
  homeBannerUrl: '',
  homeBannerImage: '',
  shopBoothBannerImage: '',
  shopBoothBannerUrl: '',
  shopModelBannerImage: '',
  shopModelBannerUrl: '',
  shopMediaBannerImage: '',
  shopMediaBannerUrl: '',
  suppliesBannerImage: '',
  suppliesBannerUrl: '',
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
