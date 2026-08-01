export type ShopMatchingCategory = '타투 쉐어' | '타투 모델 구인 (비기너)' | '사진/영상 편집자';

export interface ShopHost {
  id: string;
  nickname: string;
  role: string;
  profileImage: string;
  kakaoLink?: string;
  smsPhone?: string;
}

export interface TattooShareShop {
  id: string;
  isNew: boolean;
  title: string;
  pricePerDay: number;
  address: string;
  district: string;
  areaPyeong: number;
  bedCount: number;
  lighting: string;
  hasPrivateRoom: boolean;
  privateRoomInfo?: string;
  maxOccupancy: number;
  currentOccupancy: number;
  requiredOccupancy: number;
  images: string[];
  description: string;
  rules: string[];
  host: ShopHost;
  likeCount: number;
  commentCount: number;
  isBookmarked: boolean;
}

export type ShareBookingPurpose = '단기 쉐어' | '장기 쉐어' | '게스트 워크';
export type BedRequest = '1대' | '2대' | '무관';

export interface ShareBookingForm {
  purpose: ShareBookingPurpose | null;
  scheduleText: string;
  bedRequest: BedRequest | null;
  portfolioUrl: string;
  message: string;
}

export const INITIAL_SHARE_BOOKING_FORM: ShareBookingForm = {
  purpose: null,
  scheduleText: '',
  bedRequest: null,
  portfolioUrl: '',
  message: '',
};

export const isShareBookingFormValid = (form: ShareBookingForm): boolean =>
  !!(form.purpose && form.scheduleText.trim() && form.bedRequest);

/* ─────────────────────────────────────────────────────
 * 타투 모델 구인 (비기너)
 * ───────────────────────────────────────────────────── */

export interface BeginnerModelRecruit {
  id: string;
  isNew: boolean;
  title: string;
  materialFee: number;
  location: string;
  workPeriod: string;
  tags: string[];
  images: string[];
  description: string;
  cautions: string[];
  artist: {
    id: string;
    nickname: string;
    experience: string;
    profileImage: string;
    kakaoLink?: string;
    smsPhone?: string;
  };
  likeCount: number;
  commentCount: number;
  isBookmarked: boolean;
}

export type Gender = '남성' | '여성' | '기타';
export type BodyStatus = '타투/흉터 없음' | '기존 타투 있음' | '흉터 있음 (커버업 요망)';

export interface ModelApplicationForm {
  gender: Gender | null;
  age: string;
  desiredDate: string;
  bodyStatus: BodyStatus | null;
  message: string;
}

export const INITIAL_MODEL_APPLICATION_FORM: ModelApplicationForm = {
  gender: null,
  age: '',
  desiredDate: '',
  bodyStatus: null,
  message: '',
};

export const isModelApplicationValid = (f: ModelApplicationForm): boolean => {
  const ageNum = parseInt(f.age, 10);
  return !!(f.gender && ageNum > 0 && ageNum < 100 && f.desiredDate.trim() && f.bodyStatus);
};

export const formatModelApplicationMessage = (
  postTitle: string,
  artistName: string,
  form: ModelApplicationForm,
): string => {
  const lines = [
    '[T:ROOT 타투 모델 지원]',
    `공고: ${postTitle}`,
    `타투이스트: ${artistName}`,
    '',
    `성별: ${form.gender ?? ''}`,
    `나이: ${form.age}세`,
    `희망 작업일: ${form.desiredDate}`,
    `작업 부위 상태: ${form.bodyStatus ?? ''}`,
  ];
  if (form.message.trim()) {
    lines.push('');
    lines.push('사전 문의 / 남길 말:');
    lines.push(form.message.trim());
  }
  return lines.join('\n');
};

/* ─────────────────────────────────────────────────────
 * 사진/영상 편집자
 * ───────────────────────────────────────────────────── */

export type MediaWorkKind = '사진 촬영' | '영상 촬영' | '사진 보정' | '영상 편집';
export type MediaSpecialty = 'photo' | 'video';

export interface MediaExpertPrice {
  kind: MediaWorkKind;
  price: number;
}

export interface PortfolioItem {
  uri: string;
  isVideo: boolean;
}

export interface MediaExpert {
  id: string;
  specialty: MediaSpecialty;
  nickname: string;
  isVerified: boolean;
  experience: string;
  experienceYears: number;
  location: string;
  profileImage: string;
  tags: string[];
  priceMin: number;
  priceMax: number;
  priceItems: MediaExpertPrice[];
  description: string;
  descriptionBullets: string[];
  descriptionFooter?: string;
  portfolio: PortfolioItem[];
  instagramUrl?: string;
  satisfactionRating: number;
  reviewCount: number;
  totalWorks: number;
  avgResponseTime: string;
  primaryKind: MediaWorkKind;
  kakaoLink?: string;
  smsPhone?: string;
  isBookmarked: boolean;
}

export interface WorkInquiryForm {
  workKind: MediaWorkKind | null;
  desiredDate: string;
  workVolume: string;
  referenceUrl: string;
  extraRequest: string;
}

export const INITIAL_WORK_INQUIRY_FORM: WorkInquiryForm = {
  workKind: null,
  desiredDate: '',
  workVolume: '',
  referenceUrl: '',
  extraRequest: '',
};

export const isWorkInquiryValid = (f: WorkInquiryForm): boolean =>
  !!(f.workKind && f.desiredDate.trim() && f.workVolume.trim());

export const formatWorkInquiryMessage = (
  expertName: string,
  form: WorkInquiryForm,
): string => {
  const lines = [
    '[T:ROOT 작업 문의]',
    `전문가: ${expertName}`,
    '',
    `의뢰 분류: ${form.workKind ?? ''}`,
    `희망 일정: ${form.desiredDate}`,
    `작업 분량: ${form.workVolume}`,
  ];
  if (form.referenceUrl.trim()) {
    lines.push(`레퍼런스: ${form.referenceUrl.trim()}`);
  }
  if (form.extraRequest.trim()) {
    lines.push('');
    lines.push('추가 요청 사항:');
    lines.push(form.extraRequest.trim());
  }
  return lines.join('\n');
};

/* ─────────────────────────────────────────────────────
 * 타투 쉐어 예약 문의
 * ───────────────────────────────────────────────────── */

export const formatShareBookingMessage = (
  shopTitle: string,
  hostName: string,
  form: ShareBookingForm,
): string => {
  const lines = [
    '[T:ROOT 타투 쉐어 문의]',
    `공간: ${shopTitle}`,
    `호스트: ${hostName}`,
    '',
    `이용 목적: ${form.purpose ?? ''}`,
    `희망 일정: ${form.scheduleText}`,
    `필요 베드 수: ${form.bedRequest ?? ''}`,
  ];
  if (form.portfolioUrl.trim()) {
    lines.push(`포트폴리오: ${form.portfolioUrl.trim()}`);
  }
  if (form.message.trim()) {
    lines.push('');
    lines.push('사전 문의:');
    lines.push(form.message.trim());
  }
  return lines.join('\n');
};
