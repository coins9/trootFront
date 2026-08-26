import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, StatusBar, Linking,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, HeartIcon, TattooPlaceholderIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import PagerCarousel, { PagerDots } from '../../components/common/PagerCarousel';
import SupplyInquiryBottomSheet from '../../components/supplies/SupplyInquiryBottomSheet';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

const { width: W, height: H } = Dimensions.get('window');
const CAROUSEL_H = H * 0.4;

type DetailRoute = RouteProp<RootStackParamList, 'TattooSupplyDetail'>;
type DetailNav = NativeStackNavigationProp<RootStackParamList>;

const TattooSupplyDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { supply } = route.params;
  const { toast } = useToast();
  const { t, language } = useTranslation();

  const [activePage, setActivePage] = useState(0);
  const [bookmarked, setBookmarked] = useState(supply.isBookmarked);
  const [inquiryVisible, setInquiryVisible] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    supply.optionGroups?.forEach((g) => {
      if (g.values.length > 0) init[g.label] = g.values[0];
    });
    return init;
  });

  const images = useMemo(() => {
    const list = (supply.images && supply.images.length > 0)
        ? supply.images
        : [supply.imageUri];
    return list.length > 0 ? list : [''];
  }, [supply.images, supply.imageUri]);

  const renderCarouselItem = useCallback((uri: string) => (
      <View style={styles.carouselSlot}>
        <View style={styles.lightBox}>
          {uri ? (
              <Image source={{ uri }} style={styles.productImage} resizeMode="contain" />
          ) : (
              <View style={styles.placeholder}>
                <TattooPlaceholderIcon size={78} color="#c8c8c8" />
              </View>
          )}
        </View>
      </View>
  ), []);

  const toggleBookmark = useCallback(() => {
    setBookmarked((prev) => {
      const next = !prev;
      toast(next ? t('common.bookmarked') : t('common.unbookmarked'), {
        variant: next ? 'success' : 'default',
      });
      return next;
    });
  }, [toast, t]);

  // 선택 옵션 클립보드 복사 → toast → 오픈채팅 열기
  const handleContact = useCallback(() => {
    const chatUrl = supply.openChatUrl;

    // 클립보드에 복사할 문의 텍스트 빌드
    const lines: string[] = [
      t('supplies.inquiryMsgHeader'),
      `${t('supplies.inquiryMsgProduct')}: ${supply.name}`,
      ...(supply.subtitle ? [`${t('supplies.inquiryMsgDesc')}: ${supply.subtitle}`] : []),
      ...(supply.brand ? [`${t('supplies.inquiryMsgBrand')}: ${supply.brand}`] : []),
      ...(typeof supply.price === 'number'
        ? [`${t('supplies.inquiryMsgListPrice')}: ₩${supply.price.toLocaleString()}`]
        : []),
    ];
    Object.entries(selectedOptions).forEach(([k, v]) => {
      if (v) lines.push(`${k}: ${v}`);
    });
    Clipboard.setString(lines.join('\n'));

    if (chatUrl) {
      // 클립보드 복사 직후 바로 오픈채팅 이동 → 입력창에 즉시 붙여넣기 가능
      Linking.openURL(chatUrl).catch(() => toast(t('common.linkError'), { variant: 'error' }));
    } else {
      // openChatUrl 미등록 시: 복사 완료 토스트 → 인앱 바텀시트 fallback
      toast(t('common.copiedToChat'), { variant: 'success' });
      setTimeout(() => setInquiryVisible(true), 300);
    }
  }, [supply, selectedOptions, toast, t]);

  const handleOptionSelect = useCallback((groupLabel: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupLabel]: value }));
  }, []);

  return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            showsVerticalScrollIndicator={false}
        >
          {/* ── Carousel ── */}
          <View style={styles.carouselWrapper}>
            <PagerCarousel
                data={images}
                width={W}
                height={CAROUSEL_H}
                renderItem={renderCarouselItem}
                onIndexChange={setActivePage}
                keyExtractor={(_, i) => `img-${i}`}
            />

            <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <BackArrowIcon size={22} color={COLORS.black} />
              </TouchableOpacity>
              <View style={styles.topRight}>
                <TouchableOpacity onPress={toggleBookmark} style={styles.topBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <HeartIcon size={22} color={bookmarked ? COLORS.gold : COLORS.black} filled={bookmarked} />
                </TouchableOpacity>
              </View>
            </View>

            {images.length > 1 && (
                <View style={styles.dotsAbs}>
                  <PagerDots count={images.length} activeIndex={activePage} dotColor="rgba(0,0,0,0.25)" activeColor={COLORS.black} />
                </View>
            )}
          </View>

          {/* ── Product info ── */}
          <View style={styles.infoBlock}>
            {supply.brand ? <Text style={styles.brand}>{supply.brand}</Text> : null}
            <Text style={styles.title}>{supply.name}</Text>
            <Text style={styles.subtitle}>{supply.subtitle}</Text>

            {/* 🚨 0원 버그 수정: typeof로 정확하게 숫자일 때만 가격 표시 */}
            {typeof supply.price === 'number' ? (
                <Text style={styles.price}>
                  {language === 'ko' ? `${supply.price.toLocaleString()}` : `₩${supply.price.toLocaleString()}`}
                  <Text style={styles.priceUnit}> {language === 'ko' ? '원' : ''} <Text style={styles.priceNote}>{t('supplies.detail.listPrice')}</Text></Text>
                </Text>
            ) : (
                <Text style={styles.priceHidden}>{t('supplies.detail.priceInquiry')}</Text>
            )}
          </View>

          {/* ── Description ── */}
          {supply.description ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('supplies.detail.intro')}</Text>
                <Text style={styles.description}>{supply.description}</Text>
              </View>
          ) : null}

          {/* ── Option selectors ── */}
          {supply.optionGroups?.map((group) => (
              <View key={group.label} style={styles.section}>
                <Text style={styles.sectionTitle}>{group.label}</Text>
                <View style={styles.optionChipRow}>
                  {group.values.map((v) => {
                    const isActive = selectedOptions[group.label] === v;
                    return (
                        <TouchableOpacity key={v} onPress={() => handleOptionSelect(group.label, v)} activeOpacity={0.8} style={[styles.optionChip, isActive && styles.optionChipActive]}>
                          <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{v}</Text>
                        </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
          ))}

          {/* ── Seller ── */}
          <View style={styles.sellerRow}>
            <Text style={styles.sellerLabel}>{t('supplies.seller')}</Text>
            <Text style={styles.sellerName}>{supply.seller.nickname}</Text>
          </View>
        </ScrollView>

        {/* Sticky CTA: 1:1문의 / 구매하러가기 */}
        <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}>
          {/* 1:1 구매 문의하기 — 선택 옵션 클립보드 복사 → toast → 오픈채팅 열기 */}
          <TouchableOpacity
              onPress={handleContact}
              style={[styles.ctaBtn, (supply.storeUrl || supply.externalUrl) ? styles.ctaBtnSecondary : {}]}
              activeOpacity={0.85}
          >
            <Text style={[styles.ctaText, (supply.storeUrl || supply.externalUrl) ? styles.ctaTextSecondary : {}]}>
              {t('supplies.detail.contact')}
            </Text>
          </TouchableOpacity>

          {/* 구매하러 가기 — storeUrl → externalUrl 순서로 연결 */}
          {(supply.storeUrl || supply.externalUrl) ? (
              <TouchableOpacity
                  onPress={() => {
                    const url = supply.storeUrl || supply.externalUrl!;
                    Linking.openURL(url).catch(() => toast(t('common.linkError'), { variant: 'error' }));
                  }}
                  style={styles.ctaBtn}
                  activeOpacity={0.85}
              >
                <Text style={styles.ctaText}>{t('supplies.detail.buyNow')}</Text>
              </TouchableOpacity>
          ) : null}
        </View>

        <SupplyInquiryBottomSheet
            visible={inquiryVisible}
            supply={supply}
            selectedOptions={selectedOptions}
            onClose={() => setInquiryVisible(false)}
        />
      </View>
  );
};

export default TattooSupplyDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },

  /* Carousel */
  carouselWrapper: { width: W, height: CAROUSEL_H, backgroundColor: '#F5F5F5', position: 'relative' },
  carouselSlot: { width: W, height: CAROUSEL_H, justifyContent: 'center', alignItems: 'center' },
  lightBox: { width: '86%', height: '86%', backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  productImage: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8, zIndex: 3 },
  topBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center' },
  topRight: { flexDirection: 'row', gap: 8 },
  dotsAbs: { position: 'absolute', bottom: 14, left: 0, right: 0 },

  /* Info */
  infoBlock: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  brand: { color: COLORS.gold, fontSize: 12, fontWeight: '700', letterSpacing: 1, lineHeight: 17, marginBottom: 4 },
  title: { color: COLORS.white, fontSize: 24, fontWeight: '700', lineHeight: 32 },
  subtitle: { color: '#AAAAAA', fontSize: 14, lineHeight: 20, marginTop: 6 },
  price: { color: COLORS.white, fontSize: 22, fontWeight: '800', lineHeight: 30, marginTop: 16 },
  priceUnit: { fontSize: 15, fontWeight: '600', color: COLORS.white },
  priceNote: { fontSize: 12, color: COLORS.gray, fontWeight: '400' },
  priceHidden: { color: COLORS.gold, fontSize: 18, fontWeight: '700', lineHeight: 24, marginTop: 16 },

  /* Section */
  section: { paddingHorizontal: 20, paddingTop: 22 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', lineHeight: 20, marginBottom: 12 },
  description: { color: '#AAAAAA', fontSize: 14, lineHeight: 22 },

  /* Options */
  optionChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: 'transparent', backgroundColor: '#222222' },
  optionChipActive: { borderColor: COLORS.gold, backgroundColor: 'rgba(251,192,45,0.1)' },
  optionText: { color: '#AAAAAA', fontSize: 13, fontWeight: '500', lineHeight: 18 },
  optionTextActive: { color: COLORS.gold, fontWeight: '700' },

  /* Seller */
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 28, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  sellerLabel: { color: COLORS.gray, fontSize: 12, lineHeight: 17 },
  sellerName: { color: COLORS.white, fontSize: 14, fontWeight: '700', lineHeight: 20 },

  /* Sticky footer */
  stickyFooter: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
    flexDirection: 'row', gap: 10 // 🚨 분할 배치를 위해 추가
  },
  ctaBtn: {
    flex: 1,
    backgroundColor: '#FBC02D', borderRadius: 14, paddingVertical: 17, alignItems: 'center'
  },
  ctaBtnSecondary: {
    backgroundColor: COLORS.elevated, borderWidth: 1, borderColor: COLORS.border
  },
  ctaText: { color: COLORS.black, fontSize: 16, fontWeight: '700', lineHeight: 22 },
  ctaTextSecondary: { color: COLORS.white },
});