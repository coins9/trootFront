import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
  LayoutAnimation, Platform, UIManager, Modal, Pressable, ActivityIndicator,
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
  WEEKDAY_KO, addDays, startOfMonth, startOfWeek, toISODate, isSameDate,
  formatMonth,
  PersonalTimelineItem, MonthlyCellSummary, MonthlyCellEvent,
} from '../../../domain/entities/artistScheduleTypes';
import {
  getMultiDayEvents,
} from '../../../data/mock/artistScheduleMockData';
import { useApi } from '../../hooks/useApi';
import { reservationApi, studioApi, type Studio, type StudioScheduleEntry } from '../../../data/api';
import { MultiDayEvent } from '../../../domain/entities/artistScheduleTypes';
import ReservationDetailModal, {
  ReservationDetail,
} from '../../components/artistReservation/ReservationDetailModal';
import ShopInviteSection from '../../components/artistReservation/ShopInviteSection';
import ShopOnboarding from '../../components/artistReservation/ShopOnboarding';
import NewReservationSheet from '../../components/artistReservation/NewReservationSheet';
import AppBottomTabBar, { useBottomTabHeight } from '../../components/common/AppBottomTabBar';
import ConfirmModal, { ConfirmConfig } from '../../components/common/ConfirmModal';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

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
type TopTab = 'my' | 'shop_schedule' | 'shop';

const H_PAD = 16;
const HOUR_START = 0;
const HOUR_END = 23;
const HOUR_H = 40;

const toBookingStatus = (s: string): BookingStatus => {
  switch (s) {
    case 'requested':    return '대기';
    case 'confirmed':    return '확정';
    case 'deposit_paid': return '확정';
    case 'completed':    return '완료';
    case 'no_show':      return '노쇼';
    default:             return '취소';
  }
};

const statusToTone = (s: BookingStatus): MonthlyCellEvent['tone'] => {
  switch (s) {
    case '대기': return 'blue';
    case '확정': return 'gold';
    case '완료': return 'purple';
    case '노쇼': return 'red';
    default:     return 'gold';
  }
};

const formatHalfHour = (h: number) => {
  const hh = Math.floor(h);
  const mm = h - hh === 0.5 ? '30' : '00';
  return `${String(hh).padStart(2, '0')}:${mm}`;
};
const WEEKDAY_KO_SHORT = ['일','월','화','수','목','금','토'];
const WEEKDAY_EN_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const formatDateLabel = (d: Date, language: 'ko' | 'en' = 'ko') => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dow = language === 'en' ? WEEKDAY_EN_SHORT[d.getDay()] : WEEKDAY_KO_SHORT[d.getDay()];
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
}: SummaryProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.summaryWrap}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCell}>
          <View style={styles.summaryIcon}>
            <CalendarIcon size={16} color={COLORS.gold} strokeWidth={1.7} />
          </View>
          <Text style={styles.summaryLabel}>{t('reservation.summaryTotal')}</Text>
          <Text style={styles.summaryValue}>{total}</Text>
        </View>
        <View style={styles.summarySep} />
        <View style={styles.summaryCell}>
          <View style={styles.summaryIcon}>
            <CheckCircleIcon size={16} color={COLORS.gold} />
          </View>
          <Text style={styles.summaryLabel}>{t('reservation.summaryConfirmedPending')}</Text>
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
          <Text style={styles.summaryLabel}>{t('reservation.summaryNoShow')}</Text>
          <Text style={[
            styles.summaryValue,
            noShow > 0 && { color: COLORS.danger },
          ]}>
            {noShow}
          </Text>
        </View>
      </View>

      <View style={styles.depositBar}>
        <View style={styles.depositIconWrap}>
          <WalletIcon size={18} color={COLORS.gold} strokeWidth={1.7} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.depositLabel}>{t('reservation.summaryDepositPending')}</Text>
          <Text style={styles.depositValue}>
            {depositPendingSum.toLocaleString()}
            <Text style={styles.depositSub}> · {depositPending}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
});
SummaryBar.displayName = 'SummaryBar';

/* ============================================================
   View Tab (2가지)
   ============================================================ */
interface ViewTabsProps {
  view: ViewKey;
  onChange: (v: ViewKey) => void;
}
const ViewTabs = React.memo(({ view, onChange }: ViewTabsProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.tabRow}>
      <TouchableOpacity
        onPress={() => onChange('timeline')}
        activeOpacity={0.85}
        style={[styles.tabBtn, view === 'timeline' && styles.tabBtnActive]}
      >
        <ClockOutlineIcon size={14} color={view === 'timeline' ? COLORS.black : COLORS.gray} strokeWidth={1.8} />
        <Text style={[styles.tabText, view === 'timeline' && styles.tabTextActive]}>
          {t('reservation.viewTimeline')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange('calendar')}
        activeOpacity={0.85}
        style={[styles.tabBtn, view === 'calendar' && styles.tabBtnActive]}
      >
        <CalendarIcon size={14} color={view === 'calendar' ? COLORS.black : COLORS.gray} strokeWidth={1.7} />
        <Text style={[styles.tabText, view === 'calendar' && styles.tabTextActive]}>
          {t('reservation.viewCalendar')}
        </Text>
      </TouchableOpacity>
    </View>
  );
});
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
}: DateHeaderProps) => {
  const { t } = useTranslation();
  return (
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
        <Text style={styles.todayText}>{todayLabel ?? t('reservation.today')}</Text>
      </TouchableOpacity>
    </View>
  );
});
DateHeader.displayName = 'DateHeader';

/* ============================================================
   Event Row (iOS Calendar 스타일 — 시간별 & 캘린더 day panel 공유)
   ============================================================ */
const kindBarColor = (kind: PersonalTimelineItem['kind']) => {
  switch (kind) {
    case 'procedure':  return COLORS.gold;
    case 'consulting': return '#4E8CFF';
    case 'retouch':    return '#8C6EC8';
    case 'meeting':    return '#5AAF78';
  }
};

interface EventRowProps {
  item: PersonalTimelineItem;
  statusOverride: Record<string, BookingStatus>;
  onPress: () => void;
}
const EventRow = React.memo(({ item, statusOverride, onPress }: EventRowProps) => {
  const { t } = useTranslation();
  const currentStatus = statusOverride[item.id] ?? item.status;
  const isNoShow = currentStatus === '노쇼';
  const isDone   = currentStatus === '완료';
  const isPending = currentStatus === '대기';
  const barColor = isNoShow ? COLORS.danger : kindBarColor(item.kind);
  const endHour  = item.startHour + item.durationH;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.evRow, (isNoShow || isDone) && styles.evRowDimmed]}
    >
      {/* Left: times */}
      <View style={styles.evTimes}>
        <Text style={[styles.evTimeTop, isNoShow && { color: COLORS.danger }]}>
          {formatHalfHour(item.startHour)}
        </Text>
        <Text style={styles.evTimeBot}>
          {formatHalfHour(endHour)}
        </Text>
      </View>

      {/* Colored bar */}
      <View style={[styles.evBar, { backgroundColor: barColor }]} />

      {/* Body */}
      <View style={styles.evBody}>
        <Text style={styles.evTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.evSub} numberOfLines={1}>{item.subtitle}</Text>
        {item.depositAmount ? (
          <Text style={[
            styles.evDeposit,
            item.depositStatus === 'pending' && { color: COLORS.danger },
          ]}>
            {item.depositStatus === 'paid'
              ? t('reservation.depositPaidLabel').replace('{{amount}}', item.depositAmount.toLocaleString())
              : t('reservation.depositPendingLabel').replace('{{amount}}', item.depositAmount.toLocaleString())}
          </Text>
        ) : null}
      </View>

      {/* Status chip */}
      <View style={[
        styles.evChip,
        isPending  && styles.evChipPending,
        isNoShow   && styles.evChipDanger,
        isDone     && styles.evChipDone,
      ]}>
        <Text style={[
          styles.evChipText,
          isPending  && styles.evChipTextPending,
          isNoShow   && styles.evChipTextDanger,
          isDone     && styles.evChipTextDone,
        ]}>
          {currentStatus === '대기' ? t('reservation.bookingStatus.waiting')
            : currentStatus === '확정' ? t('reservation.bookingStatus.confirmed')
            : currentStatus === '완료' ? t('reservation.bookingStatus.completed')
            : currentStatus === '노쇼' ? t('reservation.bookingStatus.noShow')
            : t('reservation.bookingStatus.cancelled')}
        </Text>
      </View>
    </TouchableOpacity>
  );
});
EventRow.displayName = 'EventRow';

/* ============================================================
   Timeline View (list style)
   ============================================================ */
interface TimelineProps {
  dateLabel: string;
  lunarLabel?: string;
  items: PersonalTimelineItem[];
  statusOverride: Record<string, BookingStatus>;
  onOpenDetail: (item: PersonalTimelineItem) => void;
}
const TimelineView = React.memo(({
  dateLabel, lunarLabel, items, statusOverride, onOpenDetail,
}: TimelineProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.evCard}>
      <View style={styles.evDateHeader}>
        <Text style={styles.evDateTitle}>{dateLabel}</Text>
        {lunarLabel ? <Text style={styles.evDateSub}>{lunarLabel}</Text> : null}
      </View>

      {items.length === 0 ? (
        <View style={styles.evEmpty}>
          <Text style={styles.evEmptyText}>{t('reservation.evEmpty')}</Text>
        </View>
      ) : (
        <View style={styles.evList}>
          {items.map((it) => (
            <EventRow
              key={it.id}
              item={it}
              statusOverride={statusOverride}
              onPress={() => onOpenDetail(it)}
            />
          ))}
        </View>
      )}
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
  multiEvents: MultiDayEvent[];
}
const WEEKDAY_EN_CAL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CalendarView = React.memo(({
  monthStart, selectedDate, today, onSelect, summaryMap, multiEvents,
}: CalendarProps) => {
  const { t, language } = useTranslation();
  const weekdayLabels = language === 'en' ? WEEKDAY_EN_CAL : WEEKDAY_KO;
  const gridStart = useMemo(() => {
    const d = new Date(monthStart);
    const dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [monthStart]);
  // 주 단위 6주 (weeks[weekIdx][dayIdx])
  const weeks = useMemo(
    () => Array.from({ length: 6 }, (_, w) =>
      Array.from({ length: 7 }, (__, d) => addDays(gridStart, w * 7 + d))
    ),
    [gridStart],
  );

  return (
    <View style={styles.calCard}>
      <View style={styles.calDowRow}>
        {weekdayLabels.map((d, i) => (
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

      {weeks.map((weekDays, wIdx) => {
        // 해당 주에 걸치는 다일 이벤트 분할
        const weekStart = weekDays[0];
        const weekEnd = weekDays[6];
        const weekStartTime = weekStart.getTime();
        const weekEndTime = weekEnd.getTime();
        const weekBars = multiEvents
          .map((ev) => {
            const evStart = new Date(ev.startISO).getTime();
            const evEnd = new Date(ev.endISO).getTime();
            if (evEnd < weekStartTime || evStart > weekEndTime) return null;
            const barStart = Math.max(evStart, weekStartTime);
            const barEnd = Math.min(evEnd, weekEndTime);
            const startCol = Math.round((barStart - weekStartTime) / (24 * 60 * 60 * 1000));
            const endCol = Math.round((barEnd - weekStartTime) / (24 * 60 * 60 * 1000));
            const span = endCol - startCol + 1;
            const isLeftCap = evStart >= weekStartTime;
            const isRightCap = evEnd <= weekEndTime;
            return { ev, startCol, span, isLeftCap, isRightCap };
          })
          .filter((b): b is NonNullable<typeof b> => b !== null);

        return (
          <View key={wIdx} style={styles.calWeek}>
            {/* 날짜 셀 행 */}
            <View style={styles.calWeekRow}>
              {weekDays.map((d, i) => {
                const iso = toISODate(d);
                const summary = summaryMap[iso];
                const dim = d.getMonth() !== monthStart.getMonth();
                const selected = isSameDate(d, selectedDate);
                const isToday = isSameDate(d, today);
                const numColor = selected
                  ? COLORS.gold
                  : dim
                    ? COLORS.gray3
                    : i === 6
                      ? COLORS.danger
                      : i === 5
                        ? '#4E8CFF'
                        : COLORS.white;

                const events = !dim ? (summary?.events ?? []) : [];
                // 다일 바가 이 셀에 있으면 단일 이벤트는 개수 줄임
                const hasBar = weekBars.some(
                  (b) => i >= b.startCol && i < b.startCol + b.span,
                );
                const maxSingles = hasBar ? 1 : 2;
                const visibleEvents = events.slice(0, maxSingles);
                const extra = events.length - visibleEvents.length;

                return (
                  <TouchableOpacity
                    key={iso}
                    onPress={() => onSelect(d)}
                    activeOpacity={0.75}
                    style={[
                      styles.calCell,
                      selected && styles.calCellSelected,
                    ]}
                  >
                    <Text style={[styles.calNum, { color: numColor }]}>
                      {d.getDate()}
                    </Text>
                    {isToday && !selected && (
                      <View style={styles.calTodayDot} />
                    )}
                    {!dim && (
                      <View style={[
                        styles.calCellBody,
                        hasBar && { marginTop: 14 },
                      ]}>
                        {summary?.isBreak && !hasBar ? (
                          <View style={styles.calBreak}>
                            <Text style={styles.calBreakText}>{t('reservation.calBreak')}</Text>
                          </View>
                        ) : (
                          <>
                            {visibleEvents.map((ev, idx) => (
                              <View
                                key={idx}
                                style={[styles.calStripe, stripeToneStyle(ev.tone)]}
                              >
                                <Text style={styles.calStripeText} numberOfLines={1}>
                                  {ev.time} {ev.label}
                                </Text>
                              </View>
                            ))}
                            {extra > 0 && (
                              <Text style={styles.calMore}>+{extra}</Text>
                            )}
                          </>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 다일 이벤트 오버레이 바 */}
            {weekBars.map((b, i) => (
              <View
                key={`${b.ev.id}-${wIdx}`}
                pointerEvents="none"
                style={[
                  styles.multiBar,
                  multiBarToneStyle(b.ev.tone),
                  {
                    left: `${(100 / 7) * b.startCol}%`,
                    width: `${(100 / 7) * b.span}%`,
                    top: 22 + i * 14,
                    borderTopLeftRadius: b.isLeftCap ? 4 : 0,
                    borderBottomLeftRadius: b.isLeftCap ? 4 : 0,
                    borderTopRightRadius: b.isRightCap ? 4 : 0,
                    borderBottomRightRadius: b.isRightCap ? 4 : 0,
                    marginLeft: b.isLeftCap ? 2 : 0,
                    marginRight: b.isRightCap ? 2 : 0,
                  },
                ]}
              >
                {b.isLeftCap && (
                  <Text style={styles.multiBarText} numberOfLines={1}>
                    {b.ev.label}
                  </Text>
                )}
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
});
CalendarView.displayName = 'CalendarView';

const multiBarToneStyle = (tone: MultiDayEvent['tone']) => {
  switch (tone) {
    case 'red':    return { backgroundColor: 'rgba(232,85,85,0.55)' };
    case 'gold':   return { backgroundColor: 'rgba(212,168,67,0.55)' };
    case 'purple': return { backgroundColor: 'rgba(140,110,200,0.55)' };
    case 'blue':   return { backgroundColor: 'rgba(78,140,255,0.55)' };
    case 'green':  return { backgroundColor: 'rgba(90,175,120,0.55)' };
  }
};

const stripeToneStyle = (tone: 'red' | 'gold' | 'purple' | 'blue') => {
  switch (tone) {
    case 'red':    return { backgroundColor: 'rgba(232,85,85,0.35)',  borderColor: 'rgba(232,85,85,0.6)' };
    case 'gold':   return { backgroundColor: 'rgba(212,168,67,0.35)', borderColor: 'rgba(212,168,67,0.6)' };
    case 'purple': return { backgroundColor: 'rgba(140,110,200,0.35)', borderColor: 'rgba(140,110,200,0.6)' };
    case 'blue':   return { backgroundColor: 'rgba(78,140,255,0.30)', borderColor: 'rgba(78,140,255,0.6)' };
  }
};

/* ============================================================
   Screen
   ============================================================ */
const ArtistReservationScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const todayRef = useRef<Date>(new Date());
  const today = todayRef.current;

  const [topTab, setTopTab] = useState<TopTab>('my');
  const [view, setView] = useState<ViewKey>('timeline');
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [studio, setStudio] = useState<Studio | null>(null);
  const [studioLoading, setStudioLoading] = useState(true);
  const [shopSchedule, setShopSchedule] = useState<StudioScheduleEntry[]>([]);
  const [shopScheduleLoading, setShopScheduleLoading] = useState(false);
  const [dayPopupDate, setDayPopupDate] = useState<Date | null>(null);
  const [customItems, setCustomItems] = useState<Record<string, PersonalTimelineItem[]>>({});
  const [reservationSheetOpen, setReservationSheetOpen] = useState(false);
  const [reservationSheetEditing, setReservationSheetEditing] = useState<PersonalTimelineItem | null>(null);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const bottomTabHeight = useBottomTabHeight();
  const [statusOverride, setStatusOverride] = useState<Record<string, BookingStatus>>({});
  const [detail, setDetail] = useState<ReservationDetail | null>(null);

  // 스튜디오 로드
  useEffect(() => {
    studioApi.mine()
      .then((s) => setStudio(s))
      .catch(() => setStudio(null))
      .finally(() => setStudioLoading(false));
  }, []);

  // 샵 일정 탭 진입 시 API 로드
  const loadShopSchedule = useCallback(() => {
    if (!studio) return;
    setShopScheduleLoading(true);
    studioApi.schedule(studio.id, toISODate(today))
      .then(setShopSchedule)
      .catch(() => setShopSchedule([]))
      .finally(() => setShopScheduleLoading(false));
  }, [studio, today]);

  useEffect(() => {
    if (topTab === 'shop_schedule' && studio) loadShopSchedule();
  }, [topTab, studio, loadShopSchedule]);

  const monthStart = useMemo(() => startOfMonth(selectedDate), [selectedDate]);
  const isSelectedToday = isSameDate(selectedDate, today);

  // 이번 달 예약 일정 fetch
  const fromDate = useMemo(() => toISODate(monthStart), [monthStart]);
  const toDate = useMemo(() => {
    const d = new Date(monthStart);
    d.setMonth(d.getMonth() + 1, 0);
    return toISODate(d);
  }, [monthStart]);

  const { data: rawSchedule } = useApi(
    () => reservationApi.schedule(fromDate, toDate),
    [fromDate, toDate],
  );

  // Reservation[] → 날짜별 PersonalTimelineItem 맵
  const scheduleByDate = useMemo<Record<string, PersonalTimelineItem[]>>(() => {
    if (!rawSchedule) return {};
    const map: Record<string, PersonalTimelineItem[]> = {};
    for (const r of rawSchedule) {
      if (r.status === 'cancelled') continue;
      const d = new Date(r.scheduledAt);
      const iso = toISODate(d);
      const startHour = d.getHours() + d.getMinutes() / 60;
      const item: PersonalTimelineItem = {
        id: r.id,
        startHour,
        durationH: r.durationMinutes / 60,
        title: r.bodyPart ?? r.sizePreset ?? t('reservation.defaultProcedure'),
        subtitle: r.memo ?? t('reservation.appBooking'),
        status: toBookingStatus(r.status),
        kind: r.artworkId ? 'procedure' : 'consulting',
        bodyPart: r.bodyPart ?? undefined,
        memo: r.memo ?? undefined,
        isAppLinked: true,
        depositStatus: r.depositStatus === 'refunded' ? 'paid' : r.depositStatus,
        depositAmount: r.depositKrw > 0 ? r.depositKrw : undefined,
      };
      if (!map[iso]) map[iso] = [];
      map[iso].push(item);
    }
    return map;
  }, [rawSchedule, t]);

  const items = useMemo(() => {
    const iso = toISODate(selectedDate);
    const apiBase = scheduleByDate[iso] ?? [];
    const extras = customItems[iso] ?? [];
    const editedIds = new Set(extras.map((e) => e.id));
    return [
      ...apiBase.filter((b) => !editedIds.has(b.id)),
      ...extras,
    ].sort((a, b) => a.startHour - b.startHour);
  }, [selectedDate, scheduleByDate, customItems]);

  const monthlyMap = useMemo<Record<string, MonthlyCellSummary>>(() => {
    const map: Record<string, MonthlyCellSummary> = {};
    for (const [iso, dayItems] of Object.entries(scheduleByDate)) {
      map[iso] = {
        events: dayItems.slice(0, 3).map((it) => ({
          time: formatHalfHour(it.startHour),
          label: it.title,
          tone: statusToTone(it.status),
        })),
        hasEvent: dayItems.length > 0,
      };
    }
    // customItems도 dot 표시
    for (const [iso, extras] of Object.entries(customItems)) {
      if (extras.length === 0) continue;
      if (!map[iso]) {
        map[iso] = {
          events: extras.slice(0, 3).map((it) => ({
            time: formatHalfHour(it.startHour),
            label: it.title,
            tone: statusToTone(it.status),
          })),
          hasEvent: true,
        };
      }
    }
    return map;
  }, [scheduleByDate, customItems]);

  const multiEvents = useMemo(
    () => getMultiDayEvents(monthStart),
    [monthStart],
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
    () => (view === 'timeline' ? formatDateLabel(selectedDate, language) : formatMonth(monthStart)),
    [view, selectedDate, monthStart, language],
  );

  /* Status change */
  const setStatus = useCallback((id: string, next: BookingStatus) => {
    easeLayoutAnim();
    setStatusOverride((prev) => ({ ...prev, [id]: next }));
    setDetail((prev) => (prev && prev.id === id ? { ...prev, status: next } : prev));
  }, []);

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
      timeLabel: `${formatHalfHour(it.startHour)} · ${it.durationH}h`,
      dateLabel: formatDateLabel(selectedDate, language),
      kind: it.kind,
    });
  }, [statusOverride, selectedDate]);

  const closeDetail = useCallback(() => setDetail(null), []);

  const requestNoShow = useCallback((id: string, customerName?: string) => {
    const name = customerName ?? t('reservation.noShowDefault');
    setConfirm({
      title: t('reservation.noShowTitle'),
      message: t('reservation.noShowMsg').replace('{{name}}', name),
      cancelLabel: t('common.cancel'),
      confirmLabel: t('reservation.noShowConfirm'),
      variant: 'danger',
      onConfirm: () => {
        setStatus(id, '노쇼');
        toast(t('reservation.toastNoShow'), { variant: 'error' });
      },
    });
  }, [setStatus, toast, t]);

  const requestComplete = useCallback((id: string) => {
    setConfirm({
      title: t('reservation.completeTitle'),
      message: t('reservation.completeMsg'),
      cancelLabel: t('common.cancel'),
      confirmLabel: t('reservation.completeConfirm'),
      variant: 'default',
      onConfirm: () => {
        setStatus(id, '완료');
        toast(t('reservation.toastComplete'), { variant: 'success' });
      },
    });
  }, [setStatus, toast, t]);

  const requestCancel = useCallback((id: string) => {
    setConfirm({
      title: '예약 취소',
      message: '이 예약을 취소하시겠습니까?\n앱 연동 예약인 경우 고객에게 알림이 전송됩니다.',
      cancelLabel: t('common.cancel'),
      confirmLabel: '취소하기',
      variant: 'danger',
      onConfirm: async () => {
        const iso = toISODate(selectedDate);
        const isAppLinked = (scheduleByDate[iso] ?? []).some((b) => b.id === id);
        try {
          if (isAppLinked) {
            await reservationApi.changeStatus(id, 'cancelled');
          }
          setCustomItems((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((d) => {
              next[d] = next[d].filter((c) => c.id !== id);
            });
            return next;
          });
          setStatusOverride((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
          setDetail(null);
          toast('예약이 취소되었습니다.', { variant: 'success' });
        } catch {
          toast('취소 처리 중 오류가 발생했습니다.', { variant: 'error' });
        }
      },
    });
  }, [selectedDate, scheduleByDate, toast, t]);

  /* FAB → 새 예약 등록 시트 오픈 */
  const handleFab = useCallback(() => {
    setReservationSheetEditing(null);
    setReservationSheetOpen(true);
  }, []);

  /* 예약 수정 (상세 모달에서 진입) */
  const handleEditFromModal = useCallback((id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    setDetail(null);
    setTimeout(() => {
      setReservationSheetEditing({
        ...target,
        status: statusOverride[id] ?? target.status,
      });
      setReservationSheetOpen(true);
    }, 220);
  }, [items, statusOverride]);

  const handleSubmitReservation = useCallback((next: PersonalTimelineItem) => {
    const iso = toISODate(selectedDate);
    easeLayoutAnim();
    setCustomItems((prev) => {
      const cur = prev[iso] ?? [];
      const exists = cur.some((c) => c.id === next.id);
      const nextArr = exists
        ? cur.map((c) => (c.id === next.id ? next : c))
        : [...cur, next];
      return { ...prev, [iso]: nextArr };
    });
    setReservationSheetOpen(false);
    setReservationSheetEditing(null);
    toast(
      reservationSheetEditing
        ? t('reservation.toastUpdated')
        : t('reservation.toastAdded'),
      { variant: 'success' },
    );
  }, [selectedDate, reservationSheetEditing, toast, t]);

  /* Shop registration */
  const handleShopRegister = useCallback((name: string, address: string, lat?: number, lng?: number) => {
    setConfirm({
      title: t('reservation.shopRegisterTitle'),
      message: t('reservation.shopRegisterMsg')
        .replace('{{name}}', name)
        .replace('{{location}}', address),
      cancelLabel: t('common.cancel'),
      confirmLabel: t('reservation.shopRegisterConfirm'),
      onConfirm: async () => {
        try {
          const s = await studioApi.register({ name, address, lat, lng });
          easeLayoutAnim();
          setStudio(s);
          toast(t('reservation.toastShopRegistered').replace('{{name}}', name), { variant: 'success' });
        } catch {
          toast('샵 등록 중 오류가 발생했습니다.', { variant: 'error' });
        }
      },
    });
  }, [toast, t]);

  const handleShopJoin = useCallback(async (code: string) => {
    try {
      const res = await studioApi.join(code);
      easeLayoutAnim();
      setStudio(res.studio);
      toast(t('reservation.toastShopJoined').replace('{{code}}', code), { variant: 'success' });
    } catch {
      toast('초대코드가 올바르지 않거나 만료되었습니다.', { variant: 'error' });
    }
  }, [toast, t]);

  const handleCodeRefreshed = useCallback((code: string, expiresAt: string) => {
    setStudio((prev) => prev ? { ...prev, inviteCode: code, inviteCodeExpiresAt: expiresAt } : prev);
  }, []);

  /* Calendar cell tap → 날짜 변경 + 팝업 표시 */
  const handleCalendarSelect = useCallback((d: Date) => {
    easeLayoutAnim();
    setSelectedDate(d);
    setDayPopupDate(d);
  }, []);

  const closeDayPopup = useCallback(() => setDayPopupDate(null), []);

  const dayPopupItems = useMemo(() => {
    if (!dayPopupDate) return [];
    const iso = toISODate(dayPopupDate);
    const apiBase = scheduleByDate[iso] ?? [];
    const extras = customItems[iso] ?? [];
    const editedIds = new Set(extras.map((e) => e.id));
    return [
      ...apiBase.filter((b) => !editedIds.has(b.id)),
      ...extras,
    ].sort((a, b) => a.startHour - b.startHour);
  }, [dayPopupDate, scheduleByDate, customItems]);

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
          <Text style={styles.title}>{t('reservation.title')}</Text>
          <Text style={styles.subtitle}>{t('reservation.subtitle')}</Text>
        </View>
      </View>

      {/* Top tabs — 샵 등록 여부에 따라 2/3탭 */}
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
            {t('reservation.tabMy')}
          </Text>
          {topTab === 'my' && <View style={styles.topTabUnderline} />}
        </TouchableOpacity>

        {studio && (
          <TouchableOpacity
            onPress={() => {
              easeLayoutAnim();
              setTopTab('shop_schedule');
            }}
            activeOpacity={0.75}
            style={styles.topTabBtn}
          >
            <Text style={[styles.topTabText, topTab === 'shop_schedule' && styles.topTabTextActive]}>
              {t('reservation.tabShopSchedule')}
            </Text>
            {topTab === 'shop_schedule' && <View style={styles.topTabUnderline} />}
          </TouchableOpacity>
        )}

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
              {studio ? t('reservation.tabShopManage') : t('reservation.tabShopRegister')}
            </Text>
            {!studio && !studioLoading && <View style={styles.topTabDot} />}
          </View>
          {topTab === 'shop' && <View style={styles.topTabUnderline} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomTabHeight + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {topTab === 'shop' ? (
          <View style={styles.shopWrap}>
            {studioLoading ? (
              <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 40 }} />
            ) : studio ? (
              <ShopInviteSection
                studioId={studio.id}
                shopName={studio.name}
                inviteCode={studio.inviteCode}
                inviteCodeExpiresAt={studio.inviteCodeExpiresAt}
                onCodeRefreshed={handleCodeRefreshed}
              />
            ) : (
              <ShopOnboarding
                onRegister={handleShopRegister}
                onJoinCode={handleShopJoin}
              />
            )}
          </View>
        ) : topTab === 'shop_schedule' && studio ? (
          <View style={styles.shopWrap}>
            <View style={styles.shopScheduleHeader}>
              <Text style={styles.shopScheduleTitle}>
                {studio.name} {t('reservation.shopTodaySchedule')}
              </Text>
              <Text style={styles.shopScheduleSub}>
                {formatDateLabel(today, language)} · {studio.address}
              </Text>
            </View>
            {shopScheduleLoading ? (
              <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 20 }} />
            ) : shopSchedule.length === 0 ? (
              <View style={styles.shopColCard}>
                <Text style={styles.shopColEmpty}>
                  {t('reservation.shopColEmpty')}
                </Text>
              </View>
            ) : (
              shopSchedule.map((entry) => (
                <View key={entry.memberId} style={styles.shopColCard}>
                  <View style={styles.shopColHeader}>
                    <Text style={styles.shopColName}>{entry.nickname}</Text>
                    {entry.bedName ? (
                      <Text style={styles.shopColBed}>{entry.bedName}</Text>
                    ) : null}
                    <View style={styles.shopColCount}>
                      <Text style={styles.shopColCountText}>
                        {t('reservation.countSuffix').replace('{{count}}', String(entry.reservations.length))}
                      </Text>
                    </View>
                  </View>
                  {entry.reservations.length === 0 ? (
                    <Text style={styles.shopColEmpty}>{t('reservation.shopColEmpty')}</Text>
                  ) : (
                    <View style={styles.shopColList}>
                      {entry.reservations.map((r) => {
                        const d = new Date(r.scheduledAt);
                        const startH = d.getHours() + d.getMinutes() / 60;
                        const endH = startH + r.durationMinutes / 60;
                        return (
                          <View key={r.id} style={styles.shopColItem}>
                            <Text style={styles.shopColTime}>
                              {formatHalfHour(startH)} - {formatHalfHour(endH)}
                            </Text>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.shopColCustomer} numberOfLines={1}>
                                {r.customerName ?? '고객명 미등록'}
                              </Text>
                              <Text style={styles.shopColKind} numberOfLines={1}>
                                {r.bodyPart ?? '시술'}
                              </Text>
                            </View>
                            <View style={[
                              styles.shopColChip,
                              r.status === 'requested' && styles.shopColChipConsult,
                            ]}>
                              <Text style={[
                                styles.shopColChipText,
                                r.status === 'requested' && styles.shopColChipTextConsult,
                              ]}>
                                {r.status === 'requested' ? t('reservation.shopConsult') : t('reservation.shopProcedure')}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))
            )}
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
          todayLabel={isSelectedToday ? t('reservation.today') : t('reservation.goToday')}
        />

        {view === 'timeline' && (
          <TimelineView
            dateLabel={formatDateLabel(selectedDate, language)}
            items={items}
            statusOverride={statusOverride}
            onOpenDetail={openDetail}
          />
        )}

        {view === 'calendar' && (
          <>
            <CalendarView
              monthStart={monthStart}
              selectedDate={selectedDate}
              today={today}
              onSelect={handleCalendarSelect}
              summaryMap={monthlyMap}
              multiEvents={multiEvents}
            />
            <TimelineView
              dateLabel={formatDateLabel(selectedDate, language)}
              items={items}
              statusOverride={statusOverride}
              onOpenDetail={openDetail}
            />
          </>
        )}
          </>
        )}
      </ScrollView>

      {/* FAB — 내 예약에서만 표시 (바텀탭 위) */}
      {topTab === 'my' && (
        <TouchableOpacity
          onPress={handleFab}
          activeOpacity={0.85}
          style={[styles.fab, { bottom: bottomTabHeight + 12 }]}
        >
          <CalendarPlusIcon size={26} color={COLORS.black} strokeWidth={2} />
        </TouchableOpacity>
      )}

      {/* Persistent bottom tab */}
      <AppBottomTabBar activeTab="ProfileTab" />

      {/* Detail modal */}
      <ReservationDetailModal
        detail={detail}
        onClose={closeDetail}
        onRequestNoShow={requestNoShow}
        onRequestComplete={requestComplete}
        onRequestCancel={requestCancel}
        onEdit={handleEditFromModal}
      />

      {/* 새 예약 등록 / 수정 시트 */}
      <NewReservationSheet
        visible={reservationSheetOpen}
        dateLabel={formatDateLabel(selectedDate, language)}
        editing={reservationSheetEditing}
        onClose={() => {
          setReservationSheetOpen(false);
          setReservationSheetEditing(null);
        }}
        onSubmit={handleSubmitReservation}
      />

      {/* 커스텀 컨펌 모달 */}
      <ConfirmModal config={confirm} onDismiss={() => setConfirm(null)} />

      {/* 월간 캘린더 날짜 클릭 팝업 */}
      <Modal
        visible={dayPopupDate !== null}
        transparent
        animationType="fade"
        onRequestClose={closeDayPopup}
        statusBarTranslucent
      >
        <Pressable style={styles.popupBackdrop} onPress={closeDayPopup}>
          <Pressable onPress={() => {}}>
            <View style={styles.popupCard}>
              <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>
                  {dayPopupDate ? formatDateLabel(dayPopupDate, language) : ''}
                </Text>
                <TouchableOpacity onPress={closeDayPopup} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <XIcon size={20} color={COLORS.gray} />
                </TouchableOpacity>
              </View>
              {dayPopupItems.length === 0 ? (
                <Text style={styles.popupEmpty}>이날 예약이 없습니다.</Text>
              ) : (
                dayPopupItems.map((it) => {
                  const currentStatus = statusOverride[it.id] ?? it.status;
                  return (
                    <TouchableOpacity
                      key={it.id}
                      onPress={() => {
                        closeDayPopup();
                        setTimeout(() => openDetail(it), 120);
                      }}
                      activeOpacity={0.8}
                      style={styles.popupEventRow}
                    >
                      <Text style={styles.popupEventTime}>
                        {formatHalfHour(it.startHour)}
                        {'\n'}
                        {formatHalfHour(it.startHour + it.durationH)}
                      </Text>
                      <View style={[styles.popupEventBar, { backgroundColor: kindBarColor(it.kind) }]} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={styles.popupEventTitle} numberOfLines={1}>{it.title}</Text>
                        <Text style={styles.popupEventSub} numberOfLines={1}>{it.subtitle}</Text>
                      </View>
                      <View style={[
                        styles.evChip,
                        currentStatus === '대기'  && styles.evChipPending,
                        currentStatus === '노쇼'  && styles.evChipDanger,
                        currentStatus === '완료'  && styles.evChipDone,
                      ]}>
                        <Text style={[
                          styles.evChipText,
                          currentStatus === '대기' && styles.evChipTextPending,
                          currentStatus === '노쇼' && styles.evChipTextDanger,
                          currentStatus === '완료' && styles.evChipTextDone,
                        ]}>
                          {currentStatus}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  scrollContent: {},

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
    gap: 14,
  },

  /* Shop schedule tab */
  shopScheduleHeader: {
    gap: 4,
    marginBottom: 4,
  },
  shopScheduleTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  shopScheduleSub: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  shopColCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 14,
    gap: 10,
  },
  shopColHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopColName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  shopColBed: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  shopColCount: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(212,168,67,0.1)',
  },
  shopColCountText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  shopColEmpty: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    paddingVertical: 16,
  },
  shopColList: {
    gap: 6,
  },
  shopColItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  shopColTime: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    minWidth: 92,
  },
  shopColCustomer: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  shopColKind: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
  shopColChip: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(212,168,67,0.08)',
  },
  shopColChipConsult: {
    borderColor: '#4E8CFF',
    backgroundColor: 'rgba(78,140,255,0.08)',
  },
  shopColChipText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
  },
  shopColChipTextConsult: {
    color: '#4E8CFF',
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
  calWeek: {
    position: 'relative',
  },
  calWeekRow: {
    flexDirection: 'row',
  },
  multiBar: {
    position: 'absolute',
    height: 12,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  multiBarText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },
  calCell: {
    width: `${100 / 7}%`,
    minHeight: 96,
    paddingHorizontal: 2,
    paddingTop: 4,
    paddingBottom: 3,
    gap: 2,
    borderRadius: 6,
  },
  calCellSelected: {
    backgroundColor: 'rgba(212,168,67,0.10)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  calNum: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    paddingLeft: 3,
  },
  calTodayDot: {
    position: 'absolute',
    top: 5, right: 4,
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: COLORS.gold,
  },
  calCellBody: {
    gap: 2,
  },
  calStripe: {
    borderRadius: 3,
    borderLeftWidth: 2,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  calStripeText: {
    color: COLORS.white,
    fontSize: 8.5,
    fontWeight: '700',
    lineHeight: 11,
  },
  calMore: {
    color: COLORS.gray,
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 11,
    paddingLeft: 3,
  },
  calBreak: {
    borderWidth: 1,
    borderColor: COLORS.gray3,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: COLORS.elevated,
    alignSelf: 'flex-start',
    marginLeft: 3,
  },
  calBreakText: {
    color: COLORS.gray,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },

  /* iOS Calendar-style Event List */
  evCard: {
    marginHorizontal: H_PAD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    overflow: 'hidden',
    marginBottom: 18,
  },
  evDateHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 2,
  },
  evDateTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  evDateSub: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  evList: {
    gap: 0,
  },
  evEmpty: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  evEmptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  evRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  evRowDimmed: {
    opacity: 0.6,
  },
  evTimes: {
    width: 42,
    alignItems: 'flex-end',
    gap: 3,
  },
  evTimeTop: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  evTimeBot: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 13,
  },
  evBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    minHeight: 32,
  },
  evBody: {
    flex: 1,
    gap: 2,
  },
  evTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  evSub: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  evDeposit: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 2,
  },
  evChip: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  evChipPending: {
    borderColor: COLORS.gray,
  },
  evChipDanger: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(232,85,85,0.15)',
  },
  evChipDone: {
    borderColor: COLORS.gray3,
    backgroundColor: COLORS.elevated,
  },
  evChipText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
  evChipTextPending: {
    color: COLORS.gray,
  },
  evChipTextDanger: {
    color: COLORS.danger,
  },
  evChipTextDone: {
    color: COLORS.gray,
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

  /* Calendar Day Popup */
  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  popupCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  popupTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    flexShrink: 1,
  },
  popupEmpty: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: 28,
  },
  popupEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  popupEventTime: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    width: 40,
    textAlign: 'right',
  },
  popupEventBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    minHeight: 28,
  },
  popupEventTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  popupEventSub: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
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
