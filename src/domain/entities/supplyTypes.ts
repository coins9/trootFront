export type SupplyCategory =
  | '머신 & 장비'
  | '니들 (바늘)'
  | '잉크'
  | '위생·소모품'
  | '스탠실 용품'
  | '애프터케어'
  | '가구·인테리어';

export type SupplySort = '인기순' | '가격대' | '카테고리';

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
  isNew?: boolean;
  isBookmarked: boolean;
  popularityScore: number;
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

export const SUPPLY_SORTS: SupplySort[] = ['인기순', '가격대', '카테고리'];

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
