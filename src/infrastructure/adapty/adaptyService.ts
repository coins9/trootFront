import { adapty, AdaptyPaywall } from 'react-native-adapty';

type AdaptyProduct = any;

const ADAPTY_PUBLIC_KEY = 'public_live_YLLFYbPA.g4p8MsY3aNxee3Ustser';

/** Adapty 대시보드에서 생성할 페이월 ID */
const PAYWALL_ID = 'troot_pro_paywall';

/** Adapty Access Level ID */
const ACCESS_LEVEL = 'premium';

export interface TrootProduct {
  productId: string;
  title: string;
  localizedPrice: string;
  price: number;
  currencyCode: string;
  _raw: AdaptyProduct;
}

export interface TrootSubscriptionStatus {
  isActive: boolean;
  expiresAt: Date | null;
  productId: string | null;
}

export const activateAdapty = async (): Promise<void> => {
  try {
    await adapty.activate(ADAPTY_PUBLIC_KEY);
  } catch {
    // 이미 초기화된 경우 무시
  }
};

export const adaptyService = {
  /** 로그인 후 호출 — 구독이 계정에 귀속되도록 연결 */
  async identify(userId: string): Promise<void> {
    await adapty.identify(String(userId));
  },

  /** 로그아웃 시 호출 */
  async logout(): Promise<void> {
    await adapty.logout();
  },

  /** 현재 구독 상태 확인 */
  async getSubscriptionStatus(): Promise<TrootSubscriptionStatus> {
    const profile = await adapty.getProfile();
    const level = profile.accessLevels?.[ACCESS_LEVEL];
    const rawProductId = level?.vendorProductId ?? null;
    // Android: "troot_pro_1m:base-1m" → 콜론 앞만 추출
    const productId = rawProductId ? rawProductId.split(':')[0] : null;

    return {
      isActive: level?.isActive ?? false,
      expiresAt: level?.expiresAt ? new Date(level.expiresAt) : null,
      productId,
    };
  },

  /** 페이월 상품 목록 로드 */
  async getProducts(): Promise<TrootProduct[]> {
    const paywall: AdaptyPaywall = await adapty.getPaywall(PAYWALL_ID);
    const products: AdaptyProduct[] = await adapty.getPaywallProducts(paywall);

    return products.map((p) => ({
      productId: p.vendorProductId,
      title: p.localizedTitle ?? p.vendorProductId,
      localizedPrice: p.price?.localizedString ?? '',
      price: p.price?.amount ?? 0,
      currencyCode: p.price?.currencyCode ?? '',
      _raw: p,
    }));
  },

  /** 구매 실행 */
  async purchase(product: TrootProduct): Promise<{ isActive: boolean }> {
    const result = await adapty.makePurchase(product._raw);
    const profile = (result as any).profile;
    const isActive = profile?.accessLevels?.[ACCESS_LEVEL]?.isActive ?? false;
    return { isActive };
  },

  /** 구매 복원 (iOS 정책상 필수) */
  async restorePurchases(): Promise<boolean> {
    const profile = await adapty.restorePurchases();
    return (profile as any).accessLevels?.[ACCESS_LEVEL]?.isActive ?? false;
  },
};
