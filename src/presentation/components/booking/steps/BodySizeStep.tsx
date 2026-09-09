import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { BodyPartIconSvg } from '../../icons';
import { BOOKING_BODY_PARTS, BODY_PART_T_KEY, SIZES } from '../../../../domain/entities/bookingTypes';
import { useTranslation } from '../../../store/languageStore';

interface BodySizeStepProps {
  bodyParts: string[];
  sizes: string[];
  onToggleBodyPart: (part: string) => void;
  onToggleSize: (size: string) => void;
}

const Chip = memo(({
  label, selected, onPress,
}: { label: string; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[styles.chip, selected && styles.chipActive]}
  >
    <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
));
Chip.displayName = 'Chip';

const BodySizeStep = memo(({
  bodyParts, sizes, onToggleBodyPart, onToggleSize,
}: BodySizeStepProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLeft}>
          <Text style={styles.sectionNum}>02</Text>
          <BodyPartIconSvg size={16} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>{t('booking.steps.bodyTitle')}</Text>
        </View>
        <Text style={styles.required}>{t('common.required')}</Text>
      </View>
      <Text style={styles.sectionSub}>{t('booking.steps.bodySub')}</Text>

      <Text style={styles.subLabel}>{t('booking.steps.bodyPartLabel')}</Text>
      <View style={styles.chipsGrid}>
        {BOOKING_BODY_PARTS.map((part) => (
          <Chip
            key={part}
            label={t(BODY_PART_T_KEY[part] as any) || part}
            selected={bodyParts.includes(part)}
            onPress={() => onToggleBodyPart(part)}
          />
        ))}
      </View>

      {/* Size cards — 복수 선택 */}
      <Text style={[styles.subLabel, { marginTop: 20 }]}>{t('booking.steps.bodySizeLabel')}</Text>
      <View style={styles.sizeGrid}>
        {SIZES.map((s) => {
          const selected = sizes.includes(s.label);
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => onToggleSize(s.label)}
              activeOpacity={0.8}
              style={[styles.sizeCard, selected && styles.sizeCardActive]}
            >
              <Text style={[styles.sizeLabel, selected && styles.sizeLabelActive]}>
                {t(s.labelKey as any)}
              </Text>
              <Text style={[styles.sizeSub, selected && styles.sizeSubActive]}>
                {t(s.subKey as any)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

BodySizeStep.displayName = 'BodySizeStep';
export default BodySizeStep;

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
  subLabel: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
  },
  chipActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212,168,67,0.12)',
  },
  chipText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  chipTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  sizeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    gap: 4,
  },
  sizeCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212,168,67,0.12)',
  },
  sizeLabel: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'center',
  },
  sizeLabelActive: {
    color: COLORS.gold,
  },
  sizeSub: {
    color: COLORS.gray3,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  sizeSubActive: {
    color: 'rgba(212,168,67,0.7)',
  },
});
