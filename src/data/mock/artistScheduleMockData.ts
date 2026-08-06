import {
  ArtistColumn, ShopBooking, PersonalTimelineItem, TodayReservation,
  MonthlyCellSummary, UpcomingItem, MultiDayEvent,
  toISODate, addDays, startOfMonth,
} from '../../domain/entities/artistScheduleTypes';

/* ============================================================
   컬럼 / 아티스트 (고정)
   ============================================================ */
export const MOCK_ARTIST_COLUMNS: ArtistColumn[] = [
  { id: 'leo',     artistName: 'Artist. Leo',  bedName: 'Bed 1' },
  { id: 'rin',     artistName: 'Artist. RIN',  bedName: 'Bed 2' },
  { id: 'zero',    artistName: 'Artist. Zero', bedName: 'Private Room' },
  { id: 'consult', artistName: '상담 / 공용',   bedName: 'Consulting' },
];

/* ============================================================
   샵 통합 예약 — "오늘"과 "내일 몇 건" 자동 생성
   ============================================================ */
const buildShopBookingsForDate = (dateISO: string, seed: number): ShopBooking[] => ([
  {
    id: `${dateISO}-b1`, columnId: 'leo', dateISO, startHour: 10, endHour: 12,
    customerName: '민규', tattooType: '블랙&그레이', avatarUri: '',
    kind: 'procedure', status: '확정',
  },
  {
    id: `${dateISO}-b2`, columnId: 'leo', dateISO, startHour: 13, endHour: 15,
    customerName: '지수', tattooType: '라인워크', avatarUri: '',
    kind: 'procedure', status: '확정',
  },
  {
    id: `${dateISO}-b3`, columnId: 'leo', dateISO, startHour: 16, endHour: 18,
    customerName: '태현', tattooType: '다리 슬리브', avatarUri: '',
    kind: 'procedure', status: '확정',
  },
  {
    id: `${dateISO}-b4`, columnId: 'leo', dateISO, startHour: 19, endHour: 20.5,
    customerName: '예준', tattooType: '레터링', avatarUri: '',
    kind: 'procedure', status: '대기',
  },
  {
    id: `${dateISO}-b5`, columnId: 'rin', dateISO, startHour: 11, endHour: 13,
    customerName: '소연', tattooType: '플라워', avatarUri: '',
    kind: 'procedure', status: '확정',
  },
  {
    id: `${dateISO}-b6`, columnId: 'rin', dateISO, startHour: 14, endHour: 16,
    customerName: '하나', tattooType: '미니멀', avatarUri: '',
    kind: 'procedure', status: '확정',
  },
  {
    id: `${dateISO}-b7`, columnId: 'rin', dateISO, startHour: 17, endHour: 19,
    customerName: '수빈', tattooType: '파인라인', avatarUri: '',
    kind: 'procedure', status: '확정',
  },
  {
    id: `${dateISO}-b8`, columnId: 'zero', dateISO, startHour: 10, endHour: 12.5,
    customerName: '유리', tattooType: '컬러 타투', avatarUri: '',
    kind: 'procedure', status: '확정',
  },
  {
    id: `${dateISO}-b9`, columnId: 'zero', dateISO, startHour: 13.5, endHour: 15.5,
    customerName: '도현', tattooType: '일본풍', avatarUri: '',
    kind: 'procedure', status: '확정',
  },
  {
    id: `${dateISO}-b10`, columnId: 'zero', dateISO, startHour: 16, endHour: 18.5,
    customerName: '현우', tattooType: '풀컬러', avatarUri: '',
    kind: 'procedure', status: '확정',
  },
  {
    id: `${dateISO}-b11`, columnId: 'consult', dateISO, startHour: 11, endHour: 11.5,
    customerName: '상담', tattooType: '(예약 문의)', avatarUri: '',
    kind: 'consulting', status: '확정',
  },
  {
    id: `${dateISO}-b12`, columnId: 'consult', dateISO, startHour: 15, endHour: 15.5,
    customerName: '상담', tattooType: '(디자인 상담)', avatarUri: '',
    kind: 'consulting', status: '확정',
  },
  {
    id: `${dateISO}-b13`, columnId: 'consult', dateISO, startHour: 19, endHour: 19.5,
    customerName: '상담', tattooType: '(사후 관리)', avatarUri: '',
    kind: 'consulting', status: '확정',
  },
] as ShopBooking[]).slice(0, 13 - (seed % 3));

/** 오늘~+6일까지 예약 자동 생성 */
export const getShopBookingsForRange = (base: Date, days = 7): ShopBooking[] => {
  const list: ShopBooking[] = [];
  for (let i = 0; i < days; i += 1) {
    const d = addDays(base, i);
    const iso = toISODate(d);
    list.push(...buildShopBookingsForDate(iso, i));
  }
  return list;
};

/* ============================================================
   개인 타임라인 — 오늘 하루의 개인 스케줄
   ============================================================ */
export const getPersonalTimelineForDate = (date: Date): PersonalTimelineItem[] => {
  const iso = toISODate(date);
  return [
    {
      id: `${iso}-p1`, startHour: 10, durationH: 1,
      title: '블랙앤그레이 상담', subtitle: '상담 · 김태훈',
      status: '확정', kind: 'consulting',
      customerName: '김태훈', bodyPart: '팔 (전완)',
      memo: '기획서 검토 필요. 사이즈 12cm 요청.',
      isAppLinked: true,
      depositStatus: 'none',
    },
    {
      id: `${iso}-p2`, startHour: 12, durationH: 4,
      title: '팔 라인워크 시술', subtitle: '시술 · 박지은 · 4시간',
      status: '확정', kind: 'procedure',
      customerName: '박지은', bodyPart: '팔 (상완 내측)',
      memo: '결제 완료. 도안 최종본 3장 전달됨.',
      isAppLinked: true,
      depositStatus: 'paid',
      depositAmount: 80000,
    },
    {
      id: `${iso}-p3`, startHour: 15, durationH: 1.5,
      title: '리터치 예약', subtitle: '리터치 · 이민수 · 1.5시간',
      status: '확정', kind: 'retouch',
      customerName: '이민수', bodyPart: '손목',
      memo: '3개월 전 라인 리터치. 무료 리터치.',
      isAppLinked: true,
      depositStatus: 'none',
    },
    {
      id: `${iso}-p4`, startHour: 18, durationH: 1,
      title: '디자인 미팅', subtitle: '미팅 · 홍대장 · 1시간',
      status: '대기', kind: 'meeting',
      customerName: '홍대장',
      memo: '오픈톡 문의 유입. 예약금 입금 확인 대기 중.',
      isAppLinked: false,
      depositStatus: 'pending',
      depositAmount: 50000,
    },
  ];
};

/* ============================================================
   오늘의 예약 카드 리스트 (개인 요약)
   ============================================================ */
export const getTodayReservationsForDate = (date: Date): TodayReservation[] => {
  const iso = toISODate(date);
  return [
    { id: `${iso}-t1`, customerName: '김태훈', avatarUri: '', serviceLabel: '블랙앤그레이 상담', timeLabel: '10:00', status: '확정' },
    { id: `${iso}-t2`, customerName: '박지은', avatarUri: '', serviceLabel: '팔 라인워크 시술', timeLabel: '12:00', status: '확정' },
    { id: `${iso}-t3`, customerName: '이민수', avatarUri: '', serviceLabel: '리터치 예약',       timeLabel: '15:00', status: '확정' },
    { id: `${iso}-t4`, customerName: '홍대장', avatarUri: '', serviceLabel: '디자인 사전 미팅',  timeLabel: '18:00', status: '대기' },
  ];
};

/* ============================================================
   월간 셀 요약 — 특정 달의 각 날짜 자동 생성
   ============================================================ */
const EVENT_POOL: Array<{ time: string; label: string; tone: 'red' | 'gold' | 'purple' | 'blue' }> = [
  { time: '10AM', label: 'MINSOO · 상담',   tone: 'red' },
  { time: '1PM',  label: 'MINSOO · 시술',   tone: 'red' },
  { time: '3PM',  label: 'RIN · 시술',     tone: 'purple' },
  { time: '11AM', label: 'RIN · 리터치',   tone: 'purple' },
  { time: '2PM',  label: 'ZERO · 프라이빗', tone: 'gold' },
  { time: '5PM',  label: 'ZERO · 상담',    tone: 'gold' },
  { time: '7PM',  label: '공용 · 미팅',    tone: 'blue' },
];

const patternForDay = (day: number): MonthlyCellSummary => {
  const m = day % 7;
  const pickCount = (m === 5) ? 3 : (m === 0 || m === 3) ? 2 : 1;
  const events = Array.from({ length: pickCount }, (_, i) => (
    EVENT_POOL[(day * 3 + i) % EVENT_POOL.length]
  ));
  return { events, hasEvent: true };
};

export const getMonthlySummary = (
  monthBase: Date,
  todayISO: string,
): Record<string, MonthlyCellSummary> => {
  const start = startOfMonth(monthBase);
  const year = start.getFullYear();
  const month = start.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const map: Record<string, MonthlyCellSummary> = {};
  for (let day = 1; day <= lastDay; day += 1) {
    const iso = toISODate(new Date(year, month, day));
    const base = patternForDay(day);
    map[iso] = iso === todayISO ? { ...base, hasEvent: true } : base;
  }
  // 한 달에 한 번쯤 마감/휴무
  const off = new Date(year, month, Math.min(18, lastDay));
  map[toISODate(off)] = { isBreak: true };

  return map;
};

/* ============================================================
   다가오는 일정 (오늘 이후 7일)
   ============================================================ */
export const getUpcomingItems = (base: Date): UpcomingItem[] => {
  const seed: Array<Omit<UpcomingItem, 'id' | 'dateLabel'> & { delta: number }> = [
    { delta: 0, artistName: 'Artist. Leo',  bedName: 'Bed 1',        timeLabel: '11:00', kind: 'procedure',  avatarUri: '' },
    { delta: 0, artistName: 'Artist. RIN',  bedName: 'Bed 2',        timeLabel: '14:00', kind: 'procedure',  avatarUri: '' },
    { delta: 1, artistName: 'Artist. Zero', bedName: 'Private Room', timeLabel: '13:30', kind: 'consulting', avatarUri: '' },
    { delta: 2, artistName: 'Artist. Leo',  bedName: 'Bed 1',        timeLabel: '10:30', kind: 'procedure',  avatarUri: '' },
    { delta: 3, artistName: 'Artist. RIN',  bedName: 'Bed 2',        timeLabel: '15:00', kind: 'procedure',  avatarUri: '' },
    { delta: 5, artistName: 'Artist. Zero', bedName: 'Private Room', timeLabel: '19:00', kind: 'consulting', avatarUri: '' },
  ];

  return seed.map((s, i) => {
    const d = addDays(base, s.delta);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
    return {
      id: `up-${i}-${toISODate(d)}`,
      artistName: s.artistName,
      bedName: s.bedName,
      dateLabel: `${mm}.${dd} (${dow})`,
      timeLabel: s.timeLabel,
      kind: s.kind,
      avatarUri: s.avatarUri,
    };
  });
};

/* ============================================================
   주간 도트 인디케이터
   ============================================================ */
/* ============================================================
   다일(멀티데이) 이벤트 — 승연 태국 스타일
   ============================================================ */
export const getMultiDayEvents = (monthBase: Date): MultiDayEvent[] => {
  const start = startOfMonth(monthBase);
  const y = start.getFullYear();
  const m = start.getMonth();
  return [
    {
      id: 'trip1',
      label: '휴가 · 여행',
      tone: 'purple',
      startISO: toISODate(new Date(y, m, 8)),
      endISO:   toISODate(new Date(y, m, 12)),
    },
    {
      id: 'workshop1',
      label: '워크샵 · 컨벤션',
      tone: 'gold',
      startISO: toISODate(new Date(y, m, 20)),
      endISO:   toISODate(new Date(y, m, 22)),
    },
    {
      id: 'break1',
      label: '샵 정기 휴무',
      tone: 'red',
      startISO: toISODate(new Date(y, m, 26)),
      endISO:   toISODate(new Date(y, m, 27)),
    },
  ];
};

export const getWeeklyDots = (weekStart: Date): Record<string, number> => {
  const map: Record<string, number> = {};
  for (let i = 0; i < 7; i += 1) {
    const iso = toISODate(addDays(weekStart, i));
    // 요일별로 1~2 도트, 일요일은 살짝 많게
    map[iso] = (i % 6 === 0 && i !== 0) ? 2 : 1;
  }
  return map;
};
