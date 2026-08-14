import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image, StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import {
  CalendarIcon, TagIcon, LocationPinIcon, PersonSilhouette,
  WonIcon, BackArrowIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import {
  Reservation, ReservationTab, ReservationStatus, isOngoing,
} from '../../../domain/entities/reservationTypes';
import { usePagedApi } from '../../hooks/useApi';
import { reservationApi, type CustomerReservationView } from '../../../data/api';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

const STATUS_MAP: Record<string, ReservationStatus> = {
  requested: '예약 대기중',
  confirmed: '확정',
  deposit_paid: '확정',
  completed: '완료',
  cancelled: '취소됨',
  no_show: '취소됨',
};

let _seq = 1;
function toReservation(v: CustomerReservationView): Reservation {
  const regionParts = [v.artist?.regionSido, v.artist?.regionSigungu].filter(Boolean);
  const dt = new Date(v.scheduledAt);
  return {
    id: v.id,
    reservationNumber: `R-${(_seq++).toString().padStart(4, '0')}`,
    status: STATUS_MAP[v.status] ?? '예약 대기중',
    artist: {
      id: v.artist?.id ?? '',
      nickname: v.artist?.pageName ?? '',
      profileImage: v.artist?.profileImage ?? '',
      location: regionParts.join(' ') || '지역 미설정',
    },
    dateTime: `${dt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} ${dt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`,
    bodyPart: v.bodyPart ?? '',
    genre: v.sizePreset ?? '',
    totalPrice: v.estimatedPriceKrw ?? 0,
    createdAt: v.createdAt,
  };
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS: ReservationTab[] = ['진행 중인 예약', '지난 예약'];

const ReservationManageScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [tab, setTab] = useState<ReservationTab>('진행 중인 예약');

  const { items: raw, loading, loadingMore, loadMore } =
    usePagedApi((cursor) => reservationApi.mine({ cursor }), []);

  const all = useMemo(() => raw.map(toReservation), [raw]);

  const filtered = useMemo(() => (
    tab === '진행 중인 예약'
      ? all.filter((r) => isOngoing(r.status))
      : all.filter((r) => !isOngoing(r.status))
  ), [all, tab]);

  const handleOpenChat = useCallback(async (r: Reservation) => {
    if (r.artist.kakaoLink) {
      const can = await Linking.canOpenURL(r.artist.kakaoLink);
      if (can) {
        Linking.openURL(r.artist.kakaoLink);
        return;
      }
    }
    toast(`${r.artist.nickname}의 오픈카톡을 연결할 수 없습니다.`, { variant: 'error' });
  }, [toast]);

  const handleDetail = useCallback((r: Reservation) => {
    toast(`${r.reservationNumber} 상세 내역 — 준비 중입니다`);
  }, [toast]);

  const isOngoingTab = tab === '진행 중인 예약';

  const renderItem = useCallback(({ item }: { item: Reservation }) => (
    <View style={styles.card}>
      {/* Top row: status chip + reservation number */}
      <View style={styles.topRow}>
        <View style={styles.statusChip}>
          <Text style={styles.statusText}>
            {item.status === '예약 대기중'
              ? t('reservation.status.requested')
              : item.status === '확정'
                ? t('reservation.status.confirmed')
                : item.status === '완료'
                  ? t('reservation.status.completed')
                  : t('reservation.status.cancelled')}
          </Text>
        </View>
        <View style={styles.numberBlock}>
          <Text style={styles.numberLabel}>{t('reservation.numberLabel')}</Text>
          <Text style={styles.numberValue}>{item.reservationNumber}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.avatarCircle}>
          {item.artist.profileImage ? (
            <Image
              source={{ uri: item.artist.profileImage }}
              style={styles.avatarImg}
              resizeMode="cover"
            />
          ) : (
            <PersonSilhouette size={64} color="#3a3a3a" />
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.artistName}>{item.artist.nickname}</Text>
          <View style={styles.locationRow}>
            <LocationPinIcon size={13} color={COLORS.gray} />
            <Text style={styles.locationText}>{item.artist.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Detail rows */}
      <View style={styles.detailBlock}>
        <View style={styles.detailRow}>
          <CalendarIcon size={14} color={COLORS.gray} strokeWidth={1.7} />
          <Text style={styles.detailText}>{item.dateTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <TagIcon size={13} color={COLORS.gray} />
          <Text style={styles.detailText}>
            {item.bodyPart} <Text style={styles.detailDot}>·</Text> {item.genre}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <WonIcon size={13} color={COLORS.gray} />
          <Text style={styles.detailText}>
            {t('reservation.totalPrice')}   <Text style={styles.priceValue}>
              {item.totalPrice.toLocaleString()}원
            </Text>
          </Text>
        </View>
      </View>

      {/* CTA */}
      {isOngoingTab ? (
        <TouchableOpacity
          onPress={() => handleOpenChat(item)}
          activeOpacity={0.85}
          style={styles.ctaSolid}
        >
          <Text style={styles.ctaSolidText}>{t('reservation.chat')}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => handleDetail(item)}
          activeOpacity={0.85}
          style={styles.ctaOutline}
        >
          <Text style={styles.ctaOutlineText}>{t('reservation.viewDetail')}</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [isOngoingTab, handleOpenChat, handleDetail, t]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />

      {/* Sub header: back + title */}
      <View style={styles.subHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <BackArrowIcon size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>{t('reservation.title')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tabKey) => {
          const active = tabKey === tab;
          return (
            <TouchableOpacity
              key={tabKey}
              onPress={() => setTab(tabKey)}
              activeOpacity={0.75}
              style={styles.tabItem}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tabKey === '진행 중인 예약' ? t('reservation.tabOngoing') : t('reservation.tabPast')}
              </Text>
              {active && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {loading
                ? t('common.loading')
                : isOngoingTab
                  ? t('reservation.emptyOngoing')
                  : t('reservation.emptyPast')}
            </Text>
          </View>
        }
        ListFooterComponent={loadingMore ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('common.loading')}</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
};

export default ReservationManageScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  /* Sub header */
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.black,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subHeaderTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
  },

  /* Tabs */
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.black,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    bottom: -1,
    left: '18%',
    right: '18%',
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.gold,
  },

  /* List */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 12,
  },

  /* Card */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  numberBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  numberLabel: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  numberValue: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },

  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  artistName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 27,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },

  detailBlock: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  detailDot: {
    color: COLORS.gray3,
  },
  priceValue: {
    color: COLORS.white,
    fontWeight: '700',
  },

  ctaSolid: {
    marginTop: 18,
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaSolidText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  ctaOutline: {
    marginTop: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaOutlineText: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },

  empty: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
});
