export interface ArtistSelfProfile {
  id: string;
  nickname: string;
  handle: string;
  location: string;
  intro: string;
  avatarUri: string;
  rating: number;
  reviewCount: number;
  likes: number;
  bookedCount: number;
}

export type ArtworkMediaType = 'image';

export interface ArtistArtwork {
  id: string;
  type: ArtworkMediaType;
  thumbnailUri: string;
  title: string;
  genre: string;
  bodyPart: string;
  subjects: string[];
  moods: string[];
  priceFrom: number;
  duration: string;
  description: string;
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
