/**
 * Firebase Cloud Messaging 서비스
 *
 * 패키지 설치 후 활성화:
 *   npm install @react-native-firebase/app @react-native-firebase/messaging
 *
 * 그 전까지는 해당 import 라인이 런타임 오류를 일으키지 않도록
 * try/catch로 감싼 lazy import 패턴을 사용한다.
 */

import { Platform } from 'react-native';
import { userApi } from '../../data/api';

type UnsubscribeFn = () => void;

/** 포그라운드 메시지 핸들러에 전달되는 알림 데이터 */
export interface AppNotification {
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

/** 알림 탭 시 내비게이션에 쓸 라우트 정보 */
export interface NotificationRoute {
  screen: string;
  params?: Record<string, unknown>;
}

/** 알림 data payload → 내비게이션 라우트 파싱 */
const parseRoute = (data?: Record<string, string>): NotificationRoute | null => {
  if (!data?.screen) return null;
  try {
    return {
      screen: data.screen,
      params: data.params ? JSON.parse(data.params) : undefined,
    };
  } catch {
    return { screen: data.screen };
  }
};

class NotificationService {
  private messaging: any = null;
  private initialized = false;

  private async getMessaging() {
    if (this.messaging) return this.messaging;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.messaging = require('@react-native-firebase/messaging').default;
      return this.messaging;
    } catch {
      console.warn('[FCM] @react-native-firebase/messaging not installed.');
      return null;
    }
  }

  /** 앱 시작 시 1회 호출 — 권한 요청 + 토큰 등록 */
  async initialize(onRoute?: (route: NotificationRoute) => void): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    const messaging = await this.getMessaging();
    if (!messaging) return;

    // iOS: 권한 요청 (Android 13+도 해당)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn('[FCM] 알림 권한이 거부되었습니다.');
      return;
    }

    // FCM 토큰 획득 + 백엔드 저장
    await this.registerToken();

    // 토큰 갱신 리스너
    messaging().onTokenRefresh(async (token: string) => {
      await this.saveToken(token);
    });

    // 앱이 종료된 상태에서 알림 탭으로 시작
    const initialMessage = await messaging().getInitialNotification();
    if (initialMessage?.data && onRoute) {
      const route = parseRoute(initialMessage.data as Record<string, string>);
      if (route) onRoute(route);
    }

    // 백그라운드 → 포그라운드 전환 시 알림 탭
    messaging().onNotificationOpenedApp((remoteMessage: any) => {
      if (remoteMessage?.data && onRoute) {
        const route = parseRoute(remoteMessage.data as Record<string, string>);
        if (route) onRoute(route);
      }
    });
  }

  /** 포그라운드 알림 리스너 등록 — 컴포넌트 마운트 시 */
  async onForegroundMessage(
    handler: (notification: AppNotification) => void,
  ): Promise<UnsubscribeFn> {
    const messaging = await this.getMessaging();
    if (!messaging) return () => {};

    return messaging().onMessage((remoteMessage: any) => {
      handler({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
      });
    });
  }

  /** 백그라운드/종료 상태 메시지 핸들러 — index.js에서 등록 */
  async setBackgroundHandler(): Promise<void> {
    const messaging = await this.getMessaging();
    if (!messaging) return;

    messaging().setBackgroundMessageHandler(async (_remoteMessage: any) => {
      // 백그라운드에서는 OS가 알림 트레이에 자동 표시하므로 별도 처리 불필요
    });
  }

  private async registerToken(): Promise<void> {
    const messaging = await this.getMessaging();
    if (!messaging) return;
    try {
      const token = await messaging().getToken();
      await this.saveToken(token);
    } catch (e) {
      console.warn('[FCM] 토큰 등록 실패:', e);
    }
  }

  private async saveToken(token: string): Promise<void> {
    try {
      await userApi.updateFcmToken(token, Platform.OS as 'ios' | 'android');
    } catch {
      // 토큰 저장 실패 시 다음 앱 실행 때 재시도
    }
  }
}

export const notificationService = new NotificationService();
