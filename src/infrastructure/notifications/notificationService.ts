import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMessaging, getToken, onTokenRefresh, requestPermission,
  registerDeviceForRemoteMessages, getInitialNotification,
  onNotificationOpenedApp, setBackgroundMessageHandler, onMessage,
  deleteToken, AuthorizationStatus,
} from '@react-native-firebase/messaging';
import type { RemoteMessage } from '@react-native-firebase/messaging';
import { notificationApi } from '../../data/api';

type UnsubscribeFn = () => void;

export interface AppNotification {
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

export interface NotificationRoute {
  screen: string;
  params?: Record<string, unknown>;
}

const parseRoute = (data?: Record<string, string>): NotificationRoute | null => {
  const allowedScreens = new Set([
    'ReservationManage', 'TattooReview', 'NotificationList', 'ArtistReservation',
    'TattooSupplyDetail', 'TattooShareDetail', 'BeginnerModelDetail', 'MediaExpertDetail',
  ]);
  if (!data?.screen || !allowedScreens.has(data.screen)) return null;
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
  private state: 'idle' | 'initializing' | 'ready' | 'denied' | 'failed' = 'idle';
  private tokenUnsubscribe: UnsubscribeFn | null = null;
  private openedUnsubscribe: UnsubscribeFn | null = null;
  private pendingRoute: NotificationRoute | null = null;
  private routeHandler: ((route: NotificationRoute) => void) | undefined;

  async initialize(onRoute?: (route: NotificationRoute) => void): Promise<void> {
    if (this.state === 'ready' || this.state === 'initializing') return;
    this.state = 'initializing';
    this.routeHandler = onRoute;

    try {
      if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          this.state = 'denied';
          return;
        }
      }
      const m = getMessaging();
      await registerDeviceForRemoteMessages(m);
      const authStatus = await requestPermission(m);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        this.state = 'denied';
        return;
      }

      await this.registerToken();

      this.tokenUnsubscribe?.();
      this.tokenUnsubscribe = onTokenRefresh(m, (token: string) => {
        void this.saveToken(token);
      });

      const initialMessage = await getInitialNotification(m);
      if (initialMessage?.data) {
        this.deliverRoute(parseRoute(initialMessage.data as Record<string, string>));
      }

      this.openedUnsubscribe?.();
      this.openedUnsubscribe = onNotificationOpenedApp(m, (remoteMessage: RemoteMessage) => {
        if (remoteMessage.data) {
          this.deliverRoute(parseRoute(remoteMessage.data as Record<string, string>));
        }
      });
      this.state = 'ready';
    } catch (error) {
      this.state = 'failed';
      console.warn('[FCM] initialization failed', error);
    }
  }

  private deliverRoute(route: NotificationRoute | null) {
    if (!route) return;
    if (this.routeHandler) this.routeHandler(route);
    else this.pendingRoute = route;
  }

  flushPendingRoute(handler: (route: NotificationRoute) => void) {
    this.routeHandler = handler;
    if (this.pendingRoute) {
      const route = this.pendingRoute;
      this.pendingRoute = null;
      handler(route);
    }
  }

  async onForegroundMessage(
    handler: (notification: AppNotification) => void,
  ): Promise<UnsubscribeFn> {
    return onMessage(getMessaging(), (remoteMessage: RemoteMessage) => {
      handler({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data as Record<string, string> | undefined,
      });
    });
  }

  async setBackgroundHandler(): Promise<void> {
    setBackgroundMessageHandler(getMessaging(), async (_remoteMessage: RemoteMessage) => {
      // 백그라운드에서는 OS가 알림 트레이에 자동 표시하므로 별도 처리 불필요
    });
  }

  async syncToken(): Promise<void> {
    if (this.state !== 'ready') {
      await this.initialize(this.routeHandler);
      const currentState: string = this.state;
      if (currentState !== 'ready') return;
    }
    await this.registerToken();
  }

  private async registerToken(): Promise<void> {
    try {
      const token = await getToken(getMessaging());
      await this.saveToken(token);
    } catch (e) {
      console.warn('[FCM] 토큰 등록 실패:', e);
    }
  }

  private async saveToken(token: string): Promise<void> {
    const installationId = await this.getInstallationId();
    await notificationApi.registerToken({ token, platform: Platform.OS as 'ios' | 'android', installationId });
  }

  private async getInstallationId(): Promise<string> {
    const key = '@troot/push-installation-id';
    const existing = await AsyncStorage.getItem(key);
    if (existing) return existing;
    const value = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    await AsyncStorage.setItem(key, value);
    return value;
  }

  async removeCurrentToken(): Promise<void> {
    const installationId = await this.getInstallationId();
    await notificationApi.removeCurrentToken(installationId);
    await deleteToken(getMessaging());
  }
}

export const notificationService = new NotificationService();
