export interface ArtistSelfProfile {
  id: string;
  nickname: string;
  handle: string;
  location: string;
  lat?: number | null;
  lng?: number | null;
  countryCode?: string | null;
  countryName?: string | null;
  regionSido?: string | null;
  regionSigungu?: string | null;
  intro: string;
  avatarUri: string;
  rating: number;
  reviewCount: number;
  likes: number;
  bookedCount: number;
  /** 편의/특성 태그 코드 (same_day, open_24h, parking, female_artist, male_artist) */
  tags: string[];
}

export type ArtworkMediaType = 'image';

export interface ArtistArtwork {
  id: string;
  type: ArtworkMediaType;
  thumbnailUri: string;
  title: string;
  titleEn?: string;
  genre: string;
  bodyPart: string;
  subjects: string[];
  moods: string[];
  priceFrom: number;
  duration: string;
  description: string;
  descriptionEn?: string;
  isPromoted?: boolean;
  isDraft?: boolean;
  likes: number;
  views: number;
}

export interface ArtistReviewReply {
  content: string;
  answeredAt: string;
}

export interface ArtistReviewItem {
  id: string;
  customer: string;
  rating: number;
  artworkId: string;
  artworkTitle: string;
  content: string;
  imageUris: string[];
  createdAt: string;
  reply?: ArtistReviewReply;
  isAnswered: boolean;
}
