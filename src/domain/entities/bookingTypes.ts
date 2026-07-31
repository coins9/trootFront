export interface BookingFormData {
  selectedDate: string | null;
  selectedTime: string | null;
  bodyPart: string | null;
  size: string | null;
  referenceImages: string[];
  referenceText: string;
  agreedToTerms: boolean;
}

export const INITIAL_BOOKING_FORM: BookingFormData = {
  selectedDate: null,
  selectedTime: null,
  bodyPart: null,
  size: null,
  referenceImages: [],
  referenceText: '',
  agreedToTerms: false,
};

export const hasReference = (data: BookingFormData): boolean =>
  data.referenceImages.length > 0 || data.referenceText.trim().length > 0;

export const isBookingFormValid = (data: BookingFormData): boolean =>
  !!(
    data.selectedDate
    && data.selectedTime
    && data.bodyPart
    && data.size
    && hasReference(data)
    && data.agreedToTerms
  );

export const formatBookingMessage = (
  artistName: string,
  designTitle: string | undefined,
  data: BookingFormData,
): string => {
  const lines = [
    '[T:ROOT 예약/상담 요청]',
    `작가: ${artistName}`,
    ...(designTitle ? [`도안: ${designTitle}`] : []),
    `희망 날짜: ${data.selectedDate ?? ''}`,
    `희망 시간: ${data.selectedTime ?? ''}`,
    `시술 부위: ${data.bodyPart ?? ''}`,
    `크기: ${data.size ?? ''}`,
  ];
  if (data.referenceImages.length > 0) {
    lines.push(`레퍼런스 사진: ${data.referenceImages.length}장 첨부`);
  }
  if (data.referenceText.trim()) {
    lines.push('');
    lines.push('레퍼런스 설명:');
    lines.push(data.referenceText.trim());
  }
  return lines.join('\n');
};

export const TIME_SLOTS = [
  '오전 10시', '오전 10시 30분', '오전 11시', '오전 11시 30분',
  '오후 12시', '오후 12시 30분', '오후 1시', '오후 1시 30분',
  '오후 2시', '오후 2시 30분', '오후 3시', '오후 3시 30분',
  '오후 4시', '오후 4시 30분', '오후 5시', '오후 5시 30분',
  '오후 6시', '오후 6시 30분', '오후 7시',
];

export const BOOKING_BODY_PARTS = [
  '팔 (상박)', '팔 (하박)', '손목 / 손',
  '어깨', '쇄골', '가슴', '복부 / 옆구리',
  '등 (상)', '등 (하)', '허리',
  '허벅지', '종아리', '발목 / 발',
  '목 / 귀 뒤', '기타',
];

export const SIZES: { id: string; label: string; sub: string }[] = [
  { id: 'coin', label: '동전 크기', sub: '5cm 이하' },
  { id: 'fist', label: '주먹 크기', sub: '5 ~ 10cm' },
  { id: 'palm', label: '손바닥 크기', sub: '10 ~ 20cm' },
  { id: 'large', label: '그 이상', sub: '20cm+' },
];
