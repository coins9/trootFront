export type ArtistAdStatus = 'super_up' | 'up' | 'card' | 'idle';

export interface AdStatMetric {
  current: number;
  goal: number;
  unit: '회' | '건';
}

export interface ArtistAdItem {
  id: string;
  artworkId: string;
  title: string;
  thumbnailUri: string;
  status: ArtistAdStatus;
  statusLabel: string;
  periodStart: string;
  periodEnd: string;
  impressions: AdStatMetric;
  clicks: AdStatMetric;
  inquiries: AdStatMetric;
  trend: number[];
}

export interface ArtistPromoBanner {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  accentTone: 'neutral' | 'gold';
}
