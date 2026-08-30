/* ─────────────────────────────────────────────────────
 * 부스 쉐어 / 모델 구인 / 편집자 공통 지역 데이터
 * - code: 필터·글쓰기에서 쓰는 canonical 값 (게시글 region 에 그대로 저장)
 * - nameEn: 영어 표기
 * - keyword: 게시글 주소 매칭용 정규식
 * 서울 25개 구 전체 + 주요 광역시 구 + 경기 주요시 + 제주 + 도 단위
 * ───────────────────────────────────────────────────── */

export interface ShopRegionItem {
  code: string;
  nameEn: string;
  keyword: RegExp;
}

export interface ShopRegionGroup {
  city: string;
  cityEn: string;
  items: ShopRegionItem[];
}

const gu = (city: string, name: string, en: string, kw: string): ShopRegionItem => ({
  code: `${city} ${name}`,
  nameEn: en,
  keyword: new RegExp(kw),
});

export const SHOP_REGION_GROUPS: ShopRegionGroup[] = [
  {
    city: '서울',
    cityEn: 'Seoul',
    items: [
      gu('서울', '강남구', 'Gangnam-gu', '강남'),
      gu('서울', '서초구', 'Seocho-gu', '서초'),
      gu('서울', '송파구', 'Songpa-gu', '송파|잠실'),
      gu('서울', '강동구', 'Gangdong-gu', '강동'),
      gu('서울', '마포구', 'Mapo-gu', '마포|홍대|합정|망원|서교|연남'),
      gu('서울', '용산구', 'Yongsan-gu', '용산|이태원|한남'),
      gu('서울', '성동구', 'Seongdong-gu', '성동|성수|서울숲'),
      gu('서울', '광진구', 'Gwangjin-gu', '광진|건대|화양|구의'),
      gu('서울', '종로구', 'Jongno-gu', '종로|혜화|대학로'),
      gu('서울', '중구', 'Jung-gu', '서울.*중구|을지로|명동|충무로'),
      gu('서울', '성북구', 'Seongbuk-gu', '성북'),
      gu('서울', '동대문구', 'Dongdaemun-gu', '동대문|청량리'),
      gu('서울', '중랑구', 'Jungnang-gu', '중랑'),
      gu('서울', '노원구', 'Nowon-gu', '노원'),
      gu('서울', '도봉구', 'Dobong-gu', '도봉'),
      gu('서울', '강북구', 'Gangbuk-gu', '강북|수유|미아'),
      gu('서울', '은평구', 'Eunpyeong-gu', '은평'),
      gu('서울', '서대문구', 'Seodaemun-gu', '서대문|신촌'),
      gu('서울', '양천구', 'Yangcheon-gu', '양천|목동'),
      gu('서울', '강서구', 'Gangseo-gu', '서울.*강서|화곡|마곡'),
      gu('서울', '구로구', 'Guro-gu', '구로'),
      gu('서울', '금천구', 'Geumcheon-gu', '금천|가산'),
      gu('서울', '영등포구', 'Yeongdeungpo-gu', '영등포|여의도'),
      gu('서울', '동작구', 'Dongjak-gu', '동작|노량진|사당'),
      gu('서울', '관악구', 'Gwanak-gu', '관악|신림|서울대'),
    ],
  },
  {
    city: '경기',
    cityEn: 'Gyeonggi',
    items: [
      gu('경기', '수원시', 'Suwon', '수원'),
      gu('경기', '성남시', 'Seongnam', '성남|분당|판교'),
      gu('경기', '고양시', 'Goyang', '고양|일산'),
      gu('경기', '용인시', 'Yongin', '용인'),
      gu('경기', '부천시', 'Bucheon', '부천'),
      gu('경기', '안산시', 'Ansan', '안산'),
      gu('경기', '안양시', 'Anyang', '안양|평촌'),
      gu('경기', '남양주시', 'Namyangju', '남양주'),
      gu('경기', '화성시', 'Hwaseong', '화성|동탄'),
      gu('경기', '평택시', 'Pyeongtaek', '평택'),
      gu('경기', '의정부시', 'Uijeongbu', '의정부'),
      gu('경기', '파주시', 'Paju', '파주'),
      gu('경기', '김포시', 'Gimpo', '김포'),
      gu('경기', '광명시', 'Gwangmyeong', '광명'),
      gu('경기', '하남시', 'Hanam', '하남|미사'),
    ],
  },
  {
    city: '인천',
    cityEn: 'Incheon',
    items: [
      gu('인천', '중구', 'Jung-gu', '인천.*중구|영종'),
      gu('인천', '미추홀구', 'Michuhol-gu', '미추홀'),
      gu('인천', '남동구', 'Namdong-gu', '남동'),
      gu('인천', '연수구', 'Yeonsu-gu', '연수|송도'),
      gu('인천', '부평구', 'Bupyeong-gu', '부평'),
      gu('인천', '계양구', 'Gyeyang-gu', '계양'),
      gu('인천', '서구', 'Seo-gu', '인천.*서구|청라'),
    ],
  },
  {
    city: '부산',
    cityEn: 'Busan',
    items: [
      gu('부산', '해운대구', 'Haeundae-gu', '해운대'),
      gu('부산', '부산진구', 'Busanjin-gu', '부산진|서면'),
      gu('부산', '수영구', 'Suyeong-gu', '수영|광안'),
      gu('부산', '남구', 'Nam-gu', '부산.*남구|경성대'),
      gu('부산', '동래구', 'Dongnae-gu', '동래'),
      gu('부산', '중구', 'Jung-gu', '부산.*중구|남포'),
      gu('부산', '서구', 'Seo-gu', '부산.*서구'),
      gu('부산', '사하구', 'Saha-gu', '사하'),
      gu('부산', '연제구', 'Yeonje-gu', '연제'),
    ],
  },
  {
    city: '대구',
    cityEn: 'Daegu',
    items: [
      gu('대구', '중구', 'Jung-gu', '대구.*중구|동성로'),
      gu('대구', '수성구', 'Suseong-gu', '수성'),
      gu('대구', '달서구', 'Dalseo-gu', '달서'),
      gu('대구', '동구', 'Dong-gu', '대구.*동구'),
      gu('대구', '북구', 'Buk-gu', '대구.*북구'),
    ],
  },
  {
    city: '대전',
    cityEn: 'Daejeon',
    items: [
      gu('대전', '서구', 'Seo-gu', '대전.*서구|둔산'),
      gu('대전', '유성구', 'Yuseong-gu', '유성'),
      gu('대전', '중구', 'Jung-gu', '대전.*중구'),
      gu('대전', '동구', 'Dong-gu', '대전.*동구'),
    ],
  },
  {
    city: '광주',
    cityEn: 'Gwangju',
    items: [
      gu('광주', '동구', 'Dong-gu', '광주.*동구|충장로'),
      gu('광주', '서구', 'Seo-gu', '광주.*서구|상무'),
      gu('광주', '북구', 'Buk-gu', '광주.*북구'),
      gu('광주', '광산구', 'Gwangsan-gu', '광산'),
    ],
  },
  {
    city: '기타 광역시',
    cityEn: 'Other Metro',
    items: [
      gu('울산', '', 'Ulsan', '울산'),
      gu('세종', '', 'Sejong', '세종'),
    ],
  },
  {
    city: '제주',
    cityEn: 'Jeju',
    items: [
      gu('제주', '제주시', 'Jeju City', '제주시|제주도'),
      gu('제주', '서귀포시', 'Seogwipo', '서귀포'),
    ],
  },
  {
    city: '그 외 지역',
    cityEn: 'Other Regions',
    items: [
      gu('강원', '', 'Gangwon', '강원|춘천|강릉|원주'),
      gu('충북', '', 'Chungbuk', '충북|청주|충청북'),
      gu('충남', '', 'Chungnam', '충남|천안|아산|충청남'),
      gu('전북', '', 'Jeonbuk', '전북|전주|전라북'),
      gu('전남', '', 'Jeonnam', '전남|여수|순천|전라남'),
      gu('경북', '', 'Gyeongbuk', '경북|포항|경주|경상북'),
      gu('경남', '', 'Gyeongnam', '경남|창원|김해|경상남'),
    ],
  },
];

export const ALL_REGION_CODE = '전체';

/** 필터 바텀시트용 flat 옵션 (맨 앞 '전체') */
export const SHOP_REGION_OPTIONS: string[] = [
  ALL_REGION_CODE,
  ...SHOP_REGION_GROUPS.flatMap((g) => g.items.map((i) => i.code)),
];

/** 글쓰기용 옵션 ('전체' 제외) */
export const SHOP_REGION_WRITE_OPTIONS: string[] =
  SHOP_REGION_GROUPS.flatMap((g) => g.items.map((i) => i.code));

const CODE_TO_ITEM: Record<string, ShopRegionItem> = SHOP_REGION_GROUPS
  .flatMap((g) => g.items)
  .reduce((acc, item) => {
    acc[item.code] = item;
    return acc;
  }, {} as Record<string, ShopRegionItem>);

/** 언어별 지역 라벨 — '전체'는 i18n 처리 위해 호출부에서 분기 */
export const shopRegionLabel = (code: string, language: 'ko' | 'en'): string => {
  if (code === ALL_REGION_CODE) return language === 'en' ? 'All' : '전체';
  const item = CODE_TO_ITEM[code];
  if (!item) return code;
  return language === 'en' ? item.nameEn : code;
};

/** 게시글 주소가 선택 지역과 매칭되는지 */
export const matchShopRegion = (address: string, code: string): boolean => {
  if (!code || code === ALL_REGION_CODE) return true;
  if (!address) return false;
  if (address.includes(code)) return true;
  const item = CODE_TO_ITEM[code];
  return item ? item.keyword.test(address) : false;
};
