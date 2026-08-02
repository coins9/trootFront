export type FavoriteWorkCategory = '전체' | '내 첫 타투' | '레퍼런스';

export interface FavoriteWork {
  id: string;
  artistNickname: string;
  price: number;
  imageUri: string;
  isSoldOut: boolean;
  category: Exclude<FavoriteWorkCategory, '전체'>;
  isFavorite: boolean;
}

export const FAVORITE_WORK_CATEGORIES: FavoriteWorkCategory[] = [
  '전체', '내 첫 타투', '레퍼런스',
];

export const MOCK_FAVORITE_WORKS: FavoriteWork[] = [
  {
    id: 'fw1',
    artistNickname: 'MINSOO',
    price: 150000,
    imageUri: '',
    isSoldOut: false,
    category: '내 첫 타투',
    isFavorite: true,
  },
  {
    id: 'fw2',
    artistNickname: 'HAZE',
    price: 180000,
    imageUri: '',
    isSoldOut: false,
    category: '레퍼런스',
    isFavorite: true,
  },
  {
    id: 'fw3',
    artistNickname: 'JAY',
    price: 250000,
    imageUri: '',
    isSoldOut: true,
    category: '레퍼런스',
    isFavorite: true,
  },
  {
    id: 'fw4',
    artistNickname: 'LUNA',
    price: 140000,
    imageUri: '',
    isSoldOut: false,
    category: '내 첫 타투',
    isFavorite: true,
  },
  {
    id: 'fw5',
    artistNickname: 'RIN',
    price: 200000,
    imageUri: '',
    isSoldOut: false,
    category: '레퍼런스',
    isFavorite: true,
  },
  {
    id: 'fw6',
    artistNickname: 'MINSOO',
    price: 220000,
    imageUri: '',
    isSoldOut: false,
    category: '레퍼런스',
    isFavorite: true,
  },
  {
    id: 'fw7',
    artistNickname: 'HAZE',
    price: 130000,
    imageUri: '',
    isSoldOut: false,
    category: '내 첫 타투',
    isFavorite: true,
  },
  {
    id: 'fw8',
    artistNickname: 'RIN',
    price: 190000,
    imageUri: '',
    isSoldOut: true,
    category: '레퍼런스',
    isFavorite: true,
  },
];
