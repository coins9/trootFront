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

  // 🚨 1. URL 뒤에 ? 쿼리 파라미터가 붙어있어도 메인 경로만 추출하도록 분리
  const basePath = url.split('?')[0] ?? '';

  // ── 탭 경로 (파라미터 없는 단순 이동) ──────────────────
  // 🚨 2. url 대신 basePath를 참조하여 이동 성공률 100% 보장
  const tabScreen = TAB_ROUTE_MAP[basePath];
  if (tabScreen) {
    navigation.navigate(tabScreen as never);
    return;
  }

  // ── 타투이스트 프로필: troot://artist/{artistPageId} ──
  // 🚨 3. ID 뒤에 파라미터(?utm_source=...)가 섞여 들어가 API가 에러나는 현상 방지
  if (basePath.startsWith('troot://artist/')) {
    const id = basePath.slice('troot://artist/'.length).trim();
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
  // 🚨 4. 외부 브라우저를 열 때는 쿼리 파라미터가 필수이므로 원본 url을 그대로 넘김
  if (url.startsWith('http://') || url.startsWith('https://')) {
    Linking.openURL(url).catch(() => {});
  }
}