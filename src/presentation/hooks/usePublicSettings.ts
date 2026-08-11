import { useEffect, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  fetchPublicSettings,
  type PublicSettings,
} from '../../data/content/settingsApi';

// 앱 실행 중 여러 화면이 공유하는 모듈 캐시 — 매번 네트워크를 타지 않는다
let cache: PublicSettings | null = null;
let inflight: Promise<PublicSettings> | null = null;

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

/** 공개 설정(카톡 채널·왈라 배너 URL 등)을 캐시와 함께 제공한다 */
export const usePublicSettings = (): PublicSettings => {
  const [settings, setSettings] = useState<PublicSettings>(cache ?? DEFAULT_SETTINGS);

  useEffect(() => {
    let alive = true;
    void load().then((s) => {
      if (alive) setSettings(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  return settings;
};
