import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, StatusBar, NativeSyntheticEvent, NativeScrollEvent, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { useTranslation } from '../../store/languageStore';
import {
  BackArrowIcon, ShareIcon, BookmarkIcon, LocationPinIcon,
  ChevronDownIcon, ChevronUpIcon, TattooPlaceholderIcon,
  WarningTriangleIcon, CalendarIcon, CommentIcon,
} from '../../components/icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import ModelApplicationBottomSheet from '../../components/shopMatching/ModelApplicationBottomSheet';
import ImageZoomModal from '../../components/common/ImageZoomModal';
import { useToast } from '../../components/common/Toast';
import { favoriteApi } from '../../../data/api';

const { width: W, height: H } = Dimensions.get('window');
const HERO_H = H * 0.44;
const THUMB_SIZE = (W - 20 * 2 - 6 * 4) / 5;

type DetailRoute = RouteProp<RootStackParamList, 'BeginnerModelDetail'>;
type DetailNav = NativeStackNavigationProp<RootStackParamList>;

const BeginnerModelDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { post } = route.params;

  const { t, language } = useTranslation();
  const { toast } = useToast(); // 🚨 토스트 알림을 위해 추가
  const [activePage, setActivePage] = useState(0);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked);
  const [expandDesc, setExpandDesc] = useState(false);
  const [applyVisible, setApplyVisible] = useState(false);

  // 진입 시 서버의 실제 찜 상태로 동기화 (route param 은 오래된 값일 수 있음)
  useEffect(() => {
    let alive = true;
    favoriteApi.check('shop_post', [post.id])
      .then((m) => { if (alive) setBookmarked(!!m[post.id]); })
      .catch(() => {});
    return () => { alive = false; };
  }, [post.id]);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const heroRef = useRef<ScrollView>(null);

  const displayTitle = language === 'en' && post.titleEn ? post.titleEn : post.title;
  const displayDesc = language === 'en' && post.descriptionEn ? post.descriptionEn : post.description;
  const descLines = displayDesc.split('\n');
  const shouldTruncate = descLines.length > 5;
  const displayedDesc = expandDesc || !shouldTruncate
      ? displayDesc
      : descLines.slice(0, 5).join('\n');

  const handleHeroScroll = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / W);
        if (idx !== activePage) setActivePage(idx);
      },
      [activePage],
  );

  const jumpToPage = useCallback((idx: number) => {
    heroRef.current?.scrollTo({ x: idx * W, animated: true });
    setActivePage(idx);
  }, []);

  // 🚨 2. 북마크 클릭 시 단순히 UI만 바꾸지 않고 서버 API 호출 연동
  const handleBookmark = useCallback(async () => {
    const willAdd = !bookmarked;
    setBookmarked(willAdd);
    toast(willAdd ? t('common.bookmarked') : t('common.unbookmarked'), {
      variant: willAdd ? 'success' : 'default',
    });
    try {
      await favoriteApi.toggle('shop_post', post.id);
    } catch {
      // API 실패 시 롤백
      setBookmarked(!willAdd);
    }
  }, [bookmarked, post.id, toast, t]);

  return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
        >
          {/* ── 상단 이미지 갤러리 + 경고 배너 오버레이 ── */}
          <View style={styles.heroWrapper}>
            <ScrollView
                ref={heroRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleHeroScroll}
                scrollEventThrottle={16}
            >
              {post.images.map((uri, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.heroSlot}
                    activeOpacity={0.9}
                    onPress={() => { if (uri) { setZoomIndex(i); setZoomVisible(true); } }}
                  >
                    {uri ? (
                        <Image source={{ uri }} style={styles.heroImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.heroPlaceholder}>
                          <TattooPlaceholderIcon size={80} color="#2e2e2e" />
                        </View>
                    )}
                  </TouchableOpacity>
              ))}
            </ScrollView>

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
                    onPress={handleBookmark} // 🚨 수정된 북마크 함수 연결
                >
                  <BookmarkIcon size={22} color={COLORS.white} filled={bookmarked} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.warningChip, { top: insets.top + 54 }]}>
              <WarningTriangleIcon size={12} color={COLORS.gold} />
              <Text
                  style={styles.warningChipText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
              >
                {t('shop.beginnerDetail.caution')}
              </Text>
            </View>

            {post.images.length > 1 && (
                <View style={styles.pageIndicator}>
                  <Text style={styles.pageIndicatorText}>
                    {activePage + 1} / {post.images.length}
                  </Text>
                </View>
            )}
          </View>

          {/* ── 썸네일 스트립 ── */}
          {post.images.length > 1 && (
              <View style={styles.thumbStrip}>
                {post.images.slice(0, 5).map((uri, i) => (
                    <TouchableOpacity
                        key={i}
                        activeOpacity={0.8}
                        onPress={() => jumpToPage(i)}
                        style={[styles.thumb, i === activePage && styles.thumbActive]}
                    >
                      {uri ? (
                          <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
                      ) : (
                          <View style={styles.thumbPlaceholder}>
                            <TattooPlaceholderIcon size={22} color="#2e2e2e" />
                          </View>
                      )}
                    </TouchableOpacity>
                ))}
              </View>
          )}

          {/* ── 기본 정보 ── */}
          <View style={styles.infoBlock}>
            {post.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
            )}
            <Text style={styles.title}>{displayTitle}</Text>
            <Text style={styles.price}>
              {post.materialFee.toLocaleString()}{t('shop.card.wonSuffix')} <Text style={styles.priceSub}>{t('shop.card.materialFeeSuffix')}</Text>
            </Text>
            <View style={styles.metaRow}>
              <LocationPinIcon size={13} color={COLORS.gray} />
              <Text style={styles.metaText}>{post.location}</Text>
            </View>
            <View style={styles.metaRow}>
              <CalendarIcon size={13} color={COLORS.gray} />
              <Text style={styles.metaText}>{post.workPeriod}</Text>
            </View>

            <View style={styles.tagRow}>
              {post.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
              ))}
            </View>
          </View>

          {/* ── 상세 소개 ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('shop.introLabel')}</Text>
            <Text style={styles.description}>{displayedDesc}</Text>
            {shouldTruncate && (
                <TouchableOpacity
                    onPress={() => setExpandDesc((v) => !v)}
                    activeOpacity={0.75}
                    style={styles.expandBtn}
                >
                  <Text style={styles.expandText}>
                    {expandDesc ? t('shop.collapse') : t('shop.expand')}
                  </Text>
                  {expandDesc
                      ? <ChevronUpIcon size={14} color={COLORS.gray} />
                      : <ChevronDownIcon size={14} color={COLORS.gray} />
                  }
                </TouchableOpacity>
            )}
          </View>

          {/* ── 주의사항 ── */}
          {post.cautions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('shop.cautionLabel')}</Text>
                <View style={styles.rulesList}>
                  {post.cautions.map((c, i) => (
                      <View key={i} style={styles.ruleRow}>
                        <Text style={styles.ruleNum}>{i + 1}.</Text>
                        <Text style={styles.ruleText}>{c}</Text>
                      </View>
                  ))}
                </View>
              </View>
          )}
        </ScrollView>

        {/* Sticky CTA — 두 버튼 나란히 */}
        <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.ctaRow}>
            {/* 1:1 예약/상담하기 — 타투이스트 카카오 오픈채팅으로 바로 이동 */}
            {!!post.artist.kakaoLink && (
                <TouchableOpacity
                    onPress={() =>
                        Linking.openURL(post.artist.kakaoLink!).catch(() =>
                            toast(t('common.linkError' as any), { variant: 'error' }),
                        )
                    }
                    style={[styles.ctaBtn, styles.ctaBtnOutline]}
                    activeOpacity={0.85}
                >
                  <CommentIcon size={16} color={COLORS.gold} strokeWidth={2} />
                  <Text style={styles.ctaTextOutline}>{t('shop.consultDirect' as any)}</Text>
                </TouchableOpacity>
            )}

            {/* 모델 신청하기 */}
            <TouchableOpacity
                onPress={() => setApplyVisible(true)}
                style={[styles.ctaBtn, post.artist.kakaoLink ? styles.ctaBtnFlex : undefined]}
                activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>{t('shop.applyModel')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ModelApplicationBottomSheet
            visible={applyVisible}
            postTitle={post.title}
            artistName={post.artist.nickname ?? ''}
            artistKakaoLink={post.artist.kakaoLink}
            artistSmsPhone={post.artist.smsPhone}
            onClose={() => setApplyVisible(false)}
        />

        <ImageZoomModal
          visible={zoomVisible}
          images={post.images.filter(Boolean)}
          initialIndex={zoomIndex}
          onClose={() => setZoomVisible(false)}
        />
      </View>
  );
};

export default BeginnerModelDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  heroWrapper: { width: W, height: HERO_H, position: 'relative' },
  heroSlot: { width: W, height: HERO_H, backgroundColor: COLORS.elevated },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row',
    justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8, zIndex: 3,
  },
  topBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  topRight: { flexDirection: 'row', gap: 8 },

  warningChip: {
    position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center',
    gap: 6, backgroundColor: 'rgba(0,0,0,0.72)', borderWidth: 1, borderColor: COLORS.gold,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, zIndex: 2,
  },
  warningChipText: { color: COLORS.white, fontSize: 11, fontWeight: '600', lineHeight: 15 },

  pageIndicator: {
    position: 'absolute', right: 16, bottom: 16, backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  pageIndicatorText: { color: COLORS.white, fontSize: 12, fontWeight: '600', lineHeight: 17 },

  thumbStrip: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingTop: 12 },
  thumb: {
    width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 8, overflow: 'hidden',
    backgroundColor: COLORS.elevated, borderWidth: 2, borderColor: 'transparent',
  },
  thumbActive: { borderColor: COLORS.gold },
  thumbImage: { width: '100%', height: '100%' },
  thumbPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  infoBlock: {
    paddingHorizontal: 20, paddingTop: 22, paddingBottom: 22, gap: 6,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  newBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.gold, borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6,
  },
  newBadgeText: { color: COLORS.black, fontSize: 11, fontWeight: '800', lineHeight: 15, letterSpacing: 0.5 },
  title: { color: COLORS.white, fontSize: 20, fontWeight: '700', lineHeight: 28 },
  price: { color: COLORS.gold, fontSize: 22, fontWeight: '800', lineHeight: 30, marginTop: 4 },
  priceSub: { color: COLORS.gray, fontSize: 13, fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  metaText: { color: COLORS.gray, fontSize: 13, lineHeight: 18 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.chipBorder, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { color: COLORS.white, fontSize: 12, lineHeight: 17 },

  section: { paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', lineHeight: 20 },

  description: { color: COLORS.gray, fontSize: 14, lineHeight: 22 },
  expandBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.chipBorder, marginTop: 4,
  },
  expandText: { color: COLORS.gray, fontSize: 13, lineHeight: 18 },

  rulesList: {
    gap: 10, backgroundColor: COLORS.card, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 16,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  ruleNum: { color: COLORS.gold, fontSize: 13, fontWeight: '700', lineHeight: 21, minWidth: 20 },
  ruleText: { color: COLORS.gray, fontSize: 13, lineHeight: 21, flexShrink: 1 },

  stickyFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20,
    paddingTop: 12, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  ctaRow: { flexDirection: 'row', gap: 10 },
  ctaBtn: {
    flex: 1, backgroundColor: COLORS.gold, borderRadius: 14, paddingVertical: 17,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  ctaBtnFlex: { flex: 1 },
  ctaBtnOutline: {
    backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.gold,
  },
  ctaText: { color: COLORS.black, fontSize: 15, fontWeight: '700', lineHeight: 22 },
  ctaTextOutline: { color: COLORS.gold, fontSize: 14, fontWeight: '700', lineHeight: 20 },
});