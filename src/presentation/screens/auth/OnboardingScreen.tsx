import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { PersonIcon, PaletteIcon, CheckIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useTranslation } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import type { AccountRole } from '../../../domain/entities/authTypes';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const NICK_MIN = 2;
const NICK_MAX = 20;

const OnboardingScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t } = useTranslation();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const [role, setRole] = useState<AccountRole>('USER');
  const [nickname, setNickname] = useState('');

  const trimmed = nickname.trim();
  const canSubmit = trimmed.length >= NICK_MIN && trimmed.length <= NICK_MAX;

  const handleStart = useCallback(async () => {
    if (!canSubmit) return;
    // iOS: 키보드가 열린 채 화면 전환하면 크래시 위험 → 닫고 대기
    Keyboard.dismiss();
    await completeOnboarding(trimmed, role);
    setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }, 120);
  }, [canSubmit, completeOnboarding, trimmed, role, navigation, toast]);

  const roles: { key: AccountRole; title: string; desc: string; Icon: typeof PersonIcon }[] = [
    { key: 'USER', title: t('onboarding.roleUser'), desc: t('onboarding.roleUserDesc'), Icon: PersonIcon },
    { key: 'TATTOOIST', title: t('onboarding.roleArtist'), desc: t('onboarding.roleArtistDesc'), Icon: PaletteIcon },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{t('onboarding.selectRoleTitle')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.selectRoleSubtitle')}</Text>

          <View style={styles.roleList}>
            {roles.map(({ key, title, desc, Icon }) => {
              const active = role === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setRole(key)}
                  activeOpacity={0.85}
                  style={[styles.roleCard, active && styles.roleCardActive]}
                >
                  <View style={[styles.roleIcon, active && styles.roleIconActive]}>
                    <Icon size={22} color={active ? COLORS.gold : COLORS.gray} strokeWidth={1.7} />
                  </View>
                  <View style={styles.roleText}>
                    <Text style={[styles.roleTitle, active && styles.roleTitleActive]}>{title}</Text>
                    <Text style={styles.roleDesc}>{desc}</Text>
                  </View>
                  {active && <CheckIcon size={18} color={COLORS.gold} strokeWidth={2.2} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.nickLabel}>{t('onboarding.nicknameTitle')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('onboarding.nicknamePlaceholder')}
            placeholderTextColor={COLORS.gray2}
            value={nickname}
            onChangeText={(v) => setNickname(v.slice(0, NICK_MAX))}
            maxLength={NICK_MAX}
            autoCapitalize="none"
            returnKeyType="done"
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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },

  title: { fontSize: 22, fontWeight: '800', color: COLORS.white, lineHeight: 30 },
  subtitle: { fontSize: 13, color: COLORS.gray, lineHeight: 19, marginTop: 8 },

  roleList: { gap: 10, marginTop: 28, marginBottom: 36 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleCardActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  roleIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: COLORS.elevated,
    alignItems: 'center', justifyContent: 'center',
  },
  roleIconActive: { backgroundColor: 'rgba(212,168,67,0.15)' },
  roleText: { flex: 1, gap: 3 },
  roleTitle: { fontSize: 15, fontWeight: '700', color: COLORS.white, lineHeight: 21, flexShrink: 1 },
  roleTitleActive: { color: COLORS.gold },
  roleDesc: { fontSize: 12, color: COLORS.gray, lineHeight: 17, flexShrink: 1 },

  nickLabel: { fontSize: 15, fontWeight: '700', color: COLORS.white, lineHeight: 21, marginBottom: 10 },
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
