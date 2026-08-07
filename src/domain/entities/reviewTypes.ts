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
  { key: 'satisfaction', label: '결과 만족도' },
];

export const RATING_GUIDES: Record<keyof ReviewRatings, string> = {
  pain: '시술 중 느낀 통증 정도 (별점이 높을수록 덜 아팠어요)',
  kindness: '상담과 응대는 친절했나요?',
  hygiene: '작업 환경과 위생 상태는 어땠나요?',
  satisfaction: '완성된 결과물에 만족하나요?',
};
