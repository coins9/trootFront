import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TextInput,
  KeyboardAvoidingView, Platform, Keyboard, TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { useTranslation } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/common/Toast';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const NICK_MIN = 2;
const NICK_MAX = 20;

const OnboardingScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { toast } = useToast();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const [nickname, setNickname] = useState('');

  const trimmed = nickname.trim();
  const canSubmit = trimmed.length >= NICK_MIN && trimmed.length <= NICK_MAX;

  const handleStart = useCallback(async () => {
    if (!canSubmit) return;
    Keyboard.dismiss();
    try {
      await completeOnboarding(trimmed, 'USER');
      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      }, 120);
    } catch {
      toast(t('onboarding.failed'), { variant: 'error' });
    }
  }, [canSubmit, completeOnboarding, trimmed, navigation, toast, t]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{t('onboarding.nicknameTitle')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.nicknameSubtitle')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('onboarding.nicknamePlaceholder')}
            placeholderTextColor={COLORS.gray2}
            value={nickname}
            onChangeText={(v) => setNickname(v.slice(0, NICK_MAX))}
            maxLength={NICK_MAX}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleStart}
            autoFocus
          />
          <Text style={styles.counter}>{trimmed.length}/{NICK_MAX}</Text>
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <TouchableOpacity
            onPress={handleStart}
            disabled={!canSubmit}
            activeOpacity={0.85}
            style={[styles.startBtn, !canSubmit && styles.startBtnDisabled]}
          >
            <Text style={[styles.startText, !canSubmit && styles.startTextDisabled]}>
              {t('onboarding.startApp')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex1: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },

  title: { fontSize: 24, fontWeight: '800', color: COLORS.white, lineHeight: 32 },
  subtitle: { fontSize: 13, color: COLORS.gray, lineHeight: 19, marginTop: 10, marginBottom: 32 },

  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.white,
    lineHeight: 20,
  },
  counter: { fontSize: 11, color: COLORS.gray2, lineHeight: 15, textAlign: 'right', marginTop: 6 },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
  startBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  startBtnDisabled: { backgroundColor: COLORS.elevated },
  startText: { fontSize: 15, fontWeight: '700', color: COLORS.black, lineHeight: 20 },
  startTextDisabled: { color: COLORS.gray2 },
});
