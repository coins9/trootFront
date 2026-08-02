import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
  Alert, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import {
  BackArrowIcon, ChevronLeftIcon, ChevronRightIcon,
  CalendarIcon, CheckCircleIcon, ClockOutlineIcon,
  ChatBubbleIcon, PaletteIcon, RefreshIcon, EditPenIcon, XIcon,
  CalendarPlusIcon, WalletIcon, WonIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import {
  BookingStatus,
  WEEKDAY_KO, addDays, startOfMonth, toISODate, isSameDate,
  formatMonth,
  PersonalTimelineItem, MonthlyCellSummary,
} from '../../../domain/entities/artistScheduleTypes';
import {
  getPersonalTimelineForDate,
  getMonthlySummary,
} from '../../../data/mock/artistScheduleMockData';
import ReservationDetailModal, {
  ReservationDetail,
} from '../../components/artistReservation/ReservationDetailModal';
import ShopInviteSection from '../../components/artistReservation/ShopInviteSection';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const easeLayoutAnim = () => {
  LayoutAnimation.configureNext({
    duration: 240,
    create: { type: 'easeInEaseOut', property: 'opacity' },
    update: { type: 'easeInEaseOut' },
    delete: { type: 'easeInEaseOut', property: 'opacity' },
  });
};

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ViewKey = 'timeline' | 'calendar';
type TopTab = 'my' | 'shop';

const H_PAD = 16;
const HOUR_START = 9;
const HOUR_END = 20;
const HOUR_H = 44;

const formatHalfHour = (h: number) => {
  const hh = Math.floor(h);
  const mm = h - hh === 0.5 ? '30' : '00';
  return `${String(hh).padStart(2, '0')}:${mm}`;
};
const formatDateLabel = (d: Date) => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dow = ['일','월','화','수','목','금','토'][d.getDay()];
  return `${d.getFullYear()}.${mm}.${dd} (${dow})`;
};

const kindIcon = (kind: PersonalTimelineItem['kind']) => {
  switch (kind) {
    case 'consulting': return ChatBubbleIcon;
    case 'procedure':  return PaletteIcon;
    case 'retouch':    return RefreshIcon;
    case 'meeting':    return EditPenIcon;
  }
};

/* ============================================================
   Summary Bar (예약/예약금 통합)
   ============================================================ */
interface SummaryProps {
  total: number;
  confirmed: number;
  pending: number;
  noShow: number;
  depositPending: number;
  depositPendingSum: number;
}
const SummaryBar = React.memo(({
  total, confirmed, pending, noShow, depositPending, depositPendingSum,
}: SummaryProps) => (
  <View style={styles.summaryWrap}>
    <View style={styles.summaryRow}>
      <View style={styles.summaryCell}>
        <View style={styles.summaryIcon}>
          <CalendarIcon size={16} color={COLORS.gold} strokeWidth={1.7} />
        </View>
        <Text style={styles.summaryLabel}>총 예약</Text>
        <Text style={styles.summaryValue}>{total}건</Text>
      </View>
      <View style={styles.summarySep} />
      <View style={styles.summaryCell}>
        <View style={styles.summaryIcon}>
          <CheckCircleIcon size={16} color={COLORS.gold} />
        </View>
        <Text style={styles.summaryLabel}>확정 · 대기</Text>
        <Text style={styles.summaryValue}>
          {confirmed}
          <Text style={styles.summarySub}> · {pending}</Text>
        </Text>
      </View>
      <View style={styles.summarySep} />
      <View style={styles.summaryCell}>
        <View style={styles.summaryIcon}>
          <XIcon size={14} color={noShow > 0 ? COLORS.danger : COLORS.gray} strokeWidth={2} />
        </View>
        <Text style={styles.summaryLabel}>노쇼</Text>
        <Text style={[
          styles.summaryValue,
          noShow > 0 && { color: COLORS.danger },
        ]}>
          {noShow}건
        </Text>
      </View>
    </View>

    <View style={styles.depositBar}>
      <View style={styles.depositIconWrap}>
        <WalletIcon size={18} color={COLORS.gold} strokeWidth={1.7} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.depositLabel}>예약금 대기</Text>
        <Text style={styles.depositValue}>
          {depositPendingSum.toLocaleString()}원
          <Text style={styles.depositSub}> · {depositPending}건</Text>
        </Text>
      </View>
    </View>
  </View>
));
SummaryBar.displayName = 'SummaryBar';

/* ============================================================
   View Tab (2가지)
   ============================================================ */
interface ViewTabsProps {
  view: ViewKey;
  onChange: (v: ViewKey) => void;
}
const ViewTabs = React.memo(({ view, onChange }: ViewTabsProps) => (
  <View style={styles.tabRow}>
    <TouchableOpacity
      onPress={() => onChange('timeline')}
      activeOpacity={0.85}
      style={[styles.tabBtn, view === 'timeline' && styles.tabBtnActive]}
    >
      <ClockOutlineIcon size={14} color={view === 'timeline' ? COLORS.black : COLORS.gray} strokeWidth={1.8} />
      <Text style={[styles.tabText, view === 'timeline' && styles.tabTextActive]}>
        시간별 보기
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => onChange('calendar')}
      activeOpacity={0.85}
      style={[styles.tabBtn, view === 'calendar' && styles.tabBtnActive]}
    >
      <CalendarIcon size={14} color={view === 'calendar' ? COLORS.black : COLORS.gray} strokeWidth={1.7} />
      <Text style={[styles.tabText, view === 'calendar' && styles.tabTextActive]}>
        월간 캘린더
      </Text>
    </TouchableOpacity>
  </View>
));
ViewTabs.displayName = 'ViewTabs';

/* ============================================================
   Date Header Bar
   ============================================================ */
interface DateHeaderProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  todayLabel?: string;
}
const DateHeader = React.memo(({
  label, onPrev, onNext, onToday, todayLabel,
}: DateHeaderProps) => (
  <View style={styles.dateHeader}>
    <TouchableOpacity onPress={onPrev} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <ChevronLeftIcon size={18} color={COLORS.white} />
    </TouchableOpacity>
    <Text style={styles.dateHeaderText}>{label}</Text>
    <TouchableOpacity onPress={onNext} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <ChevronRightIcon size={18} color={COLORS.white} />
    </TouchableOpacity>
    <View style={{ flex: 1 }} />
    <TouchableOpacity
      onPress={onToday}
      activeOpacity={0.85}
      style={styles.todayBtn}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Text style={styles.todayText}>{todayLabel ?? '오늘'}</Text>
    </TouchableOpacity>
  </View>
));
DateHeader.displayName = 'DateHeader';

/* ============================================================
   Timeline View
   ============================================================ */
interface TimelineProps {
  items: PersonalTimelineItem[];
  statusOverride: Record<string, BookingStatus>;
  onOpenDetail: (item: PersonalTimelineItem) => void;
  onConfirm: (id: string) => void;
  onNoShow: (id: string, name?: string) => void;
}
const TimelineView = React.memo(({
  items, statusOverride, onOpenDetail, onConfirm, onNoShow,
}: TimelineProps) => {
  const totalHours = HOUR_END - HOUR_START + 1;
  const totalH = totalHours * HOUR_H;
  const hourLabels = useMemo(
    () => Array.from({ length: totalHours }, (_, i) => HOUR_START + i),
    [totalHours],
  );

  return (
    <View style={styles.timelineCard}>
      <View style={[styles.timelineBody, { height: totalH }]}>
        <View style={styles.timelineAxis}>
          {hourLabels.map((h) => (
            <View key={h} style={[styles.timelineHourRow, { height: HOUR_H }]}>
              <Text style={styles.timelineHourText}>{String(h).padStart(2, '0')}:00</Text>
            </View>
          ))}
        </View>
        <View style={styles.timelineTrack}>
          {hourLabels.map((h) => (
            <View key={h} style={[styles.timelineGrid, { top: (h - HOUR_START) * HOUR_H }]} />
          ))}

          {items.map((it) => {
            const top = (it.startHour - HOUR_START) * HOUR_H;
            const height = it.durationH * HOUR_H - 4;
            const isProcedure = it.kind === 'procedure';
            const currentStatus = statusOverride[it.id] ?? it.status;
            const isPending = currentStatus === '대기';
            const isNoShow = currentStatus === '노쇼';
            const isDone = currentStatus === '완료';
            const Icon = kindIcon(it.kind);

            const isTall = height >= 96;     // 2h+ : deposit chip 노출 가능
            const isCompact = height < 60;   // 1h 이하: 서브텍스트/칩 축약

            return (
              <TouchableOpacity
                key={it.id}
                onPress={() => onOpenDetail(it)}
                activeOpacity={0.85}
                style={[
                  styles.timelineBlock,
                  isProcedure && styles.timelineBlockGold,
                  isNoShow && styles.timelineBlockDanger,
                  isDone && styles.timelineBlockDone,
                  isCompact && styles.timelineBlockCompact,
                  { top: top + 2, height },
                ]}
              >
                <View style={styles.timelineBlockLeft}>
                  <Icon
                    size={15}
                    color={isNoShow ? COLORS.danger : COLORS.gold}
                    strokeWidth={1.7}
                  />
                  <Text style={[
                    styles.timelineTime,
                    isNoShow && { color: COLORS.danger },
                  ]}>
                    {formatHalfHour(it.startHour)}
                  </Text>
                </View>
                <View style={styles.timelineBlockBody}>
                  <Text style={styles.timelineTitle} numberOfLines={1}>
                    {it.title}
                  </Text>
                  {!isCompact && (
                    <Text style={styles.timelineSubtitle} numberOfLines={1}>
                      {it.subtitle}
                    </Text>
                  )}
                  {isTall && it.depositAmount ? (
                    <View style={styles.depositChip}>
                      <WonIcon
                        size={10}
                        color={it.depositStatus === 'paid' ? COLORS.gold : COLORS.danger}
                        strokeWidth={1.7}
                      />
                      <Text style={[
                        styles.depositChipText,
                        it.depositStatus === 'pending' && { color: COLORS.danger },
                      ]}>
                        {it.depositStatus === 'paid'
                          ? `${it.depositAmount.toLocaleString()}원 입금`
                          : `${it.depositAmount.toLocaleString()}원 대기`}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.timelineBlockRight}>
                  {!isCompact ? (
                    <View style={styles.inlineActions}>
                      <TouchableOpacity
                        onPress={() => onNoShow(it.id, it.customerName)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        activeOpacity={0.75}
                        style={[
                          styles.inlineBtn, styles.inlineBtnDanger,
                          isNoShow && styles.inlineBtnDisabled,
                        ]}
                        disabled={isNoShow}
                      >
                        <Text style={styles.inlineBtnDangerText}>노쇼</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => onConfirm(it.id)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        activeOpacity={0.75}
                        style={[
                          styles.inlineBtn, styles.inlineBtnGold,
                          isDone && styles.inlineBtnDisabled,
                        ]}
                        disabled={isDone}
                      >
                        <Text style={styles.inlineBtnGoldText}>
                          {isPending ? '확정' : '완료'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={[
                      styles.statusChip,
                      isPending && styles.statusChipPending,
                      isNoShow && styles.statusChipDanger,
                      isDone && styles.statusChipDone,
                    ]}>
                      <Text style={[
                        styles.statusChipText,
                        isPending && styles.statusChipTextPending,
                        isNoShow && styles.statusChipTextDanger,
                        isDone && styles.statusChipTextDone,
                      ]}>
                        {currentStatus}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
});
TimelineView.displayName = 'TimelineView';

/* ============================================================
   Calendar View (월간만)
   ============================================================ */
interface CalendarProps {
  monthStart: Date;
  selectedDate: Date;
  today: Date;
  onSelect: (d: Date) => void;
  summaryMap: Record<string, MonthlyCellSummary>;
}
const CalendarView = React.memo(({
  monthStart, selectedDate, today, onSelect, summaryMap,
}: CalendarProps) => {
  const gridStart = useMemo(() => {
    const d = new Date(monthStart);
    const dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [monthStart]);
  const cells = useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)),
    [gridStart],
  );

  return (
    <View style={styles.calCard}>
      <View style={styles.calDowRow}>
        {WEEKDAY_KO.map((d, i) => (
          <Text
            key={d}
            style={[
              styles.calDow,
              i === 5 && { color: '#4E8CFF' },
              i === 6 && { color: COLORS.danger },
            ]}
          >{d}</Text>
        ))}
      </View>

      <View style={styles.calGrid}>
        {cells.map((d, i) => {
          const iso = toISODate(d);
          const summary = summaryMap[iso];
          const dim = d.getMonth() !== monthStart.getMonth();
          const selected = isSameDate(d, selectedDate);
          const isToday = isSameDate(d, today);
          const dowIdx = i % 7;
          const numColor = selected
            ? COLORS.black
            : dim
              ? COLORS.gray3
              : dowIdx === 6
                ? COLORS.danger
                : dowIdx === 5
                  ? '#4E8CFF'
                  : COLORS.white;

          const count =
            (summary?.bed1 ?? 0) +
            (summary?.bed2 ?? 0) +
            (summary?.consulting ?? 0);

          return (
            <TouchableOpacity
              key={iso}
              onPress={() => onSelect(d)}
              activeOpacity={0.75}
              style={styles.calCell}
            >
              <View style={[
                styles.calNumWrap,
                selected && styles.calNumSelected,
                !selected && isToday && styles.calNumToday,
              ]}>
                <Text style={[styles.calNum, { color: numColor }]}>
                  {d.getDate()}
                </Text>
              </View>
              {!dim && (
                <View style={styles.calCellBody}>
                  {summary?.isBreak ? (
                    <View style={styles.calBreak}>
                      <Text style={styles.calBreakText}>마감</Text>
                    </View>
                  ) : count > 0 ? (
                    <View style={styles.calCount}>
                      <Text style={styles.calCountText}>{count}</Text>
                    </View>
                  ) : summary?.hasEvent ? (
                    <View style={styles.calDot} />
                  ) : null}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});
CalendarView.displayName = 'CalendarView';

/* ============================================================
   Screen
   ============================================================ */
const ArtistReservationScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const todayRef = useRef<Date>(new Date());
  const today = todayRef.current;

  const [topTab, setTopTab] = useState<TopTab>('my');
  const [view, setView] = useState<ViewKey>('timeline');
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [statusOverride, setStatusOverride] = useState<Record<string, BookingStatus>>({});
  const [detail, setDetail] = useState<ReservationDetail | null>(null);

  const monthStart = useMemo(() => startOfMonth(selectedDate), [selectedDate]);
  const todayISO = useMemo(() => toISODate(today), [today]);
  const isSelectedToday = isSameDate(selectedDate, today);

  const items = useMemo(
    () => getPersonalTimelineForDate(selectedDate),
    [selectedDate],
  );
  const monthlyMap = useMemo(
    () => getMonthlySummary(monthStart, todayISO),
    [monthStart, todayISO],
  );

  /* Summary stats */
  const stats = useMemo(() => {
    const total = items.length;
    const confirmed = items.filter((i) => (statusOverride[i.id] ?? i.status) === '확정').length;
    const pending = items.filter((i) => (statusOverride[i.id] ?? i.status) === '대기').length;
    const noShow = items.filter((i) => (statusOverride[i.id] ?? i.status) === '노쇼').length;
    const depositPendingItems = items.filter((i) => i.depositStatus === 'pending');
    const depositPending = depositPendingItems.length;
    const depositPendingSum = depositPendingItems.reduce(
      (acc, i) => acc + (i.depositAmount ?? 0), 0,
    );
    return { total, confirmed, pending, noShow, depositPending, depositPendingSum };
  }, [items, statusOverride]);

  /* Navigation */
  const goPrev = useCallback(() => {
    setSelectedDate((d) => addDays(d, view === 'timeline' ? -1 : -30));
  }, [view]);
  const goNext = useCallback(() => {
    setSelectedDate((d) => addDays(d, view === 'timeline' ? 1 : 30));
  }, [view]);
  const goToday = useCallback(() => {
    easeLayoutAnim();
    todayRef.current = new Date();
    setSelectedDate(todayRef.current);
  }, []);

  const dateLabel = useMemo(
    () => (view === 'timeline' ? formatDateLabel(selectedDate) : formatMonth(monthStart)),
    [view, selectedDate, monthStart],
  );

  /* Status change */
  const setStatus = useCallback((id: string, next: BookingStatus) => {
    easeLayoutAnim();
    setStatusOverride((prev) => ({ ...prev, [id]: next }));
    setDetail((prev) => (prev && prev.id === id ? { ...prev, status: next } : prev));
  }, []);

  const handleInlineConfirm = useCallback((id: string) => {
    const item = items.find((i) => i.id === id);
    const currentStatus = statusOverride[id] ?? item?.status;
    const isPending = currentStatus === '대기';
    Alert.alert(
      isPending ? '예약 확정' : '시술 완료',
      isPending
        ? '해당 예약을 확정 상태로 변경하시겠습니까?'
        : '해당 시술을 완료 처리하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'default',
          onPress: () => {
            setStatus(id, isPending ? '확정' : '완료');
            toast(
              isPending ? '예약이 확정되었습니다.' : '시술 완료로 표시되었습니다.',
              { variant: 'success' },
            );
          },
        },
      ],
      { cancelable: true },
    );
  }, [items, statusOverride, setStatus, toast]);

  const handleInlineNoShow = useCallback((id: string, name?: string) => {
    Alert.alert(
      '노쇼(No-show) 처리',
      `${name ?? '해당 고객'}을(를) 노쇼로 처리하시겠습니까?\n노쇼 처리 시 고객 신뢰도에 반영됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '노쇼 확정',
          style: 'destructive',
          onPress: () => {
            setStatus(id, '노쇼');
            toast('노쇼 처리되었습니다.', { variant: 'error' });
          },
        },
      ],
      { cancelable: true },
    );
  }, [setStatus, toast]);

  const openDetail = useCallback((it: PersonalTimelineItem) => {
    const currentStatus = statusOverride[it.id] ?? it.status;
    setDetail({
      id: it.id,
      title: it.title,
      customerName: it.customerName,
      bodyPart: it.bodyPart,
      tattooType: it.subtitle,
      memo: it.memo,
      isAppLinked: it.isAppLinked ?? true,
      status: currentStatus,
      timeLabel: `${formatHalfHour(it.startHour)} · ${it.durationH}시간`,
      dateLabel: formatDateLabel(selectedDate),
      kind: it.kind,
    });
  }, [statusOverride, selectedDate]);

  const closeDetail = useCallback(() => setDetail(null), []);
  const changeStatusFromModal = useCallback((id: string, next: BookingStatus) => {
    setStatus(id, next);
    toast(
      next === '노쇼'
        ? '노쇼 처리되었습니다.'
        : next === '완료'
          ? '시술 완료로 표시되었습니다.'
          : `상태가 ${next}로 변경되었습니다.`,
      { variant: next === '노쇼' ? 'error' : 'success' },
    );
  }, [setStatus, toast]);
  const handleEdit = useCallback((_id: string) => {
    setDetail(null);
    setTimeout(() => toast('예약 수정 — 준비 중입니다'), 220);
  }, [toast]);

  /* FAB */
  const handleFab = useCallback(() => {
    Alert.alert(
      '새 예약 등록',
      `${formatDateLabel(selectedDate)}에 새 예약을 등록하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '등록',
          style: 'default',
          onPress: () => toast('새 예약 등록 — 준비 중입니다', { variant: 'success' }),
        },
      ],
      { cancelable: true },
    );
  }, [selectedDate, toast]);

  /* Calendar cell tap → 시간별 뷰로 전환 */
  const handleCalendarSelect = useCallback((d: Date) => {
    setSelectedDate(d);
    if (!isSameDate(d, selectedDate)) {
      easeLayoutAnim();
      setView('timeline');
    }
  }, [selectedDate]);

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
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>예약 관리</Text>
          <Text style={styles.subtitle}>
            예약 · 예약금 · 노쇼를 한 화면에서 관리하세요.
          </Text>
        </View>
      </View>

      {/* Top tab (내 예약 관리 / 샵) */}
      <View style={styles.topTabRow}>
        <TouchableOpacity
          onPress={() => {
            easeLayoutAnim();
            setTopTab('my');
          }}
          activeOpacity={0.75}
          style={styles.topTabBtn}
        >
          <Text style={[styles.topTabText, topTab === 'my' && styles.topTabTextActive]}>
            내 예약 관리
          </Text>
          {topTab === 'my' && <View style={styles.topTabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            easeLayoutAnim();
            setTopTab('shop');
          }}
          activeOpacity={0.75}
          style={styles.topTabBtn}
        >
          <View style={styles.topTabLabelWrap}>
            <Text style={[styles.topTabText, topTab === 'shop' && styles.topTabTextActive]}>
              샵
            </Text>
            <View style={styles.topTabDot} />
          </View>
          {topTab === 'shop' && <View style={styles.topTabUnderline} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {topTab === 'shop' ? (
          <View style={styles.shopWrap}>
            <ShopInviteSection />
          </View>
        ) : (
          <>
        {/* Summary */}
        <SummaryBar
          total={stats.total}
          confirmed={stats.confirmed}
          pending={stats.pending}
          noShow={stats.noShow}
          depositPending={stats.depositPending}
          depositPendingSum={stats.depositPendingSum}
        />

        {/* View switch */}
        <ViewTabs view={view} onChange={setView} />

        {/* Date header */}
        <DateHeader
          label={dateLabel}
          onPrev={goPrev}
          onNext={goNext}
          onToday={goToday}
          todayLabel={isSelectedToday ? '오늘' : '오늘로'}
        />

        {view === 'timeline' && (
          items.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                {formatDateLabel(selectedDate)}에는 예약이 없습니다.
              </Text>
              <TouchableOpacity
                onPress={goToday}
                activeOpacity={0.85}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>오늘로 이동</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TimelineView
              items={items}
              statusOverride={statusOverride}
              onOpenDetail={openDetail}
              onConfirm={handleInlineConfirm}
              onNoShow={handleInlineNoShow}
            />
          )
        )}

        {view === 'calendar' && (
          <CalendarView
            monthStart={monthStart}
            selectedDate={selectedDate}
            today={today}
            onSelect={handleCalendarSelect}
            summaryMap={monthlyMap}
          />
        )}
          </>
        )}
      </ScrollView>

      {/* FAB — 내 예약 탭에서만 표시 */}
      {topTab === 'my' && (
        <TouchableOpacity
          onPress={handleFab}
          activeOpacity={0.85}
          style={styles.fab}
        >
          <CalendarPlusIcon size={26} color={COLORS.black} strokeWidth={2} />
        </TouchableOpacity>
      )}

      {/* Detail modal */}
      <ReservationDetailModal
        detail={detail}
        onClose={closeDetail}
        onChangeStatus={changeStatusFromModal}
        onEdit={handleEdit}
      />
    </SafeAreaView>
  );
};

export default ArtistReservationScreen;

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
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 110,
  },

  /* Top Tabs */
  topTabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topTabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  topTabLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topTabText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  topTabTextActive: {
    color: COLORS.gold,
    fontWeight: '800',
  },
  topTabDot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: COLORS.gold,
  },
  topTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2,
    backgroundColor: COLORS.gold,
  },

  shopWrap: {
    paddingHorizontal: H_PAD,
    paddingTop: 16,
  },

  /* Summary */
  summaryWrap: {
    marginHorizontal: H_PAD,
    marginTop: 14,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  summaryCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summarySep: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: 4,
    backgroundColor: COLORS.border,
  },
  summaryIcon: {
    width: 24, height: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  summaryLabel: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  summaryValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  summarySub: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '600',
  },
  depositBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.elevated,
  },
  depositIconWrap: {
    width: 34, height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  depositLabel: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  depositValue: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  depositSub: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
  },

  /* Tabs */
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: H_PAD,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: COLORS.gold,
  },
  tabText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  tabTextActive: {
    color: COLORS.black,
    fontWeight: '800',
  },

  /* Date header */
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  dateHeaderText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  todayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: 'transparent',
  },
  todayText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },

  /* Timeline */
  timelineCard: {
    marginHorizontal: H_PAD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 12,
    marginBottom: 18,
  },
  timelineBody: {
    flexDirection: 'row',
    position: 'relative',
  },
  timelineAxis: {
    width: 46,
  },
  timelineHourRow: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  timelineHourText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 14,
  },
  timelineTrack: {
    flex: 1,
    position: 'relative',
  },
  timelineGrid: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1,
    backgroundColor: COLORS.border,
  },
  timelineBlock: {
    position: 'absolute',
    left: 4, right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
    overflow: 'hidden',
  },
  timelineBlockCompact: {
    paddingVertical: 4,
  },
  timelineBlockRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  timelineBlockGold: {
    backgroundColor: 'rgba(212,168,67,0.22)',
    borderColor: COLORS.gold,
  },
  timelineBlockDanger: {
    backgroundColor: 'rgba(232,85,85,0.15)',
    borderColor: COLORS.danger,
  },
  timelineBlockDone: {
    backgroundColor: COLORS.elevated,
    borderColor: COLORS.gray3,
    opacity: 0.75,
  },
  timelineBlockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 60,
  },
  timelineTime: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  timelineBlockBody: {
    flex: 1,
    gap: 2,
  },
  timelineTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  timelineSubtitle: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  depositChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    marginTop: 3,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.4)',
    backgroundColor: 'rgba(212,168,67,0.06)',
  },
  depositChipText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
  },

  inlineActions: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  inlineBtn: {
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  inlineBtnDanger: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(232,85,85,0.12)',
  },
  inlineBtnDangerText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  inlineBtnGold: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.gold,
  },
  inlineBtnGoldText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  inlineBtnDisabled: {
    opacity: 0.4,
  },

  statusChip: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusChipPending: {
    borderColor: COLORS.gray,
  },
  statusChipDanger: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(232,85,85,0.15)',
  },
  statusChipDone: {
    borderColor: COLORS.gray3,
    backgroundColor: COLORS.elevated,
  },
  statusChipText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
  statusChipTextPending: {
    color: COLORS.gray,
  },
  statusChipTextDanger: {
    color: COLORS.danger,
  },
  statusChipTextDone: {
    color: COLORS.gray,
  },

  /* Calendar */
  calCard: {
    marginHorizontal: H_PAD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 12,
    marginBottom: 18,
  },
  calDowRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calDow: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: `${100 / 7}%`,
    minHeight: 62,
    padding: 3,
    alignItems: 'center',
    gap: 4,
  },
  calNumWrap: {
    width: 28, height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calNumSelected: {
    backgroundColor: COLORS.gold,
  },
  calNumToday: {
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  calNum: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  calCellBody: {
    alignItems: 'center',
    minHeight: 18,
    justifyContent: 'center',
  },
  calDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: COLORS.gold,
    marginTop: 2,
  },
  calCount: {
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.55)',
    backgroundColor: 'rgba(212,168,67,0.1)',
    borderRadius: 8,
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    alignItems: 'center',
  },
  calCountText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
  calBreak: {
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: COLORS.elevated,
  },
  calBreakText: {
    color: COLORS.gray,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },

  /* Empty */
  emptyBox: {
    marginHorizontal: H_PAD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyBtn: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  emptyBtnText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },

  /* FAB */
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
