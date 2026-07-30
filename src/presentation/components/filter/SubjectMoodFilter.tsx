import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { SUBJECTS, MOODS } from '../../../data/mock/mockData';

interface SubjectMoodFilterProps {
  selectedSubjects: string[];
  selectedMoods: string[];
  onToggleSubject: (s: string) => void;
  onToggleMood: (m: string) => void;
}

const SubjectMoodFilter = memo(({
  selectedSubjects, selectedMoods, onToggleSubject, onToggleMood,
}: SubjectMoodFilterProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>주제</Text>
        <Text style={styles.sectionSubtitle}>무엇을 그릴 것인가?</Text>
        <View style={styles.chipGrid}>
          {SUBJECTS.map((item) => {
            const isSelected = selectedSubjects.includes(item);
            return (
              <TouchableOpacity
                key={item}
                onPress={() => onToggleSubject(item)}
                activeOpacity={0.75}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>감성</Text>
        <Text style={styles.sectionSubtitle}>어떤 느낌을 줄 것인가?</Text>
        <View style={styles.chipGrid}>
          {MOODS.map((item) => {
            const isSelected = selectedMoods.includes(item);
            return (
              <TouchableOpacity
                key={item}
                onPress={() => onToggleMood(item)}
                activeOpacity={0.75}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
});

SubjectMoodFilter.displayName = 'SubjectMoodFilter';
export default SubjectMoodFilter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
  },
  section: {
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    padding: 16,
    gap: 12,
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
    marginTop: -8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  chipText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
  },
  chipTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
});
