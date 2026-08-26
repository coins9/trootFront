// 타투이스트 편의/특성 태그 — 백엔드 artist_pages.tags 와 코드 동일해야 함
export type ArtistTagCode =
  | 'same_day'
  | 'open_24h'
  | 'parking'
  | 'female_artist'
  | 'male_artist';

export interface ArtistTagOption {
  code: ArtistTagCode;
  label: string;
  labelEn: string;
}

export const ARTIST_TAGS: ArtistTagOption[] = [
  { code: 'same_day',      label: '당일 시술 가능', labelEn: 'Same-day Available' },
  { code: 'open_24h',      label: '24시간 운영',    labelEn: '24h Open' },
  { code: 'parking',       label: '주차 가능',      labelEn: 'Parking' },
  { code: 'female_artist', label: '여성 아티스트',  labelEn: 'Female Artist' },
  { code: 'male_artist',   label: '남성 아티스트',  labelEn: 'Male Artist' },
];

const LABEL    = new Map<string, string>(ARTIST_TAGS.map((t) => [t.code, t.label]));
const LABEL_EN = new Map<string, string>(ARTIST_TAGS.map((t) => [t.code, t.labelEn]));

/** 코드 → 표시 라벨 (미정의 코드는 코드 그대로) */
export const artistTagLabel = (code: string, language?: string): string =>
  (language === 'en' ? LABEL_EN : LABEL).get(code) ?? code;

/** 코드 배열 → 라벨 배열 (language='en' 이면 영문 반환) */
export const artistTagLabels = (codes: string[] | undefined | null, language?: string): string[] => {
  const map = language === 'en' ? LABEL_EN : LABEL;
  return (codes ?? []).filter((c) => map.has(c)).map((c) => map.get(c)!);
};
