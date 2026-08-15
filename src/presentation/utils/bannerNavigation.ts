import { Linking } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { artistApi } from '../../data/api';
import { toArtist } from '../../data/api/mappers';
import type { RootStackParamList } from '../../infrastructure/navigation/RootNavigator';

/**
 * troot:// 탭 경로 → 스크린 이름 매핑.
 * 어드민 힌트에서도 이 목록을 참조한다.
 */
const TAB_ROUTE_MAP: Record<string, keyof RootStackParamList> = {
  'troot://home': 'Main',
  'troot://rootspick': 'Main',
  'troot://shop': 'Main',
  'troot://supplies': 'Main',
  'troot://profile': 'Main',
  'troot://reservation': 'ReservationManage',
  'troot://ad-stats': 'ArtistAdStats',
  'troot://support': 'Support',
  'troot://vendor-apply': 'VendorApply',
  'troot://my-products': 'MyProducts',
  'troot://safety-policy': 'SafetyPolicy',
};

export function isInternalLink(url: string): boolean {
  return url.startsWith('troot://');
}

/**
 * 배너 linkUrl 처리 (async — 상세 페이지는 API 호출 필요).
 *
 * 지원 형식
 *   troot://home | troot://shop | ...  → 탭/화면으로 이동
 *   troot://artist/{id}                → 타투이스트 프로필 (API 조회 후 이동)
 *   https://...                        → 외부 브라우저
 *   빈 값                              → 무동작
 */
export async function handleBannerLink(
  url: string,
  navigation: NavigationProp<RootStackParamList>,
): Promise<void> {
  if (!url) return;

  // ── 탭 경로 (파라미터 없는 단순 이동) ──────────────────
  const tabScreen = TAB_ROUTE_MAP[url];
  if (tabScreen) {
    navigation.navigate(tabScreen as never);
    return;
  }

  // ── 타투이스트 프로필: troot://artist/{artistPageId} ──
  if (url.startsWith('troot://artist/')) {
    const id = url.slice('troot://artist/'.length).trim();
    if (!id) return;
    try {
      const artistPage = await artistApi.detail(id);
      const artist = toArtist(artistPage);
      (navigation as any).navigate('ArtistProfile', { artist });
    } catch {
      // 존재하지 않는 ID면 조용히 무시
    }
    return;
  }

  // ── 외부 URL ─────────────────────────────────────────
  if (url.startsWith('http://') || url.startsWith('https://')) {
    Linking.openURL(url).catch(() => {});
  }
}
