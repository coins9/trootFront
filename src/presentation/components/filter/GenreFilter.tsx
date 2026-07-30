import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { GENRES } from '../../../data/mock/mockData';

interface GenreFilterProps {
  selected: string[];
  onToggle: (genre: string) => void;
  variant?: 'sheet' | 'compact';
}

const GenreFilter = memo(({ selected, onToggle, variant = 'sheet' }: GenreFilterProps) => {
  if (variant === 'compact') {
    return (
      <View style={styles.compactGrid}>
        {GENRES.map((genre) => {
          const isSelected = selected.includes(genre);
          return (
            <TouchableOpacity
              key={genre}
              onPress={() => onToggle(genre)}
              activeOpacity={0.75}
              style={[styles.compactChip, isSelected && styles.compactChipActive]}
            >
              <Text style={[styles.compactText, isSelected && styles.compactTextActive]}>
                {genre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  const rows: string[][] = [];
  for (let i = 0; i < GENRES.length; i += 2) {
    rows.push(GENRES.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((genre) => {
            const isSelected = selected.includes(genre);
            return (
              <TouchableOpacity
                key={genre}
                onPress={() => onToggle(genre)}
                activeOpacity={0.75}
                style={[styles.btn, isSelected && styles.btnActive]}
              >
                <Text style={[styles.btnText, isSelected && styles.btnTextActive]}>
                  {genre}
                </Text>
              </TouchableOpacity>
            );
          })}
          {row.length === 1 && <View style={styles.btn} />}
        </View>
      ))}
    </View>
  );
});

GenreFilter.displayName = 'GenreFilter';
export default GenreFilter;

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  btnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  btnTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  /* compact (full filter modal) */
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compactChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  compactChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  compactText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  compactTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
});
