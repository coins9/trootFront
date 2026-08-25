import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import {
  RegionIcon, GenreIcon, BodyPartIconSvg, SubjectIcon, WonIcon,
  FilterSlidersIcon, ChevronDownIcon,
} from '../icons';
import { FilterType } from '../../../domain/entities/types';
import { useFilterStore } from '../../store/filterStore';
import { useTranslation } from '../../store/languageStore';

const CITY_LABEL_EN: Record<string, string> = {
  '서울': 'Seoul',
  '경기도': 'Gyeonggi',
  '부산광역시': 'Busan',
  '대구광역시': 'Daegu',
  '인천광역시': 'Incheon',
  '광주광역시': 'Gwangju',
  '울산광역시': 'Ulsan',
  '세종특별자치시': 'Sejong',
};

interface FilterBarProps {
  onFilterPress: (type: FilterType) => void;
}

const FilterBar = memo(({ onFilterPress }: FilterBarProps) => {
  const { genres, bodyParts, subjects, moods, budgetMin, budgetMax, region } = useFilterStore();
  const { t, language } = useTranslation();

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
      label: region.city
        ? (language === 'en' ? (CITY_LABEL_EN[region.city] ?? region.city) : region.city)
        : t('filter.region'),
      Icon: RegionIcon,
      active: !!region.city,
    },
    {
      type: 'genre',
      label: (t as any)('filter.genre.label'),
      count: genreCount || 14,
      Icon: GenreIcon,
      active: genreCount > 0,
    },
    {
      type: 'bodyPart',
      label: (t as any)('filter.bodyPart.label'),
      count: bodyPartCount || 30,
      Icon: BodyPartIconSvg,
      active: bodyPartCount > 0,
    },
    {
      type: 'subject',
      label: (t as any)('filter.subject.label'),
      Icon: SubjectIcon,
      active: subjects.length > 0 || moods.length > 0,
    },
    {
      type: 'budget',
      label: t('filter.budget'),
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
        style={styles.scroll}
      >
        {buttons.map((btn) => (
          <TouchableOpacity
            key={btn.type}
            onPress={() => onFilterPress(btn.type)}
            activeOpacity={0.75}
            style={[styles.filterBtn, btn.active && styles.filterBtnActive]}
          >
            <btn.Icon
              size={13}
              color={btn.active ? COLORS.gold : COLORS.gray}
            />
            <Text style={[styles.filterLabel, btn.active && styles.filterLabelActive]}>
              {btn.label}
              {btn.count !== undefined ? ` (${btn.count})` : ''}
            </Text>
            <ChevronDownIcon
              size={11}
              color={btn.active ? COLORS.gold : COLORS.gray}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        onPress={() => onFilterPress('full')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.sliderBtn}
      >
        <FilterSlidersIcon size={17} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
});

FilterBar.displayName = 'FilterBar';
export default FilterBar;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    paddingRight: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    alignItems: 'center',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  filterBtnActive: {
    borderColor: COLORS.gold,
  },
  filterLabel: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  filterLabelActive: {
    color: COLORS.gold,
  },
  sliderBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
