import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { CheckboxIcon, ShieldCheckIcon } from '../../icons';

interface AgreementStepProps {
  agreed: boolean;
  onToggle: () => void;
}

const AgreementStep = memo(({ agreed, onToggle }: AgreementStepProps) => (
  <View style={styles.container}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLeft}>
        <Text style={styles.sectionNum}>04</Text>
        <ShieldCheckIcon size={16} color={COLORS.gold} />
        <Text style={styles.sectionTitle}>노쇼 방지 동의</Text>
      </View>
      <Text style={styles.required}>필수</Text>
    </View>
    <Text style={styles.sectionSub}>예약 확정 후 무단 불참 방지를 위한 동의가 필요합니다</Text>

    <View style={styles.agreementBox}>
      <Text style={styles.agreementTitle}>노쇼 방지 정책 안내</Text>

      <View style={styles.bulletList}>
        {[
          '예약 확정 후 24시간 이내 취소 시 위약금이 발생하지 않습니다.',
          '예약 당일 취소 또는 무단 불참 시 예치금(디파짓)은 환불되지 않습니다.',
          '예약 변경은 시술 48시간 전까지만 가능합니다.',
          '작가와 채팅 연결 후 세부 조건은 작가와 직접 협의하세요.',
        ].map((text, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{text}</Text>
          </View>
        ))}
      </View>
    </View>

    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.85}
      style={styles.checkRow}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <CheckboxIcon size={22} checked={agreed} />
      <Text style={[styles.checkLabel, agreed && styles.checkLabelActive]}>
        위 노쇼 방지 정책을 확인하였으며, 이에 동의합니다.
      </Text>
    </TouchableOpacity>
  </View>
));

AgreementStep.displayName = 'AgreementStep';
export default AgreementStep;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionNum: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  required: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sectionSub: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  agreementBox: {
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    marginBottom: 16,
  },
  agreementTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  bulletList: {
    gap: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 19,
    flexShrink: 1,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkLabel: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
    flexShrink: 1,
  },
  checkLabelActive: {
    color: COLORS.white,
  },
});
