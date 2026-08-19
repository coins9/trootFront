import React, { useCallback, useMemo, useState } from 'react';
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

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteP = RouteProp<RootStackParamList, 'AdManage'>;

const PLACEMENT_LABEL: Record<AdPlacement, string> = {
  artwork: '작품', product: '용품샵', booth: '부스 쉐어', media: '사진/영상', model: '타투 모델',
};

const AdManageScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();

  const placement = route.params.placement;
  const targetId = route.params.targetId;

  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [stats, setStats] = useState<{ impressions: number; clicks: number; spend: number; ctr: number } | null>(null);
  const [products, setProducts] = useState<Record<AdType, AdProduct[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyOpen, setBuyOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
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
      toast(e instanceof ApiError ? e.userMessage : '광고 정보를 불러오지 못했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [placement, toast]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const purchase = useCallback(
    async (type: AdType, productCode: string, regionKey: string) => {
      try {
        await adApi.purchase({ placement, type, productCode, targetId, regionKey });
        setBuyOpen(false);
        toast('광고가 등록되었습니다', { variant: 'success' });
        void load();
      } catch (e) {
        toast(e instanceof ApiError ? e.userMessage : '광고 등록에 실패했습니다.', { variant: 'error' });
      }
    },
    [placement, targetId, toast, load],
  );

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{PLACEMENT_LABEL[placement]} 광고 관리</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={s.state}><ActivityIndicator color={COLORS.gold} /></View>
      ) : (
        <ScrollView contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
          {stats && (
            <View style={s.statsCard}>
              <View style={s.statItem}><Text style={s.statValue}>{stats.impressions.toLocaleString()}</Text><Text style={s.statLabel}>노출</Text></View>
              <View style={s.statDivider} />
              <View style={s.statItem}><Text style={s.statValue}>{stats.clicks.toLocaleString()}</Text><Text style={s.statLabel}>클릭</Text></View>
              <View style={s.statDivider} />
              <View style={s.statItem}><Text style={s.statValue}>{stats.ctr}%</Text><Text style={s.statLabel}>CTR</Text></View>
              <View style={s.statDivider} />
              <View style={s.statItem}><Text style={s.statValue}>{stats.spend.toLocaleString()}</Text><Text style={s.statLabel}>집행액</Text></View>
            </View>
          )}

          <Text style={s.sectionTitle}>진행 중 · 지난 광고</Text>
          {campaigns.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyText}>아직 등록한 광고가 없습니다.</Text></View>
          ) : (
            campaigns.map((c) => (
              <View key={c.id} style={s.campCard}>
                <View style={s.campLeft}>
                  <Text style={s.campPlan}>{c.planLabel}</Text>
                  <Text style={s.campSeg}>
                    {[c.regionKey, c.genreKey].filter(Boolean).join(' · ') || '전국'} · 노출 {c.impressions.toLocaleString()}
                  </Text>
                </View>
                <View style={[s.campBadge, c.status === 'active' && s.campBadgeActive]}>
                  <Text style={[s.campBadgeText, c.status === 'active' && s.campBadgeTextActive]}>
                    {c.status === 'active' ? '진행중' : c.status === 'completed' ? '종료' : c.status === 'refunded' ? '환불' : '대기'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {!loading && (
        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <TouchableOpacity style={s.buyBtn} activeOpacity={0.85} onPress={() => setBuyOpen(true)}>
            <BarChartIcon size={18} color={COLORS.black} strokeWidth={1.8} />
            <Text style={s.buyText}>광고 구매하기</Text>
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
  const [type, setType] = useState<AdType>('cardad');
  const [productCode, setProductCode] = useState<string>('');
  const [regionKey, setRegionKey] = useState<string>('');

  const list = useMemo(() => products?.[type] ?? [], [products, type]);
  const canBuy = !!productCode && !!regionKey;

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={[s.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>광고 구매</Text>

          <Text style={s.sheetLabel}>광고 유형</Text>
          <View style={s.chipRow}>
            {(['cardad', 'superup'] as AdType[]).map((t) => (
              <TouchableOpacity key={t} onPress={() => { setType(t); setProductCode(''); }}
                style={[s.chip, type === t && s.chipActive]} activeOpacity={0.75}>
                <Text style={[s.chipText, type === t && s.chipTextActive]}>{t === 'cardad' ? '카드광고(고정노출)' : '슈퍼UP(횟수권)'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.sheetLabel}>상품</Text>
          <View style={s.chipRow}>
            {list.map((p) => (
              <TouchableOpacity key={p.code} onPress={() => setProductCode(p.code)}
                style={[s.chip, productCode === p.code && s.chipActive]} activeOpacity={0.75}>
                <Text style={[s.chipText, productCode === p.code && s.chipTextActive]}>
                  {p.label} · {p.price.toLocaleString()}원
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.sheetLabel}>노출 지역 {type === 'cardad' && <Text style={s.req}>*</Text>}</Text>
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
            <Text style={[s.confirmText, !canBuy && s.confirmTextDisabled]}>결제하고 광고 시작</Text>
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
