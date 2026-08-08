import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { COLORS } from './src/presentation/theme/colors';
import SplashScreen from './src/presentation/screens/splash/SplashScreen';
import RootNavigator from './src/infrastructure/navigation/RootNavigator';
import { ToastProvider } from './src/presentation/components/common/Toast';
import { useLanguageStore } from './src/presentation/store/languageStore';
import { useAuthStore } from './src/presentation/store/authStore';
import { initSocialAuth } from './src/data/auth/socialAuth';
import { ENV } from './src/infrastructure/config/env';

enableScreens();

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

  // 저장된 언어 · 세션을 스플래시가 도는 동안 복원한다
  useEffect(() => {
    hydrateLanguage();
    hydrateAuth();
  }, [hydrateLanguage, hydrateAuth]);

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
            <RootNavigator />
          </ToastProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
