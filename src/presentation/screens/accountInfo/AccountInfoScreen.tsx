import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, KeyboardAvoidingView, Platform, Keyboard, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import {
  BackArrowIcon, CameraSolidIcon, CheckCircleIcon, CheckIcon,
  BellIcon, ShieldCheckIcon, ChevronRightIcon, PersonSilhouette,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import ConfirmModal, { ConfirmConfig } from '../../components/common/ConfirmModal';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../store/languageStore';
import { userApi } from '../../../data/api';
import { PROVIDER_LABEL_KEY } from '../../../domain/entities/authTypes';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const NICKNAME_MAX = 20;
const NICKNAME_MIN = 2;

interface LinkRowProps {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  value?: string;
  valueColor?: string;
  showCheck?: boolean;
  showChevron?: boolean;
  isLast?: boolean;
  onPress?: () => void;
}

const LinkRow = React.memo(({
  Icon, label, value, valueColor, showCheck, showChevron, isLast, onPress,
}: LinkRowProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={onPress ? 0.75 : 1}
    disabled={!onPress}
    style={[styles.linkRow, !isLast && styles.linkRowBorder]}
  >
    <View style={styles.linkIconWrap}>
      <Icon size={20} color={COLORS.gold} strokeWidth={1.7} />
    </View>
    <Text style={styles.linkLabel}>{label}</Text>
    <View style={styles.linkRight}>
      {value ? (
        <Text
          style={[styles.linkValue, valueColor ? { color: valueColor } : null]}
          numberOfLines={1}
        >
          {value}
        </Text>
      ) : null}
      {showCheck && <CheckIcon size={16} color={COLORS.gold} strokeWidth={2.2} />}
      {showChevron && <ChevronRightIcon size={16} color={COLORS.gray} />}
    </View>
  </TouchableOpacity>
));
LinkRow.displayName = 'LinkRow';

const AccountInfoScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t } = useTranslation();

  const session = useAuthStore(s => s.session);
  const logout = useAuthStore(s => s.logout);
  const user = session?.user;

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [saving, setSaving] = useState(false);
  const [nicknameFocused, setNicknameFocused] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  const nicknameValid = useMemo(
    () => nickname.trim().length >= NICKNAME_MIN,
    [nickname],
  );
  const nicknameBorderColor = nicknameValid || nicknameFocused ? COLORS.gold : COLORS.border;

  const providerLabel = user?.provider ? t(PROVIDER_LABEL_KEY[user.provider] as any) : '';

  const handleNicknameChange = useCallback((next: string) => {
    if (next.length <= NICKNAME_MAX) setNickname(next);
  }, []);

  const handleSave = useCallback(async () => {
    if (!nicknameValid) {
      toast(t('account.nicknameMin').replace('{{min}}', String(NICKNAME_MIN)), { variant: 'error' });
      return;
    }
    Keyboard.dismiss();
    setSaving(true);
    try {
      await userApi.updateNickname(nickname.trim());
      toast(t('account.saved'), { variant: 'success' });
      setTimeout(() => navigation.goBack(), 100);
    } catch {
      toast(t('common.error'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  }, [nicknameValid, nickname, t, toast, navigation]);

  const handleLogout = useCallback(() => {
    setConfirm({
      title: t('auth.logout'),
      message: t('auth.logoutConfirm'),
      cancelLabel: t('common.cancel'),
      confirmLabel: t('auth.logout'),
      variant: 'danger',
      onConfirm: async () => {
        await logout();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      },
    });
  }, [t, logout, navigation]);

  const handleNotifSettings = useCallback(() => {
    navigation.navigate('NotificationSettings');
  }, [navigation]);

  const handlePrivacy = useCallback(() => {
    navigation.navigate('PrivacySecurity');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />

      <View style={styles.subHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <BackArrowIcon size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('account.title')}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarBlock}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
                ) : (
                  <PersonSilhouette size={110} color="#3a3a3a" />
                )}
              </View>
              <View style={styles.avatarBadge} pointerEvents="none">
                <CameraSolidIcon size={18} color={COLORS.black} strokeWidth={1.9} />
              </View>
            </View>
            <Text style={styles.avatarHelper}>{t('account.profilePhotoHint')}</Text>
          </View>

          {/* 닉네임 */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{t('account.nicknameLabel')}</Text>
            <View style={[styles.inputRow, { borderColor: nicknameBorderColor }]}>
              <TextInput
                value={nickname}
                onChangeText={handleNicknameChange}
                onFocus={() => setNicknameFocused(true)}
                onBlur={() => setNicknameFocused(false)}
                placeholder={t('account.nicknamePlaceholder')}
                placeholderTextColor={COLORS.gray}
                style={styles.textInput}
                maxLength={NICKNAME_MAX}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
              {nicknameValid && (
                <CheckCircleIcon size={22} color={COLORS.gold} />
              )}
            </View>
          </View>

          {/* 소셜 연동 정보 */}
          <View style={styles.card}>
            <LinkRow
              Icon={ShieldCheckIcon}
              label={t('account.socialConnected').replace('{{provider}}', providerLabel)}
              showCheck
              isLast={!user?.email}
            />
            {user?.email ? (
              <LinkRow
                Icon={BellIcon}
                label={t('account.emailLabel')}
                value={user.email}
                isLast
              />
            ) : null}
          </View>

          {/* 기타 설정 */}
          <Text style={styles.sectionTitle}>{t('account.sectionSettings')}</Text>
          <View style={styles.card}>
            <LinkRow
              Icon={BellIcon}
              label={t('notification.title')}
              showChevron
              onPress={handleNotifSettings}
            />
            <LinkRow
              Icon={ShieldCheckIcon}
              label={t('privacy.title')}
              showChevron
              isLast
              onPress={handlePrivacy}
            />
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
            style={styles.logoutBtn}
          >
            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            style={[styles.submitBtn, (!nicknameValid || saving) && styles.submitBtnDisabled]}
            disabled={!nicknameValid || saving}
          >
            <Text style={styles.submitText}>{t('account.saveBtn')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <ConfirmModal config={confirm} onDismiss={() => setConfirm(null)} />
    </SafeAreaView>
  );
};

export default AccountInfoScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },

  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.black,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginLeft: 4,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },

  avatarBlock: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 24,
  },
  avatarWrap: {
    width: 130,
    height: 130,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  avatarHelper: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },

  fieldBlock: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 6,
    gap: 8,
  },
  textInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    padding: 0,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 4,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    marginBottom: 22,
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  linkRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  linkIconWrap: {
    width: 24,
    alignItems: 'center',
  },
  linkLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    flexShrink: 1,
  },
  linkRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  linkValue: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
    textAlign: 'right',
  },

  logoutBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginTop: 2,
    marginBottom: 8,
  },
  logoutText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.gray,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
});
