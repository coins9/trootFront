import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { SUBJECTS, MOODS } from '../../../data/mock/mockData';
import { useTranslation } from '../../store/languageStore';

interface SubjectMoodFilterProps {
  selectedSubjects: string[];
  selectedMoods: string[];
  onToggleSubject: (s: string) => void;
  onToggleMood: (m: string) => void;
}

const Chip = memo(({
  label, selected, onPress,
}: { label: string; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[styles.chip, selected && styles.chipActive]}
  >
    <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
));
Chip.displayName = 'Chip';

const SubjectMoodFilter = memo(({
  selectedSubjects, selectedMoods, onToggleSubject, onToggleMood,
}: SubjectMoodFilterProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      {/* 주제 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('filter.subjectSectionLabel')}</Text>
        <Text style={styles.sectionSubtitle}>{t('filter.subjectSectionSub')}</Text>
        <View style={styles.chipGrid}>
          {SUBJECTS.map((item) => (
            <Chip
              key={item}
              label={(t as any)(`filter.subject.${item}`) || item}
              selected={selectedSubjects.includes(item)}
              onPress={() => onToggleSubject(item)}
            />
          ))}
        </View>
      </View>

      {/* 감성 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('filter.moodSectionLabel')}</Text>
        <Text style={styles.sectionSubtitle}>{t('filter.moodSectionSub')}</Text>
        <View style={styles.chipGrid}>
          {MOODS.map((item) => (
            <Chip
              key={item}
              label={(t as any)(`filter.mood.${item}`) || item}
              selected={selectedMoods.includes(item)}
              onPress={() => onToggleMood(item)}
            />
          ))}
        </View>
      </View>
    </View>
  );
});

SubjectMoodFilter.displayName = 'SubjectMoodFilter';
export default SubjectMoodFilter;

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  section: {
    backgroundColor: COLORS.elevated,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  sectionSubtitle: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
    marginBottom: 14,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  chip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.sheet,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  chipActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  chipText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  chipTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
});
