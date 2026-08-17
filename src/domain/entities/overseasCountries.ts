export interface OverseasCountry {
  code: string;
  name: string;
}

export interface OverseasRegionGroup {
  region: string;
  countries: OverseasCountry[];
}

export const OVERSEAS_COUNTRY_GROUPS: OverseasRegionGroup[] = [
  {
    region: '동북아시아',
    countries: [
      { code: 'JP', name: '일본' },
      { code: 'HK', name: '홍콩' },
      { code: 'TW', name: '대만' },
      { code: 'CN', name: '중국' },
    ],
  },
  {
    region: '동남아시아',
    countries: [
      { code: 'TH', name: '태국' },
      { code: 'VN', name: '베트남' },
      { code: 'ID', name: '인도네시아' },
      { code: 'PH', name: '필리핀' },
      { code: 'SG', name: '싱가포르' },
      { code: 'MY', name: '말레이시아' },
    ],
  },
  {
    region: '유럽',
    countries: [
      { code: 'GB', name: '영국' },
      { code: 'DE', name: '독일' },
      { code: 'FR', name: '프랑스' },
      { code: 'NL', name: '네덜란드' },
      { code: 'ES', name: '스페인' },
      { code: 'IT', name: '이탈리아' },
      { code: 'SE', name: '스웨덴' },
      { code: 'PL', name: '폴란드' },
    ],
  },
  {
    region: '북미',
    countries: [
      { code: 'US', name: '미국' },
      { code: 'CA', name: '캐나다' },
    ],
  },
  {
    region: '오세아니아',
    countries: [
      { code: 'AU', name: '호주' },
      { code: 'NZ', name: '뉴질랜드' },
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
