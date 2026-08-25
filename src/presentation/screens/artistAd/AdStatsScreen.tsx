import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import { BackArrowIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import ConfirmModal, { ConfirmConfig } from '../../components/common/ConfirmModal';
import AppBottomTabBar, { useBottomTabHeight } from '../../components/common/AppBottomTabBar';
import PromoBanner from '../../components/artistAd/PromoBanner';
import BannerCarousel from '../../components/common/BannerCarousel';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import AdCard from '../../components/artistAd/AdCard';
import SuperUpBottomSheet, { SuperUpPlan } from '../../components/artistAd/SuperUpBottomSheet';
import CardAdBottomSheet, { CardAdPlan } from '../../components/artistAd/CardAdBottomSheet';
import BannerAdBottomSheet, { BannerAdPlan } from '../../components/artistAd/BannerAdBottomSheet';
import { useMemo } from 'react';
import { MOCK_PROMO_BANNERS } from '../../../data/mock/artistAdMockData';
import { ArtistAdItem, ArtistAdStatus } from '../../../domain/entities/artistAdTypes';
import { useApi, usePagedApi } from '../../hooks/useApi';
import { artistApi, adApi, reservationApi  } from '../../../data/api';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';
import { adaptyService } from '../../../infrastructure/adapty/adaptyService';
import { toTattoo } from '../../../data/api/mappers';

const FMT_DATE = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }) : '-';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SheetKind = 'superUp' | 'cardAd' | 'bannerAd';

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
  const [activeItem, setActiveItem] = useState<ArtistAdItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const bottomTabHeight = useBottomTabHeight();

  const {
    items: artworks,
    loading: isArtworksLoading,
    loadMore,
    hasNext,
    reload: reloadArtworks // 👈 추가
  } = usePagedApi((cursor) => artistApi.myArtworks({ cursor }), []);

  const { data: campaigns, reload: reloadCampaigns } = useApi(() => adApi.mine(), []); // 👈 reload 추가
  const { data: artistProfile } = useApi(() => artistApi.me(), []);
  const { data: inquiryCounts } = useApi(() => reservationApi.countByArtwork(), []);

  const adItems = useMemo(() => {
    const campaignMap = new Map((campaigns ?? []).map((c) => [c.targetId, c]));

    return artworks.map((aw) => {
      const campaign = campaignMap.get(aw.id);

      let status: ArtistAdStatus = 'idle';
      let statusLabel = t('adStats.noAd');

      // 🚨 캠페인 데이터가 있을 때 상태(status)에 따른 분기 처리
      if (campaign) {
        const campStatus = String(campaign.status).toUpperCase(); // 백엔드 상태값 정규화

        if (campStatus === 'REFUNDED') {
          statusLabel = t('ad.statusRefunded'); // "환불"
        } else if (campStatus === 'COMPLETED' || campStatus === 'EXPIRED') {
          statusLabel = t('ad.statusCompleted'); // "종료"
        } else if (campStatus === 'PENDING') {
          statusLabel = t('ad.statusPending'); // "대기"
        } else {
          // 정상 활성화 상태
          status = campaign.type === 'superup' ? 'super_up' : campaign.type === 'cardad' ? 'card' : 'up';
          statusLabel = t('adStats.campaignActive').replace('{{label}}', campaign.planLabel || '');
        }
      }

      return {
        id: campaign?.id ?? aw.id,
        artworkId: aw.id,
        title: aw.title || t('adStats.noTitle'),
        thumbnailUri: aw.thumbnail ?? (aw.images[0] ?? ''),
        status,
        statusLabel,
        // 기간 시작/종료 처리도 정상적으로 연결됨
        periodStart: FMT_DATE(campaign?.startedAt ?? null),
        periodEnd: FMT_DATE(campaign?.expiresAt ?? null),
        impressions: { current: campaign?.impressions ?? 0, goal: 0, unit: t('adStats.unitViews') },
        clicks: { current: campaign?.clicks ?? 0, goal: 0, unit: t('adStats.unitCount') },
        inquiries: { current: inquiryCounts?.[aw.id] ?? 0, goal: 0, unit: t('adStats.unitCount') },
        trend: [],
      } as ArtistAdItem;
    });
  }, [artworks, campaigns, inquiryCounts, t]);

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
  }, [t, toast]);

  const handleOpenDetail = useCallback((item: ArtistAdItem) => () => {
    const artwork = artworks.find((aw) => aw.id === item.artworkId);
    if (artwork) {
      navigation.navigate('TattooDetail', { tattoo: toTattoo(artwork) });
    } else {
      toast(t('adStats.detailComingSoon').replace('{{title}}', item.title));
    }
  }, [artworks, navigation, toast, t]);

  const handleUp = useCallback((item: ArtistAdItem) => () => {
    setConfirm({
      title: t('adStats.upTitle'),
      message: t('adStats.upMsg'),
      cancelLabel: t('common.cancel'),
      confirmLabel: t('common.confirm'),
      variant: 'default',
      onConfirm: () => {
        toast(t('adStats.toastUp').replace('{{title}}', item.title), { variant: 'success' });
      },
    });
  }, [toast, t]);

  const handleSuperUp = useCallback((item: ArtistAdItem) => () => {
    setActiveItem(item);
    openBottomSheet('superUp');
  }, [openBottomSheet]);

  const handleCardAd = useCallback((item: ArtistAdItem) => () => {
    setActiveItem(item);
    openBottomSheet('cardAd');
  }, [openBottomSheet]);

  const handleBannerAd = useCallback((item: ArtistAdItem) => () => {
    setActiveItem(item);
    openBottomSheet('bannerAd');
  }, [openBottomSheet]);

  const executePurchase = useCallback(async (
      productCode: string,
      type: 'superup' | 'cardad' | 'banner',
      targetId?: string,
      regionKey?: string,
  ) => {
    if (purchasing) return;
    setPurchasing(true);
    closeBottomSheet();

    try {
      await adaptyService.purchaseAdProduct(productCode);
      await adApi.purchase({ placement: 'artwork', type, productCode, targetId, regionKey });

      toast(t('adStats.purchaseSuccess'), { variant: 'success' });

      // 🚨 이 부분이 핵심입니다! 구매 성공 시 서버에서 최신 광고 상태와 리스트를 즉시 다시 불러옵니다.
      reloadCampaigns();
      reloadArtworks();

    } catch (error: any) {
      const isCancelled =
          error?.adaptyCode === 2 ||
          error?.code === 'paymentCancelled' ||
          error?.code === 'E_USER_CANCELLED' ||
          String(error).toLowerCase().includes('cancel');

      if (isCancelled) return;

      toast(t('adStats.purchaseFailed'), { variant: 'error' });
    } finally {
      setPurchasing(false);
    }
  }, [purchasing, closeBottomSheet, reloadCampaigns, reloadArtworks, toast, t]);

  const handleSuperUpPurchase = useCallback((plan: SuperUpPlan) => {
    void executePurchase(plan.id, 'superup', activeItem?.artworkId); // 👈 void 추가
  }, [executePurchase, activeItem]);

  const handleCardAdPurchase = useCallback((plan: CardAdPlan) => {
    const regionKey = artistProfile?.regionSido ?? undefined;
    if (!regionKey) {
      toast(t('adStats.regionRequired'), { variant: 'error' });
      return;
    }
    void executePurchase(plan.id, 'cardad', activeItem?.artworkId, regionKey); // 👈 void 추가
  }, [executePurchase, activeItem, artistProfile, toast, t]);

  const handleBannerAdPurchase = useCallback((plan: BannerAdPlan) => {
    void executePurchase(plan.id, 'banner', activeItem?.artworkId); // 👈 void 추가
  }, [executePurchase, activeItem]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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

      <FlatList
          style={styles.scroll}
          data={adItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomTabHeight + 32 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {settings.bannerAdImages.length > 0 && (
                  <BannerCarousel items={settings.bannerAdImages} />
              )}
              {settings.bannerPartnerImages.length > 0 && (
                  <BannerCarousel items={settings.bannerPartnerImages} />
              )}
              {MOCK_PROMO_BANNERS.map((b) => {
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
              <Text style={styles.sectionTitle}>{t('adStats.sectionTitle')}</Text>
            </>
          }
          renderItem={({ item: ad }) => (
              <AdCard
                  ad={ad}
                  onOpenDetail={handleOpenDetail(ad)}
                  onUp={handleUp(ad)}
                  onSuperUp={handleSuperUp(ad)}
                  onCardAd={handleCardAd(ad)}
                  onBannerAd={handleBannerAd(ad)}
              />
          )}
          ListEmptyComponent={
            isArtworksLoading ? (
                <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 40 }} />
            ) : (
                <Text style={styles.emptyText}>{t('adStats.artworkEmpty')}</Text>
            )
          }
          onEndReached={hasNext ? loadMore : undefined}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isArtworksLoading && adItems.length > 0 ? (
                <ActivityIndicator size="small" color={COLORS.gold} style={{ marginVertical: 20 }} />
            ) : null
          }
      />

      <AppBottomTabBar activeTab="ProfileTab" />
      <ConfirmModal config={confirm} onDismiss={() => setConfirm(null)} />

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
      <BannerAdBottomSheet
        visible={sheet === 'bannerAd'}
        onClose={closeBottomSheet}
        onPurchase={handleBannerAdPurchase}
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
