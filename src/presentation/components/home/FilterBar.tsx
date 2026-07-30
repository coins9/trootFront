import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import {
  RegionIcon, GenreIcon, BodyPartIconSvg, SubjectIcon, WonIcon,
  FilterSlidersIcon, ChevronDownIcon,
} from '../icons';
import { FilterType } from '../../../domain/entities/types';
import { useFilterStore } from '../../store/filterStore';

interface FilterBarProps {
  onFilterPress: (type: FilterType) => void;
}

const FilterBar = memo(({ onFilterPress }: FilterBarProps) => {
  const { genres, bodyParts, subjects, moods, budgetMin, budgetMax, region } = useFilterStore();

  const genreCount = genres.length;
  const bodyPartCount = bodyParts.length;
  const hasBudget = budgetMin > 0 || budgetMax < 500000;

  const buttons: {
    type: FilterType;
    label: string;
    count?: number;
    Icon: React.ComponentType<any>;
    active: boolean;
  }[] = [
    {
      type: 'region',
      label: region.city ?? '지역',
      Icon: RegionIcon,
      active: !!region.city,
    },
    {
      type: 'genre',
      label: '장르',
      count: genreCount || 14,
      Icon: GenreIcon,
      active: genreCount > 0,
    },
    {
      type: 'bodyPart',
      label: '부위',
      count: bodyPartCount || 30,
      Icon: BodyPartIconSvg,
      active: bodyPartCount > 0,
    },
    {
      type: 'subject',
      label: '주제/감성',
      Icon: SubjectIcon,
      active: subjects.length > 0 || moods.length > 0,
    },
    {
      type: 'budget',
      label: '예산',
      Icon: WonIcon,
      active: hasBudget,
    },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {buttons.map((btn) => (
          <TouchableOpacity
            key={btn.type}
            onPress={() => onFilterPress(btn.type)}
            activeOpacity={0.75}
            style={[styles.filterBtn, btn.active && styles.filterBtnActive]}
          >
            <btn.Icon
              size={14}
              color={btn.active ? COLORS.gold : COLORS.gray}
            />
            <Text style={[styles.filterLabel, btn.active && styles.filterLabelActive]}>
              {btn.label}
              {btn.count !== undefined ? ` (${btn.count})` : ''}
            </Text>
            <ChevronDownIcon
              size={12}
              color={btn.active ? COLORS.gold : COLORS.gray}
            />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => onFilterPress('full')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.sliderBtn}
        >
          <FilterSlidersIcon size={18} color={COLORS.white} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
});

FilterBar.displayName = 'FilterBar';
export default FilterBar;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterBtnActive: {
    borderColor: COLORS.gold,
  },
  filterLabel: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  filterLabelActive: {
    color: COLORS.gold,
  },
  sliderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
