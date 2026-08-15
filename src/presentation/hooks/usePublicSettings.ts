import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  DEFAULT_SETTINGS,
  fetchPublicSettings,
  type PublicSettings,
} from '../../data/content/settingsApi';

let cache: PublicSettings | null = null;
let inflight: Promise<PublicSettings> | null = null;
// 마운트된 모든 usePublicSettings 인스턴스에 새 값을 전파한다
const subscribers = new Set<(s: PublicSettings) => void>();

const load = (): Promise<PublicSettings> => {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetchPublicSettings().then((s) => {
      cache = s;
      inflight = null;
      return s;
    });
  }
  return inflight;
};

const refresh = () => {
  cache = null;
  void load().then((s) => {
    subscribers.forEach((cb) => cb(s));
  });
};

// AppState 리스너는 앱 전체에서 한 번만 등록한다
let appStateListenerReady = false;
function ensureAppStateListener() {
  if (appStateListenerReady) return;
  appStateListenerReady = true;
  let prev: AppStateStatus = AppState.currentState;
  AppState.addEventListener('change', (next) => {
    // 백그라운드/인액티브 → 포그라운드 복귀 시에만 캐시 무효화
    if (prev !== 'active' && next === 'active') refresh();
    prev = next;
  });
}

/** 공개 설정(카톡 채널·배너 URL 등)을 캐시와 함께 제공한다.
 *  앱이 포그라운드로 돌아올 때마다 자동으로 갱신된다. */
export const usePublicSettings = (): PublicSettings => {
  const [settings, setSettings] = useState<PublicSettings>(cache ?? DEFAULT_SETTINGS);

  useEffect(() => {
    ensureAppStateListener();

    let alive = true;
    const cb = (s: PublicSettings) => { if (alive) setSettings(s); };
    subscribers.add(cb);

    void load().then((s) => { if (alive) setSettings(s); });

    return () => {
      alive = false;
      subscribers.delete(cb);
    };
  }, []);

  return settings;
};
