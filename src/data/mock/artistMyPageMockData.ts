import {
  ArtistSelfProfile, ArtistArtwork, ArtistReviewItem,
} from '../../domain/entities/artistMyPageTypes';

export const MOCK_ARTIST_SELF: ArtistSelfProfile = {
  id: 'me',
  nickname: 'Artist. Leo',
  handle: '@leo.ink',
  location: '서울 · 성수',
  intro: '블랙워크 · 라인워크 전문. 감성 디테일에 집중합니다.',
  avatarUri: '',
  rating: 4.9,
  reviewCount: 342,
  likes: 1200,
  bookedCount: 58,
  tags: ['same_day', 'parking', 'female_artist'],
};

export const MOCK_ARTIST_ARTWORKS: ArtistArtwork[] = [
  {
    id: 'aw1', type: 'image', thumbnailUri: '',
    title: '블랙워크 천사',
    genre: '블랙워크', bodyPart: '상박',
    subjects: ['인물/캐릭터'], moods: ['다크/퇴폐'],
    priceFrom: 350000, duration: '5시간',
    description: '전면 상박 블랙워크. 사이즈 20cm 전후.',
    isPromoted: true, likes: 128, views: 2340,
  },
  {
    id: 'aw2', type: 'image', thumbnailUri: '',
    title: '미니멀 라인 · 팔찌',
    genre: '라인워크', bodyPart: '손목',
    subjects: ['기호/문양'], moods: ['심플/미니멀'],
    priceFrom: 90000, duration: '1시간',
    description: '라인워크 미니멀. 사이즈 4~6cm.',
    likes: 82, views: 980,
  },
  {
    id: 'aw3', type: 'image', thumbnailUri: '',
    title: '레터링 · 쇄골',
    genre: '레터링', bodyPart: '쇄골',
    subjects: ['글귀/숫자'], moods: ['빈티지/러프'],
    priceFrom: 130000, duration: '2시간',
    description: '레터링 사이즈 8~12cm.',
    likes: 54, views: 1120,
  },
  {
    id: 'aw4', type: 'image', thumbnailUri: '',
    title: '플라워 미니멀',
    genre: '미니타투', bodyPart: '어깨',
    subjects: ['식물/꽃'], moods: ['여리여리한/섬세한'],
    priceFrom: 110000, duration: '1.5시간',
    description: '단일 꽃 도안 미니. 5cm.',
    likes: 41, views: 610,
  },
  {
    id: 'aw5', type: 'image', thumbnailUri: '',
    title: '이레즈미 팔 슬리브',
    genre: '이레즈미', bodyPart: '상박',
    subjects: ['자연/우주'], moods: ['다크/퇴폐', '오리엔탈'],
    priceFrom: 950000, duration: '10시간+',
    description: '풀 슬리브 이레즈미. 상담 후 여러 세션 진행.',
    likes: 216, views: 3620,
  },
  {
    id: 'aw6', type: 'image', thumbnailUri: '',
    title: '기호 · 문양 시리즈',
    genre: '블랙워크', bodyPart: '하박',
    subjects: ['기호/문양'], moods: ['오리엔탈'],
    priceFrom: 200000, duration: '3시간',
    description: '기호/문양 시리즈. 커스텀 도안 상담.',
    likes: 74, views: 1180,
  },
];

export const MOCK_ARTIST_REVIEWS: ArtistReviewItem[] = [
  {
    id: 'rv1',
    customer: '김*훈',
    rating: 5,
    artworkId: 'aw1',
    artworkTitle: '블랙워크 천사',
    content:
      '시술 정말 만족스러웠습니다. 상담 때부터 꼼꼼하게 잡아주시고,\n' +
      '위생 상태도 완벽했어요. 결과물은 기대 이상입니다.',
    imageUris: ['', ''],
    createdAt: '2024.08.02',
    isAnswered: false,
  },
  {
    id: 'rv2',
    customer: '박*진',
    rating: 1,
    artworkId: 'aw3',
    artworkTitle: '레터링 시술 영상',
    content:
      '생각한 톤이랑 조금 달랐어요. 색감이 아쉽고 얇게 나온 부분이 있습니다.',
    imageUris: [''],
    createdAt: '2024.07.29',
    isAnswered: false,
  },
  {
    id: 'rv3',
    customer: '이*민',
    rating: 5,
    artworkId: 'aw2',
    artworkTitle: '미니멀 라인 · 팔찌',
    content: '깔끔한 라인워크. 다음에도 방문할 예정입니다.',
    imageUris: [''],
    createdAt: '2024.07.20',
    isAnswered: true,
    reply: {
      content: '방문해주셔서 감사합니다. 라인 유지 잘 부탁드려요!',
      answeredAt: '2024.07.21',
    },
  },
];
