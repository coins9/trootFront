import { ArtistAdItem, ArtistPromoBanner } from '../../domain/entities/artistAdTypes';

const TALLY_URL = 'https://tally.so/r/troot-ads';

export const MOCK_PROMO_BANNERS: ArtistPromoBanner[] = [
  {
    id: 'promo1',
    title: '타투이스트 최상단 배너 광고',
    description: '더 많은 고객에게 당신의 작품을 노출하세요.',
    ctaLabel: '광고 문의하기',
    ctaUrl: TALLY_URL,
    accentTone: 'neutral',
  },
  {
    id: 'promo2',
    title: '메인 배너 입점 안내',
    description: 'T:ROOT 메인에 당신의 브랜드를 소개하세요.',
    ctaLabel: '입점 문의하기',
    ctaUrl: TALLY_URL,
    accentTone: 'neutral',
  },
];

export const MOCK_ARTIST_ADS: ArtistAdItem[] = [
  {
    id: 'ad-super-1',
    title: '블랙워크 천사',
    thumbnailUri: '',
    status: 'super_up',
    statusLabel: '슈퍼UP 진행 중',
    periodStart: '2024.08.12',
    periodEnd: '2024.08.19',
    impressions: { current: 10200, goal: 15000, unit: '회' },
    clicks:      { current: 320,   goal: 500,   unit: '회' },
    inquiries:   { current: 16,    goal: 30,    unit: '건' },
    trend: [12, 18, 22, 28, 26, 34, 42, 55, 62, 78, 92],
  },
  {
    id: 'ad-up-1',
    title: '미니멀 라인 · 팔찌',
    thumbnailUri: '',
    status: 'up',
    statusLabel: 'UP 진행 중',
    periodStart: '2024.08.10',
    periodEnd: '2024.08.11',
    impressions: { current: 2100, goal: 3000, unit: '회' },
    clicks:      { current: 88,   goal: 150,  unit: '회' },
    inquiries:   { current: 4,    goal: 10,   unit: '건' },
    trend: [8, 14, 18, 15, 22, 26, 24, 30, 28, 34, 40],
  },
];
