import { useEffect, useMemo, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  DEFAULT_SETTINGS,
  fetchPublicSettings,
  type PublicSettings,
} from '../../data/content/settingsApi';
import { useLanguageStore } from '../store/languageStore';

let cache: PublicSettings | null = null;
let inflight: Promise<PublicSettings> | null = null;
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

let appStateListenerReady = false;
function ensureAppStateListener() {
  if (appStateListenerReady) return;
  appStateListenerReady = true;
  let prev: AppStateStatus = AppState.currentState;
  AppState.addEventListener('change', (next) => {
    if (prev !== 'active' && next === 'active') refresh();
    prev = next;
  });
}

/**
 * 공개 설정을 캐시와 함께 제공한다.
 * bannerXxxImages 필드는 현재 앱 언어에 맞는 KO/EN 슬롯으로 자동 주입된다.
 */
export const usePublicSettings = (): PublicSettings => {
  const [raw, setRaw] = useState<PublicSettings>(cache ?? DEFAULT_SETTINGS);
  const lang = useLanguageStore((s) => s.language);

  useEffect(() => {
    ensureAppStateListener();

    let alive = true;
    const cb = (s: PublicSettings) => { if (alive) setRaw(s); };
    subscribers.add(cb);
    void load().then((s) => { if (alive) setRaw(s); });

    return () => {
      alive = false;
      subscribers.delete(cb);
    };
  }, []);

  return useMemo(() => {
    const isKo = (lang as string) === 'ko';
    return {
      ...raw,
      bannerBeginnerImages: isKo ? raw.bannerBeginnerImagesKo : raw.bannerBeginnerImagesEn,
      bannerSupplyImages:   isKo ? raw.bannerSupplyImagesKo   : raw.bannerSupplyImagesEn,
      bannerBoothImages:    isKo ? raw.bannerBoothImagesKo    : raw.bannerBoothImagesEn,
      bannerMediaImages:    isKo ? raw.bannerMediaImagesKo    : raw.bannerMediaImagesEn,
      bannerAdImages:       isKo ? raw.bannerAdImagesKo       : raw.bannerAdImagesEn,
      bannerPartnerImages:  isKo ? raw.bannerPartnerImagesKo  : raw.bannerPartnerImagesEn,
    };
  }, [raw, lang]);
};
