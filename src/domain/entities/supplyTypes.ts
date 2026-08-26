export type SupplyCategory =
  | '머신 & 장비'
  | '니들 (바늘)'
  | '잉크'
  | '위생·소모품'
  | '스탠실 용품'
  | '애프터케어'
  | '가구·인테리어';

export type SupplySort = '인기순' | '최신순' | '가격순';

export interface SupplyOptionGroup {
  label: string;
  values: string[];
}

export interface TattooSupply {
  id: string;
  category: SupplyCategory;
  name: string;
  subtitle: string;
  brand?: string;
  imageUri: string;
  images?: string[];
  price?: number;
  description?: string;
  optionGroups?: SupplyOptionGroup[];
  seller: {
    id: string;
    nickname: string;
    kakaoLink?: string;
    smsPhone?: string;
  };
  nameEn?: string | null;
  descriptionEn?: string | null;
  openChatUrl?: string | null;
  storeUrl?: string | null;
  isNew?: boolean;
  isBookmarked: boolean;
  popularityScore: number;
  externalUrl?: string;
}

export const SUPPLY_CATEGORIES: SupplyCategory[] = [
  '머신 & 장비',
  '니들 (바늘)',
  '잉크',
  '위생·소모품',
  '스탠실 용품',
  '애프터케어',
  '가구·인테리어',
];

export const SUPPLY_SORTS: SupplySort[] = ['인기순', '최신순', '가격순'];

export const formatSupplyInquiryMessage = (supply: TattooSupply): string => {
  const lines = [
    '[T:ROOT 용품 구매 문의]',
    `상품: ${supply.name}`,
    ...(supply.subtitle ? [`설명: ${supply.subtitle}`] : []),
    ...(supply.brand ? [`브랜드: ${supply.brand}`] : []),
    ...(supply.price ? [`표시가: ${supply.price.toLocaleString()}원`] : []),
    '',
    '구매 관련 문의드립니다.',
  ];
  return lines.join('\n');
};

// supplyTypes.ts 의 기존 코드 맨 아래에 이어서 작성해 주세요.

export const applySupplySort = (list: TattooSupply[], sort: SupplySort): TattooSupply[] => {
  const copy = list.slice();

  switch (sort) {
    case '인기순':
      return copy.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));

    case '가격순':
      return copy.sort((a, b) => (a.price || 0) - (b.price || 0));

    case '최신순':
    default:
      return copy;
  }
};

// 리스트 화면에서 카테고리 탭을 눌렀을 때 필터링 해주는 헬퍼
export const matchSupplyCategory = (supply: TattooSupply, filterCategory: string): boolean => {
  if (!filterCategory || filterCategory === '전체') return true;
  return supply.category === filterCategory;
};