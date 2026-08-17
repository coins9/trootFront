import { api, qs, type CursorPage } from './client';

export { ApiError } from './client';
export type { CursorPage } from './client';

// ── 타투이스트 · 작품 ─────────────────────────────────────
export interface ArtistPage {
  id: string;
  userId: string;
  pageName: string;
  handle: string;
  bio: string | null;
  profileImage: string | null;
  coverImage: string | null;
  tier: 'main' | 'general' | 'beginner';
  isSelectedMaster: boolean;
  regionSido: string | null;
  regionSigungu: string | null;
  genres: string[];
  rating: string;
  reviewCount: number;
  portfolioCount: number;
  followerCount: number;
}

export interface Artwork {
  id: string;
  artistPageId: string;
  artist?: ArtistPage;
  type: 'tattoo' | 'design';
  title: string;
  titleEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  images: string[];
  thumbnail: string | null;
  genres: string[];
  bodyPart: string | null;
  sizePreset: string | null;
  priceKrw: number | null;
  likeCount: number;
  viewCount: number;
  isPromoted: boolean;
  createdAt: string;
}

export const artistApi = {
  selectedMasters: () => api.get<ArtistPage[]>('/app/artists/selected-masters'),

  list: (p: {
    cursor?: string; limit?: number; region?: string; genre?: string;
    sort?: 'recent' | 'rating' | 'popular';
    lat?: number; lng?: number; radiusKm?: number;
  }) => api.get<CursorPage<ArtistPage>>(`/app/artists${qs(p)}`),

  detail: (id: string) => api.get<ArtistPage>(`/app/artists/${id}`),

  artworks: (id: string, p: { cursor?: string; limit?: number } = {}) =>
    api.get<CursorPage<Artwork>>(`/app/artists/${id}/artworks${qs(p)}`),

  feed: (p: { cursor?: string; limit?: number; sort?: 'recent' | 'popular'; keyword?: string } = {}) =>
    api.get<CursorPage<Artwork>>(`/app/artists/feed${qs(p)}`),

  // 타투이스트 본인
  me: () => api.get<ArtistPage>('/app/artists/me'),
  createPage: (body: {
    pageName: string; handle: string; bio?: string;
    regionSido?: string; regionSigungu?: string;
  }) => api.post<ArtistPage>('/app/artists', body),
  updateMe: (body: Partial<ArtistPage>) => api.patch<ArtistPage>('/app/artists/me', body),
  freeUp: () => api.post<{ bumpedAt: string }>('/app/artists/me/up'),

  myArtworks: (p: { cursor?: string; limit?: number } = {}) =>
    api.get<CursorPage<Artwork>>(`/app/artists/me/artworks${qs(p)}`),
  createArtwork: (body: Partial<Artwork>) => api.post<Artwork>('/app/artists/me/artworks', body),
  updateArtwork: (id: string, body: Partial<Artwork>) =>
    api.patch<Artwork>(`/app/artists/me/artworks/${id}`, body),
  deleteArtwork: (id: string) => api.delete<{ deleted: boolean }>(`/app/artists/me/artworks/${id}`),
};

// ── 예약 ──────────────────────────────────────────────────
export type ReservationStatus =
  | 'requested' | 'confirmed' | 'deposit_paid' | 'completed' | 'cancelled' | 'no_show';

export interface Reservation {
  id: string;
  customerId: string;
  artistPageId: string;
  artworkId: string | null;
  scheduledAt: string;
  durationMinutes: number;
  bodyPart: string | null;
  sizePreset: string | null;
  memo: string | null;
  referenceImages: string[];
  status: ReservationStatus;
  depositKrw: number;
  depositStatus: 'none' | 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

/** 백엔드 원본 상태값(영문 enum) — 확정/필터에 그대로 사용 */
export type BackendReservationStatus =
  | 'requested' | 'confirmed' | 'deposit_paid' | 'completed' | 'cancelled' | 'no_show';

/** 고객 예약 목록 뷰 — 어떤 타투이스트에게/언제/무슨 시술인지 (작가 정보 포함) */
export interface CustomerReservationView {
  id: string;
  status: BackendReservationStatus;
  scheduledAt: string;
  durationMinutes: number;
  bodyPart: string | null;
  sizePreset: string | null;
  depositKrw: number;
  depositStatus: 'none' | 'pending' | 'paid' | 'refunded';
  estimatedPriceKrw: number | null;
  createdAt: string;
  artist: {
    id: string;
    pageName: string;
    profileImage: string | null;
    regionSido: string | null;
    regionSigungu: string | null;
  } | null;
}

/** 타투이스트 예약함 뷰 — 누가/언제/무엇을 요청했는지 (고객 정보 포함) */
export interface ArtistReservationView {
  id: string;
  status: BackendReservationStatus;
  scheduledAt: string;
  durationMinutes: number;
  bodyPart: string | null;
  sizePreset: string | null;
  memo: string | null;
  referenceImages: string[];
  estimatedPriceKrw: number | null;
  depositKrw: number;
  depositStatus: 'none' | 'pending' | 'paid' | 'refunded';
  artworkId: string | null;
  createdAt: string;
  customer: { id: string; nickname: string | null; profileImage: string | null } | null;
}

export const reservationApi = {
  create: (body: {
    artistPageId: string; scheduledAt: string; artworkId?: string;
    durationMinutes?: number; bodyPart?: string; sizePreset?: string;
    memo?: string; referenceImages?: string[];
  }) => api.post<Reservation>('/app/reservations', body),

  mine: (p: { cursor?: string; limit?: number } = {}) =>
    api.get<CursorPage<CustomerReservationView>>(`/app/reservations/me${qs(p)}`),

  reviewable: () => api.get<ReviewableItem[]>('/app/reservations/me/reviewable'),

  forArtist: (p: { status?: BackendReservationStatus; depositStatus?: 'pending' | 'paid' | 'refunded'; cursor?: string; limit?: number } = {}) =>
    api.get<CursorPage<ArtistReservationView>>(`/app/reservations/artist${qs(p)}`),

  /** 타투이스트: 예약 요청 확정 (requested → confirmed) */
  confirmByArtist: (id: string) =>
    api.patch<ArtistReservationView>(`/app/reservations/${id}/status`, { status: 'confirmed' }),
  /** 타투이스트: 예약 요청 거절/취소 */
  rejectByArtist: (id: string, reason?: string) =>
    api.patch<ArtistReservationView>(`/app/reservations/${id}/status`, { status: 'cancelled', reason }),

  schedule: (from: string, to: string) =>
    api.get<Reservation[]>(`/app/reservations/artist/schedule${qs({ from, to })}`),

  depositSummary: () =>
    api.get<Record<'pending' | 'paid' | 'refunded', { count: number; sum: number }>>(
      '/app/reservations/artist/deposits/summary',
    ),

  detail: (id: string) => api.get<Reservation>(`/app/reservations/${id}`),

  changeStatus: (id: string, status: ReservationStatus, reason?: string) =>
    api.patch<Reservation>(`/app/reservations/${id}/status`, { status, reason }),

  requestDeposit: (id: string, amountKrw: number) =>
    api.patch<Reservation>(`/app/reservations/${id}/deposit/request`, { amountKrw }),

  confirmDeposit: (id: string) =>
    api.patch<Reservation>(`/app/reservations/${id}/deposit/confirm`, {}),
};

// ── 리뷰 ──────────────────────────────────────────────────
/** 카드 렌더용 작가 요약 (백엔드 조인) */
export interface ArtistMini {
  id: string;
  pageName: string;
  profileImage: string | null;
  regionSido: string | null;
  regionSigungu: string | null;
}

export interface Review {
  id: string;
  reservationId: string;
  authorId: string;
  artistPageId: string;
  painScore: number;
  kindnessScore: number;
  hygieneScore: number;
  satisfactionScore: number;
  averageScore: string;
  body: string;
  images: string[];
  healedImages: string[];
  bodyPart: string | null;
  reply: string | null;
  createdAt: string;
}

export type ReviewWithArtist = Review & { artist: ArtistMini | null };
/** 타투이스트가 자신의 페이지에서 보는 리뷰 — 고객 닉네임 조인 */
export type ReviewByArtist = Review & { customerNickname: string | null };

/** 리뷰 작성 가능한 완료 예약 (작가 조인) */
export interface ReviewableItem {
  id: string;
  artistPageId: string;
  artworkId: string | null;
  scheduledAt: string;
  bodyPart: string | null;
  sizePreset: string | null;
  updatedAt: string;
  artist: ArtistMini | null;
}

export const reviewApi = {
  create: (body: {
    reservationId: string; painScore: number; kindnessScore: number;
    hygieneScore: number; satisfactionScore: number; body: string; images?: string[];
  }) => api.post<Review>('/app/reviews', body),

  mine: (p: { cursor?: string; limit?: number } = {}) =>
    api.get<CursorPage<ReviewWithArtist>>(`/app/reviews/me${qs(p)}`),

  byArtist: (artistPageId: string, p: { cursor?: string; limit?: number } = {}) =>
    api.get<CursorPage<ReviewByArtist>>(`/app/reviews/artists/${artistPageId}${qs(p)}`),

  summary: (artistPageId: string) =>
    api.get<{ pain: number; kindness: number; hygiene: number; satisfaction: number; count: number }>(
      `/app/reviews/artists/${artistPageId}/summary`,
    ),

  addHealed: (id: string, images: string[]) =>
    api.post<Review>(`/app/reviews/${id}/healed`, { images }),

  reply: (id: string, body: string) => api.post<Review>(`/app/reviews/${id}/reply`, { body }),
};

// ── 샵 & 매칭 ─────────────────────────────────────────────
export type ShopCategory = 'booth_share' | 'booth_share_overseas' | 'model_recruit' | 'media_expert';

export interface ShopPost {
  id: string;
  authorId: string;
  category: ShopCategory;
  title: string;
  titleEn: string | null;
  description: string;
  descriptionEn: string | null;
  region: string | null;
  images: string[];
  attributes: Record<string, unknown>;
  priceKrw: number | null;
  contact: string | null;
  status: 'open' | 'closed' | 'hidden';
  viewCount: number;
  likeCount: number;
  applicationCount: number;
  createdAt: string;
}

export const shopApi = {
  list: (p: { category: ShopCategory; region?: string; keyword?: string; cursor?: string; limit?: number }) =>
    api.get<CursorPage<ShopPost>>(`/app/shop-posts${qs(p)}`),

  detail: (id: string) => api.get<ShopPost>(`/app/shop-posts/${id}`),

  mine: (p: { cursor?: string; limit?: number } = {}) =>
    api.get<CursorPage<ShopPost>>(`/app/shop-posts/me${qs(p)}`),

  create: (body: Partial<ShopPost> & { category: ShopCategory; title: string; description: string }) =>
    api.post<ShopPost>('/app/shop-posts', body),

  update: (id: string, body: Partial<ShopPost>) => api.patch<ShopPost>(`/app/shop-posts/${id}`, body),

  setStatus: (id: string, status: 'open' | 'closed') =>
    api.patch<ShopPost>(`/app/shop-posts/${id}/status`, { status }),

  remove: (id: string) => api.delete<{ deleted: boolean }>(`/app/shop-posts/${id}`),

  apply: (id: string, body: { answers?: Record<string, unknown>; message?: string }) =>
    api.post<{ id: string }>(`/app/shop-posts/${id}/apply`, body),

  applications: (id: string) => api.get<unknown[]>(`/app/shop-posts/${id}/applications`),
};

// ── 찜 ────────────────────────────────────────────────────
export type FavoriteType = 'artist' | 'artwork' | 'shop_post' | 'supply';

export interface Favorite {
  id: string;
  userId: string;
  type: FavoriteType;
  targetId: string;
  createdAt: string;
}

/** 찜 + 대상 실데이터 (백엔드가 타입에 맞는 엔티티를 조인해 내려줌) */
export interface FavoriteItem<T = Artwork | ArtistPage | SupplyProduct | ShopPost> {
  id: string;
  type: FavoriteType;
  targetId: string;
  createdAt: string;
  target: T | null;
}

export const favoriteApi = {
  list: <T = Artwork | ArtistPage | SupplyProduct | ShopPost>(
    type: FavoriteType,
    p: { cursor?: string; limit?: number } = {},
  ) => api.get<CursorPage<FavoriteItem<T>>>(`/app/favorites${qs({ type, ...p })}`),

  toggle: (type: FavoriteType, targetId: string) =>
    api.post<{ favorited: boolean }>('/app/favorites/toggle', { type, targetId }),

  /** 목록 렌더링 시 N+1 을 피하려 한 번에 조회 */
  check: (type: FavoriteType, targetIds: string[]) =>
    api.post<Record<string, boolean>>('/app/favorites/check', { type, targetIds }),
};

// ── 광고 ──────────────────────────────────────────────────
export type AdType = 'superup' | 'cardad' | 'banner';
/** 광고 노출 면 — 작품·용품샵·부스쉐어·사진영상·타투모델 */
export type AdPlacement = 'artwork' | 'product' | 'booth' | 'media' | 'model';

export interface AdCampaign {
  id: string;
  ownerUserId: string;
  placement: AdPlacement;
  targetId: string | null;
  type: AdType;
  productCode: string;
  planLabel: string;
  priceKrw: number;
  remainingCount: number;
  status: 'pending' | 'active' | 'completed' | 'refunded';
  regionKey: string | null;
  genreKey: string | null;
  adminPriority: number;
  startedAt: string | null;
  expiresAt: string | null;
  impressions: number;
  clicks: number;
}

export interface AdProduct {
  code: string;
  label: string;
  price: number;
  quantity?: number;
  days?: number;
}

export interface PurchaseAdInput {
  placement: AdPlacement;
  type: AdType;
  productCode: string;
  targetId?: string;
  regionKey?: string;
  genreKey?: string;
}

export const adApi = {
  products: () => api.get<Record<AdType, AdProduct[]>>('/app/ads/products'),
  mine: () => api.get<AdCampaign[]>('/app/ads/me'),
  stats: () =>
    api.get<{ impressions: number; clicks: number; spend: number; activeCount: number; ctr: number }>(
      '/app/ads/me/stats',
    ),
  /** 세그먼트 잔여 슬롯 — 구매 화면 '매진' 표시 */
  availability: (placement: AdPlacement, regionKey: string, genreKey?: string) =>
    api.get<{ used: number; total: number; available: number }>(
      `/app/ads/availability${qs({ placement, regionKey, genreKey })}`,
    ),
  purchase: (input: PurchaseAdInput) => api.post<AdCampaign>('/app/ads/purchase', input),
  useSuperUp: (campaignId: string, targetId: string) =>
    api.post<AdCampaign>('/app/ads/super-up', { campaignId, targetId }),
  /** 목록/피드가 세그먼트 광고를 받아감 (라운드로빈) */
  serving: (placement: AdPlacement, type: AdType, regionKey?: string, genreKey?: string) =>
    api.get<AdCampaign[]>(`/app/ads/serving${qs({ placement, type, regionKey, genreKey })}`),
};

// ── 타투용품 ──────────────────────────────────────────────
export type ProductCategory =
  | 'machine' | 'needle' | 'ink' | 'hygiene' | 'stencil' | 'aftercare' | 'furniture' | 'etc';

export interface SupplyProduct {
  id: string;
  vendorId: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  brand: string | null;
  priceKrw: number;
  stock: number;
  images: string[];
  thumbnail: string | null;
  attributes: Record<string, unknown>;
  rating: string;
  reviewCount: number;
  soldCount: number;
  externalUrl: string | null;
  createdAt: string;
}

export const supplyApi = {
  list: (p: {
    category?: ProductCategory; keyword?: string;
    sort?: 'recent' | 'price_asc' | 'price_desc' | 'popular';
    cursor?: string; limit?: number;
  } = {}) => api.get<CursorPage<SupplyProduct>>(`/app/supplies/products${qs(p)}`),

  detail: (id: string) => api.get<SupplyProduct>(`/app/supplies/products/${id}`),
};

// ── 신고 ──────────────────────────────────────────────────
export const reportApi = {
  create: (body: {
    targetType: 'artist' | 'user' | 'post';
    targetId: string;
    targetUserId?: string;
    reason: 'price_deception' | 'design_theft' | 'proxy_artist' | 'false_info' | 'etc';
    detail?: string;
  }) => api.post<{ id: string; sanctioned: boolean }>('/app/reports', body),
};

// ── 사용자 ────────────────────────────────────────────────
export const userApi = {
  me: () => api.get<{
    id: string; nickname: string | null; email: string | null;
    profileImage: string | null; activeRole: string; roles: string[];
    onboarded: boolean; language: string; status: string;
  }>('/app/users/me'),

  nicknameAvailable: (nickname: string) =>
    api.get<{ available: boolean }>(`/app/users/nickname/available${qs({ nickname })}`),

  updateNickname: (nickname: string) => api.patch('/app/users/me/nickname', { nickname }),
  updateLanguage: (language: string) => api.patch('/app/users/me/language', { language }),
  updateFcmToken: (fcmToken: string, platform: 'ios' | 'android') =>
    api.patch('/app/users/me/fcm-token', { fcmToken, platform }),
  switchRole: (role: 'USER' | 'TATTOOIST') => api.patch('/app/users/me/role', { role }),
  withdraw: () => api.delete<void>('/app/users/me'),
};
