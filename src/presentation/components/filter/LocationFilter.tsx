import React, { memo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { CheckCircleIcon } from '../icons';
import { CITIES, DISTRICTS } from '../../../data/mock/mockData';
import { useTranslation } from '../../store/languageStore';

interface LocationFilterProps {
  selectedCity: string | null;
  selectedDistrict: string | null;
  onSelect: (city: string | null, district: string | null) => void;
}

const LocationFilter = memo(({ selectedCity, selectedDistrict, onSelect }: LocationFilterProps) => {
  const districts = selectedCity ? (DISTRICTS[selectedCity] ?? []) : [];
  const { t } = useTranslation();

  const handleCityPress = useCallback((city: string) => {
    if (selectedCity === city) {
      onSelect(null, null);
    } else {
      onSelect(city, null);
    }
  }, [selectedCity, onSelect]);

  const handleDistrictPress = useCallback((dist: string) => {
    if (selectedDistrict === dist) {
      onSelect(selectedCity, null);
    } else {
      onSelect(selectedCity, dist);
    }
  }, [selectedCity, selectedDistrict, onSelect]);

  return (
    <View style={styles.container}>
      {/* Column headers */}
      <View style={styles.colHeaders}>
        <View style={[styles.colHeader, styles.colHeaderActive]}>
          <Text style={styles.colHeaderTextActive}>{t('filter.regionSido')}</Text>
        </View>
        <View style={styles.colHeaderGap} />
        <View style={styles.colHeader}>
          <Text style={styles.colHeaderText}>{t('filter.regionSigungu')}</Text>
        </View>
      </View>

      {/* Side-by-side scrollable lists */}
      <View style={styles.lists}>
        {/* Left: City list */}
        <ScrollView
          style={styles.col}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {CITIES.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                style={[styles.listItem, isSelected && styles.listItemActive]}
                onPress={() => handleCityPress(city)}
                activeOpacity={0.75}
              >
                <Text
                  style={[styles.listItemText, isSelected && styles.listItemTextActive]}
                  numberOfLines={1}
                >
                  {city}
                </Text>
                {isSelected && (
                  <CheckCircleIcon size={20} color={COLORS.gold} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Divider */}
        <View style={styles.colDivider} />

        {/* Right: District list */}
        <ScrollView
          style={styles.col}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {selectedCity ? (
            districts.map((dist) => {
              const isSelected = selectedDistrict === dist;
              return (
                <TouchableOpacity
                  key={dist}
                  style={[styles.listItem, isSelected && styles.listItemActive]}
                  onPress={() => handleDistrictPress(dist)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[styles.listItemText, isSelected && styles.listItemTextActive]}
                    numberOfLines={1}
                  >
                    {dist}
                  </Text>
                  {isSelected && (
                    <CheckCircleIcon size={20} color={COLORS.gold} />
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('filter.regionSelectFirst')}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
});

LocationFilter.displayName = 'LocationFilter';
export default LocationFilter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  colHeaders: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  colHeaderGap: {
    width: 10,
  },
  colHeader: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
  },
  colHeaderActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  colHeaderText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  colHeaderTextActive: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  lists: {
    flexDirection: 'row',
    maxHeight: 320,
  },
  col: {
    flex: 1,
  },
  colDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    marginBottom: 4,
  },
  listItemActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  listItemText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  listItemTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.gray3,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
