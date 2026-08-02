export interface ReviewArtist {
  id: string;
  nickname: string;
  handle: string;
  location: string;
  avatarUri: string;
}

export interface ReviewRatings {
  pain: number;
  kindness: number;
  hygiene: number;
  satisfaction: number;
}

export interface WritableReview {
  id: string;
  artist: ReviewArtist;
  procedureDate: string;
  procedureTime: string;
  bodyPart: string;
  style: string;
  daysLeft: number;
  rewardPoint: number;
}

export interface WrittenReview {
  id: string;
  artist: ReviewArtist;
  writtenDate: string;
  photos: string[];
  ratings: ReviewRatings;
  text: string;
  canAddHealedPhoto: boolean;
}

export const RATING_LABELS: { key: keyof ReviewRatings; label: string }[] = [
  { key: 'pain', label: '통증' },
  { key: 'kindness', label: '친절' },
  { key: 'hygiene', label: '위생' },
  { key: 'satisfaction', label: '만족도' },
];
