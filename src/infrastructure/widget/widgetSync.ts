import { NativeModules, Platform } from 'react-native';

/**
 * iOS 홈 위젯(T14) 데이터 브리지.
 *
 * 네이티브 모듈 WidgetBridge 가 App Group UserDefaults 에 일정 스냅샷을 저장하고
 * WidgetCenter 로 위젯을 새로고침한다. 위젯 타깃이 빌드에 포함되지 않은 경우
 * (ENABLE_WIDGET 미설정) NativeModules.WidgetBridge 가 없으므로 모든 호출은 무해하게 무시된다.
 * → 위젯 미포함 빌드/안드로이드에서도 앱 동작에 전혀 영향 없음.
 */
const Bridge = (NativeModules as { WidgetBridge?: {
  setSchedule?: (json: string) => void;
  clear?: () => void;
} }).WidgetBridge;

export interface WidgetItem {
  /** 표시용 시간 문자열(로케일 반영). 예: "14:00" */
  time: string;
  /** 제목(고객명/일정 제목) */
  title: string;
  /** 보조 문구(부위·유형 등). 없으면 빈 문자열 */
  sub: string;
}

export interface WidgetSnapshot {
  /** 상단 요약. 예: "오늘 3건" */
  headline: string;
  items: WidgetItem[];
  /** 일정이 없을 때 문구 */
  empty: string;
}

/** 위젯이 사용 가능한 환경인지(iOS + 네이티브 모듈 포함) */
export const isWidgetAvailable = (): boolean =>
  Platform.OS === 'ios' && !!Bridge?.setSchedule;

export const syncWidget = (snapshot: WidgetSnapshot): void => {
  if (!isWidgetAvailable()) return;
  try {
    Bridge!.setSchedule!(
      JSON.stringify({
        updatedAt: Math.floor(Date.now() / 1000),
        headline: snapshot.headline,
        items: snapshot.items.slice(0, 6),
        empty: snapshot.empty,
      }),
    );
  } catch {
    // 위젯은 부가 기능 — 실패해도 앱 흐름에 영향 주지 않는다
  }
};

export const clearWidget = (): void => {
  if (Platform.OS !== 'ios' || !Bridge?.clear) return;
  try {
    Bridge.clear();
  } catch {
    // no-op
  }
};
