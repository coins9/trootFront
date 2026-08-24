export interface BookingReferenceImage {
  uri: string;
  type?: string;
  fileSize?: number;
}

export interface BookingFormData {
  selectedDate: string | null;
  selectedTime: string | null;
  bodyPart: string | null;
  size: string | null;
  referenceImages: BookingReferenceImage[];
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

// 'YYYY-MM-DD' + '오후 2시 30분' → ISO 문자열 (서버 scheduledAt)
export const toScheduledAt = (dateStr: string, timeSlot: string): string => {
  const isPM = timeSlot.startsWith('오후');
  const hour = Number(timeSlot.match(/(\d+)\s*시/)?.[1] ?? 0);
  const min = Number(timeSlot.match(/(\d+)\s*분/)?.[1] ?? 0);
  let h = hour;
  if (isPM && hour !== 12) h += 12;
  if (!isPM && hour === 12) h = 0;
  const hh = String(h).padStart(2, '0');
  const mm = String(min).padStart(2, '0');
  return new Date(`${dateStr}T${hh}:${mm}:00`).toISOString();
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
] as const;

export const BODY_PART_T_KEY: Record<string, string> = {
  '팔 (상박)': 'booking.steps.bodyParts.upperArm',
  '팔 (하박)': 'booking.steps.bodyParts.forearm',
  '손목 / 손': 'booking.steps.bodyParts.wristHand',
  '어깨': 'booking.steps.bodyParts.shoulder',
  '쇄골': 'booking.steps.bodyParts.collarbone',
  '가슴': 'booking.steps.bodyParts.chest',
  '복부 / 옆구리': 'booking.steps.bodyParts.abdomenSide',
  '등 (상)': 'booking.steps.bodyParts.upperBack',
  '등 (하)': 'booking.steps.bodyParts.lowerBack',
  '허리': 'booking.steps.bodyParts.waist',
  '허벅지': 'booking.steps.bodyParts.thigh',
  '종아리': 'booking.steps.bodyParts.calf',
  '발목 / 발': 'booking.steps.bodyParts.ankleFoot',
  '목 / 귀 뒤': 'booking.steps.bodyParts.neckBehindEar',
  '기타': 'booking.steps.bodyParts.other',
};

export const SIZES: { id: string; label: string; labelKey: string; subKey: string }[] = [
  { id: 'coin', label: '동전 크기', labelKey: 'booking.steps.sizes.coinLabel', subKey: 'booking.steps.sizes.coinSub' },
  { id: 'fist', label: '주먹 크기', labelKey: 'booking.steps.sizes.fistLabel', subKey: 'booking.steps.sizes.fistSub' },
  { id: 'palm', label: '손바닥 크기', labelKey: 'booking.steps.sizes.palmLabel', subKey: 'booking.steps.sizes.palmSub' },
  { id: 'large', label: '그 이상', labelKey: 'booking.steps.sizes.largeLabel', subKey: 'booking.steps.sizes.largeSub' },
];
