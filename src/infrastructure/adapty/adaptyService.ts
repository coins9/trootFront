import { adapty, AdaptyFlow } from 'react-native-adapty';

type AdaptyProduct = any;

const ADAPTY_PUBLIC_KEY = 'public_live_YLLFYbPA.g4p8MsY3aNxee3Ustser';

const PAYWALL_ID = 'troot_pro_paywall';

export const activateAdapty = async (): Promise<void> => {
  try {
    await adapty.activate(ADAPTY_PUBLIC_KEY);
  } catch {
    // 이미 초기화된 경우 무시
  }
};

export const adaptyService = {
  /** 로그인 후 호출 — 구매 내역이 계정에 귀속되도록 연결 */
  async identify(userId: string): Promise<void> {
    await adapty.identify(String(userId));
  },

  /** 로그아웃 시 호출 */
  async logout(): Promise<void> {
    await adapty.logout();
  },

  /** 광고 소모품 구매 — troot_pro_paywall에서 productId로 제품 찾아 결제 */
  async purchaseAdProduct(productId: string): Promise<void> {
    const flow: AdaptyFlow = await adapty.getFlow(PAYWALL_ID);
    const products = await adapty.getPaywallProducts(flow);
    const product = products.find((p: AdaptyProduct) => p.vendorProductId === productId);
    if (!product) throw new Error(`Ad product not found: ${productId}`);
    await adapty.makePurchase(product);
  },

  /** 구매 복원 (iOS 정책상 필수) */
  async restorePurchases(): Promise<void> {
    await adapty.restorePurchases();
  },
};
