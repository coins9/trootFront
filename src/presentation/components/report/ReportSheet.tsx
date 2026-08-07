import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  View, Text, Modal, Animated, StyleSheet, Dimensions,
  TouchableWithoutFeedback, ScrollView, TouchableOpacity, TextInput,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import { XIcon, CheckCircleIcon, WarningTriangleIcon } from '../icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type ReportReason =
  | '가격 기망 (앱 표기가와 현장가 상이)'
  | '도안 · 포트폴리오 도용'
  | '등록된 타투이스트와 다른 사람이 시술 (대리 · 수강생)'
  | '허위 · 과장 정보'
  | '기타';

export const REPORT_REASONS: ReportReason[] = [
  '가격 기망 (앱 표기가와 현장가 상이)',
  '도안 · 포트폴리오 도용',
  '등록된 타투이스트와 다른 사람이 시술 (대리 · 수강생)',
  '허위 · 과장 정보',
  '기타',
];

const DETAIL_MAX = 300;

interface Props {
  visible: boolean;
  targetName: string;
  onClose: () => void;
  onSubmit: (reason: ReportReason, detail: string) => void;
  onViewPolicy?: () => void;
}

const ReportSheetInner = ({ visible, targetName, onClose, onSubmit, onViewPolicy }: Props) => {
  const insets = useSafeAreaInsets();
  const maxSheetH = SCREEN_HEIGHT * 0.85;
  const translateY = useRef(new Animated.Value(maxSheetH)).current;
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');

  useEffect(() => {
    if (visible) {
      setReason(null);
      setDetail('');
      Animated.spring(translateY, {
        toValue: 0, useNativeDriver: true, tension: 65, friction: 12,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: maxSheetH, duration: 240, useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY, maxSheetH]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(translateY, {
      toValue: maxSheetH, duration: 220, useNativeDriver: true,
    }).start(() => onClose());
  }, [onClose, translateY, maxSheetH]);

  const handleSubmit = useCallback(() => {
    if (!reason) return;
    onSubmit(reason, detail.trim());
    handleClose();
  }, [reason, detail, onSubmit, handleClose]);

  const handleViewPolicy = useCallback(() => {
    if (!onViewPolicy) return;
    Animated.timing(translateY, {
      toValue: maxSheetH, duration: 220, useNativeDriver: true,
    }).start(() => {
      onClose();
      onViewPolicy();
    });
  }, [onViewPolicy, onClose, translateY, maxSheetH]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sheet, { maxHeight: maxSheetH, transform: [{ translateY }] }]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>신고하기</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <XIcon size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.target} numberOfLines={1}>
              <Text style={styles.targetName}>{targetName}</Text> 님을 신고합니다
            </Text>

            <View style={styles.noticeBox}>
              <WarningTriangleIcon size={16} color={COLORS.gold} />
              <Text style={styles.noticeText}>
                허위 신고는 제재 대상이 될 수 있습니다. 접수된 신고는 운영팀이 검토 후 조치합니다.
              </Text>
            </View>

            <Text style={styles.sectionLabel}>신고 사유</Text>
            {REPORT_REASONS.map((r) => {
              const active = r === reason;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => setReason(r)}
                  activeOpacity={0.75}
                  style={[styles.reasonRow, active && styles.reasonRowActive]}
                >
                  <Text style={[styles.reasonText, active && styles.reasonTextActive]}>
                    {r}
                  </Text>
                  {active && <CheckCircleIcon size={20} color={COLORS.gold} />}
                </TouchableOpacity>
              );
            })}

            {onViewPolicy && (
              <TouchableOpacity
                onPress={handleViewPolicy}
                activeOpacity={0.7}
                style={styles.policyLink}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.policyLinkText}>이용 안전 정책 · 제재 기준 자세히 보기</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionLabel}>상세 내용 (선택)</Text>
            <TextInput
              style={styles.textarea}
              placeholder="상황을 구체적으로 적어주시면 심사에 도움이 됩니다."
              placeholderTextColor={COLORS.gray2}
              value={detail}
              onChangeText={(v) => setDetail(v.slice(0, DETAIL_MAX))}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.counter}>{detail.length}/{DETAIL_MAX}</Text>

            <View style={{ height: 8 }} />
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!reason}
              style={[styles.submitBtn, !reason && styles.submitBtnDisabled]}
              activeOpacity={0.85}
            >
              <Text style={[styles.submitText, !reason && styles.submitTextDisabled]}>
                신고 접수
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const ReportSheet = memo(ReportSheetInner);

export default ReportSheet;

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: COLORS.overlay },
  sheet: {
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.gray3,
    marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700', lineHeight: 23 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },

  target: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  targetName: { color: COLORS.white, fontWeight: '700' },

  noticeBox: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.25)',
  },
  noticeText: {
    flex: 1,
    color: COLORS.gold,
    fontSize: 12,
    lineHeight: 18,
    flexShrink: 1,
  },

  sectionLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.card,
    gap: 10,
  },
  reasonRowActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  reasonText: { flex: 1, color: COLORS.white, fontSize: 14, lineHeight: 20, flexShrink: 1 },
  reasonTextActive: { color: COLORS.gold, fontWeight: '600' },

  policyLink: {
    marginHorizontal: 20,
    marginTop: 4,
    paddingVertical: 4,
  },
  policyLinkText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    textDecorationLine: 'underline',
  },

  textarea: {
    marginHorizontal: 20,
    minHeight: 100,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 21,
  },
  counter: {
    color: COLORS.gray2,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
    paddingHorizontal: 20,
    marginTop: 6,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.sheet,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: COLORS.elevated },
  submitText: { color: COLORS.white, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  submitTextDisabled: { color: COLORS.gray2 },
});
