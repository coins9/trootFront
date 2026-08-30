export type AdCategory = '도안 광고' | '샵 홍보' | '이벤트';

export interface HomeAd {
  id: string;
  // 표시용 라벨 (i18n 로 번역된 문자열이 들어옴)
  category: string;
  title: string;
  subtitle: string;
  advertiserName: string;
  location?: string;
  priceLabel?: string;
  imageUri: string;
  ctaLabel: string;
  targetType: 'artist' | 'tattoo' | 'external';
  targetId?: string;
  isSponsored: true;
}
