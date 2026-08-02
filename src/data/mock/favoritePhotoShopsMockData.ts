export type PhotoShopCategory = '사진 촬영' | '영상/숏폼' | '보정 전문';

export interface FavoritePhotoShop {
  id: string;
  name: string;
  category: PhotoShopCategory;
  rating: number;
  reviewCount: number;
  estimatedPrice: number;
  logoUri: string;
  works: string[];
  kakaoLink?: string;
  isFavorite: boolean;
}

export const PHOTO_SHOP_CATEGORIES: PhotoShopCategory[] = [
  '사진 촬영', '영상/숏폼', '보정 전문',
];

export const MOCK_FAVORITE_PHOTO_SHOPS: FavoritePhotoShop[] = [
  {
    id: 'ps1',
    name: 'Lens Studio',
    category: '사진 촬영',
    rating: 4.9,
    reviewCount: 128,
    estimatedPrice: 150000,
    logoUri: '',
    works: ['', '', ''],
    kakaoLink: 'https://open.kakao.com/o/lensstudio',
    isFavorite: true,
  },
  {
    id: 'ps2',
    name: 'Frame Works',
    category: '영상/숏폼',
    rating: 4.8,
    reviewCount: 96,
    estimatedPrice: 180000,
    logoUri: '',
    works: ['', '', ''],
    kakaoLink: 'https://open.kakao.com/o/frameworks',
    isFavorite: true,
  },
  {
    id: 'ps3',
    name: 'Tone Bakery',
    category: '보정 전문',
    rating: 4.7,
    reviewCount: 74,
    estimatedPrice: 60000,
    logoUri: '',
    works: ['', '', ''],
    kakaoLink: 'https://open.kakao.com/o/tonebakery',
    isFavorite: true,
  },
  {
    id: 'ps4',
    name: 'Studio Ink',
    category: '사진 촬영',
    rating: 4.9,
    reviewCount: 210,
    estimatedPrice: 180000,
    logoUri: '',
    works: ['', '', ''],
    kakaoLink: 'https://open.kakao.com/o/studioink',
    isFavorite: true,
  },
  {
    id: 'ps5',
    name: 'Reel Master',
    category: '영상/숏폼',
    rating: 4.8,
    reviewCount: 132,
    estimatedPrice: 120000,
    logoUri: '',
    works: ['', '', ''],
    kakaoLink: 'https://open.kakao.com/o/reelmaster',
    isFavorite: true,
  },
];
