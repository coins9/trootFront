import type { Artist, Tattoo } from '../../domain/entities/types';
import type { ArtistPage, Artwork } from './index';

/**
 * 서버 DTO → 화면이 사용하는 도메인 모델 변환.
 * UI 컴포넌트를 그대로 두고 데이터 소스만 교체하기 위한 어댑터 계층.
 */

const formatCount = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

export const toArtist = (page: ArtistPage): Artist => ({
  id: page.id,
  nickname: page.pageName,
  city: page.regionSido ?? '',
  district: page.regionSigungu ?? '',
  genres: page.genres ?? [],
  rating: Number(page.rating ?? 0),
  reviewCount: page.reviewCount,
  followerCount: formatCount(page.followerCount),
  totalSessions: formatCount(page.portfolioCount),
  profileImage: page.profileImage ?? '',
  coverImage: page.coverImage ?? '',
  specialties: page.genres ?? [],
  bio: page.intro ?? page.bio ?? '',
  availableHours: page.availableHours ?? '',
  closedDay: page.closedDay ?? '',
  kakaoLink: page.openChatUrl ?? undefined,
  tags: page.tags ?? [],
  isVerified: page.tier === 'main',
  isHygieneCertified: false,
  hasDepositProtection: false,
  isPromoted: false,
  isSelectedMaster: page.isSelectedMaster,
});

export const toTattoo = (artwork: Artwork, favorited = false): Tattoo => ({
  id: artwork.id,
  artistId: artwork.artistPageId,
  artist: artwork.artist
    ? toArtist(artwork.artist)
    : ({
        id: artwork.artistPageId,
        nickname: '',
        city: '',
        district: '',
        genres: [],
        rating: 0,
        reviewCount: 0,
        followerCount: '0',
        totalSessions: '0',
        profileImage: '',
        coverImage: '',
        specialties: [],
        bio: '',
        availableHours: '',
        closedDay: '',
        kakaoLink: undefined,
        tags: [],
        isVerified: false,
        isHygieneCertified: false,
        hasDepositProtection: false,
        isPromoted: false,
        isSelectedMaster: false,
      } as Artist),
  title: artwork.title,
  titleEn: artwork.titleEn ?? null,
  description: artwork.description ?? '',
  descriptionEn: artwork.descriptionEn ?? null,
  images: artwork.images?.length ? artwork.images : artwork.thumbnail ? [artwork.thumbnail] : [],
  tags: [],
  genres: artwork.genres ?? [],
  bodyParts: artwork.bodyPart ? [artwork.bodyPart] : [],
  subjects: [],
  moods: [],
  sizePreset: artwork.sizePreset ?? null,
  minPrice: artwork.priceKrw ?? 0,
  likeCount: artwork.likeCount,
  commentCount: 0,
  viewCount: formatCount(artwork.viewCount),
  isBookmarked: favorited,
  isPromoted: artwork.isPromoted,
});
