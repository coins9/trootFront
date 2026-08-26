import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView,
  ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { BackArrowIcon, ChevronRightIcon, BarChartIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { ApiError } from '../../../data/api/client';
import {
  adApi, type AdCampaign, type AdPlacement, type AdProduct, type AdType,
} from '../../../data/api';
import { REGIONS } from '../../../domain/entities/regions';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteP = RouteProp<RootStackParamList, 'AdManage'>;

const PLACEMENT_T_KEY: Record<AdPlacement, string> = {
  artwork: 'ad.placementArtwork',
  product: 'ad.placementProduct',
  booth: 'ad.placementBooth',
  media: 'ad.placementMedia',
  model: 'ad.placementModel',
};

const AdManageScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t } = useTranslation();

  const placement = route.params.placement;
  const targetId = route.params.targetId;

  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [stats, setStats] = useState<{ impressions: number; clicks: number; inquiries: number; spend: number; ctr: number } | null>(null);
  const [products, setProducts] = useState<Record<AdType, AdProduct[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyOpen, setBuyOpen] = useState(false);

  // 🚨 1. 화면 복귀 및 구매 완료 시 조용한 갱신(Silent Reload)을 위한 isSilent 옵션 추가
  const load = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [mine, st, prods] = await Promise.all([
        adApi.mine(),
        adApi.stats(),
        adApi.products(),
      ]);
      setCampaigns(mine.filter((c) => c.placement === placement));
      setStats(st);
      setProducts(prods);
    } catch (e) {
      toast(e instanceof ApiError ? e.userMessage : t('ad.loadFailed' as any), { variant: 'error' });
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [placement, toast, t]);

  // 🚨 2. 화면에 들어올 때마다 최신 데이터로 갱신 (최초 1회만 스피너 동작)
  const hasFocused = useRef(false);
  useFocusEffect(
      useCallback(() => {
        if (!hasFocused.current) {
          hasFocused.current = true;
          void load(false);
        } else {
          void load(true);
        }
      }, [load])
  );

  const purchase = useCallback(
      async (type: AdType, productCode: string, regionKey: string) => {
        try {
          // 1단계: PENDING 캠페인 생성
          const campaign = await adApi.purchase({ placement, type, productCode, targetId, regionKey });
          // 2단계: 결제 확인 (PG 연동 전이므로 즉시 활성화)
          await adApi.activate(campaign.id);
          setBuyOpen(false);
          toast(t('ad.registered' as any), { variant: 'success' });
          void load(true);
        } catch (e) {
          toast(e instanceof ApiError ? e.userMessage : t('ad.registerFailed' as any), { variant: 'error' });
        }
      },
      [placement, targetId, toast, load, t],
  );

  return (
      // 🚨 3. 하단 잘림을 막기 위해 edges=['top'] 으로 수정
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t(PLACEMENT_T_KEY[placement] as any)} {t('ad.manage' as any)}</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
            <View style={s.state}><ActivityIndicator color={COLORS.gold} /></View>
        ) : (
            <ScrollView
                // 🚨 하단 시스템 영역 + 하단 고정 버튼을 고려한 안전 여백 적용
                contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom, 24) + 90 }]}
                showsVerticalScrollIndicator={false}
            >
              {stats && (
                  <View style={s.statsCard}>
                    <View style={s.statItem}><Text style={s.statValue}>{stats.impressions.toLocaleString()}</Text><Text style={s.statLabel}>{t('ad.impressions' as any)}</Text></View>
                    <View style={s.statDivider} />
                    <View style={s.statItem}><Text style={s.statValue}>{stats.clicks.toLocaleString()}</Text><Text style={s.statLabel}>{t('ad.clicks' as any)}</Text></View>
                    <View style={s.statDivider} />
                    <View style={s.statItem}><Text style={s.statValue}>{stats.inquiries.toLocaleString()}</Text><Text style={s.statLabel}>{t('ad.inquiries' as any)}</Text></View>
                    <View style={s.statDivider} />
                    <View style={s.statItem}><Text style={s.statValue}>{stats.ctr}%</Text><Text style={s.statLabel}>CTR</Text></View>
                  </View>
              )}

              <Text style={s.sectionTitle}>{t('ad.sectionHistory' as any)}</Text>
              {campaigns.length === 0 ? (
                  <View style={s.empty}><Text style={s.emptyText}>{t('ad.emptyAds' as any)}</Text></View>
              ) : (
                  campaigns.map((c) => (
                      <View key={c.id} style={s.campCard}>
                        <View style={s.campLeft}>
                          <Text style={s.campPlan}>{c.planLabel}</Text>
                          <Text style={s.campSeg}>
                            {[c.regionKey, c.genreKey].filter(Boolean).join(' · ') || t('ad.nationwide' as any)} · {t('ad.impressionCount' as any)} {c.impressions.toLocaleString()}
                          </Text>
                        </View>
                        <View style={[s.campBadge, c.status === 'active' && s.campBadgeActive]}>
                          <Text style={[s.campBadgeText, c.status === 'active' && s.campBadgeTextActive]}>
                            {c.status === 'active' ? t('ad.statusActive' as any) : c.status === 'completed' ? t('ad.statusCompleted' as any) : c.status === 'refunded' ? t('ad.statusRefunded' as any) : t('ad.statusPending' as any)}
                          </Text>
                        </View>
                      </View>
                  ))
              )}
            </ScrollView>
        )}

        {!loading && (
            // 🚨 4. 하단 고정 버튼 시스템 영역(홈 인디케이터) 가림 방지
            <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 24) + 12 }]}>
              <TouchableOpacity style={s.buyBtn} activeOpacity={0.85} onPress={() => setBuyOpen(true)}>
                <BarChartIcon size={18} color={COLORS.black} strokeWidth={1.8} />
                <Text style={s.buyText}>{t('ad.buyBtn' as any)}</Text>
              </TouchableOpacity>
            </View>
        )}

        <PurchaseSheet
            visible={buyOpen}
            products={products}
            onClose={() => setBuyOpen(false)}
            onPurchase={purchase}
        />
      </SafeAreaView>
  );
};

/** 광고 구매 시트 — 유형·상품·지역 선택 */
const PurchaseSheet = ({ visible, products, onClose, onPurchase }: {
  visible: boolean;
  products: Record<AdType, AdProduct[]> | null;
  onClose: () => void;
  onPurchase: (type: AdType, productCode: string, regionKey: string) => void;
}) => {
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();
  const [type, setType] = useState<AdType>('cardad');
  const [productCode, setProductCode] = useState<string>('');
  const [regionKey, setRegionKey] = useState<string>('');

  const list = useMemo(() => products?.[type] ?? [], [products, type]);
  const canBuy = !!productCode && !!regionKey;

  return (
      <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
        <Pressable style={s.backdrop} onPress={onClose}>
          {/* 🚨 5. 바텀 시트에도 안전한 하단 여백 부여 */}
          <Pressable style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]} onPress={() => {}}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>{t('ad.purchaseTitle' as any)}</Text>

            <Text style={s.sheetLabel}>{t('ad.adType' as any)}</Text>
            <View style={s.chipRow}>
              {(['cardad', 'superup', 'banner'] as AdType[]).map((adType) => (
                  <TouchableOpacity key={adType} onPress={() => { setType(adType); setProductCode(''); }}
                                    style={[s.chip, type === adType && s.chipActive]} activeOpacity={0.75}>
                    <Text style={[s.chipText, type === adType && s.chipTextActive]}>
                      {adType === 'cardad' ? t('ad.typeCardAd' as any) : adType === 'superup' ? t('ad.typeSuperUp' as any) : t('ad.typeBanner' as any)}
                    </Text>
                  </TouchableOpacity>
              ))}
            </View>

            <Text style={s.sheetLabel}>{t('ad.product' as any)}</Text>
            <View style={s.chipRow}>
              {list.map((p) => (
                  <TouchableOpacity key={p.code} onPress={() => setProductCode(p.code)}
                                    style={[s.chip, productCode === p.code && s.chipActive]} activeOpacity={0.75}>
                    <Text style={[s.chipText, productCode === p.code && s.chipTextActive]}>
                      {p.label} · {language === 'ko' ? `${p.price.toLocaleString()}원` : `₩${p.price.toLocaleString()}`}
                    </Text>
                  </TouchableOpacity>
              ))}
            </View>

            <Text style={s.sheetLabel}>{t('ad.region' as any)} {type === 'cardad' && <Text style={s.req}>*</Text>}</Text>
            <ScrollView style={s.regionScroll} showsVerticalScrollIndicator={false}>
              <View style={s.chipRow}>
                {REGIONS.map((r) => (
                    <TouchableOpacity key={r.code} onPress={() => setRegionKey(r.code)}
                                      style={[s.chip, regionKey === r.code && s.chipActive]} activeOpacity={0.75}>
                      <Text style={[s.chipText, regionKey === r.code && s.chipTextActive]}>{r.label}</Text>
                    </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
                style={[s.confirmBtn, !canBuy && s.confirmDisabled]}
                disabled={!canBuy}
                activeOpacity={0.85}
                onPress={() => onPurchase(type, productCode, regionKey)}
            >
              <Text style={[s.confirmText, !canBuy && s.confirmTextDisabled]}>{t('ad.confirmBuy' as any)}</Text>
              <ChevronRightIcon size={16} color={canBuy ? COLORS.black : COLORS.gray2} />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
  );
};

export default AdManageScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.black,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white, letterSpacing: 0.3 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },

  statsCard: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, paddingVertical: 16, marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: '800', color: COLORS.gold },
  statLabel: { fontSize: 11, color: COLORS.gray },
  statDivider: { width: 1, backgroundColor: COLORS.border },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.white, marginBottom: 10 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: COLORS.gray, fontSize: 13 },

  campCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    padding: 14, marginBottom: 8, gap: 12,
  },
  campLeft: { flex: 1, gap: 3 },
  campPlan: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  campSeg: { fontSize: 11.5, color: COLORS.gray },
  campBadge: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  campBadgeActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  campBadgeText: { fontSize: 11, color: COLORS.gray },
  campBadgeTextActive: { color: COLORS.gold, fontWeight: '700' },

  footer: {
    paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.black,
  },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 16,
  },
  buyText: { fontSize: 15, fontWeight: '700', color: COLORS.black },

  backdrop: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.sheet, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 20, paddingTop: 12,
  },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.gray3, marginBottom: 14 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: COLORS.white, marginBottom: 16 },
  sheetLabel: { fontSize: 13, fontWeight: '600', color: COLORS.white, marginTop: 14, marginBottom: 8 },
  req: { color: COLORS.gold },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.chipBorder, backgroundColor: COLORS.card,
  },
  chipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  chipText: { color: COLORS.gray, fontSize: 12.5, lineHeight: 17 },
  chipTextActive: { color: COLORS.gold, fontWeight: '600' },
  regionScroll: { maxHeight: 160 },

  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 16, marginTop: 20,
  },
  confirmDisabled: { backgroundColor: COLORS.elevated },
  confirmText: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  confirmTextDisabled: { color: COLORS.gray2 },
});