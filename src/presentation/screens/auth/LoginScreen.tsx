import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import SocialLoginButton from '../../components/auth/SocialLoginButton';
import { useToast } from '../../components/common/Toast';
import { useTranslation } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { isAppleSignInSupported } from '../../../data/auth/socialAuth';
import { isProviderConfigured } from '../../../infrastructure/config/env';
import {
  SocialAuthCancelled, PROVIDER_LABEL_KEY, type AuthProvider,
} from '../../../domain/entities/authTypes';
import type { TranslationKey } from '../../../infrastructure/i18n';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRIMARY_COUNT = 2;

const LoginScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const loginWith = useAuthStore((s) => s.loginWith);
  const pendingProvider = useAuthStore((s) => s.pendingProvider);

  const [showAll, setShowAll] = useState(false);

  // 한국어 기기는 카카오·네이버를, 그 외에는 Apple·Google을 위로 올린다.
  const providers = useMemo<AuthProvider[]>(() => {
    const base: AuthProvider[] =
      language === 'ko'
        ? ['kakao', 'google', 'apple']
        : ['apple', 'google', 'kakao'];

    return base.filter((p) => {
      if (p === 'apple') return isAppleSignInSupported();
      return isProviderConfigured[p]();
    });
  }, [language]);

  const visibleProviders = showAll ? providers : providers.slice(0, PRIMARY_COUNT);

  const handleLogin = useCallback(
    (provider: AuthProvider) => async () => {
      try {
        const { isNewUser } = await loginWith(provider);
        if (isNewUser) {
          navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        }
      } catch (e) {
        if (e instanceof SocialAuthCancelled) {
          toast(t('auth.loginCancelled'));
          return;
        }
        // TODO: 디버그 확인 후 아래 줄로 원복
        // toast(t('auth.loginFailed'), { variant: 'error' });
        const errMsg = e instanceof Error ? `${e.message} [code:${(e as { code?: unknown }).code ?? '-'}]` : String(e);
        toast(`${t('auth.loginErrorPrefix')} ${errMsg}`, { variant: 'error' });
      }
    },
    [loginWith, navigation, toast, t],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.logo}>T:ROOT</Text>
          <Text style={styles.title}>{t('auth.welcomeTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.welcomeSubtitle')}</Text>
        </View>

        <View style={styles.buttons}>
          {visibleProviders.map((provider) => (
            <SocialLoginButton
              key={provider}
              provider={provider}
              label={t('auth.continueWith', {
                provider: t(PROVIDER_LABEL_KEY[provider] as TranslationKey),
              })}
              loading={pendingProvider === provider}
              disabled={pendingProvider !== null && pendingProvider !== provider}
              onPress={handleLogin(provider)}
            />
          ))}

          {!showAll && providers.length > PRIMARY_COUNT && (
            <TouchableOpacity
              onPress={() => setShowAll(true)}
              activeOpacity={0.75}
              style={styles.moreBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.moreText}>{t('auth.moreOptions')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.agreement}>
          {t('auth.agreementPrefix')}{' '}
          <Text style={styles.agreementLink}>{t('auth.termsOfService')}</Text>
          {' '}{t('auth.and')}{' '}
          <Text style={styles.agreementLink}>{t('auth.privacyPolicy')}</Text>
          {t('auth.agreementSuffix')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' },

  hero: { alignItems: 'center', marginBottom: 48 },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
    lineHeight: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gold,
    lineHeight: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  buttons: { gap: 10 },
  moreBtn: { alignSelf: 'center', paddingVertical: 12, marginTop: 2 },
  moreText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
    textDecorationLine: 'underline',
  },

  agreement: {
    marginTop: 28,
    fontSize: 11.5,
    color: COLORS.gray2,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  agreementLink: { color: COLORS.gray, textDecorationLine: 'underline' },
});
