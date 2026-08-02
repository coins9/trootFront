export type AdCategory = '도안 광고' | '샵 홍보' | '이벤트';

export interface HomeAd {
  id: string;
  category: AdCategory;
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
