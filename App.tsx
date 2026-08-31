import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { COLORS } from './src/presentation/theme/colors';
import SplashScreen from './src/presentation/screens/splash/SplashScreen';
import RootNavigator from './src/infrastructure/navigation/RootNavigator';
import { ToastProvider, useToast } from './src/presentation/components/common/Toast';
import NetDebugOverlay from './src/presentation/components/debug/NetDebugOverlay';
import UpdateGateModal from './src/presentation/components/common/UpdateGateModal';
import { useLanguageStore } from './src/presentation/store/languageStore';
import { useAuthStore } from './src/presentation/store/authStore';
import { initSocialAuth } from './src/data/auth/socialAuth';
import { ENV } from './src/infrastructure/config/env';
import { notificationService } from './src/infrastructure/notifications/notificationService';
import { activateAdapty } from './src/infrastructure/adapty/adaptyService';

const navigationRef = createNavigationContainerRef<any>();

/** 포그라운드 FCM 메시지를 Toast로 표시 — ToastProvider 안에서만 마운트 */
const ForegroundNotificationHandler = () => {
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    notificationService.onForegroundMessage((notification) => {
      const parts = [notification.title, notification.body].filter(Boolean);
      if (parts.length) toast(parts.join('\n'), { durationMs: 4000 });
    }).then((fn) => { unsubscribe = fn; });
    return () => { unsubscribe?.(); };
  }, [toast]);

  return null;
};

enableScreens();
activateAdapty();

initSocialAuth({
  googleWebClientId: ENV.googleWebClientId,
  googleIosClientId: ENV.googleIosClientId,
});

const App = () => {
  const [splashDone, setSplashDone] = useState(false);
  const hydrateLanguage = useLanguageStore((s) => s.hydrate);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const isLanguageReady = useLanguageStore((s) => s.isHydrated);
  const isAuthReady = useAuthStore((s) => s.isHydrated);
  const session = useAuthStore((s) => s.session);

  // 저장된 언어 · 세션을 스플래시가 도는 동안 복원한다
  useEffect(() => {
    hydrateLanguage();
    hydrateAuth();
  }, [hydrateLanguage, hydrateAuth]);

  // 인증 복원 완료 후 FCM 초기화 (알림 탭 → 화면 이동 콜백 포함)
  useEffect(() => {
    if (isAuthReady) {
      notificationService.initialize((route) => {
        if (navigationRef.isReady()) {
          navigationRef.navigate(route.screen, route.params);
        }
      });
    }
  }, [isAuthReady]);

  // 로그인 후 FCM 토큰을 백엔드에 재등록 (앱 시작 시 미로그인 상태였다가 이후 로그인한 경우 대응)
  useEffect(() => {
    if (session) {
      notificationService.syncToken();
    }
  }, [session]);

  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  if (!splashDone || !isLanguageReady || !isAuthReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <SplashScreen onFinish={handleSplashFinish} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <NavigationContainer
          ref={navigationRef}
          onReady={() => notificationService.flushPendingRoute((route) => {
            if (navigationRef.isReady()) navigationRef.navigate(route.screen, route.params);
          })}
          theme={{
            dark: true,
            colors: {
              primary: COLORS.gold,
              background: COLORS.bg,
              card: COLORS.card,
              text: COLORS.white,
              border: COLORS.border,
              notification: COLORS.gold,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '900' },
            },
          }}
        >
          <ToastProvider>
            <ForegroundNotificationHandler />
            <RootNavigator />
          </ToastProvider>
        </NavigationContainer>
        <NetDebugOverlay />
        {/* 버전 게이트 — 최신 버전 아니면 업데이트 안내/강제 (조회 실패 시 아무 것도 안 함) */}
        <UpdateGateModal />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
