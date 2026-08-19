import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
  StatusBar, Alert, LayoutAnimation, Platform, UIManager,
} from 'react-native';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const easeLayoutAnim = () => {
  LayoutAnimation.configureNext({
    duration: 260,
    create: { type: 'easeInEaseOut', property: 'opacity' },
    update: { type: 'easeInEaseOut' },
    delete: { type: 'easeInEaseOut', property: 'opacity' },
  });
};
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, HelpCircleIcon, AlertInfoIcon, CalendarIcon, TagIcon,
  StarIcon, WalletIcon, ChevronRightIcon, DotsVerticalIcon,
  PersonSilhouette,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import LogoHeader from '../../components/common/LogoHeader';
import { DepositItem, DepositStatus } from '../../../domain/entities/depositTypes';
import { useApi, usePagedApi } from '../../hooks/useApi';
import { reservationApi, type ArtistReservationView } from '../../../data/api';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

function toDepositItem(v: ArtistReservationView): DepositItem {
  const dt = new Date(v.scheduledAt);
  const requestedAt = new Date(v.createdAt);
  const dueAt = new Date(requestedAt.getTime() + 3 * 86_400_000);
  return {
    id: v.id,
    reservationNumber: `R-${v.id.slice(0, 8).toUpperCase()}`,
    customer: {
      id: v.customer?.id ?? '',
      nickname: v.customer?.nickname ?? '',
      handle: '',
      avatarUri: v.customer?.profileImage ?? '',
    },
    procedureDateLabel: dt.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
    procedureTimeLabel: dt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    style: v.sizePreset ?? '',
    bodyPart: v.bodyPart ?? '',
    depositAmount: v.depositKrw,
    requestedAt: requestedAt.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
    dueAt: dueAt.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
    status: 'pending' as DepositStatus,
  };
}

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TabKey = 'pending' | 'confirmed';

/* ============================================================
   Deposit Card
   ============================================================ */
interface DepositCardProps {
  item: DepositItem;
  status: DepositStatus;
  onPrimary: () => void;
  onSecondary: () => void;
  onMore: () => void;
}
const DepositCard = React.memo(({
  item, status, onPrimary, onSecondary, onMore,
}: DepositCardProps) => {
  const { t } = useTranslation();
  const isPending = status === 'pending';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>
            {isPending ? t('reservation.depositPendingBadge') : t('reservation.confirmed')}
          </Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <Text style={styles.reservationLabel}>{t('reservation.numberLabel')} </Text>
          <Text style={styles.reservationNumber}>{item.reservationNumber}</Text>
          <TouchableOpacity
            onPress={onMore}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
            style={styles.moreBtn}
          >
            <DotsVerticalIcon size={16} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.avatarWrap}>
          {item.customer.avatarUri ? (
            <Image source={{ uri: item.customer.avatarUri }} style={styles.avatarImg} />
          ) : (
            <PersonSilhouette size={64} color="#3a3a3a" />
          )}
        </View>

        <View style={styles.customerInfo}>
          <View style={styles.customerNameRow}>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.customer.nickname || t('reservation.noNameFallback')}
            </Text>
            {item.customer.isVip && (
              <StarIcon size={14} color={COLORS.gold} filled />
            )}
          </View>
          <Text style={styles.customerHandle} numberOfLines={1}>
            {item.customer.handle}
          </Text>
          <View style={styles.metaRow}>
            <CalendarIcon size={13} color={COLORS.gray} strokeWidth={1.6} />
            <Text style={styles.metaText}>
              {item.procedureDateLabel}  {item.procedureTimeLabel}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <TagIcon size={13} color={COLORS.gray} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.style} · {item.bodyPart}
            </Text>
          </View>
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>{t('reservation.depositAmount')}</Text>
          <View style={styles.amountValueRow}>
            <Text style={styles.amountValue}>
              {item.depositAmount.toLocaleString()}
            </Text>
            <Text style={styles.amountUnit}>원</Text>
          </View>
        </View>
      </View>

      <View style={styles.metaDivider} />

      <View style={styles.dateGrid}>
        <View style={styles.dateItem}>
          <Text style={styles.dateItemLabel}>{t('reservation.requestedAt')}</Text>
          <Text style={styles.dateItemValue}>{item.requestedAt}</Text>
        </View>
        <View style={styles.dateItemDivider} />
        <View style={styles.dateItem}>
          <Text style={styles.dateItemLabel}>
            {isPending ? t('reservation.dueAt') : t('reservation.confirmedAt')}
          </Text>
          <Text style={[
            styles.dateItemValue,
            isPending && styles.dateItemValueGold,
          ]}>
            {isPending ? item.dueAt : (item.confirmedAt ?? '-')}
          </Text>
        </View>
      </View>

      {isPending ? (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={onSecondary}
            activeOpacity={0.85}
            style={[styles.actionBtn, styles.actionBtnGhost]}
          >
            <Text style={styles.actionBtnGhostText}>{t('reservation.cancelPending')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPrimary}
            activeOpacity={0.85}
            style={[styles.actionBtn, styles.actionBtnPrimary]}
          >
            <Text style={styles.actionBtnPrimaryText}>{t('reservation.confirmDeposit')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={onSecondary}
            activeOpacity={0.85}
            style={[styles.actionBtn, styles.actionBtnGhost, { flex: 1 }]}
          >
            <Text style={styles.actionBtnGhostText}>{t('reservation.cancelConfirmed')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});
DepositCard.displayName = 'DepositCard';

/* ============================================================
   Screen
   ============================================================ */
const DepositManagementScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const { items: pendingRaw, loading: pendingLoading, loadMore: loadMorePending, setItems: setPendingRaw } =
    usePagedApi((cursor) => reservationApi.forArtist({ depositStatus: 'pending', cursor }), []);
  const { items: confirmedRaw, loading: confirmedLoading, loadMore: loadMoreConfirmed, setItems: setConfirmedRaw } =
    usePagedApi((cursor) => reservationApi.forArtist({ depositStatus: 'paid', cursor }), []);
  const { data: summary } = useApi(() => reservationApi.depositSummary(), []);

  const pending = useMemo(() => pendingRaw.map(toDepositItem), [pendingRaw]);
  const confirmed = useMemo(() => confirmedRaw.map((v) => ({ ...toDepositItem(v), status: 'confirmed' as DepositStatus })), [confirmedRaw]);

  const pendingSum = summary?.pending.sum ?? 0;
  const confirmedSum = summary?.paid.sum ?? 0;

  const list = activeTab === 'pending' ? pending : confirmed;
  const listLoading = activeTab === 'pending' ? pendingLoading : confirmedLoading;

  const handleGuide = useCallback(() => {
    toast(t('reservation.guideComingSoon'));
  }, [toast, t]);

  const handleMore = useCallback((item: DepositItem) => () => {
    toast(t('reservation.optionComingSoon').replace('{{number}}', item.reservationNumber));
  }, [toast, t]);

  const handleConfirm = useCallback((item: DepositItem) => () => {
    Alert.alert(
      t('reservation.confirmDepositTitle'),
      t('reservation.confirmDepositMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'default',
          onPress: async () => {
            easeLayoutAnim();
            setPendingRaw((prev) => prev.filter((d) => d.id !== item.id));
            try {
              await reservationApi.confirmDeposit(item.id);
              toast(
                t('reservation.toastDepositConfirmed').replace('{{name}}', item.customer.nickname || t('reservation.noNameFallback')),
                { variant: 'success' },
              );
            } catch {
              toast(t('common.error'), { variant: 'error' });
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [toast, setPendingRaw, t]);

  const handleCancelPending = useCallback((item: DepositItem) => () => {
    Alert.alert(
      t('reservation.cancelPendingTitle'),
      t('reservation.cancelPendingMsg'),
      [
        { text: t('reservation.cancelBack'), style: 'cancel' },
        {
          text: t('reservation.cancelPendingConfirmBtn'),
          style: 'destructive',
          onPress: async () => {
            easeLayoutAnim();
            setPendingRaw((prev) => prev.filter((d) => d.id !== item.id));
            try {
              await reservationApi.rejectByArtist(item.id, '미입금');
              toast(
                t('reservation.toastDepositCancelled').replace('{{name}}', item.customer.nickname || t('reservation.noNameFallback')),
                { variant: 'error' },
              );
            } catch {
              toast(t('common.error'), { variant: 'error' });
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [toast, setPendingRaw, t]);

  const handleCancelConfirmed = useCallback((item: DepositItem) => () => {
    Alert.alert(
      t('reservation.cancelConfirmedTitle'),
      t('reservation.cancelConfirmedMsg'),
      [
        { text: t('reservation.cancelBack'), style: 'cancel' },
        {
          text: t('reservation.cancelConfirmedBtn'),
          style: 'destructive',
          onPress: async () => {
            easeLayoutAnim();
            setConfirmedRaw((prev) => prev.filter((d) => d.id !== item.id));
            try {
              await reservationApi.rejectByArtist(item.id, '예약 취소');
              toast(
                t('reservation.toastDepositRefunded').replace('{{name}}', item.customer.nickname || t('reservation.noNameFallback')),
                { variant: 'error' },
              );
            } catch {
              toast(t('common.error'), { variant: 'error' });
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [toast, setConfirmedRaw, t]);

  const handleSummaryTap = useCallback(() => {
    toast(t('reservation.summaryComingSoon'));
  }, [toast, t]);

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
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{t('reservation.depositTitle')}</Text>
          <Text style={styles.subtitle}>{t('reservation.depositSubtitle')}</Text>
        </View>
        <TouchableOpacity
          onPress={handleGuide}
          activeOpacity={0.85}
          style={styles.guideBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <HelpCircleIcon size={14} color={COLORS.gold} />
          <Text style={styles.guideText}>{t('reservation.guide')}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => {
            easeLayoutAnim();
            setActiveTab('pending');
          }}
          activeOpacity={0.75}
          style={styles.tabBtn}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            {t('reservation.tabPendingDeposit')} ({summary?.pending.count ?? pending.length})
          </Text>
          {activeTab === 'pending' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            easeLayoutAnim();
            setActiveTab('confirmed');
          }}
          activeOpacity={0.75}
          style={styles.tabBtn}
        >
          <Text style={[styles.tabText, activeTab === 'confirmed' && styles.tabTextActive]}>
            {t('reservation.confirmed')} ({summary?.paid.count ?? confirmed.length})
          </Text>
          {activeTab === 'confirmed' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 200) {
            if (activeTab === 'pending') loadMorePending();
            else loadMoreConfirmed();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <AlertInfoIcon size={18} color={COLORS.gold} />
          <Text style={styles.infoText}>{t('reservation.infoUpdate')}</Text>
        </View>

        {listLoading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('common.loading')}</Text>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('common.empty')}</Text>
          </View>
        ) : (
          list.map((item) => (
            <DepositCard
              key={item.id}
              item={item}
              status={activeTab}
              onPrimary={handleConfirm(item)}
              onSecondary={
                activeTab === 'pending'
                  ? handleCancelPending(item)
                  : handleCancelConfirmed(item)
              }
              onMore={handleMore(item)}
            />
          ))
        )}
      </ScrollView>

      {/* Bottom summary */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleSummaryTap}
        style={[styles.summaryBar, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}
      >
        <View style={styles.summaryIconWrap}>
          <WalletIcon size={22} color={COLORS.gold} strokeWidth={1.7} />
        </View>
        <View style={styles.summaryColLeft}>
          <Text style={styles.summaryLabel}>
            {activeTab === 'pending' ? t('reservation.summaryPendingLabel') : t('reservation.summaryConfirmedLabel')}
          </Text>
          <Text style={styles.summaryAmount}>
            {(activeTab === 'pending' ? pendingSum : confirmedSum).toLocaleString()}원
          </Text>
        </View>
        <View style={styles.summaryColRight}>
          <Text style={styles.summaryLabel}>{t('reservation.countLabel')}</Text>
          <Text style={styles.summaryAmount}>
            {(activeTab === 'pending'
              ? (summary?.pending.count ?? pending.length)
              : (summary?.paid.count ?? confirmed.length))}건
          </Text>
        </View>
        <ChevronRightIcon size={18} color={COLORS.gray} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DepositManagementScreen;

/* ============================================================
   Styles
   ============================================================ */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  subHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: COLORS.black,
    gap: 4,
  },
  backBtn: {
    width: 36, height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  titleGroup: { flex: 1, gap: 4 },
  title: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  guideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 4,
  },
  guideText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },

  /* Tabs */
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  tabTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: COLORS.gold,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },

  /* Info banner */
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoText: {
    flex: 1,
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },

  /* Card */
  card: {
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reservationLabel: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  reservationNumber: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  moreBtn: {
    marginLeft: 6,
    padding: 2,
  },

  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  avatarWrap: {
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },

  customerInfo: {
    flex: 1,
    gap: 4,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  customerHandle: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 16,
    flexShrink: 1,
  },

  amountBlock: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    minWidth: 110,
  },
  amountLabel: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  amountValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  amountValue: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  amountUnit: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginLeft: 1,
  },

  metaDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },

  dateGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateItemDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  dateItemLabel: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  dateItemValue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    flexShrink: 1,
  },
  dateItemValueGold: {
    color: COLORS.gold,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnGhost: {
    flex: 1,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnGhostText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionBtnPrimary: {
    flex: 2,
    backgroundColor: COLORS.gold,
  },
  actionBtnPrimaryText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },

  /* Bottom summary */
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryIconWrap: {
    width: 40, height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
  },
  summaryColLeft: {
    flex: 1,
    gap: 2,
  },
  summaryColRight: {
    gap: 2,
    marginRight: 12,
    alignItems: 'flex-end',
    minWidth: 60,
  },
  summaryLabel: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  summaryAmount: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },

  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
});
