export interface OverseasCountry {
  code: string;
  name: string;
  nameEn: string;
}

export interface OverseasRegionGroup {
  region: string;
  regionEn: string;
  countries: OverseasCountry[];
}

export const OVERSEAS_COUNTRY_GROUPS: OverseasRegionGroup[] = [
  {
    region: '동북아시아',
    regionEn: 'Northeast Asia',
    countries: [
      { code: 'JP', name: '일본', nameEn: 'Japan' },
      { code: 'HK', name: '홍콩', nameEn: 'Hong Kong' },
      { code: 'TW', name: '대만', nameEn: 'Taiwan' },
      { code: 'CN', name: '중국', nameEn: 'China' },
    ],
  },
  {
    region: '동남아시아',
    regionEn: 'Southeast Asia',
    countries: [
      { code: 'TH', name: '태국', nameEn: 'Thailand' },
      { code: 'VN', name: '베트남', nameEn: 'Vietnam' },
      { code: 'ID', name: '인도네시아', nameEn: 'Indonesia' },
      { code: 'PH', name: '필리핀', nameEn: 'Philippines' },
      { code: 'SG', name: '싱가포르', nameEn: 'Singapore' },
      { code: 'MY', name: '말레이시아', nameEn: 'Malaysia' },
    ],
  },
  {
    region: '유럽',
    regionEn: 'Europe',
    countries: [
      { code: 'GB', name: '영국', nameEn: 'UK' },
      { code: 'DE', name: '독일', nameEn: 'Germany' },
      { code: 'FR', name: '프랑스', nameEn: 'France' },
      { code: 'NL', name: '네덜란드', nameEn: 'Netherlands' },
      { code: 'ES', name: '스페인', nameEn: 'Spain' },
      { code: 'IT', name: '이탈리아', nameEn: 'Italy' },
      { code: 'SE', name: '스웨덴', nameEn: 'Sweden' },
      { code: 'PL', name: '폴란드', nameEn: 'Poland' },
    ],
  },
  {
    region: '북미',
    regionEn: 'North America',
    countries: [
      { code: 'US', name: '미국', nameEn: 'USA' },
      { code: 'CA', name: '캐나다', nameEn: 'Canada' },
    ],
  },
  {
    region: '오세아니아',
    regionEn: 'Oceania',
    countries: [
      { code: 'AU', name: '호주', nameEn: 'Australia' },
      { code: 'NZ', name: '뉴질랜드', nameEn: 'New Zealand' },
    ],
  },
];

export function findCountryByCode(code: string): OverseasCountry | undefined {
  for (const group of OVERSEAS_COUNTRY_GROUPS) {
    const found = group.countries.find((c) => c.code === code);
    if (found) return found;
  }
  return undefined;
}
