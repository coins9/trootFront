import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, StatusBar, Linking, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, ShareIcon, BookmarkIcon, LocationPinIcon,
  ChevronDownIcon, ChevronUpIcon, TattooPlaceholderIcon, PersonSilhouette,
  VerifiedBadgeIcon, PlayCircleIcon, InstagramIcon, InfoIcon,
  ImageMountainIcon, VideoFilmIcon, CameraSolidIcon, VideoCameraIcon,
  StarIcon, StackIcon, ClockOutlineIcon, CheckCircleIcon, ChevronRightIcon,
} from '../../components/icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { MediaWorkKind } from '../../../domain/entities/shopTypes';
import WorkInquiryBottomSheet from '../../components/shopMatching/WorkInquiryBottomSheet';

const { width: W, height: H } = Dimensions.get('window');
const HERO_H = H * 0.42;
const THUMB_SIZE = (W - 20 * 2 - 6 * 4) / 5;

type DetailRoute = RouteProp<RootStackParamList, 'MediaExpertDetail'>;
type DetailNav = NativeStackNavigationProp<RootStackParamList>;

const KIND_ICON: Record<MediaWorkKind, React.ComponentType<{ size?: number; color?: string }>> = {
  '사진 촬영': CameraSolidIcon,
  '영상 촬영': VideoCameraIcon,
  '사진 보정': ImageMountainIcon,
  '영상 편집': VideoFilmIcon,
};

const MediaExpertDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { expert } = route.params;

  const [activePage, setActivePage] = useState(0);
  const [bookmarked, setBookmarked] = useState(expert.isBookmarked);
  const [expandDesc, setExpandDesc] = useState(false);
  const [inquiryVisible, setInquiryVisible] = useState(false);
  const heroRef = useRef<ScrollView>(null);

  const bulletCount = expert.descriptionBullets.length;
  const descLineCount = expert.description.split('\n').length + bulletCount;
  const shouldTruncate = descLineCount > 5;

  const handleHeroScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    if (idx !== activePage) setActivePage(idx);
  }, [activePage]);

  const jumpToPage = useCallback((idx: number) => {
    heroRef.current?.scrollTo({ x: idx * W, animated: true });
    setActivePage(idx);
  }, []);

  const openInstagram = useCallback(() => {
    if (expert.instagramUrl) Linking.openURL(expert.instagramUrl);
  }, [expert.instagramUrl]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 갤러리 ── */}
        <View style={styles.heroWrapper}>
          <ScrollView
            ref={heroRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleHeroScroll}
            scrollEventThrottle={16}
          >
            {expert.portfolio.map((item, i) => (
              <View key={i} style={styles.heroSlot}>
                {item.uri ? (
                  <Image source={{ uri: item.uri }} style={styles.heroImage} resizeMode="cover" />
                ) : (
                  <View style={styles.heroPlaceholder}>
                    <TattooPlaceholderIcon size={80} color="#2e2e2e" />
                  </View>
                )}
                {item.isVideo && (
                  <View style={styles.playOverlay} pointerEvents="none">
                    <PlayCircleIcon size={64} color={COLORS.white} />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Top nav */}
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.topBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BackArrowIcon size={22} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.topRight}>
              <TouchableOpacity style={styles.topBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <ShareIcon size={22} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.topBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => setBookmarked((v) => !v)}
              >
                <BookmarkIcon size={22} color={COLORS.white} filled={bookmarked} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Page indicator */}
          {expert.portfolio.length > 1 && (
            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                {activePage + 1} / {expert.portfolio.length}
              </Text>
            </View>
          )}
        </View>

        {/* ── 썸네일 스트립 ── */}
        {expert.portfolio.length > 1 && (
          <View style={styles.thumbStrip}>
            {expert.portfolio.slice(0, 5).map((item, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.8}
                onPress={() => jumpToPage(i)}
                style={[styles.thumb, i === activePage && styles.thumbActive]}
              >
                {item.uri ? (
                  <Image source={{ uri: item.uri }} style={styles.thumbImage} resizeMode="cover" />
                ) : (
                  <View style={styles.thumbPlaceholder}>
                    <TattooPlaceholderIcon size={22} color="#2e2e2e" />
                  </View>
                )}
                {item.isVideo && (
                  <View style={styles.thumbPlayOverlay} pointerEvents="none">
                    <PlayCircleIcon size={22} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── 프로필 헤더 ── */}
        <View style={styles.profileBlock}>
          <View style={styles.avatarCircle}>
            {expert.profileImage ? (
              <Image source={{ uri: expert.profileImage }} style={styles.imgFill} resizeMode="cover" />
            ) : (
              <PersonSilhouette size={60} color="#3a3a3a" />
            )}
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.nickname}>{expert.nickname}</Text>
              {expert.isVerified && <VerifiedBadgeIcon size={17} />}
            </View>
            <Text style={styles.experience}>{expert.experience}</Text>
            <View style={styles.locationRow}>
              <LocationPinIcon size={13} color={COLORS.gray} />
              <Text style={styles.locationText}>{expert.location}</Text>
            </View>
          </View>
        </View>

        {/* ── 태그 ── */}
        <View style={styles.tagWrap}>
          {expert.tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>#{t}</Text>
            </View>
          ))}
        </View>

        {/* ── 단가표 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHead}>단가표 (Price Info)</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceHeadRow}>
              <Text style={styles.priceHeadLabel}>건당</Text>
              <Text style={styles.priceHeadValue}>
                {expert.priceMin.toLocaleString()}원 ~ {expert.priceMax.toLocaleString()}원
              </Text>
            </View>
            <View style={styles.priceHintRow}>
              <Text style={styles.priceHint}>위치/작업 난이도에 따라 변동 가능</Text>
              <InfoIcon size={12} color={COLORS.gray} />
            </View>

            <View style={styles.priceGridDivider} />

            <View style={styles.priceGrid}>
              {expert.priceItems.map((item, idx) => {
                const Icon = KIND_ICON[item.kind];
                const isLast = idx === expert.priceItems.length - 1;
                return (
                  <View
                    key={item.kind}
                    style={[styles.priceGridCell, !isLast && styles.priceCellDivider]}
                  >
                    <Icon size={22} color={COLORS.gold} />
                    <Text style={styles.priceKindLabel}>{item.kind}</Text>
                    <Text style={styles.priceKindValue}>{item.price.toLocaleString()}원~</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── 상세 소개 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHead}>상세 소개 (Description)</Text>
          <View style={styles.descCard}>
            <Text style={styles.description}>{expert.description}</Text>

            <View style={styles.bulletList}>
              {expert.descriptionBullets
                .slice(0, expandDesc || !shouldTruncate ? undefined : 3)
                .map((b, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <CheckCircleIcon size={16} color={COLORS.gold} />
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
            </View>

            {(expandDesc || !shouldTruncate) && expert.descriptionFooter && (
              <Text style={styles.descFooter}>{expert.descriptionFooter}</Text>
            )}

            {shouldTruncate && (
              <TouchableOpacity
                onPress={() => setExpandDesc((v) => !v)}
                style={styles.expandInline}
                activeOpacity={0.75}
              >
                <Text style={styles.expandText}>{expandDesc ? '접기' : '더보기'}</Text>
                {expandDesc
                  ? <ChevronUpIcon size={14} color={COLORS.gray} />
                  : <ChevronDownIcon size={14} color={COLORS.gray} />
                }
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── 포트폴리오 더보기 (인스타) ── */}
        {expert.instagramUrl && (
          <TouchableOpacity
            style={styles.instaRow}
            onPress={openInstagram}
            activeOpacity={0.75}
          >
            <View style={styles.instaLeft}>
              <Text style={styles.instaText}>포트폴리오 더보기</Text>
              <InstagramIcon size={16} color={COLORS.gold} />
            </View>
            <ChevronRightIcon size={16} color={COLORS.gray} />
          </TouchableOpacity>
        )}

        {/* ── 3-column stats ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <View style={styles.statIconLabel}>
              <StarIcon size={13} color={COLORS.gold} filled />
              <Text style={styles.statLabel}>작업 만족도</Text>
            </View>
            <Text style={styles.statValue}>
              {expert.satisfactionRating} <Text style={styles.statValueSub}>(리뷰 {expert.reviewCount})</Text>
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <View style={styles.statIconLabel}>
              <StackIcon size={13} color={COLORS.gold} />
              <Text style={styles.statLabel}>누적 작업 수</Text>
            </View>
            <Text style={styles.statValue}>{expert.totalWorks}건</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <View style={styles.statIconLabel}>
              <ClockOutlineIcon size={13} color={COLORS.gold} />
              <Text style={styles.statLabel}>응답 시간</Text>
            </View>
            <Text style={styles.statValue}>{expert.avgResponseTime}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          onPress={() => setInquiryVisible(true)}
          style={styles.ctaBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>[ 작업 문의하기 ]</Text>
        </TouchableOpacity>
      </View>

      <WorkInquiryBottomSheet
        visible={inquiryVisible}
        expertName={expert.nickname}
        defaultWorkKind={expert.primaryKind}
        expertKakaoLink={expert.kakaoLink}
        expertSmsPhone={expert.smsPhone}
        onClose={() => setInquiryVisible(false)}
      />
    </View>
  );
};

export default MediaExpertDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  /* Hero */
  heroWrapper: {
    width: W,
    height: HERO_H,
    position: 'relative',
  },
  heroSlot: {
    width: W,
    height: HERO_H,
    backgroundColor: COLORS.elevated,
    position: 'relative',
  },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
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
    zIndex: 3,
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRight: { flexDirection: 'row', gap: 8 },
  pageIndicator: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pageIndicatorText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },

  /* Thumb strip */
  thumbStrip: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbActive: { borderColor: COLORS.gold },
  thumbImage: { width: '100%', height: '100%' },
  thumbPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbPlayOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Profile header */
  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 14,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  imgFill: { width: '100%', height: '100%' },
  profileInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nickname: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  experience: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
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

  /* Tags */
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tag: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  tagText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },

  /* Section */
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  sectionHead: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },

  /* Price card */
  priceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  priceHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  priceHeadLabel: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 19,
  },
  priceHeadValue: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  priceHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  priceHint: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  priceGridDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  priceGrid: {
    flexDirection: 'row',
  },
  priceGridCell: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  priceCellDivider: {
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  priceKindLabel: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 4,
  },
  priceKindValue: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    textAlign: 'center',
  },

  /* Description card */
  descCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 14,
  },
  description: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 21,
  },
  bulletList: { gap: 8 },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
    flexShrink: 1,
  },
  descFooter: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  expandInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  expandText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },

  /* Instagram row */
  instaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  instaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  instaText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: COLORS.border,
  },
  statIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statLabel: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  statValueSub: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '500',
  },

  /* Sticky CTA */
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ctaBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
});
