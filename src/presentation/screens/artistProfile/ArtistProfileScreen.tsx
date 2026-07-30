import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, FlatList,
  StyleSheet, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, ShareIcon, DotsIcon, StarIcon, LocationPinIcon,
  BookmarkIcon, ShieldCheckIcon, LockIcon, ChevronDownIcon,
} from '../../components/icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { MOCK_TATTOOS, PORTFOLIO_IMAGES } from '../../../data/mock/mockData';
import { Tattoo } from '../../../domain/entities/types';
import BookingBottomSheet from '../../components/booking/BookingBottomSheet';

const { width: W } = Dimensions.get('window');
const COVER_HEIGHT = 180;
const PORTFOLIO_COL_SIZE = (W - 4) / 3;
const GRID_GENRES = ['전체', '블랙앤그레이', '리얼리스틱', '포트레이트', '미니타투'];

type ProfileRoute = RouteProp<RootStackParamList, 'ArtistProfile'>;
type ProfileNav = NativeStackNavigationProp<RootStackParamList>;

type TabType = '작품' | '리뷰' | '안내';

const ArtistProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileNav>();
  const route = useRoute<ProfileRoute>();
  const { artist } = route.params;

  const [activeTab, setActiveTab] = useState<TabType>('작품');
  const [activeGenre, setActiveGenre] = useState('전체');
  const [following, setFollowing] = useState(false);
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);
  const [bookingVisible, setBookingVisible] = useState(false);

  const artistTattoos = MOCK_TATTOOS.filter((t) => t.artistId === artist.id);
  const portfolioItems = showAllPortfolio ? PORTFOLIO_IMAGES : PORTFOLIO_IMAGES.slice(0, 9);

  const handleTattooPress = useCallback(
    (tattoo: Tattoo) => navigation.navigate('TattooDetail', { tattoo }),
    [navigation],
  );

  const renderPortfolioItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
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
        <View style={[styles.portfolioImage, { backgroundColor: COLORS.card }]} />
      )}
      <View style={styles.portfolioBookmark}>
        <BookmarkIcon size={14} color={COLORS.white} />
      </View>
    </TouchableOpacity>
  );

  const renderReviewSection = () => (
    <View style={styles.reviewSection}>
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <StarIcon key={s} size={16} color={COLORS.gold} filled={s <= 5} />
            ))}
            <Text style={styles.reviewScore}>5.0</Text>
          </View>
          <Text style={styles.reviewMeta}>jh_**** | 2024.05.21</Text>
        </View>
        <Text style={styles.reviewText}>
          너무 만족스러워요! 상담 때부터 꼼꼼하게{'\n'}
          설명해주셔서 믿음이 갔고, 결과물도{'\n'}
          상상 이상입니다. 다음 타투도 민수님께 받을게요 :)
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
          {[0, 1].map((i) => (
            <Image
              key={i}
              source={{ uri: `https://picsum.photos/seed/rev${i}/150/150` }}
              style={styles.reviewImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        <View style={styles.reviewDots}>
          {[0, 1, 2, 3, 4].map((d) => (
            <View key={d} style={[styles.reviewDot, d === 0 && styles.reviewDotActive]} />
          ))}
        </View>
      </View>
    </View>
  );

  const renderInfoSection = () => (
    <View style={styles.infoSection}>
      <View style={styles.infoRow}>
        <LocationPinIcon size={16} color={COLORS.gray} />
        <View>
          <Text style={styles.infoLabel}>활동 지역</Text>
          <Text style={styles.infoValue}>{artist.city} · {artist.district}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoIconPlaceholder} />
        <View>
          <Text style={styles.infoLabel}>상담 가능 시간</Text>
          <Text style={styles.infoValue}>{artist.availableHours}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoIconPlaceholder} />
        <View>
          <Text style={styles.infoLabel}>휴무일</Text>
          <Text style={styles.infoValue}>{artist.closedDay}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: 0 }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        <View>
          <View style={styles.coverWrapper}>
            {artist.coverImage ? (
              <Image
                source={{ uri: artist.coverImage }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.coverImage, { backgroundColor: COLORS.card }]} />
            )}
            <View style={[styles.coverOverlay, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <BackArrowIcon size={22} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <ShareIcon size={22} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <DotsIcon size={22} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.profileAvatarWrapper}>
              {artist.profileImage ? (
                <Image
                  source={{ uri: artist.profileImage }}
                  style={styles.profileAvatar}
                  resizeMode="cover"
                />
              ) : null}
            </View>
            <Text style={styles.nickname}>{artist.nickname}</Text>
            <View style={styles.locationRow}>
              <LocationPinIcon size={13} color={COLORS.gray} />
              <Text style={styles.locationText}>{artist.city}·{artist.district}</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <StarIcon size={15} color={COLORS.gold} filled />
                <Text style={styles.statValue}>{artist.rating}</Text>
                <Text style={styles.statLabel}>(리뷰 {artist.reviewCount})</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{artist.followerCount}</Text>
                <Text style={styles.statLabel}>팔로워</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{artist.totalSessions}</Text>
                <Text style={styles.statLabel}>누적 시술</Text>
              </View>
            </View>
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
                <BookmarkIcon size={16} color={following ? COLORS.gold : COLORS.white} />
                <Text style={[styles.followText, following && styles.followTextActive]}>
                  {following ? '팔로잉' : '팔로우'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.consultBtn}
                activeOpacity={0.85}
                onPress={() => setBookingVisible(true)}
              >
                <Text style={styles.consultText}>1:1 예약 / 상담하기</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.badgesRow}>
              {artist.isVerified && (
                <View style={styles.badge}>
                  <ShieldCheckIcon size={16} color={COLORS.gold} />
                  <View style={styles.badgeTextGroup}>
                    <Text style={styles.badgeTitle}>타투루트 인증 작가</Text>
                    <Text style={styles.badgeSub}>신원 및 자격 검증 완료</Text>
                  </View>
                </View>
              )}
              {artist.isHygieneCertified && (
                <View style={styles.badge}>
                  <ShieldCheckIcon size={16} color={COLORS.gold} />
                  <View style={styles.badgeTextGroup}>
                    <Text style={styles.badgeTitle}>위생 안심 업소</Text>
                    <Text style={styles.badgeSub}>위생 관리 기준 통과</Text>
                  </View>
                </View>
              )}
              {artist.hasDepositProtection && (
                <View style={styles.badge}>
                  <LockIcon size={16} color={COLORS.gold} />
                  <View style={styles.badgeTextGroup}>
                    <Text style={styles.badgeTitle}>예약금 보호제</Text>
                    <Text style={styles.badgeSub}>예약금 100% 보호</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.tabBar}>
          {(['작품', `리뷰 ${artist.reviewCount}`, '안내'] as const).map((tab) => {
            const tabKey = tab.includes('리뷰') ? '리뷰' : tab as TabType;
            const isActive = activeTab === tabKey;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setActiveTab(tabKey as TabType)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === '작품' && (
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.genreFilter}
            >
              {GRID_GENRES.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setActiveGenre(g)}
                  style={[styles.genreChip, activeGenre === g && styles.genreChipActive]}
                >
                  <Text style={[styles.genreChipText, activeGenre === g && styles.genreChipTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={styles.sortBtn}>
                <Text style={styles.sortText}>최신순</Text>
                <ChevronDownIcon size={12} color={COLORS.gray} />
              </View>
            </ScrollView>

            <View style={styles.portfolioGrid}>
              {portfolioItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {renderPortfolioItem({ item, index: idx })}
                </React.Fragment>
              ))}
            </View>

            {!showAllPortfolio && PORTFOLIO_IMAGES.length > 9 && (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => setShowAllPortfolio(true)}
              >
                <Text style={styles.showMoreText}>더 많은 작품 보기</Text>
                <ChevronDownIcon size={14} color={COLORS.gray} />
              </TouchableOpacity>
            )}

            <View style={styles.latestReviewHeader}>
              <Text style={styles.latestReviewTitle}>최신 리뷰</Text>
              <TouchableOpacity style={styles.moreReviews}>
                <Text style={styles.moreReviewsText}>더보기</Text>
                <ChevronDownIcon size={13} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            {renderReviewSection()}
          </View>
        )}
        {activeTab === '리뷰' && renderReviewSection()}
        {activeTab === '안내' && renderInfoSection()}

        <View style={{ height: 32 }} />
      </ScrollView>

      <BookingBottomSheet
        visible={bookingVisible}
        artistName={artist.nickname}
        artistKakaoLink={artist.kakaoLink}
        onClose={() => setBookingVisible(false)}
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
  coverWrapper: {
    height: COVER_HEIGHT,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: COVER_HEIGHT,
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 16,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    marginTop: -40,
  },
  profileAvatarWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 3,
    borderColor: COLORS.bg,
    marginBottom: 12,
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },
  nickname: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  statLabel: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.border,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  specialtyChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  specialtyText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 16,
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
  },
  followBtnActive: {
    borderColor: COLORS.gold,
  },
  followText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  followTextActive: {
    color: COLORS.gold,
  },
  consultBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
  },
  consultText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  badge: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 4,
  },
  badgeTextGroup: {
    alignItems: 'center',
  },
  badgeTitle: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    textAlign: 'center',
  },
  badgeSub: {
    color: COLORS.gray,
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.transparent,
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
  genreFilter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
  },
  genreChipActive: {
    borderColor: COLORS.transparent,
    backgroundColor: COLORS.transparent,
  },
  genreChipText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  genreChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.gold,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    marginLeft: 8,
  },
  sortText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    paddingHorizontal: 2,
  },
  portfolioItem: {
    width: PORTFOLIO_COL_SIZE,
    height: PORTFOLIO_COL_SIZE,
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  portfolioBookmark: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    borderRadius: 10,
    marginTop: 12,
  },
  showMoreText: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 20,
  },
  latestReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  latestReviewTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
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
  reviewSection: {
    paddingHorizontal: 16,
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  reviewHeader: {
    gap: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reviewScore: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
    marginLeft: 4,
  },
  reviewMeta: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  reviewText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 21,
  },
  reviewImages: {
    flexDirection: 'row',
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  reviewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.chipBorder,
  },
  reviewDotActive: {
    backgroundColor: COLORS.white,
    width: 18,
  },
  infoSection: {
    padding: 20,
    gap: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconPlaceholder: {
    width: 16,
    height: 16,
    backgroundColor: COLORS.gray3,
    borderRadius: 3,
  },
  infoLabel: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  infoValue: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
