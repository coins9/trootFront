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
}

export const ARTIST_TAGS: ArtistTagOption[] = [
  { code: 'same_day', label: '당일 시술 가능' },
  { code: 'open_24h', label: '24시간 운영' },
  { code: 'parking', label: '주차 가능' },
  { code: 'female_artist', label: '여성 아티스트' },
  { code: 'male_artist', label: '남성 아티스트' },
];

const LABEL = new Map<string, string>(ARTIST_TAGS.map((t) => [t.code, t.label]));

/** 코드 → 표시 라벨 (미정의 코드는 코드 그대로) */
export const artistTagLabel = (code: string): string => LABEL.get(code) ?? code;

/** 코드 배열 → 라벨 배열 (알 수 없는 코드는 제외) */
export const artistTagLabels = (codes: string[] | undefined | null): string[] =>
  (codes ?? []).filter((c) => LABEL.has(c)).map((c) => LABEL.get(c)!);
