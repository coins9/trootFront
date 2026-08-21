import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, Dimensions, StatusBar, Share, Linking,
} from 'react-native';
import CachedImage from '../../components/common/CachedImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, ShareIcon, DotsIcon, StarIcon, LocationPinIcon,
  BookmarkIcon, ShieldCheckIcon, LockIcon, ChevronDownIcon, ChevronRightIcon,
  CommentIcon, PersonSilhouette, TattooPlaceholderIcon, ClockIcon, CalendarIcon,
} from '../../components/icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { usePagedApi, useApi } from '../../hooks/useApi';
import { artistApi, favoriteApi, reviewApi, type ReviewByArtist } from '../../../data/api';
import { toTattoo } from '../../../data/api/mappers';
import { Tattoo } from '../../../domain/entities/types';
import { artistTagLabels } from '../../../domain/entities/artistTags';
import BookingBottomSheet from '../../components/booking/BookingBottomSheet';
import ReportSheet, { ReportReason } from '../../components/report/ReportSheet';
import { useToast } from '../../components/common/Toast';
import { useTranslation } from '../../store/languageStore';

const { width: W } = Dimensions.get('window');
const COVER_HEIGHT = 340;
const PORTFOLIO_GAP = 2;
const PORTFOLIO_COL_SIZE = (W - PORTFOLIO_GAP * 2) / 3;

type ProfileRoute = RouteProp<RootStackParamList, 'ArtistProfile'>;
type ProfileNav = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'works' | 'reviews' | 'info';

const ArtistProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileNav>();
  const route = useRoute<ProfileRoute>();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { artist } = route.params;

  const [activeTab, setActiveTab] = useState<TabType>('works');
  const [activeGenreKey, setActiveGenreKey] = useState('all');
  const [sortOrder, setSortOrder] = useState<'recent' | 'popular'>('recent');

  const GRID_GENRES = useMemo(() => [
    { key: 'all', label: t('filter.genreAll') },
    { key: 'black_grey', label: t('filter.genreBlackGrey') },
    { key: 'realistic', label: t('filter.genreRealistic') },
    { key: 'portrait', label: t('filter.genrePortrait') },
    { key: 'mini', label: t('filter.genreMini') },
  ], [t]);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);

  useEffect(() => {
    favoriteApi.check('artist', [artist.id])
      .then((map) => setFollowing(map[artist.id] ?? false))
      .catch(() => {});
  }, [artist.id]);

  const handleFollowToggle = useCallback(async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const next = !following;
    setFollowing(next);
    try {
      await favoriteApi.toggle('artist', artist.id);
    } catch {
      setFollowing(!next);
      toast(t('common.error'), { variant: 'error' });
    } finally {
      setFollowLoading(false);
    }
  }, [following, followLoading, artist.id, toast, t]);
  const [bookingVisible, setBookingVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);

  const handleReportSubmit = useCallback((_reason: ReportReason, _detail: string) => {
    toast(t('artistProfile.reported'), { variant: 'success' });
  }, [toast, t]);

  const { data: reviewPage } = useApi(
    () => reviewApi.byArtist(artist.id, { limit: 5 }),
    [artist.id],
  );
  const recentReviews = reviewPage?.items ?? [];

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `T:ROOT에서 ${artist.nickname} 타투이스트를 확인해보세요!\nhttps://tattooroot.com`,
      });
    } catch {}
  }, [artist.nickname]);

  // 포트폴리오 — 실제 작가 작품 목록
  const { items: artworks, loadMore } = usePagedApi(
    (cursor) => artistApi.artworks(artist.id, { cursor, limit: 30 }),
    [artist.id],
  );
  const artistTattoos = useMemo(() => artworks.map((a) => toTattoo(a)), [artworks]);

  // 장르 필터 + 정렬 — activeGenreKey / sortOrder 변경 시 재계산
  const filteredTattoos = useMemo(() => {
    let result = activeGenreKey === 'all'
      ? artistTattoos
      : artistTattoos.filter((t) => t.genres.includes(activeGenreKey));
    if (sortOrder === 'popular') {
      result = [...result].sort((a, b) => b.likeCount - a.likeCount);
    }
    return result;
  }, [artistTattoos, activeGenreKey, sortOrder]);

  const portfolioImages = useMemo(
    () => filteredTattoos.map((t) => t.images[0] ?? ''),
    [filteredTattoos],
  );
  const portfolioItems = showAllPortfolio ? portfolioImages : portfolioImages.slice(0, 9);

  const handleTattooPress = useCallback(
    (tattoo: Tattoo) => navigation.navigate('TattooDetail', { tattoo }),
    [navigation],
  );

  const renderPortfolioItem = (item: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.portfolioItem}
      activeOpacity={0.85}
      onPress={() => {
        const tattoo = filteredTattoos[index];
        if (tattoo) handleTattooPress(tattoo);
      }}
    >
      {item ? (
        <Image source={{ uri: item }} style={styles.portfolioImage} resizeMode="cover" />
      ) : (
        <View style={styles.portfolioPlaceholder}>
          <TattooPlaceholderIcon size={40} color="#2e2e2e" />
        </View>
      )}
      <View style={styles.multiIcon}>
        <View style={styles.multiIconInner} />
      </View>
      {artist.isSelectedMaster && (
        <View style={styles.selectedMasterBadge}>
          <Text style={styles.selectedMasterBadgeText}>★ SM</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderReviewItem = (rv: ReviewByArtist) => {
    const avg = (rv.painScore + rv.kindnessScore + rv.hygieneScore + rv.satisfactionScore) / 4;
    const score = Math.round(avg * 10) / 10;
    const date = new Date(rv.createdAt).toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
    const customer = rv.customerNickname
      ? `${rv.customerNickname.slice(0, 2)}${'*'.repeat(Math.max(rv.customerNickname.length - 2, 2))}`
      : '익명';
    return (
      <View key={rv.id} style={styles.reviewCard}>
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon key={s} size={15} color={COLORS.gold} filled={s <= Math.round(avg)} />
          ))}
          <Text style={styles.reviewScore}>{score.toFixed(1)}</Text>
        </View>
        <Text style={styles.reviewMeta}>{customer} | {date}</Text>
        <View style={styles.reviewBody}>
          <View style={styles.reviewTextBlock}>
            <Text style={styles.reviewText} numberOfLines={4}>{rv.body}</Text>
          </View>
          {rv.images.length > 0 && (
            <View style={styles.reviewImages}>
              {rv.images.slice(0, 2).filter(Boolean).map((uri, i) => (
                <CachedImage key={i} uri={uri} style={styles.reviewImageReal} resizeMode="cover" />
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderReviewsTab = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {recentReviews.length === 0 ? (
        <View style={styles.reviewEmpty}>
          <Text style={styles.reviewEmptyText}>{t('artistProfile.noReviews')}</Text>
        </View>
      ) : (
        recentReviews.map(renderReviewItem)
      )}
    </View>
  );

  const renderInfoTab = () => (
    <View style={styles.infoTab}>
      <View style={styles.infoTabRow}>
        <View style={styles.infoTabItem}>
          <LocationPinIcon size={18} color={COLORS.gold} />
          <View style={styles.infoTabTextGroup}>
            <Text style={styles.infoTabLabel}>{t('artistProfile.regionLabel')}</Text>
            <Text style={styles.infoTabValue}>{artist.city} · {artist.district}</Text>
          </View>
        </View>
        {!!artist.availableHours && (
          <View style={styles.infoTabItem}>
            <ClockIcon size={18} color={COLORS.gold} />
            <View style={styles.infoTabTextGroup}>
              <Text style={styles.infoTabLabel}>{t('artistProfile.consultLabel')}</Text>
              <Text style={styles.infoTabValue}>{artist.availableHours}</Text>
            </View>
          </View>
        )}
        {!!artist.closedDay && (
          <View style={styles.infoTabItem}>
            <CalendarIcon size={18} color={COLORS.gold} />
            <View style={styles.infoTabTextGroup}>
              <Text style={styles.infoTabLabel}>{t('artistProfile.dayOffLabel')}</Text>
              <Text style={styles.infoTabValue}>{artist.closedDay}</Text>
            </View>
          </View>
        )}
        {!!artist.bio && (
          <View style={styles.infoTabItem}>
            <PersonSilhouette size={18} color={COLORS.gold} />
            <View style={styles.infoTabTextGroup}>
              <Text style={styles.infoTabLabel}>소개</Text>
              <Text style={styles.infoTabValue}>{artist.bio}</Text>
            </View>
          </View>
        )}
        {!!artist.kakaoLink && (
          <TouchableOpacity
            style={styles.infoTabItem}
            activeOpacity={0.8}
            onPress={() => Linking.openURL(artist.kakaoLink!).catch(() => {})}
          >
            <CommentIcon size={18} color={COLORS.gold} strokeWidth={2} />
            <View style={styles.infoTabTextGroup}>
              <Text style={styles.infoTabLabel}>카카오 오픈채팅</Text>
              <Text style={[styles.infoTabValue, { color: COLORS.gold }]}>채팅방 바로가기 →</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        style={styles.scroll}
      >
        {/* ── 상단 커버 + 프로필 헤더 (스크린샷3 목업 그대로) ── */}
        <View style={styles.coverWrapper}>
          {artist.coverImage ? (
            <Image
              source={{ uri: artist.coverImage }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]} />
          )}
          <View style={styles.coverGradient} pointerEvents="none" />

          {/* Top action buttons */}
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.topBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BackArrowIcon size={22} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.topRight}>
              <TouchableOpacity
                style={styles.topBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={handleShare}
              >
                <ShareIcon size={22} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.topBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => setReportVisible(true)}
              >
                <DotsIcon size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile header — avatar + info side-by-side */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              {artist.profileImage ? (
                <Image
                  source={{ uri: artist.profileImage }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <PersonSilhouette size={68} color="#3a3a3a" />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.nickname}>{artist.nickname}</Text>
              <View style={styles.locationRow}>
                <LocationPinIcon size={13} color={COLORS.gray} />
                <Text style={styles.locationText}>{artist.city} · {artist.district}</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <StarIcon size={13} color={COLORS.gold} filled />
                  <Text style={styles.statValue}>{artist.rating}</Text>
                  <Text style={styles.statLabelSmall}>{t('artistProfile.reviewScore', { count: artist.reviewCount } as any)}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItemStack}>
                  <Text style={styles.statValueBig}>{artist.followerCount}</Text>
                  <Text style={styles.statLabelSmall}>{t('artistProfile.followers')}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItemStack}>
                  <Text style={styles.statValueBig}>{artist.totalSessions}</Text>
                  <Text style={styles.statLabelSmall}>{t('artistProfile.totalSessions')}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Sticky tab bar wrapper (index 1) */}
        <View style={styles.stickySection}>
          {/* Specialty + Actions + Badges */}
          <View style={styles.underCoverBlock}>
            <View style={styles.specialtiesRow}>
              {artist.specialties.map((s) => (
                <View key={s} style={styles.specialtyChip}>
                  <Text style={styles.specialtyText}>{s}</Text>
                </View>
              ))}
            </View>

            {artistTagLabels(artist.tags).length > 0 && (
              <View style={styles.tagsRow}>
                {artistTagLabels(artist.tags).map((t) => (
                  <View key={t} style={styles.tagChip}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={handleFollowToggle}
                style={[styles.followBtn, following && styles.followBtnActive]}
                activeOpacity={0.8}
              >
                <BookmarkIcon
                  size={16}
                  color={following ? COLORS.gold : COLORS.white}
                  filled={following}
                />
                <Text style={[styles.followText, following && styles.followTextActive]}>
                  {following ? t('artistProfile.following') : t('artistProfile.follow')}
                </Text>
              </TouchableOpacity>
              {artist.kakaoLink ? (
                <TouchableOpacity
                  style={styles.kakaoBtn}
                  activeOpacity={0.85}
                  onPress={() => Linking.openURL(artist.kakaoLink!).catch(() => {})}
                >
                  <CommentIcon size={16} color={COLORS.black} strokeWidth={2} />
                  <Text style={styles.kakaoText}>오픈채팅</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={[styles.consultBtn, artist.kakaoLink ? styles.consultBtnNarrow : undefined]}
                activeOpacity={0.85}
                onPress={() => setBookingVisible(true)}
              >
                <CommentIcon size={16} color={COLORS.black} strokeWidth={2} />
                <Text style={styles.consultText}>{t('artistProfile.cta')}</Text>
              </TouchableOpacity>
            </View>

            {/* 3-column badge card */}
            <View style={styles.badgeCard}>
              <View style={styles.badgeCol}>
                <ShieldCheckIcon size={18} color={COLORS.gold} />
                <Text style={styles.badgeTitle}>{t('artistProfile.certified')}</Text>
                <Text style={styles.badgeSub}>{t('artistProfile.certifiedSub')}</Text>
              </View>
              <View style={styles.badgeDivider} />
              <View style={styles.badgeCol}>
                <ShieldCheckIcon size={18} color={COLORS.gold} />
                <Text style={styles.badgeTitle}>{t('artistProfile.hygienic')}</Text>
                <Text style={styles.badgeSub}>{t('artistProfile.hygienicSub')}</Text>
              </View>
              <View style={styles.badgeDivider} />
              <View style={styles.badgeCol}>
                <LockIcon size={18} color={COLORS.gold} />
                <Text style={styles.badgeTitle}>{t('artistProfile.depositProtect')}</Text>
                <Text style={styles.badgeSub}>{t('artistProfile.depositProtectSub')}</Text>
              </View>
            </View>
          </View>

          {/* Tab bar */}
          <View style={styles.tabBar}>
            {([
              { key: 'works' as TabType, label: t('artistProfile.tabWorks') },
              { key: 'reviews' as TabType, label: t('artistProfile.reviewCount', { count: artist.reviewCount } as any) },
              { key: 'info' as TabType, label: t('artistProfile.tabInfo') },
            ]).map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Content by tab ── */}
        {activeTab === 'works' && (
          <View>
            <View style={styles.genreFilterRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.genreFilterContent}
                style={{ flex: 1 }}
              >
                {GRID_GENRES.map((g) => {
                  const isActive = activeGenreKey === g.key;
                  return (
                    <TouchableOpacity
                      key={g.key}
                      onPress={() => setActiveGenreKey(g.key)}
                      style={[styles.genreChip, isActive && styles.genreChipActive]}
                    >
                      <Text style={[styles.genreChipText, isActive && styles.genreChipTextActive]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                style={styles.sortBtn}
                onPress={() => setSortOrder((prev) => prev === 'recent' ? 'popular' : 'recent')}
              >
                <Text style={styles.sortText}>
                  {sortOrder === 'recent' ? t('artistProfile.sortLatest') : '인기순'}
                </Text>
                <ChevronDownIcon size={12} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.portfolioGrid}>
              {portfolioItems.map((item, idx) => renderPortfolioItem(item, idx))}
            </View>

            {!showAllPortfolio && portfolioImages.length > 9 && (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => { setShowAllPortfolio(true); loadMore(); }}
                activeOpacity={0.85}
              >
                <Text style={styles.showMoreText}>{t('artistProfile.moreWorks')}</Text>
                <ChevronDownIcon size={16} color={COLORS.gray} />
              </TouchableOpacity>
            )}

            {/* Latest Reviews */}
            {recentReviews.length > 0 && (
              <>
                <View style={styles.latestReviewHeader}>
                  <Text style={styles.latestReviewTitle}>{t('artistProfile.latestReviews')}</Text>
                  <TouchableOpacity
                    style={styles.moreReviews}
                    onPress={() => setActiveTab('reviews')}
                  >
                    <Text style={styles.moreReviewsText}>{t('artistProfile.moreReviews')}</Text>
                    <ChevronRightIcon size={13} color={COLORS.gray} />
                  </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 16 }}>
                  {renderReviewItem(recentReviews[0])}
                </View>
              </>
            )}

            {/* 하단 정보 3컬럼 */}
            <View style={styles.bottomInfoRow}>
              <View style={styles.bottomInfoItem}>
                <LocationPinIcon size={16} color={COLORS.gold} />
                <View style={styles.bottomInfoTextGroup}>
                  <Text style={styles.bottomInfoLabel}>{t('artistProfile.regionLabel')}</Text>
                  <Text style={styles.bottomInfoValue}>{artist.city} · {artist.district}</Text>
                </View>
              </View>
              <View style={styles.bottomInfoItem}>
                <View style={styles.clockDot}>
                  <View style={styles.clockRing} />
                </View>
                <View style={styles.bottomInfoTextGroup}>
                  <Text style={styles.bottomInfoLabel}>{t('artistProfile.consultLabel')}</Text>
                  <Text style={styles.bottomInfoValue}>{artist.availableHours}</Text>
                </View>
              </View>
              <View style={styles.bottomInfoItem}>
                <View style={styles.calendarDot}>
                  <View style={styles.calendarInner} />
                </View>
                <View style={styles.bottomInfoTextGroup}>
                  <Text style={styles.bottomInfoLabel}>{t('artistProfile.dayOffLabel')}</Text>
                  <Text style={styles.bottomInfoValue}>{artist.closedDay}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        {activeTab === 'reviews' && renderReviewsTab()}
        {activeTab === 'info' && renderInfoTab()}

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>

      <BookingBottomSheet
        visible={bookingVisible}
        artistPageId={artist.id}
        artistName={artist.nickname}
        artistKakaoLink={artist.kakaoLink}
        onClose={() => setBookingVisible(false)}
      />

      <ReportSheet
        visible={reportVisible}
        targetName={artist.nickname}
        onClose={() => setReportVisible(false)}
        onSubmit={handleReportSubmit}
        onViewPolicy={() => navigation.navigate('SafetyPolicy')}
      />
    </View>
  );
};

export default ArtistProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },

  /* ── Cover section ── */
  coverWrapper: {
    width: '100%',
    height: COVER_HEIGHT,
    position: 'relative',
    backgroundColor: '#0a0a0a',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: '#0a0a0a',
  },
  coverGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRight: {
    flexDirection: 'row',
    gap: 4,
  },

  /* ── Profile header (avatar + info side-by-side) ── */
  profileHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 14,
  },
  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  nickname: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  locationText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statItemStack: {
    alignItems: 'flex-start',
    gap: 1,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  statValueBig: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 19,
  },
  statLabelSmall: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: COLORS.gray3,
    opacity: 0.6,
  },

  /* ── Sticky section (specialty + actions + badges + tabs) ── */
  stickySection: {
    backgroundColor: COLORS.bg,
  },
  underCoverBlock: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 14,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  specialtyText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tagChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.4)',
    backgroundColor: 'rgba(212,168,67,0.13)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: COLORS.gold,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: 'transparent',
  },
  followBtnActive: {
    backgroundColor: COLORS.goldDim,
  },
  followText: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  followTextActive: {
    color: COLORS.gold,
  },
  consultBtn: {
    flex: 2.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
  },
  consultBtnNarrow: {
    flex: 1.6,
  },
  consultText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  kakaoBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FEE500',
  },
  kakaoText: {
    color: '#3C1E1E',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },

  /* ── Badge card (3 columns) ── */
  badgeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  badgeDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  badgeTitle: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    textAlign: 'center',
  },
  badgeSub: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },

  /* ── Tab bar ── */
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: COLORS.gold,
  },
  tabText: {
    color: COLORS.gray,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },

  /* ── Genre sub-filter ── */
  genreFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  genreFilterContent: {
    gap: 8,
    alignItems: 'center',
    paddingRight: 8,
  },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
  },
  genreChipActive: {
    borderColor: COLORS.gold,
  },
  genreChipText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  genreChipTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  sortText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },

  /* ── Portfolio grid ── */
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PORTFOLIO_GAP,
  },
  portfolioItem: {
    width: PORTFOLIO_COL_SIZE,
    height: PORTFOLIO_COL_SIZE,
    position: 'relative',
    backgroundColor: COLORS.elevated,
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  portfolioPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiIconInner: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.card,
  },
  showMoreText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
  },

  /* ── Latest review header ── */
  latestReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  latestReviewTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  moreReviews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moreReviewsText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },

  /* ── Review card ── */
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reviewScore: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginLeft: 6,
  },
  reviewMeta: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  reviewBody: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  reviewTextBlock: {
    flex: 1,
    flexShrink: 1,
  },
  reviewText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 20,
  },
  reviewImages: {
    flexDirection: 'row',
    gap: 6,
  },
  reviewImage: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewImageReal: {
    width: 68,
    height: 68,
    borderRadius: 8,
  },
  reviewEmpty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  reviewEmptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
  reviewDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 12,
  },
  reviewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray3,
  },
  reviewDotActive: {
    backgroundColor: COLORS.gold,
    width: 16,
  },

  /* ── Bottom info row (3 cols) ── */
  bottomInfoRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  bottomInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bottomInfoTextGroup: {
    flexShrink: 1,
    gap: 2,
  },
  bottomInfoLabel: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  bottomInfoValue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  clockDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  clockRing: {
    width: 6,
    height: 6,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: COLORS.gold,
  },
  calendarDot: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  calendarInner: {
    width: 8,
    height: 6,
    backgroundColor: COLORS.gold,
    opacity: 0.4,
  },

  /* ── Info tab ── */
  infoTab: {
    padding: 20,
    gap: 20,
  },
  infoTabRow: {
    gap: 20,
  },
  infoTabItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTabTextGroup: {
    flex: 1,
    gap: 2,
  },
  infoTabLabel: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  infoTabValue: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },

  /* ── Selected Master badge on portfolio items ── */
  selectedMasterBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  selectedMasterBadgeText: {
    color: COLORS.black,
    fontSize: 8,
    fontWeight: '800',
    lineHeight: 11,
  },
});
