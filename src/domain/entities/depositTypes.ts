export type DepositStatus = 'pending' | 'confirmed';

export interface DepositCustomer {
  id: string;
  nickname: string;
  handle: string;
  avatarUri: string;
  isVip?: boolean;
}

export interface DepositItem {
  id: string;
  reservationNumber: string;
  customer: DepositCustomer;
  procedureDateLabel: string;
  procedureTimeLabel: string;
  style: string;
  bodyPart: string;
  depositAmount: number;
  requestedAt: string;
  dueAt: string;
  confirmedAt?: string;
  status: DepositStatus;
}
