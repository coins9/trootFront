import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { configApi, type PlatformVersionConfig } from '../../data/api';
import { APP_VERSION } from '../../infrastructure/config/env';

export type VersionGateStatus = 'loading' | 'ok' | 'optional' | 'force';

/** "1.2.3" 비교 — a<b:-1, a==b:0, a>b:1. 형식이 이상해도 절대 throw 하지 않음 */
const compareVersion = (a: string, b: string): number => {
  const pa = String(a ?? '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b ?? '').split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
};

interface VersionGate {
  status: VersionGateStatus;
  storeUrl: string | null;
  /** 권장(optional) 업데이트를 사용자가 닫을 때 */
  dismiss: () => void;
}

/**
 * 앱 부팅 시 서버의 min/latest 버전과 현재 APP_VERSION 을 비교.
 * - min 미만 → 'force' (닫기 불가 강제 업데이트)
 * - latest 미만 → 'optional' (닫기 가능 권장)
 * - 그 외/조회 실패/설정 누락 → 'ok' (절대 앱을 막지 않음)
 */
export function useVersionGate(): VersionGate {
  const [status, setStatus] = useState<VersionGateStatus>('loading');
  const [storeUrl, setStoreUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    configApi.version()
      .then((cfg) => {
        if (!alive) return;
        const p: PlatformVersionConfig | undefined =
          Platform.OS === 'ios' ? cfg?.ios : cfg?.android;
        // 설정이 없거나 min 이 비어 있으면 게이트 미적용
        if (!p || !p.min) { setStatus('ok'); return; }
        setStoreUrl(p.storeUrl ?? null);
        if (compareVersion(APP_VERSION, p.min) < 0) {
          setStatus('force');
        } else if (p.latest && compareVersion(APP_VERSION, p.latest) < 0) {
          setStatus('optional');
        } else {
          setStatus('ok');
        }
      })
      // 네트워크 오류·서버 문제 등 어떤 이유로든 실패하면 앱을 막지 않는다
      .catch(() => { if (alive) setStatus('ok'); });
    return () => { alive = false; };
  }, []);

  const dismiss = useCallback(() => setStatus('ok'), []);

  return { status, storeUrl, dismiss };
}
