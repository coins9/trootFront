import React, { useState, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, Dimensions, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, ShareIcon, DotsIcon, StarIcon, LocationPinIcon,
  BookmarkIcon, ShieldCheckIcon, LockIcon, ChevronDownIcon, ChevronRightIcon,
  CommentIcon, PersonSilhouette, TattooPlaceholderIcon,
} from '../../components/icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { MOCK_TATTOOS, PORTFOLIO_IMAGES } from '../../../data/mock/mockData';
import { Tattoo } from '../../../domain/entities/types';
import BookingBottomSheet from '../../components/booking/BookingBottomSheet';
import ReportSheet, { ReportReason } from '../../components/report/ReportSheet';
import { useToast } from '../../components/common/Toast';

const { width: W } = Dimensions.get('window');
const COVER_HEIGHT = 340;
const PORTFOLIO_GAP = 2;
const PORTFOLIO_COL_SIZE = (W - PORTFOLIO_GAP * 2) / 3;
const GRID_GENRES = ['전체', '블랙앤그레이', '리얼리스틱', '포트레이트', '미니타투'];

type ProfileRoute = RouteProp<RootStackParamList, 'ArtistProfile'>;
type ProfileNav = NativeStackNavigationProp<RootStackParamList>;

type TabType = '작품' | '리뷰' | '안내';

const ArtistProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileNav>();
  const route = useRoute<ProfileRoute>();
  const { toast } = useToast();
  const { artist } = route.params;

  const [activeTab, setActiveTab] = useState<TabType>('작품');
  const [activeGenre, setActiveGenre] = useState('전체');
  const [following, setFollowing] = useState(false);
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);
  const [bookingVisible, setBookingVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);

  const handleReportSubmit = useCallback((_reason: ReportReason, _detail: string) => {
    toast('신고가 접수되었습니다. 운영팀이 검토 후 조치합니다.', { variant: 'success' });
  }, [toast]);

  const artistTattoos = MOCK_TATTOOS.filter((t) => t.artistId === artist.id);
  const portfolioItems = showAllPortfolio ? PORTFOLIO_IMAGES : PORTFOLIO_IMAGES.slice(0, 9);

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
        const tattoo = artistTattoos[index % Math.max(artistTattoos.length, 1)];
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
    </TouchableOpacity>
  );

  const renderReviewCard = () => (
    <View style={styles.reviewCard}>
      <View style={styles.ratingStars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <StarIcon key={s} size={15} color={COLORS.gold} filled={s <= 5} />
        ))}
        <Text style={styles.reviewScore}>5.0</Text>
      </View>
      <Text style={styles.reviewMeta}>jh_**** | 2024.05.21</Text>
      <View style={styles.reviewBody}>
        <View style={styles.reviewTextBlock}>
          <Text style={styles.reviewText}>
            너무 만족스러워요! 상담 때부터 꼼꼼하게{'\n'}
            설명해주셔서 믿음이 갔고, 결과물도{'\n'}
            상상 이상입니다. 다음 타투도 민수님께 받을게요 :)
          </Text>
        </View>
        <View style={styles.reviewImages}>
          <View style={styles.reviewImage}>
            <TattooPlaceholderIcon size={32} color="#2e2e2e" />
          </View>
          <View style={styles.reviewImage}>
            <TattooPlaceholderIcon size={32} color="#2e2e2e" />
          </View>
        </View>
      </View>
      <View style={styles.reviewDots}>
        {[0, 1, 2, 3, 4].map((d) => (
          <View key={d} style={[styles.reviewDot, d === 0 && styles.reviewDotActive]} />
        ))}
      </View>
    </View>
  );

  const renderReviewsTab = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {renderReviewCard()}
    </View>
  );

  const renderInfoTab = () => (
    <View style={styles.infoTab}>
      <View style={styles.infoTabRow}>
        <View style={styles.infoTabItem}>
          <LocationPinIcon size={18} color={COLORS.gold} />
          <View>
            <Text style={styles.infoTabLabel}>활동 지역</Text>
            <Text style={styles.infoTabValue}>{artist.city} · {artist.district}구</Text>
          </View>
        </View>
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
                  <Text style={styles.statLabelSmall}>(리뷰 {artist.reviewCount})</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItemStack}>
                  <Text style={styles.statValueBig}>{artist.followerCount}</Text>
                  <Text style={styles.statLabelSmall}>팔로워</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItemStack}>
                  <Text style={styles.statValueBig}>{artist.totalSessions}</Text>
                  <Text style={styles.statLabelSmall}>누적 시술</Text>
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

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => setFollowing((v) => !v)}
                style={[styles.followBtn, following && styles.followBtnActive]}
                activeOpacity={0.8}
              >
                <BookmarkIcon
                  size={16}
                  color={following ? COLORS.gold : COLORS.white}
                  filled={following}
                />
                <Text style={[styles.followText, following && styles.followTextActive]}>
                  {following ? '팔로잉' : '팔로우'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.consultBtn}
                activeOpacity={0.85}
                onPress={() => setBookingVisible(true)}
              >
                <CommentIcon size={16} color={COLORS.black} strokeWidth={2} />
                <Text style={styles.consultText}>1:1 예약 / 상담하기</Text>
              </TouchableOpacity>
            </View>

            {/* 3-column badge card */}
            <View style={styles.badgeCard}>
              <View style={styles.badgeCol}>
                <ShieldCheckIcon size={18} color={COLORS.gold} />
                <Text style={styles.badgeTitle}>타투루트 인증 작가</Text>
                <Text style={styles.badgeSub}>신원 및 자격 검증 완료</Text>
              </View>
              <View style={styles.badgeDivider} />
              <View style={styles.badgeCol}>
                <ShieldCheckIcon size={18} color={COLORS.gold} />
                <Text style={styles.badgeTitle}>위생 안심 업소</Text>
                <Text style={styles.badgeSub}>위생 관리 기준 통과</Text>
              </View>
              <View style={styles.badgeDivider} />
              <View style={styles.badgeCol}>
                <LockIcon size={18} color={COLORS.gold} />
                <Text style={styles.badgeTitle}>예약금 보호제</Text>
                <Text style={styles.badgeSub}>예약금 100% 보호</Text>
              </View>
            </View>
          </View>

          {/* Tab bar */}
          <View style={styles.tabBar}>
            {(['작품', '리뷰', '안내'] as TabType[]).map((tab) => {
              const label = tab === '리뷰' ? `리뷰 ${artist.reviewCount}` : tab;
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Content by tab ── */}
        {activeTab === '작품' && (
          <View>
            <View style={styles.genreFilterRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.genreFilterContent}
                style={{ flex: 1 }}
              >
                {GRID_GENRES.map((g) => {
                  const isActive = activeGenre === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setActiveGenre(g)}
                      style={[styles.genreChip, isActive && styles.genreChipActive]}
                    >
                      <Text style={[styles.genreChipText, isActive && styles.genreChipTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={styles.sortBtn}>
                <Text style={styles.sortText}>최신순</Text>
                <ChevronDownIcon size={12} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.portfolioGrid}>
              {portfolioItems.map((item, idx) => renderPortfolioItem(item, idx))}
            </View>

            {!showAllPortfolio && PORTFOLIO_IMAGES.length > 9 && (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => setShowAllPortfolio(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.showMoreText}>더 많은 작품 보기</Text>
                <ChevronDownIcon size={16} color={COLORS.gray} />
              </TouchableOpacity>
            )}

            {/* 최신 리뷰 */}
            <View style={styles.latestReviewHeader}>
              <Text style={styles.latestReviewTitle}>최신 리뷰</Text>
              <TouchableOpacity style={styles.moreReviews}>
                <Text style={styles.moreReviewsText}>더보기</Text>
                <ChevronRightIcon size={13} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 16 }}>
              {renderReviewCard()}
            </View>

            {/* 하단 정보 3컬럼 */}
            <View style={styles.bottomInfoRow}>
              <View style={styles.bottomInfoItem}>
                <LocationPinIcon size={16} color={COLORS.gold} />
                <View style={styles.bottomInfoTextGroup}>
                  <Text style={styles.bottomInfoLabel}>활동 지역</Text>
                  <Text style={styles.bottomInfoValue}>{artist.city} · {artist.district}구</Text>
                </View>
              </View>
              <View style={styles.bottomInfoItem}>
                <View style={styles.clockDot}>
                  <View style={styles.clockRing} />
                </View>
                <View style={styles.bottomInfoTextGroup}>
                  <Text style={styles.bottomInfoLabel}>상담 가능 시간</Text>
                  <Text style={styles.bottomInfoValue}>{artist.availableHours}</Text>
                </View>
              </View>
              <View style={styles.bottomInfoItem}>
                <View style={styles.calendarDot}>
                  <View style={styles.calendarInner} />
                </View>
                <View style={styles.bottomInfoTextGroup}>
                  <Text style={styles.bottomInfoLabel}>휴무일</Text>
                  <Text style={styles.bottomInfoValue}>{artist.closedDay}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        {activeTab === '리뷰' && renderReviewsTab()}
        {activeTab === '안내' && renderInfoTab()}

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
  consultText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
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
    alignItems: 'center',
    gap: 12,
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
});
