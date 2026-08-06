export type ArtistViewMode = 'PERSONAL' | 'SHOP';
export type ArtistCalendarMode = 'WEEKLY' | 'MONTHLY';

export type BookingKind = 'procedure' | 'consulting' | 'break';
export type BookingStatus = '확정' | '대기' | '완료' | '취소' | '노쇼';

export interface ArtistColumn {
  id: string;
  artistName: string;
  bedName: string;
}

export interface ShopBooking {
  id: string;
  columnId: string;
  dateISO: string;
  startHour: number;
  endHour: number;
  customerName: string;
  tattooType: string;
  avatarUri: string;
  kind: BookingKind;
  status: BookingStatus;
}

export type DepositStatus = 'paid' | 'pending' | 'none';

export interface PersonalTimelineItem {
  id: string;
  startHour: number;
  durationH: number;
  title: string;
  subtitle: string;
  status: BookingStatus;
  kind: 'procedure' | 'consulting' | 'retouch' | 'meeting';
  customerName?: string;
  bodyPart?: string;
  memo?: string;
  isAppLinked?: boolean;
  depositStatus?: DepositStatus;
  depositAmount?: number;
}

export interface TodayReservation {
  id: string;
  customerName: string;
  avatarUri: string;
  serviceLabel: string;
  timeLabel: string;
  status: BookingStatus;
}

export interface MonthlyCellEvent {
  time: string;
  label: string;
  tone: 'red' | 'gold' | 'purple' | 'blue';
}

export interface MultiDayEvent {
  id: string;
  label: string;
  startISO: string;
  endISO: string;
  tone: 'red' | 'gold' | 'purple' | 'blue' | 'green';
}

export interface MonthlyCellSummary {
  bed1?: number;
  bed2?: number;
  consulting?: number;
  isBreak?: boolean;
  hasEvent?: boolean;
  events?: MonthlyCellEvent[];
}

export interface UpcomingItem {
  id: string;
  artistName: string;
  bedName: string;
  dateLabel: string;
  timeLabel: string;
  kind: 'procedure' | 'consulting';
  avatarUri: string;
}

export type FilterKey = '전체' | '시술 예약' | '상담 예약' | '완료' | '취소';

export const FILTER_KEYS: FilterKey[] = ['전체', '시술 예약', '상담 예약', '완료', '취소'];

export const WEEKDAY_KO = ['월', '화', '수', '목', '금', '토', '일'];

/* ---- helpers ---- */
export const addDays = (base: Date, delta: number): Date => {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
};

export const startOfWeek = (base: Date): Date => {
  const d = new Date(base);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const startOfMonth = (base: Date): Date => {
  const d = new Date(base.getFullYear(), base.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const toISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const isSameDate = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const formatWeekRange = (start: Date): string => {
  const end = addDays(start, 6);
  const y = start.getFullYear();
  const m1 = String(start.getMonth() + 1).padStart(2, '0');
  const d1 = String(start.getDate()).padStart(2, '0');
  const m2 = String(end.getMonth() + 1).padStart(2, '0');
  const d2 = String(end.getDate()).padStart(2, '0');
  return `${y}. ${m1}. ${d1} - ${m2}. ${d2}`;
};

export const formatMonth = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}. ${m}`;
};
