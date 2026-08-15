import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
  Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import {
  BackArrowIcon, ChevronRightIcon, ShieldCheckIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useTranslation } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface RowProps {
  label: string;
  onPress: () => void;
  isLast: boolean;
}
const Row = React.memo(({ label, onPress, isLast }: RowProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[styles.row, !isLast && styles.rowBorder]}
    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
  >
    <Text style={styles.rowLabel} numberOfLines={1}>{label}</Text>
    <ChevronRightIcon size={18} color={COLORS.gray} />
  </TouchableOpacity>
));
Row.displayName = 'Row';

interface SectionProps {
  title: string;
  items: { key: string; label: string; onPress: () => void }[];
}
const Section = React.memo(({ title, items }: SectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>
      {items.map((it, i) => (
        <Row
          key={it.key}
          label={it.label}
          onPress={it.onPress}
          isLast={i === items.length - 1}
        />
      ))}
    </View>
  </View>
));
Section.displayName = 'Section';

const PrivacySecurityScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const notImplemented = useCallback((label: string) => () => {
    toast(t('privacy.notImplemented', { label } as any));
  }, [toast, t]);

  const handleDownload = useCallback(() => {
    toast(t('privacy.notImplemented', { label: t('privacy.downloadData') } as any));
  }, [toast, t]);

  const openWithdraw = useCallback(() => setWithdrawOpen(true), []);
  const closeWithdraw = useCallback(() => setWithdrawOpen(false), []);

  const goToSafetyPolicy = useCallback(() => {
    navigation.navigate('SafetyPolicy');
  }, [navigation]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }, [logout, navigation]);

  const confirmWithdraw = useCallback(() => {
    setWithdrawOpen(false);
    setTimeout(() => {
      toast(t('privacy.withdrawRequested'), { variant: 'error' });
    }, 200);
  }, [toast, t]);

  const securityItems = [
    { key: 'password', label: t('privacy.passwordChange'), onPress: notImplemented(t('privacy.passwordChange')) },
  ];
  const privacyItems = [
    { key: 'blocked', label: t('privacy.blocked'), onPress: notImplemented(t('privacy.blocked')) },
  ];
  const legalItems = [
    { key: 'safety', label: t('privacy.safetyPolicy'), onPress: goToSafetyPolicy },
    { key: 'tos', label: t('privacy.terms'), onPress: notImplemented(t('privacy.terms')) },
    { key: 'privacy', label: t('privacy.privacyPolicyLink'), onPress: notImplemented(t('privacy.privacyPolicyLink')) },
    { key: 'community', label: t('privacy.community'), onPress: notImplemented(t('privacy.community')) },
    { key: 'copyright', label: t('privacy.copyright'), onPress: notImplemented(t('privacy.copyright')) },
  ];

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
        <Text style={styles.title}>{t('privacy.title')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Section title={t('privacy.sectionSecurity')} items={securityItems} />
        <Section title={t('privacy.sectionPrivacy')} items={privacyItems} />
        <Section title={t('privacy.sectionLegal')} items={legalItems} />

        <TouchableOpacity
          onPress={handleDownload}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          style={styles.downloadBtn}
        >
          <Text style={styles.downloadText}>{t('privacy.downloadData')} </Text>
          <ChevronRightIcon size={16} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.85}
          style={styles.logoutBtn}
        >
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openWithdraw}
          activeOpacity={0.85}
          style={styles.withdrawBtn}
        >
          <Text style={styles.withdrawText}>{t('privacy.withdraw')}</Text>
        </TouchableOpacity>

        <Text style={styles.withdrawHint}>{t('privacy.withdrawHint')}</Text>
      </ScrollView>

      {/* ── 탈퇴 확인 모달 ── */}
      <Modal
        visible={withdrawOpen}
        transparent
        animationType="fade"
        onRequestClose={closeWithdraw}
        statusBarTranslucent
      >
        <Pressable style={styles.modalBackdrop} onPress={closeWithdraw}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalIconWrap}>
              <ShieldCheckIcon size={30} color={COLORS.danger} strokeWidth={1.8} />
            </View>
            <Text style={styles.modalTitle}>{t('privacy.withdrawModalTitle')}</Text>
            <Text style={styles.modalDesc}>
              {t('privacy.withdrawModalDesc')}{'\n'}
              <Text style={styles.modalDescStrong}>{t('privacy.withdrawModalDescStrong')}</Text>
            </Text>
            <View style={styles.modalBullets}>
              <Text style={styles.modalBullet}>{t('privacy.withdrawBullet1')}</Text>
              <Text style={styles.modalBullet}>{t('privacy.withdrawBullet2')}</Text>
              <Text style={styles.modalBullet}>{t('privacy.withdrawBullet3')}</Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={closeWithdraw}
                activeOpacity={0.85}
                style={[styles.modalBtn, styles.modalBtnGhost]}
              >
                <Text style={styles.modalBtnGhostText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmWithdraw}
                activeOpacity={0.85}
                style={[styles.modalBtn, styles.modalBtnDanger]}
              >
                <Text style={styles.modalBtnDangerText}>{t('privacy.withdrawBtn')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default PrivacySecurityScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

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
    paddingTop: 20,
    paddingBottom: 40,
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },

  /* Bottom actions */
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 4,
    gap: 2,
  },
  downloadText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },

  logoutBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },

  withdrawBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  withdrawText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  withdrawHint: {
    marginTop: 10,
    color: COLORS.gray2,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: COLORS.sheet,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(232,85,85,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDesc: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 14,
  },
  modalDescStrong: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  modalBullets: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
    marginBottom: 18,
  },
  modalBullet: {
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnGhost: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalBtnGhostText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  modalBtnDanger: {
    backgroundColor: COLORS.danger,
  },
  modalBtnDangerText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
});
