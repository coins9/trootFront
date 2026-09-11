/**
 * CDN 이미지 리사이즈(썸네일) 설정.
 *
 * cdn.tattooroot.com 은 Cloudflare 커스텀 도메인이므로, Cloudflare
 * "Image Transformations(이미지 리사이즈)" 를 켜면 /cdn-cgi/image/ 경로로
 * 원본은 그대로 둔 채 엣지에서 축소·캐시해서 내려줄 수 있다.
 * → 목록/홈에서 2048px 원본 대신 수백 px 썸네일만 받으므로
 *   로딩이 빨라지고(“가끔 사진이 안 나오는” 현상 완화) 대역폭/서버비를 아낀다.
 *
 * 활성화 절차(운영):
 *  1) Cloudflare 대시보드 → cdn.tattooroot.com 존 → Images → Transformations "Enable"
 *  2) 아래 ENABLED 를 true 로 바꾸고 앱 재빌드
 * ENABLED=false 이면 원본 URL 을 그대로 쓰므로 기존 동작과 100% 동일(무해).
 */
export const IMAGE_CDN = {
  /** Cloudflare Image Transformations 활성화 후 true 로 변경 */
  enabled: false,
  base: 'https://cdn.tattooroot.com',
};

/**
 * 목록·그리드용 썸네일 URL 생성.
 * - enabled 이고 우리 CDN 도메인 URL 일 때만 /cdn-cgi/image/ 리사이즈 URL 로 변환
 * - 그 외에는 원본 URL 을 그대로 반환(무해)
 * onerror=redirect: 개별 이미지 리사이즈 실패 시 Cloudflare 가 원본을 대신 응답한다.
 */
export const cdnThumb = (
  url: string | null | undefined,
  width: number,
): string | null | undefined => {
  if (!url || !IMAGE_CDN.enabled) return url;
  const prefix = `${IMAGE_CDN.base}/`;
  if (!url.startsWith(prefix)) return url;
  const path = url.slice(prefix.length);
  // 이미 변환 경로면 중복 적용 금지
  if (path.startsWith('cdn-cgi/')) return url;
  const w = Math.max(1, Math.round(width));
  return `${IMAGE_CDN.base}/cdn-cgi/image/width=${w},quality=75,format=auto,onerror=redirect/${path}`;
};
