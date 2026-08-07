import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Image, StatusBar, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import {
  BackArrowIcon, CameraSolidIcon, CheckCircleIcon, CheckIcon,
  ChatBubbleIcon, PhoneIcon, MailIcon, LockIcon,
  BellIcon, ShieldCheckIcon, ChevronRightIcon, PersonSilhouette,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BIO_MAX = 50;
const NICKNAME_MAX = 20;
const NICKNAME_MIN = 2;

interface LinkRowProps {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  value: string;
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
      <Text
        style={[styles.linkValue, valueColor ? { color: valueColor } : null]}
        numberOfLines={1}
      >
        {value}
      </Text>
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

  const [avatarUri, setAvatarUri] = useState<string>('');
  const [nickname, setNickname] = useState<string>('root_user');
  const [bio, setBio] = useState<string>('타투를 사랑하는 사람, 나만의 감성을 찾아가는 중');
  const [nicknameFocused, setNicknameFocused] = useState(false);

  const nicknameValid = useMemo(
    () => nickname.trim().length >= NICKNAME_MIN,
    [nickname],
  );
  const nicknameBorderColor = nicknameValid || nicknameFocused
    ? COLORS.gold
    : COLORS.border;

  const handleAvatarPress = useCallback(() => {
    toast('프로필 사진 변경 — 준비 중입니다');
  }, [toast]);

  const handleBioChange = useCallback((next: string) => {
    if (next.length <= BIO_MAX) setBio(next);
  }, []);

  const handleNicknameChange = useCallback((next: string) => {
    if (next.length <= NICKNAME_MAX) setNickname(next);
  }, []);

  const handleLinkKakao = useCallback(() => {
    toast('카카오 연동 — 준비 중입니다');
  }, [toast]);

  const handleChangePassword = useCallback(() => {
    toast('비밀번호 변경 — 준비 중입니다');
  }, [toast]);

  const handleNotifSettings = useCallback(() => {
    navigation.navigate('NotificationSettings');
  }, [navigation]);

  const handlePrivacy = useCallback(() => {
    navigation.navigate('PrivacySecurity');
  }, [navigation]);

  const handleLogout = useCallback(() => {
    toast('로그아웃 — 준비 중입니다');
  }, [toast]);

  const handleSubmit = useCallback(() => {
    if (!nicknameValid) {
      toast(`닉네임은 최소 ${NICKNAME_MIN}자 이상 입력해주세요.`, { variant: 'error' });
      return;
    }
    Keyboard.dismiss();
    setTimeout(() => {
      toast('계정 정보가 저장되었습니다.', { variant: 'success' });
      navigation.goBack();
    }, 100);
  }, [nicknameValid, toast, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
        <Text style={styles.title}>계정 정보</Text>
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
          {/* ── Avatar block ── */}
          <View style={styles.avatarBlock}>
            <TouchableOpacity
              onPress={handleAvatarPress}
              activeOpacity={0.85}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.avatarWrap}
            >
              <View style={styles.avatarCircle}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                  <PersonSilhouette size={110} color="#3a3a3a" />
                )}
              </View>
              <View style={styles.avatarBadge} pointerEvents="none">
                <CameraSolidIcon size={18} color={COLORS.black} strokeWidth={1.9} />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHelper}>
              프로필 사진을 탭하여 변경할 수 있습니다.
            </Text>
          </View>

          {/* ── 닉네임 ── */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>닉네임</Text>
            <View style={[styles.inputRow, { borderColor: nicknameBorderColor }]}>
              <TextInput
                value={nickname}
                onChangeText={handleNicknameChange}
                onFocus={() => setNicknameFocused(true)}
                onBlur={() => setNicknameFocused(false)}
                placeholder="닉네임을 입력하세요"
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

          {/* ── 한 줄 소개 ── */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>한 줄 소개</Text>
            <View style={styles.bioWrap}>
              <TextInput
                value={bio}
                onChangeText={handleBioChange}
                placeholder="자신을 한 줄로 소개해보세요"
                placeholderTextColor={COLORS.gray}
                multiline
                maxLength={BIO_MAX}
                style={styles.bioInput}
                textAlignVertical="top"
              />
              <Text style={styles.bioCounter}>
                {bio.length}/{BIO_MAX}
              </Text>
            </View>
          </View>

          {/* ── 연동 정보 ── */}
          <Text style={styles.sectionTitle}>연동 정보</Text>
          <View style={styles.card}>
            <LinkRow
              Icon={ChatBubbleIcon}
              label="카카오 계정 연동"
              value="연동 없음"
              valueColor={COLORS.gold}
              showChevron
              onPress={handleLinkKakao}
            />
            <LinkRow
              Icon={PhoneIcon}
              label="휴대폰 번호"
              value="010-1234-5678"
              showCheck
            />
            <LinkRow
              Icon={MailIcon}
              label="이메일 주소"
              value="root_user@example.com"
              showCheck
            />
            <LinkRow
              Icon={LockIcon}
              label="비밀번호"
              value="********"
              showChevron
              isLast
              onPress={handleChangePassword}
            />
          </View>

          {/* ── 기타 설정 ── */}
          <Text style={styles.sectionTitle}>기타 설정</Text>
          <View style={styles.card}>
            <LinkRow
              Icon={BellIcon}
              label="알림 설정"
              value=""
              showChevron
              onPress={handleNotifSettings}
            />
            <LinkRow
              Icon={ShieldCheckIcon}
              label="개인정보 및 보안"
              value=""
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
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            style={[styles.submitBtn, !nicknameValid && styles.submitBtnDisabled]}
            disabled={!nicknameValid}
          >
            <Text style={styles.submitText}>수정 완료</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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

  /* Avatar */
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

  /* Fields */
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

  bioWrap: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    minHeight: 96,
  },
  bioInput: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
    padding: 0,
    minHeight: 44,
  },
  bioCounter: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'right',
    marginTop: 6,
  },

  /* Section card */
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
    flexShrink: 0,
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

  /* Logout */
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

  /* Footer submit */
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
