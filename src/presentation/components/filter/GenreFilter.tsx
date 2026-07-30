import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { GENRES } from '../../../data/mock/mockData';

interface GenreFilterProps {
  selected: string[];
  onToggle: (genre: string) => void;
}

const GenreFilter = memo(({ selected, onToggle }: GenreFilterProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {GENRES.map((genre) => {
          const isSelected = selected.includes(genre);
          return (
            <TouchableOpacity
              key={genre}
              onPress={() => onToggle(genre)}
              activeOpacity={0.75}
              style={[styles.chip, isSelected && styles.chipActive]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {genre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

GenreFilter.displayName = 'GenreFilter';
export default GenreFilter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    width: '47%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingVertical: 14,
    alignItems: 'center',
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
