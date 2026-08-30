import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, StatusBar, Linking, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { useTranslation } from '../../store/languageStore';
import { lightingLabel, stencilLabel } from '../../utils/shopDisplayMap';
import {
  BackArrowIcon, ShareIcon, BookmarkIcon, LocationPinIcon,
  AreaIcon, BedIcon, LightIcon, DoorIcon, PeopleIcon,
  ChevronDownIcon, ChevronUpIcon, TattooPlaceholderIcon, PersonSilhouette,
  PaletteIcon, CameraSolidIcon, // 🚨 1. 스텐실, 촬영존 아이콘 임포트 추가
} from '../../components/icons';
import ImageZoomModal from '../../components/common/ImageZoomModal';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { favoriteApi } from '../../../data/api';
import { useToast } from '../../components/common/Toast';

const { width: W, height: H } = Dimensions.get('window');
const IMG_HEIGHT = H * 0.42;

type DetailRoute = RouteProp<RootStackParamList, 'TattooShareDetail'>;
type DetailNav = NativeStackNavigationProp<RootStackParamList>;

const TattooShareDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { shop } = route.params;

  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [activePage, setActivePage] = useState(0);
  const [bookmarked, setBookmarked] = useState(shop.isBookmarked);
  const [expandDescription, setExpandDescription] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);

  // 진입 시 서버의 실제 찜 상태로 동기화 (route param 은 오래된 값일 수 있음)
  useEffect(() => {
    let alive = true;
    favoriteApi.check('shop_post', [shop.id])
      .then((m) => { if (alive) setBookmarked(!!m[shop.id]); })
      .catch(() => {});
    return () => { alive = false; };
  }, [shop.id]);

  const displayTitle = language === 'en' && shop.titleEn ? shop.titleEn : shop.title;
  const displayDesc = language === 'en' && shop.descriptionEn ? shop.descriptionEn : shop.description;
  const descLines = displayDesc.split('\n');
  const shouldTruncate = descLines.length > 5;
  const displayedDesc = expandDescription || !shouldTruncate
      ? displayDesc
      : descLines.slice(0, 5).join('\n');

  // 🚨 2. 가격 표기 분기 (월세 vs 일세)
  const actualPrice = shop.price ?? shop.pricePerDay ?? 0;
  const isMonthly = shop.priceType === 'monthly';
  const priceText = isMonthly
      ? (language === 'ko' ? `${actualPrice.toLocaleString()}원 / 월` : `₩${actualPrice.toLocaleString()} / month`)
      : t('shop.card.pricePerDayFmt' as any, { price: actualPrice.toLocaleString() });

  // 🚨 3. 스펙 그리드 동적 생성 (스텐실, 촬영존 포함)
  const specs: { Icon: React.ComponentType<any>; label: string; value: string }[] = [
    { Icon: AreaIcon, label: t('shop.card.areaPyeong' as any), value: `${shop.areaPyeong}${t('shop.card.unitPyeong' as any)}` },
    { Icon: BedIcon, label: t('shop.card.bedCount' as any), value: `${shop.bedCount}${t('shop.card.unitBed' as any)}` },
    { Icon: LightIcon, label: t('shop.card.lighting' as any), value: lightingLabel(t as any, shop.lighting as any) },
    { Icon: DoorIcon, label: t('shop.card.privateRoom' as any), value: shop.privateRoomInfo ?? (shop.hasPrivateRoom ? t('shop.card.privateYes' as any) : t('shop.card.privateNo' as any)) },
    { Icon: PeopleIcon, label: t('shop.card.maxOccupancy' as any), value: `${shop.maxOccupancy}${t('shop.card.unitPerson' as any)}` },
    { Icon: PeopleIcon, label: t('shop.card.currentNeeded' as any), value: `${shop.currentOccupancy} / ${shop.requiredOccupancy}${t('shop.card.unitPerson' as any)}` },
  ];

  if (shop.stencilType) {
    specs.push({
      Icon: PaletteIcon,
      label: t('shop.opt.stencilMachine' as any),
      // 🚨 여기서 DB에 저장된 한국어 원본을 영어로 번역해서 화면에 출력합니다!
      value: stencilLabel(t as any, shop.stencilType)
    });
  }

  if (shop.hasPhotoZone !== undefined) {
    specs.push({ Icon: CameraSolidIcon, label: '촬영존', value: shop.hasPhotoZone ? '구비됨' : '없음' });
  }

  const handlePageScroll = useCallback((e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    if (idx !== activePage) setActivePage(idx);
  }, [activePage]);

  const handleBookmark = useCallback(async () => {
    const willAdd = !bookmarked;
    setBookmarked(willAdd);
    toast(willAdd ? t('common.bookmarked' as any) : t('common.unbookmarked' as any), {
      variant: willAdd ? 'success' : 'default',
    });
    try {
      await favoriteApi.toggle('shop_post', shop.id);
    } catch {
      setBookmarked(!willAdd);
      toast(t('common.error' as any), { variant: 'error' });
    }
  }, [bookmarked, shop.id, toast, t]);

  return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.galleryWrapper}>
          <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handlePageScroll}
              scrollEventThrottle={16}
          >
            {shop.images.map((uri, i) => (
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
                        <TattooPlaceholderIcon size={72} color="#2e2e2e" />
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
                  onPress={handleBookmark}
              >
                <BookmarkIcon size={22} color={COLORS.white} filled={bookmarked} />
              </TouchableOpacity>
            </View>
          </View>

          {shop.images.length > 1 && (
              <View style={styles.pageIndicator}>
                <Text style={styles.pageIndicatorText}>
                  {activePage + 1} / {shop.images.length}
                </Text>
              </View>
          )}
        </View>

        <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            {shop.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>{t('shop.card.newBadge' as any)}</Text>
                </View>
            )}
            <Text style={styles.title}>{displayTitle}</Text>
            {/* 🚨 월/일 단위 가격 표시 */}
            <Text style={styles.price}>{priceText}</Text>
            <View style={styles.addressRow}>
              <LocationPinIcon size={14} color={COLORS.gray} />
              <Text style={styles.addressText}>{shop.address}</Text>
            </View>
          </View>

          {/* 🚨 4. 스펙 그리드 항목 동적 생성에 따른 CSS 수정 (가변 갯수 대응) */}
          <View style={styles.specGrid}>
            {specs.map((s, idx) => {
              const rowCount = Math.ceil(specs.length / 3);
              const currentRow = Math.floor(idx / 3);
              const isLastRow = currentRow === rowCount - 1;

              return (
                  <View
                      key={idx}
                      style={[
                        styles.specCell,
                        idx % 3 !== 2 && styles.specCellBorderRight, // 마지막 열이 아니면 우측 테두리
                        !isLastRow && styles.specCellBorderBottom,   // 마지막 행이 아니면 하단 테두리
                      ]}
                  >
                    <View style={styles.specLabelRow}>
                      <s.Icon size={13} color={COLORS.gray} />
                      <Text style={styles.specLabel}>{s.label}</Text>
                    </View>
                    <Text style={styles.specValue} numberOfLines={1} adjustsFontSizeToFit>{s.value}</Text>
                  </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('shop.detail.intro' as any)}</Text>
            <Text style={styles.description}>{displayedDesc}</Text>
            {shouldTruncate && (
                <TouchableOpacity
                    onPress={() => setExpandDescription((v) => !v)}
                    activeOpacity={0.75}
                    style={styles.expandBtn}
                >
                  <Text style={styles.expandText}>
                    {expandDescription ? t('shop.collapse' as any) : t('shop.expand' as any)}
                  </Text>
                  {expandDescription
                      ? <ChevronUpIcon size={14} color={COLORS.gray} />
                      : <ChevronDownIcon size={14} color={COLORS.gray} />
                  }
                </TouchableOpacity>
            )}
          </View>

          {shop.rules.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('shop.detail.rules' as any)}</Text>
                <View style={styles.rulesList}>
                  {shop.rules.map((rule, i) => (
                      <View key={i} style={styles.ruleRow}>
                        <View style={styles.ruleDot} />
                        <Text style={styles.ruleText}>{rule}</Text>
                      </View>
                  ))}
                </View>
              </View>
          )}

          <TouchableOpacity
              style={styles.hostCard}
              activeOpacity={0.8}
              onPress={() => {
                if (shop.host.id) {
                  navigation.navigate('UserProfile' as any, { userId: shop.host.id });
                }
              }}
          >
            <View style={styles.hostAvatar}>
              {shop.host.profileImage ? (
                  <Image source={{ uri: shop.host.profileImage }} style={styles.imgFill} resizeMode="cover" />
              ) : (
                  <PersonSilhouette size={36} color="#3a3a3a" />
              )}
            </View>
            <View style={styles.hostInfo}>
              <Text style={styles.hostLabel}>{t('shop.hostLabel' as any)}</Text>
              <Text style={styles.hostName}>{shop.host.nickname}</Text>
              <Text style={styles.hostRole}>{t('shop.hostLabel' as any)}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
              onPress={() => {
                const kakao = shop.host.kakaoLink;
                const phone = shop.host.smsPhone;
                if (kakao) { Linking.openURL(kakao).catch(() => {}); return; }
                if (phone) {
                  const digits = phone.replace(/[^0-9+]/g, '');
                  Linking.openURL(`tel:${digits}`).catch(() => {});
                  return;
                }
                Alert.alert(t('common.noContactTitle' as any), t('shop.noContactMsg' as any));
              }}
              style={styles.ctaBtn}
              activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{t('shop.bookingInquiry' as any)}</Text>
          </TouchableOpacity>
        </View>

        <ImageZoomModal
          visible={zoomVisible}
          images={shop.images.filter(Boolean)}
          initialIndex={zoomIndex}
          onClose={() => setZoomVisible(false)}
        />
      </View>
  );
};

export default TattooShareDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  galleryWrapper: {
    width: W,
    height: IMG_HEIGHT,
    position: 'relative',
  },
  heroSlot: {
    width: W,
    height: IMG_HEIGHT,
    backgroundColor: COLORS.elevated,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    flex: 1,
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
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRight: {
    flexDirection: 'row',
    gap: 8,
  },
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 18,
  },
  headerBlock: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  newBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  newBadgeText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
  },
  price: {
    color: COLORS.gold,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginTop: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  addressText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },

  /* Spec grid */
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  specCell: {
    width: '33.33%',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  specCellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  specCellBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  specLabel: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  specValue: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },

  /* Section */
  section: {
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  description: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 22,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    marginTop: 4,
  },
  expandText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  rulesList: {
    gap: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
    marginTop: 9,
    flexShrink: 0,
  },
  ruleText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 21,
    flexShrink: 1,
  },

  /* Host card */
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    marginTop: 28,
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hostAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgFill: {
    width: '100%',
    height: '100%',
  },
  hostInfo: {
    gap: 2,
  },
  hostLabel: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  hostName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  hostRole: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },

  /* Sticky footer */
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
  },
  ctaText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
});
