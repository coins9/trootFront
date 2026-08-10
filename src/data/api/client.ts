import { useAuthStore } from '../../presentation/store/authStore';

const API_BASE = 'https://api.tattooroot.com/api/v1';
const TIMEOUT_MS = 15_000;

interface SuccessBody<T> {
  success: true;
  data: T;
  requestId: string;
}

interface ErrorBody {
  success: false;
  error: { code: string; message: string; details?: Record<string, unknown> };
  requestId: string;
}

/** 백엔드 ErrorCode 를 그대로 보존해 화면에서 분기할 수 있게 한다 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  get userMessage(): string {
    switch (this.code) {
      case 'AUTH_TOKEN_EXPIRED':
      case 'AUTH_UNAUTHORIZED': return '다시 로그인해주세요.';
      case 'USER_SUSPENDED': return '이용이 정지된 계정입니다.';
      case 'USER_BANNED': return '영구 정지된 계정입니다.';
      case 'USER_NICKNAME_TAKEN': return '이미 사용 중인 닉네임입니다.';
      case 'USER_ONBOARDING_REQUIRED': return '먼저 프로필 설정을 완료해주세요.';
      case 'ARTIST_SELECTED_MASTER_LIMIT_EXCEEDED': return 'Selected Master 정원이 가득 찼습니다.';
      case 'REPORT_DUPLICATED': return '이미 신고한 대상입니다.';
      case 'REPORT_SELF_NOT_ALLOWED': return '본인은 신고할 수 없습니다.';
      case 'AD_SLOT_SOLD_OUT': return '광고 슬롯이 모두 판매되었습니다.';
      case 'AD_FREE_UP_COOLDOWN': return '무료 UP은 24시간마다 사용할 수 있습니다.';
      case 'COMMON_RATE_LIMITED': return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      case 'NETWORK_ERROR': return '네트워크 연결을 확인해주세요.';
      default: return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }
}

/** 401 이면 리프레시를 1회 시도하고, 실패 시 세션을 비운다 */
let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;

  refreshing = (async () => {
    const store = useAuthStore.getState();
    const refreshToken = store.session?.refreshToken;
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/app/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;

      const json = (await res.json()) as SuccessBody<{
        accessToken: string;
        refreshToken: string;
      }>;
      await store.applyTokens(json.data.accessToken, json.data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = useAuthStore.getState().session?.accessToken;

  // RN 런타임에는 AbortSignal.timeout 이 없어 직접 타이머로 중단시킨다
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      signal: controller.signal,
    });
  } catch (cause) {
    throw new ApiError('NETWORK_ERROR', String(cause), 0);
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return undefined as T;

  const json = (await res.json().catch(() => null)) as SuccessBody<T> | ErrorBody | null;

  if (!res.ok || !json || json.success === false) {
    const err = (json as ErrorBody | null)?.error;
    const code = err?.code ?? 'COMMON_INTERNAL_ERROR';

    // 액세스 토큰 만료 → 갱신 후 1회 재시도
    if (retry && res.status === 401 && code === 'AUTH_TOKEN_EXPIRED') {
      if (await tryRefresh()) return request<T>(path, init, false);
      await useAuthStore.getState().forceLogout();
    }

    throw new ApiError(code, err?.message ?? `HTTP ${res.status}`, res.status, err?.details);
  }

  return json.data;
}

/** 쿼리스트링 조립 — undefined 값은 제외 */
export const qs = (params: Record<string, unknown>): string => {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.length ? `?${parts.join('&')}` : '';
};

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
}
