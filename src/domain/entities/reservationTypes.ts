export type ReservationStatus = '예약 대기중' | '확정' | '완료' | '취소됨';
export type ReservationTab = '진행 중인 예약' | '지난 예약';

export interface Reservation {
  id: string;
  reservationNumber: string;
  status: ReservationStatus;
  artist: {
    id: string;
    nickname: string;
    profileImage: string;
    location: string;
    kakaoLink?: string;
  };
  dateTime: string;
  bodyPart: string;
  genre: string;
  totalPrice: number;
  createdAt: string;
}

export const isOngoing = (status: ReservationStatus): boolean =>
  status === '예약 대기중' || status === '확정';
