import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, StatusBar, Linking, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { useTranslation } from '../../store/languageStore';
import {
  BackArrowIcon, ShareIcon, BookmarkIcon, LocationPinIcon,
  AreaIcon, BedIcon, LightIcon, DoorIcon, PeopleIcon,
  ChevronDownIcon, ChevronUpIcon, TattooPlaceholderIcon, PersonSilhouette,
} from '../../components/icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

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
  const [activePage, setActivePage] = useState(0);
  const [bookmarked, setBookmarked] = useState(shop.isBookmarked);
  const [expandDescription, setExpandDescription] = useState(false);

  const displayTitle = language === 'en' && shop.titleEn ? shop.titleEn : shop.title;
  const displayDesc = language === 'en' && shop.descriptionEn ? shop.descriptionEn : shop.description;
  const descLines = displayDesc.split('\n');
  const shouldTruncate = descLines.length > 5;
  const displayedDesc = expandDescription || !shouldTruncate
    ? displayDesc
    : descLines.slice(0, 5).join('\n');

  const specs: { Icon: React.ComponentType<any>; label: string; value: string }[] = [
    { Icon: AreaIcon, label: t('shop.card.areaPyeong'), value: `${shop.areaPyeong}${t('shop.card.unitPyeong')}` },
    { Icon: BedIcon, label: t('shop.card.bedCount'), value: `${shop.bedCount}${t('shop.card.unitBed')}` },
    { Icon: LightIcon, label: t('shop.card.lighting'), value: shop.lighting },
    { Icon: DoorIcon, label: t('shop.card.privateRoom'), value: shop.privateRoomInfo ?? (shop.hasPrivateRoom ? t('shop.card.privateYes') : t('shop.card.privateNo')) },
    { Icon: PeopleIcon, label: t('shop.card.maxOccupancy'), value: `${shop.maxOccupancy}${t('shop.card.unitPerson')}` },
    { Icon: PeopleIcon, label: t('shop.card.currentNeeded'), value: `${shop.currentOccupancy} / ${shop.requiredOccupancy}${t('shop.card.unitPerson')}` },
  ];

  const handlePageScroll = useCallback((e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    if (idx !== activePage) setActivePage(idx);
  }, [activePage]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── 이미지 갤러리 ── */}
      <View style={styles.galleryWrapper}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handlePageScroll}
          scrollEventThrottle={16}
        >
          {shop.images.map((uri, i) => (
            <View key={i} style={styles.heroSlot}>
              {uri ? (
                <Image source={{ uri }} style={styles.heroImage} resizeMode="cover" />
              ) : (
                <View style={styles.heroPlaceholder}>
                  <TattooPlaceholderIcon size={72} color="#2e2e2e" />
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

        {/* Page indicator (bottom-right) */}
        {shop.images.length > 1 && (
          <View style={styles.pageIndicator}>
            <Text style={styles.pageIndicatorText}>
              {activePage + 1} / {shop.images.length}
            </Text>
          </View>
        )}
      </View>

      {/* ── Scroll content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 신규 뱃지 + 제목 + 가격 + 주소 */}
        <View style={styles.headerBlock}>
          {shop.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{t('shop.card.newBadge')}</Text>
            </View>
          )}
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.price}>{t('shop.card.pricePerDayFmt', { price: shop.pricePerDay.toLocaleString() })}</Text>
          <View style={styles.addressRow}>
            <LocationPinIcon size={14} color={COLORS.gray} />
            <Text style={styles.addressText}>{shop.address}</Text>
          </View>
        </View>

        {/* 스펙 그리드 (3x2) */}
        <View style={styles.specGrid}>
          {specs.map((s, idx) => (
            <View
              key={idx}
              style={[
                styles.specCell,
                idx % 3 !== 2 && styles.specCellBorderRight,
                idx < 3 && styles.specCellBorderBottom,
              ]}
            >
              <View style={styles.specLabelRow}>
                <s.Icon size={13} color={COLORS.gray} />
                <Text style={styles.specLabel}>{s.label}</Text>
              </View>
              <Text style={styles.specValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* 상세 소개 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('shop.detail.intro')}</Text>
          <Text style={styles.description}>{displayedDesc}</Text>
          {shouldTruncate && (
            <TouchableOpacity
              onPress={() => setExpandDescription((v) => !v)}
              activeOpacity={0.75}
              style={styles.expandBtn}
            >
              <Text style={styles.expandText}>
                {expandDescription ? t('shop.collapse') : t('shop.expand')}
              </Text>
              {expandDescription
                ? <ChevronUpIcon size={14} color={COLORS.gray} />
                : <ChevronDownIcon size={14} color={COLORS.gray} />
              }
            </TouchableOpacity>
          )}
        </View>

        {/* 이용 규정 */}
        {shop.rules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('shop.detail.rules')}</Text>
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

        {/* 호스트 정보 */}
        <View style={styles.hostCard}>
          <View style={styles.hostAvatar}>
            {shop.host.profileImage ? (
              <Image source={{ uri: shop.host.profileImage }} style={styles.imgFill} resizeMode="cover" />
            ) : (
              <PersonSilhouette size={36} color="#3a3a3a" />
            )}
          </View>
          <View style={styles.hostInfo}>
            <Text style={styles.hostLabel}>{t('shop.hostLabel')}</Text>
            <Text style={styles.hostName}>{shop.host.nickname}</Text>
            <Text style={styles.hostRole}>{shop.host.role}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}>
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
            Alert.alert(t('common.noContactTitle'), t('shop.noContactMsg'));
          }}
          style={styles.ctaBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{t('shop.bookingInquiry')}</Text>
        </TouchableOpacity>
      </View>
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
