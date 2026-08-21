import type {
  ShareRegion, ShareLighting, ShareBedCount, ShareOccupancy, ShareSort,
  BeginnerStyle, BeginnerPriceRange, BeginnerSort,
  ExpertCareer, ExpertWorkKind, ExpertSort,
} from '../../domain/entities/shopTypes';

type TFunc = (key: string, params?: Record<string, string | number>) => string;

const REGION_KEY: Record<ShareRegion, string> = {
  '전체': 'shop.opt.all',
  '서울 · 강남/서초': 'shop.opt.regionGangnam',
  '서울 · 홍대/합정/망원': 'shop.opt.regionHongdae',
  '서울 · 이태원/용산': 'shop.opt.regionItaewon',
  '서울 · 건대/성수': 'shop.opt.regionKonkuk',
  '서울 · 기타': 'shop.opt.regionSeoulEtc',
  '경기/인천': 'shop.opt.regionGyeonggi',
  '부산/경상': 'shop.opt.regionBusan',
  '그 외 지역': 'shop.opt.regionOther',
};

const LIGHTING_KEY: Record<ShareLighting, string> = {
  '전체': 'shop.opt.all',
  'LED (백색광)': 'shop.opt.lightingLed',
  '자연광': 'shop.opt.lightingNatural',
  '조도 조절 (디밍)': 'shop.opt.lightingDimming',
  '촬영용 조명 구비': 'shop.opt.lightingStudio',
};

const BED_KEY: Record<ShareBedCount, string> = {
  '전체': 'shop.opt.all',
  '1대': 'shop.opt.bed1',
  '2대': 'shop.opt.bed2',
  '3대': 'shop.opt.bed3',
  '4대 이상': 'shop.opt.bed4Plus',
};

const OCCUPANCY_KEY: Record<ShareOccupancy, string> = {
  '전체': 'shop.opt.all',
  '1~2인 (소수 정예)': 'shop.opt.occupancySmall',
  '3~4인 (중소규모)': 'shop.opt.occupancyMedium',
  '5인 이상 (대형 크루)': 'shop.opt.occupancyLarge',
};

const SHARE_SORT_KEY: Record<ShareSort, string> = {
  '최신순': 'shop.opt.sortLatest',
  '가격 낮은 순': 'shop.opt.sortPriceLow',
  '가격 높은 순': 'shop.opt.sortPriceHigh',
  '인기순 (찜 많은 순)': 'shop.opt.sortPopular',
};

const BEGINNER_STYLE_KEY: Record<BeginnerStyle, string> = {
  '전체': 'shop.opt.all',
  '블랙앤그레이': 'shop.opt.styleBlackGrey',
  '라인워크': 'shop.opt.styleLinework',
  '미니타투': 'shop.opt.styleMini',
  '일러스트': 'shop.opt.styleIllust',
  '올드스쿨': 'shop.opt.styleOldSchool',
  '수채화': 'shop.opt.styleWatercolor',
  '뉴스쿨': 'shop.opt.styleNewSchool',
  '기호/문양': 'shop.opt.styleSymbol',
};

const BEGINNER_PRICE_KEY: Record<BeginnerPriceRange, string> = {
  '전체': 'shop.opt.all',
  '무료': 'shop.opt.priceFree',
  '5만원 이하': 'shop.opt.priceUnder50k',
  '10만원 이하': 'shop.opt.priceUnder100k',
  '20만원 이하': 'shop.opt.priceUnder200k',
};

const BEGINNER_SORT_KEY: Record<BeginnerSort, string> = {
  '최신순': 'shop.opt.sortLatest',
  '가격 낮은 순': 'shop.opt.sortPriceLow',
  '마감 임박순': 'shop.opt.sortDeadline',
};

const EXPERT_CAREER_KEY: Record<ExpertCareer, string> = {
  '전체': 'shop.opt.all',
  '1년 미만': 'shop.opt.careerUnder1',
  '1~3년': 'shop.opt.career1to3',
  '3~5년': 'shop.opt.career3to5',
  '5년 이상': 'shop.opt.career5Plus',
};

const EXPERT_WORK_KIND_KEY: Record<ExpertWorkKind, string> = {
  '전체': 'shop.opt.all',
  '사진 촬영': 'shop.opt.workPhoto',
  '사진 보정': 'shop.opt.workPhotoEdit',
  '영상 촬영': 'shop.opt.workVideo',
  '영상 편집': 'shop.opt.workVideoEdit',
};

const EXPERT_SORT_KEY: Record<ExpertSort, string> = {
  '추천순': 'shop.opt.sortRecommended',
  '가격 낮은 순': 'shop.opt.sortPriceLow',
  '가격 높은 순': 'shop.opt.sortPriceHigh',
};

const OVERSEAS_COUNTRY_KEY: Record<string, string> = {
  '전체': 'shop.opt.all',
  '일본': 'shop.opt.countryJapan',
  '미국': 'shop.opt.countryUSA',
  '프랑스': 'shop.opt.countryFrance',
  '독일': 'shop.opt.countryGermany',
  '영국': 'shop.opt.countryUK',
  '태국': 'shop.opt.countryThailand',
  '싱가포르': 'shop.opt.countrySingapore',
  '홍콩': 'shop.opt.countryHongKong',
  '대만': 'shop.opt.countryTaiwan',
  '호주': 'shop.opt.countryAustralia',
  '캐나다': 'shop.opt.countryCanada',
  '이탈리아': 'shop.opt.countryItaly',
  '기타': 'shop.opt.countryOther',
};

export function optLabel(t: TFunc, map: Record<string, string>, koValue: string): string {
  const key = map[koValue];
  return key ? t(key as any) : koValue;
}

export const regionLabel = (t: TFunc, v: ShareRegion) => optLabel(t, REGION_KEY, v);
export const lightingLabel = (t: TFunc, v: ShareLighting) => optLabel(t, LIGHTING_KEY, v);
export const bedLabel = (t: TFunc, v: ShareBedCount) => optLabel(t, BED_KEY, v);
export const occupancyLabel = (t: TFunc, v: ShareOccupancy) => optLabel(t, OCCUPANCY_KEY, v);
export const shareSortLabel = (t: TFunc, v: ShareSort) => optLabel(t, SHARE_SORT_KEY, v);
export const beginnerStyleLabel = (t: TFunc, v: BeginnerStyle) => optLabel(t, BEGINNER_STYLE_KEY, v);
export const beginnerPriceLabel = (t: TFunc, v: BeginnerPriceRange) => optLabel(t, BEGINNER_PRICE_KEY, v);
export const beginnerSortLabel = (t: TFunc, v: BeginnerSort) => optLabel(t, BEGINNER_SORT_KEY, v);
export const expertCareerLabel = (t: TFunc, v: ExpertCareer) => optLabel(t, EXPERT_CAREER_KEY, v);
export const expertWorkKindLabel = (t: TFunc, v: ExpertWorkKind) => optLabel(t, EXPERT_WORK_KIND_KEY, v);
export const expertSortLabel = (t: TFunc, v: ExpertSort) => optLabel(t, EXPERT_SORT_KEY, v);
export const overseasCountryLabel = (t: TFunc, v: string) => optLabel(t, OVERSEAS_COUNTRY_KEY, v);

export function regionOptions(t: TFunc): string[] {
  return Object.keys(REGION_KEY).map(k => optLabel(t, REGION_KEY, k));
}
export function lightingOptions(t: TFunc): string[] {
  return Object.keys(LIGHTING_KEY).map(k => optLabel(t, LIGHTING_KEY, k));
}
export function bedOptions(t: TFunc): string[] {
  return Object.keys(BED_KEY).map(k => optLabel(t, BED_KEY, k));
}
export function occupancyOptions(t: TFunc): string[] {
  return Object.keys(OCCUPANCY_KEY).map(k => optLabel(t, OCCUPANCY_KEY, k));
}
export function shareSortOptions(t: TFunc): string[] {
  return Object.keys(SHARE_SORT_KEY).map(k => optLabel(t, SHARE_SORT_KEY, k));
}
export function beginnerStyleOptions(t: TFunc): string[] {
  return Object.keys(BEGINNER_STYLE_KEY).map(k => optLabel(t, BEGINNER_STYLE_KEY, k));
}
export function beginnerPriceOptions(t: TFunc): string[] {
  return Object.keys(BEGINNER_PRICE_KEY).map(k => optLabel(t, BEGINNER_PRICE_KEY, k));
}
export function beginnerSortOptions(t: TFunc): string[] {
  return Object.keys(BEGINNER_SORT_KEY).map(k => optLabel(t, BEGINNER_SORT_KEY, k));
}
export function expertCareerOptions(t: TFunc): string[] {
  return Object.keys(EXPERT_CAREER_KEY).map(k => optLabel(t, EXPERT_CAREER_KEY, k));
}
export function expertWorkKindOptions(t: TFunc): string[] {
  return Object.keys(EXPERT_WORK_KIND_KEY).map(k => optLabel(t, EXPERT_WORK_KIND_KEY, k));
}
export function expertSortOptions(t: TFunc): string[] {
  return Object.keys(EXPERT_SORT_KEY).map(k => optLabel(t, EXPERT_SORT_KEY, k));
}
export function overseasCountryOptions(t: TFunc): string[] {
  return Object.keys(OVERSEAS_COUNTRY_KEY).map(k => optLabel(t, OVERSEAS_COUNTRY_KEY, k));
}

export { REGION_KEY, LIGHTING_KEY, BED_KEY, OCCUPANCY_KEY, SHARE_SORT_KEY };
export { BEGINNER_STYLE_KEY, BEGINNER_PRICE_KEY, BEGINNER_SORT_KEY };
export { EXPERT_CAREER_KEY, EXPERT_WORK_KIND_KEY, EXPERT_SORT_KEY };
export { OVERSEAS_COUNTRY_KEY };
