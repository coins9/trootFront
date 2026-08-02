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
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const notImplemented = useCallback((label: string) => () => {
    toast(`${label} — 준비 중입니다`);
  }, [toast]);

  const handleDownload = useCallback(() => {
    toast('개인정보 다운로드 — 준비 중입니다');
  }, [toast]);

  const openWithdraw = useCallback(() => setWithdrawOpen(true), []);
  const closeWithdraw = useCallback(() => setWithdrawOpen(false), []);

  const confirmWithdraw = useCallback(() => {
    setWithdrawOpen(false);
    setTimeout(() => {
      toast('회원탈퇴 요청이 접수되었습니다.', { variant: 'error' });
    }, 200);
  }, [toast]);

  const securityItems = [
    { key: 'password', label: '비밀번호 변경', onPress: notImplemented('비밀번호 변경') },
  ];
  const privacyItems = [
    { key: 'blocked', label: '차단된 사용자', onPress: notImplemented('차단된 사용자') },
  ];
  const legalItems = [
    { key: 'tos', label: '서비스 이용약관', onPress: notImplemented('서비스 이용약관') },
    { key: 'privacy', label: '개인정보 처리방침', onPress: notImplemented('개인정보 처리방침') },
    { key: 'community', label: '커뮤니티 가이드라인', onPress: notImplemented('커뮤니티 가이드라인') },
    { key: 'copyright', label: '저작권 정책', onPress: notImplemented('저작권 정책') },
  ];

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
        <Text style={styles.title}>개인정보 및 보안</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Section title="보안 (Security)" items={securityItems} />
        <Section title="프라이버시 (Privacy)" items={privacyItems} />
        <Section title="약관 및 정책 (Legal)" items={legalItems} />

        <TouchableOpacity
          onPress={handleDownload}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          style={styles.downloadBtn}
        >
          <Text style={styles.downloadText}>개인정보 다운로드 </Text>
          <ChevronRightIcon size={16} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openWithdraw}
          activeOpacity={0.85}
          style={styles.withdrawBtn}
        >
          <Text style={styles.withdrawText}>회원탈퇴</Text>
        </TouchableOpacity>

        <Text style={styles.withdrawHint}>
          탈퇴 시 계정과 예약·리뷰·찜 데이터가 모두 삭제되며 복구할 수 없습니다.
        </Text>
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
            <Text style={styles.modalTitle}>정말 탈퇴하시겠어요?</Text>
            <Text style={styles.modalDesc}>
              탈퇴하시면 아래 정보가 모두 삭제되며{'\n'}
              <Text style={styles.modalDescStrong}>복구할 수 없습니다.</Text>
            </Text>
            <View style={styles.modalBullets}>
              <Text style={styles.modalBullet}>· 예약 및 시술 기록</Text>
              <Text style={styles.modalBullet}>· 작성한 리뷰와 찜 목록</Text>
              <Text style={styles.modalBullet}>· 보유 T:ROOT 포인트</Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={closeWithdraw}
                activeOpacity={0.85}
                style={[styles.modalBtn, styles.modalBtnGhost]}
              >
                <Text style={styles.modalBtnGhostText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmWithdraw}
                activeOpacity={0.85}
                style={[styles.modalBtn, styles.modalBtnDanger]}
              >
                <Text style={styles.modalBtnDangerText}>탈퇴하기</Text>
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
