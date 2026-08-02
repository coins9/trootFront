import { WritableReview, WrittenReview } from '../../domain/entities/reviewTypes';

export const MOCK_WRITABLE_REVIEWS: WritableReview[] = [
  {
    id: 'wr1',
    artist: {
      id: 'a1',
      nickname: 'MINSOO',
      handle: '@minsoo_tattoo',
      location: '서울 · 강남',
      avatarUri: '',
    },
    procedureDate: '2024. 05. 20 (월)',
    procedureTime: '15:00',
    bodyPart: '팔 (어깨 ~ 전완)',
    style: '블랙앤그레이',
    daysLeft: 6,
    rewardPoint: 3000,
  },
  {
    id: 'wr2',
    artist: {
      id: 'a2',
      nickname: 'RIN',
      handle: '@rin.ink',
      location: '서울 · 건대',
      avatarUri: '',
    },
    procedureDate: '2024. 05. 15 (수)',
    procedureTime: '16:00',
    bodyPart: '팔 (상완)',
    style: '라인워크',
    daysLeft: 12,
    rewardPoint: 3000,
  },
];

export const MOCK_WRITTEN_REVIEWS: WrittenReview[] = [
  {
    id: 'r1',
    artist: {
      id: 'a1',
      nickname: 'MINSOO',
      handle: '@minsoo_tattoo',
      location: '서울 · 강남',
      avatarUri: '',
    },
    writtenDate: '2026.08.12',
    photos: ['', ''],
    ratings: { pain: 4, kindness: 5, hygiene: 5, satisfaction: 4 },
    text: '상담부터 시술까지 굉장히 섬세했고,\n위생 상태도 매우 만족스러웠어요.\n작업 결과도 기대 이상입니다.',
    canAddHealedPhoto: true,
  },
  {
    id: 'r2',
    artist: {
      id: 'a3',
      nickname: 'YURI',
      handle: '@yuri.art',
      location: '서울 · 홍대',
      avatarUri: '',
    },
    writtenDate: '2026.05.02',
    photos: ['', '', ''],
    ratings: { pain: 3, kindness: 5, hygiene: 5, satisfaction: 5 },
    text: '작품 퀄리티 최고, 색감도 정말 예쁘게 잘 나왔어요.\n다음에도 꼭 다시 방문할 예정입니다.',
    canAddHealedPhoto: false,
  },
];
