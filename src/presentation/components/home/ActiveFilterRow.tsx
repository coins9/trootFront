import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { XIcon, PlusIcon, RefreshIcon } from '../icons';
import { useFilterStore } from '../../store/filterStore';
import { useTranslation } from '../../store/languageStore';

interface ActiveFilterRowProps {
  onAddPress?: () => void;
}

const ActiveFilterRow = memo(({ onAddPress }: ActiveFilterRowProps) => {
  const { getActiveFilterChips, removeFilterChip, resetAll } = useFilterStore();
  const { t } = useTranslation();
  const chips = getActiveFilterChips();

  if (chips.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {chips.map((chip, idx) => (
          <View key={`${chip.type}-${chip.label}-${idx}`} style={styles.chip}>
            <Text style={styles.chipText}>{chip.label}</Text>
            <TouchableOpacity
              onPress={() => removeFilterChip(chip.label, chip.type)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <XIcon size={13} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={onAddPress} style={styles.addBtn}>
          <PlusIcon size={14} color={COLORS.white} />
        </TouchableOpacity>
      </ScrollView>
      <TouchableOpacity onPress={resetAll} style={styles.resetBtn}>
        <RefreshIcon size={13} color={COLORS.gray} />
        <Text style={styles.resetText}>{t('common.resetFilters')}</Text>
      </TouchableOpacity>
    </View>
  );
});

ActiveFilterRow.displayName = 'ActiveFilterRow';
export default ActiveFilterRow;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    gap: 8,
    alignItems: 'center',
    paddingRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
});
