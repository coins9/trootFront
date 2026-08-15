import { Linking } from 'react-native';

/**
 * 관리자에서 배너 링크로 설정 가능한 내부 화면 목록.
 * troot:// 스킴을 사용해 외부 URL과 구분한다.
 */
export const INTERNAL_BANNER_ROUTES = [
  { label: '홈', value: 'troot://home', screen: 'HomeTab' },
  { label: '루츠픽', value: 'troot://rootspick', screen: 'RootsPickTab' },
  { label: '샵&매칭', value: 'troot://shop', screen: 'ShopMatchingTab' },
  { label: '용품샵', value: 'troot://supplies', screen: 'TattooSuppliesTab' },
  { label: '내 프로필', value: 'troot://profile', screen: 'ProfileTab' },
  { label: '예약 관리', value: 'troot://reservation', screen: 'ReservationManage' },
  { label: '광고 통계', value: 'troot://ad-stats', screen: 'ArtistAdStats' },
  { label: '문의하기', value: 'troot://support', screen: 'Support' },
  { label: '셀러 신청', value: 'troot://vendor-apply', screen: 'VendorApply' },
  { label: '내 상품', value: 'troot://my-products', screen: 'MyProducts' },
  { label: '이용 안전 정책', value: 'troot://safety-policy', screen: 'SafetyPolicy' },
] as const;

const ROUTE_MAP = Object.fromEntries(
  INTERNAL_BANNER_ROUTES.map((r) => [r.value, r.screen]),
) as Record<string, string>;

/**
 * 배너 linkUrl 을 처리한다.
 * - troot:// 스킴 → 내부 화면 navigate
 * - http(s):// → 외부 브라우저
 * - 빈 값 → 무동작
 */
export function handleBannerLink(
  url: string,
  navigate: (screen: string) => void,
) {
  if (!url) return;
  const screen = ROUTE_MAP[url];
  if (screen) {
    navigate(screen);
    return;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    Linking.openURL(url).catch(() => {});
  }
}

export function isInternalLink(url: string): boolean {
  return url.startsWith('troot://');
}
