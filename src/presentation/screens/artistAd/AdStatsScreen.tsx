import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
  Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import { BackArrowIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import AppBottomTabBar, { useBottomTabHeight } from '../../components/common/AppBottomTabBar';
import PromoBanner from '../../components/artistAd/PromoBanner';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import AdCard from '../../components/artistAd/AdCard';
import SuperUpBottomSheet, { SuperUpPlan } from '../../components/artistAd/SuperUpBottomSheet';
import CardAdBottomSheet, { CardAdPlan } from '../../components/artistAd/CardAdBottomSheet';
import { useMemo } from 'react';
import { MOCK_PROMO_BANNERS } from '../../../data/mock/artistAdMockData';
import { ArtistAdItem, ArtistAdStatus } from '../../../domain/entities/artistAdTypes';
import { useApi, usePagedApi } from '../../hooks/useApi';
import { artistApi, adApi, type Artwork, type AdCampaign } from '../../../data/api';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

const FMT_DATE = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }) : '-';

function toAdItem(artwork: Artwork, campaign?: AdCampaign): ArtistAdItem {
  const status: ArtistAdStatus = campaign
    ? campaign.type === 'superup' ? 'super_up'
      : campaign.type === 'cardad' ? 'card'
      : 'up'
    : 'idle';
  return {
    id: campaign?.id ?? artwork.id,
    title: artwork.title || '(제목 없음)',
    thumbnailUri: artwork.thumbnail ?? (artwork.images[0] ?? ''),
    status,
    statusLabel: campaign ? `${campaign.planLabel} 진행 중` : '광고 없음',
    periodStart: FMT_DATE(campaign?.startedAt ?? null),
    periodEnd: FMT_DATE(campaign?.expiresAt ?? null),
    impressions: { current: campaign?.impressions ?? 0, goal: 0, unit: '회' },
    clicks: { current: campaign?.clicks ?? 0, goal: 0, unit: '건' },
    inquiries: { current: 0, goal: 0, unit: '건' },
    trend: [],
  };
}

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SheetKind = 'superUp' | 'cardAd';

// 프로모 배너 id → 관리자에서 관리하는 문의 링크 키
const PROMO_URL_KEY: Record<string, 'adInquiryUrl' | 'partnerInquiryUrl'> = {
  promo1: 'adInquiryUrl',
  promo2: 'partnerInquiryUrl',
};

const AdStatsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const settings = usePublicSettings();
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const bottomTabHeight = useBottomTabHeight();

  const { items: artworks } = usePagedApi((cursor) => artistApi.myArtworks({ cursor }), []);
  const { data: campaigns } = useApi(() => adApi.mine(), []);

  const adItems = useMemo(() => {
    const campaignMap = new Map((campaigns ?? []).map((c) => [c.targetId, c]));
    return artworks.map((aw) => toAdItem(aw, campaignMap.get(aw.id) ?? undefined));
  }, [artworks, campaigns]);

  const openBottomSheet = useCallback((kind: SheetKind) => {
    // NOTE: superUp → 슈퍼UP 횟수권 결제 바텀시트가 올라옵니다.
    // NOTE: cardAd  → 홈 화면 고정 노출 카드광고 결제 바텀시트가 올라옵니다.
    setSheet(kind);
  }, []);
  const closeBottomSheet = useCallback(() => setSheet(null), []);

  const openPromoUrl = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      toast(t('adStats.linkError'), { variant: 'error' });
    });
  }, [toast]);

  const handleOpenDetail = useCallback((item: ArtistAdItem) => () => {
    // NOTE: 상세 통계 페이지가 열립니다. (준비 중)
    toast(`${item.title} 상세 통계 — 준비 중입니다`);
    // 실제 라우트 등록 후 아래로 교체
    // navigation.navigate('AdDetail', { id: item.id });
  }, [toast]);

  const handleUp = useCallback((item: ArtistAdItem) => () => {
    Alert.alert(
      'UP 적용',
      '해당 도안을 상단으로 무료로 끌어올리시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'default',
          onPress: () => {
            toast(`${item.title} 이(가) 상단으로 UP 되었습니다.`, { variant: 'success' });
          },
        },
      ],
      { cancelable: true },
    );
  }, [toast]);

  const handleSuperUp = useCallback((_item: ArtistAdItem) => () => {
    openBottomSheet('superUp');
  }, [openBottomSheet]);

  const handleCardAd = useCallback((_item: ArtistAdItem) => () => {
    openBottomSheet('cardAd');
  }, [openBottomSheet]);

  const handleSuperUpPurchase = useCallback((plan: SuperUpPlan) => {
    closeBottomSheet();
    setTimeout(() => {
      toast(
        `슈퍼UP ${plan.label} · ${plan.price.toLocaleString()}원 결제 — 준비 중입니다`,
        { variant: 'success' },
      );
    }, 200);
  }, [closeBottomSheet, toast]);

  const handleCardAdPurchase = useCallback((plan: CardAdPlan) => {
    closeBottomSheet();
    setTimeout(() => {
      toast(
        `카드광고 ${plan.label} · ${plan.price.toLocaleString()}원 결제 — 준비 중입니다`,
        { variant: 'success' },
      );
    }, 200);
  }, [closeBottomSheet, toast]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />

      <View style={styles.subHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <BackArrowIcon size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('adStats.title')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomTabHeight + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Promo banners */}
        {MOCK_PROMO_BANNERS.map((b) => {
          // 관리자에서 설정한 문의 링크로 연결, 없으면 배너 기본값(Tally)로 폴백
          const key = PROMO_URL_KEY[b.id];
          const url = (key && settings[key]) || b.ctaUrl;
          return (
            <PromoBanner
              key={b.id}
              banner={b}
              onPress={() => openPromoUrl(url)}
            />
          );
        })}

        {/* Section title */}
        <Text style={styles.sectionTitle}>{t('adStats.sectionTitle')}</Text>

        {adItems.length === 0 ? (
          <Text style={styles.emptyText}>{t('adStats.artworkEmpty')}</Text>
        ) : (
          adItems.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              onOpenDetail={handleOpenDetail(ad)}
              onUp={handleUp(ad)}
              onSuperUp={handleSuperUp(ad)}
              onCardAd={handleCardAd(ad)}
            />
          ))
        )}
      </ScrollView>

      <AppBottomTabBar activeTab="ProfileTab" />

      <SuperUpBottomSheet
        visible={sheet === 'superUp'}
        onClose={closeBottomSheet}
        onPurchase={handleSuperUpPurchase}
      />
      <CardAdBottomSheet
        visible={sheet === 'cardAd'}
        onClose={closeBottomSheet}
        onPurchase={handleCardAdPurchase}
      />
    </SafeAreaView>
  );
};

export default AdStatsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.black,
  },
  backBtn: {
    width: 36, height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginLeft: 4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
