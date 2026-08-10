/**
 * 지역 코드 표준 (single source of truth).
 *
 * 광고 세그먼트·검색 필터·타투이스트 지역이 모두 이 코드(regionKey)를 쓴다.
 * 한글 표기를 키로 쓰면 띄어쓰기·가운뎃점·오타로 매칭이 깨지므로 slug 로 고정한다.
 * 화면에는 label 을 보여주고, 저장·매칭·광고에는 code 를 쓴다.
 *
 * ⚠️ 백엔드 src/shared/regions.ts 와 반드시 동일하게 유지할 것.
 */
export interface RegionOption {
  code: string;
  label: string;
}

export const REGIONS: RegionOption[] = [
  { code: 'seoul_gangnam', label: '서울 · 강남/서초' },
  { code: 'seoul_hongdae', label: '서울 · 홍대/합정/망원' },
  { code: 'seoul_itaewon', label: '서울 · 이태원/용산' },
  { code: 'seoul_konkuk', label: '서울 · 건대/성수' },
  { code: 'seoul_etc', label: '서울 · 기타' },
  { code: 'gyeonggi_incheon', label: '경기/인천' },
  { code: 'busan', label: '부산' },
  { code: 'daegu', label: '대구' },
  { code: 'gwangju', label: '광주' },
  { code: 'daejeon', label: '대전' },
  { code: 'ulsan', label: '울산' },
  { code: 'gyeongsang', label: '경상' },
  { code: 'jeolla', label: '전라' },
  { code: 'chungcheong', label: '충청' },
  { code: 'gangwon', label: '강원' },
  { code: 'jeju', label: '제주' },
  { code: 'etc', label: '그 외 지역' },
];

const CODE_TO_LABEL = new Map(REGIONS.map((r) => [r.code, r.label]));
const LABEL_TO_CODE = new Map(REGIONS.map((r) => [r.label, r.code]));

export const regionLabel = (code: string | null | undefined): string =>
  (code && CODE_TO_LABEL.get(code)) || '지역 미지정';

export const regionCodeFromLabel = (label: string): string | null =>
  LABEL_TO_CODE.get(label) ?? null;

/**
 * 주소·구 문자열에서 지역 코드를 추론한다.
 * 기존 데이터(city/district)나 자유 입력을 표준 코드로 정규화할 때 사용.
 */
export const inferRegionCode = (address: string): string => {
  const a = address ?? '';
  if (/강남|서초/.test(a)) return 'seoul_gangnam';
  if (/홍대|합정|망원|마포|서교/.test(a)) return 'seoul_hongdae';
  if (/이태원|용산/.test(a)) return 'seoul_itaewon';
  if (/건대|성수|광진|화양/.test(a)) return 'seoul_konkuk';
  if (/서울/.test(a)) return 'seoul_etc';
  if (/경기|인천|수원|성남|고양|용인|부천|안산|부평|계양/.test(a)) return 'gyeonggi_incheon';
  if (/부산|해운대|서면|수영/.test(a)) return 'busan';
  if (/대구|수성/.test(a)) return 'daegu';
  if (/광주/.test(a)) return 'gwangju';
  if (/대전/.test(a)) return 'daejeon';
  if (/울산/.test(a)) return 'ulsan';
  if (/경상|포항|창원|김해|진주/.test(a)) return 'gyeongsang';
  if (/전라|전주|여수|순천|목포/.test(a)) return 'jeolla';
  if (/충청|청주|천안|충남|충북/.test(a)) return 'chungcheong';
  if (/강원|춘천|원주|강릉/.test(a)) return 'gangwon';
  if (/제주/.test(a)) return 'jeju';
  return 'etc';
};
