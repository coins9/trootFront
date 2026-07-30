export interface Artist {
  id: string;
  nickname: string;
  city: string;
  district: string;
  genres: string[];
  rating: number;
  reviewCount: number;
  followerCount: string;
  totalSessions: string;
  profileImage: string;
  coverImage: string;
  specialties: string[];
  bio: string;
  availableHours: string;
  closedDay: string;
  isVerified: boolean;
  isHygieneCertified: boolean;
  hasDepositProtection: boolean;
  isPromoted: boolean;
  kakaoLink?: string;
}

export interface Tattoo {
  id: string;
  artistId: string;
  artist: Artist;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  genres: string[];
  bodyParts: string[];
  subjects: string[];
  moods: string[];
  minPrice: number;
  likeCount: number;
  commentCount: number;
  viewCount: string;
  isBookmarked: boolean;
  isPromoted: boolean;
}

export interface FilterState {
  region: { city: string | null; district: string | null };
  genres: string[];
  bodyParts: string[];
  subjects: string[];
  moods: string[];
  budgetMin: number;
  budgetMax: number;
}

export type FilterType = 'region' | 'genre' | 'bodyPart' | 'subject' | 'budget' | 'full';
