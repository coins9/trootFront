import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image, StatusBar, Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import {
  CalendarIcon, TagIcon, LocationPinIcon, PersonSilhouette,
  WonIcon, BackArrowIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import {
  Reservation, ReservationTab, isOngoing,
} from '../../../domain/entities/reservationTypes';
import { usePagedApi } from '../../hooks/useApi';
import { reservationApi, type CustomerReservationView } from '../../../data/api';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

// 🚨 도메인 타입 충돌 방지를 위해 일반 string 레코드로 매핑
const STATUS_MAP: Record<string, string> = {
  requested: '예약 대기중',
  confirmed: '확정',
  deposit_paid: '확정',
  completed: '완료',
  cancelled: '취소',
  no_show: '취소',
};

let _seq = 1;
// 🚨 날짜 다국어 포맷팅을 위해 language 인자 추가
function toReservation(v: CustomerReservationView, language: string): Reservation {
  const regionParts = [v.artist?.regionSido, v.artist?.regionSigungu].filter(Boolean);
  const dt = new Date(v.scheduledAt);
  const isKo = language === 'ko';

  const dateStr = dt.toLocaleDateString(isKo ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = dt.toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  return {
    id: v.id,
    reservationNumber: `R-${(_seq++).toString().padStart(4, '0')}`,
    status: (STATUS_MAP[v.status] ?? '예약 대기중') as any, // 🚨 TS2367 우회를 위해 as any 적용
    artist: {
      id: v.artist?.id ?? '',
      nickname: v.artist?.pageName ?? '',
      profileImage: v.artist?.profileImage ?? '',
      location: regionParts.join(' ') || '',
      openChatUrl: v.artist?.openChatUrl ?? null,
    },
    dateTime: `${dateStr} ${timeStr}`,
    artworkTitle: v.artworkTitle ?? null,
    bodyPart: v.bodyPart ?? '',
    genre: v.sizePreset ?? '',
    totalPrice: v.estimatedPriceKrw ?? 0,
    createdAt: v.createdAt,
  };
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS: ReservationTab[] = ['진행 중인 예약', '지난 예약'];

const ReservationManageScreen = () => {
  const { t, language } = useTranslation();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const [tab, setTab] = useState<ReservationTab>('진행 중인 예약');

  const { items: raw, loading, loadingMore, hasNext, loadMore, reload } =
      usePagedApi((cursor) => reservationApi.mine({ cursor }), []);

  const hasFocused = useRef(false);
  useFocusEffect(
      useCallback(() => {
        if (!hasFocused.current) {
          hasFocused.current = true;
          return;
        }
        reload();
      }, [reload])
  );

  // 🚨 language 상태에 따라 목록 재생성
  const all = useMemo(() => raw.map((r) => toReservation(r, language)), [raw, language]);

  const rawMap = useMemo(() => {
    const m = new Map<string, CustomerReservationView>();
    raw.forEach((r) => m.set(r.id, r));
    return m;
  }, [raw]);

  const filtered = useMemo(() => (
      tab === '진행 중인 예약'
          ? all.filter((r) => isOngoing(r.status as any))
          : all.filter((r) => !isOngoing(r.status as any))
  ), [all, tab]);

  const handleOpenChat = useCallback((r: Reservation) => {
    if (r.artist.openChatUrl) {
      Linking.openURL(r.artist.openChatUrl).catch(() => {
        toast(t('reservation.chatCannotOpen' as any).replace('{{name}}', r.artist.nickname), { variant: 'error' });
      });
      return;
    }
    toast(t('reservation.chatCannotOpen' as any).replace('{{name}}', r.artist.nickname), { variant: 'error' });
  }, [toast, t]);

  const handleWriteReview = useCallback((item: Reservation) => {
    const rv = rawMap.get(item.id);
    if (!rv) return;
    const dt = new Date(rv.scheduledAt);
    const isKo = language === 'ko';
    navigation.navigate('ReviewWrite', {
      review: {
        id: rv.id,
        artist: {
          id: rv.artist?.id ?? '',
          avatarUri: rv.artist?.profileImage ?? '',
          nickname: rv.artist?.pageName ?? '',
          handle: rv.artist?.id ?? '',
          location: [rv.artist?.regionSido, rv.artist?.regionSigungu].filter(Boolean).join(' '),
        },
        // 🚨 리뷰 작성 화면에도 번역된 날짜/시간 전달
        procedureDate: dt.toLocaleDateString(isKo ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        procedureTime: dt.toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        bodyPart: rv.bodyPart ?? '',
        style: rv.sizePreset ?? '',
        daysLeft: 0,
      },
    });
  }, [rawMap, navigation, language]);

  const isOngoingTab = tab === '진행 중인 예약';

  // 필터링 후 목록이 비어 있고 더 불러올 데이터가 있으면 자동으로 추가 로드
  useEffect(() => {
    if (filtered.length === 0 && !loading && !loadingMore && hasNext) {
      loadMore();
    }
  }, [filtered.length, loading, loadingMore, hasNext, loadMore]);

  const renderItem = useCallback(({ item }: { item: Reservation }) => {
    // 🚨 TS2367 방어: as string으로 변경하여 자유로운 비교 허용
    const statusStr = item.status as string;
    const statusLabel = statusStr === '예약 대기중' ? t('reservation.status.requested' as any)
        : statusStr === '확정' ? t('reservation.status.confirmed' as any)
            : statusStr === '완료' ? t('reservation.status.completed' as any)
                : t('reservation.status.cancelled' as any);

    return (
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.statusChip}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
            <View style={styles.numberBlock}>
              <Text style={styles.numberLabel}>{t('reservation.numberLabel' as any)}</Text>
              <Text style={styles.numberValue}>{item.reservationNumber}</Text>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.avatarCircle}>
              {item.artist.profileImage ? (
                  <Image source={{ uri: item.artist.profileImage }} style={styles.avatarImg} resizeMode="cover" />
              ) : (
                  <PersonSilhouette size={64} color="#3a3a3a" />
              )}
            </View>

            <View style={styles.info}>
              <Text style={styles.artistName}>{item.artist.nickname}</Text>
              {!!item.artworkTitle && (
                  <Text style={styles.artworkTitle} numberOfLines={1}>{item.artworkTitle}</Text>
              )}
              <View style={styles.locationRow}>
                <LocationPinIcon size={13} color={COLORS.gray} />
                <Text style={styles.locationText}>{item.artist.location || t('reservation.locationDefault' as any)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

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
                {t('reservation.totalPrice' as any)}{'   '}
                <Text style={styles.priceValue}>
                  {item.totalPrice > 0
                    ? (language === 'ko' ? `${item.totalPrice.toLocaleString()}원` : `₩${item.totalPrice.toLocaleString()}`)
                    : (language === 'ko' ? '확인 예정' : 'To be confirmed')}
                </Text>
              </Text>
            </View>
          </View>

          {statusStr === '완료' ? (
              <TouchableOpacity onPress={() => handleWriteReview(item)} activeOpacity={0.85} style={styles.ctaSolid}>
                <Text style={styles.ctaSolidText}>{t('reservation.writeReview' as any)}</Text>
              </TouchableOpacity>
          ) : statusStr === '예약 대기중' || statusStr === '확정' ? (
              <TouchableOpacity onPress={() => handleOpenChat(item)} activeOpacity={0.85} style={styles.ctaSolid}>
                <Text style={styles.ctaSolidText}>{t('reservation.chat' as any)}</Text>
              </TouchableOpacity>
          ) : (
              <View style={[styles.ctaOutline, { opacity: 0.5 }]}>
                <Text style={styles.ctaOutlineText}>{statusLabel}</Text>
              </View>
          )}
        </View>
    );
  }, [isOngoingTab, handleOpenChat, handleWriteReview, t, language]);

  return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <LogoHeader />

        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.backBtn}>
            <BackArrowIcon size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>{t('reservation.title' as any)}</Text>
        </View>

        <View style={styles.tabBar}>
          {TABS.map((tabKey) => {
            const active = tabKey === tab;
            return (
                <TouchableOpacity key={tabKey} onPress={() => setTab(tabKey)} activeOpacity={0.75} style={styles.tabItem}>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tabKey === '진행 중인 예약' ? t('reservation.tabOngoing' as any) : t('reservation.tabPast' as any)}
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
            contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 24) + 20 }]}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  {loading ? t('common.loading' as any) : isOngoingTab ? t('reservation.emptyOngoing' as any) : t('reservation.emptyPast' as any)}
                </Text>
              </View>
            }
            ListFooterComponent={loadingMore ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>{t('common.loading' as any)}</Text>
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 12,
  },
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
    flexShrink: 1,
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
    flexShrink: 1,
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
  artworkTitle: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 1,
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