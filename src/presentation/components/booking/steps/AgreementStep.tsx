import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { CheckboxIcon, ShieldCheckIcon } from '../../icons';
import { useTranslation } from '../../../store/languageStore';

interface AgreementStepProps {
  agreed: boolean;
  onToggle: () => void;
}

const AgreementStep = memo(({ agreed, onToggle }: AgreementStepProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLeft}>
          <Text style={styles.sectionNum}>04</Text>
          <ShieldCheckIcon size={16} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>{t('booking.steps.agreementTitle')}</Text>
        </View>
        <Text style={styles.required}>{t('common.required')}</Text>
      </View>
      <Text style={styles.sectionSub}>{t('booking.steps.agreementSub')}</Text>

      <View style={styles.agreementBox}>
        <Text style={styles.agreementTitle}>{t('booking.steps.agreementPolicyTitle')}</Text>

        <View style={styles.bulletList}>
          {([
            t('booking.steps.agreementPolicy1'),
            t('booking.steps.agreementPolicy2'),
            t('booking.steps.agreementPolicy3'),
            t('booking.steps.agreementPolicy4'),
          ] as string[]).map((text, i) => (
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
          {t('booking.steps.agreementCheck')}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

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
