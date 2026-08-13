import { create } from 'zustand';

/** 네트워크 요청 1건의 기록 */
export interface NetEntry {
  id: string;
  method: string;
  path: string;
  status: number;
  ok: boolean;
  durationMs: number;
  at: number;
  errorCode?: string;
  requestId?: string;
  /** 요청/응답 본문 요약(디버깅용, 길면 잘림) */
  reqBody?: string;
  resBody?: string;
}

interface NetLogState {
  entries: NetEntry[];
  push: (e: Omit<NetEntry, 'id' | 'at'>) => void;
  clear: () => void;
}

const MAX = 80;
let seq = 0;

export const useNetLog = create<NetLogState>((set) => ({
  entries: [],
  push: (e) =>
    set((s) => ({
      entries: [{ ...e, id: String(++seq), at: Date.now() }, ...s.entries].slice(0, MAX),
    })),
  clear: () => set({ entries: [] }),
}));

const cut = (v: unknown, n = 500): string | undefined => {
  if (v === undefined || v === null) return undefined;
  const str = typeof v === 'string' ? v : JSON.stringify(v);
  return str.length > n ? `${str.slice(0, n)}…` : str;
};

/** 데이터 레이어(비 React)에서 호출하는 기록 헬퍼 */
export const logNet = (e: {
  method: string;
  path: string;
  status: number;
  ok: boolean;
  durationMs: number;
  errorCode?: string;
  requestId?: string;
  reqBody?: unknown;
  resBody?: unknown;
}) =>
  useNetLog.getState().push({
    ...e,
    reqBody: cut(e.reqBody),
    resBody: cut(e.resBody),
  });
