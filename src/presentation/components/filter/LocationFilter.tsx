import React, { memo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { CheckCircleIcon } from '../icons';
import { CITIES, DISTRICTS } from '../../../data/mock/mockData';
import { OVERSEAS_COUNTRY_GROUPS } from '../../../domain/entities/overseasCountries';

interface LocationFilterProps {
  regionMode: 'domestic' | 'overseas';
  selectedCity: string | null;
  selectedDistrict: string | null;
  selectedCountryCode: string | null;
  onModeChange: (mode: 'domestic' | 'overseas') => void;
  onSelect: (city: string | null, district: string | null) => void;
  onSelectOverseas: (code: string | null, name: string | null) => void;
}

const LocationFilter = memo(({
  regionMode,
  selectedCity,
  selectedDistrict,
  selectedCountryCode,
  onModeChange,
  onSelect,
  onSelectOverseas,
}: LocationFilterProps) => {
  const districts = selectedCity ? (DISTRICTS[selectedCity] ?? []) : [];

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

  const handleCountryPress = useCallback((code: string, name: string) => {
    if (selectedCountryCode === code) {
      onSelectOverseas(null, null);
    } else {
      onSelectOverseas(code, name);
    }
  }, [selectedCountryCode, onSelectOverseas]);

  return (
    <View style={styles.container}>
      {/* 국내 / 해외 탭 */}
      <View style={styles.modeTab}>
        <TouchableOpacity
          style={[styles.modeBtn, regionMode === 'domestic' && styles.modeBtnActive]}
          onPress={() => onModeChange('domestic')}
          activeOpacity={0.75}
        >
          <Text style={[styles.modeBtnText, regionMode === 'domestic' && styles.modeBtnTextActive]}>
            국내
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, regionMode === 'overseas' && styles.modeBtnActive]}
          onPress={() => onModeChange('overseas')}
          activeOpacity={0.75}
        >
          <Text style={[styles.modeBtnText, regionMode === 'overseas' && styles.modeBtnTextActive]}>
            해외
          </Text>
        </TouchableOpacity>
      </View>

      {regionMode === 'domestic' ? (
        <View>
          {/* Column headers */}
          <View style={styles.colHeaders}>
            <View style={[styles.colHeader, styles.colHeaderActive]}>
              <Text style={styles.colHeaderTextActive}>시 / 도</Text>
            </View>
            <View style={styles.colHeaderGap} />
            <View style={styles.colHeader}>
              <Text style={styles.colHeaderText}>구 / 군</Text>
            </View>
          </View>

          {/* Side-by-side scrollable lists */}
          <View style={styles.lists}>
            <ScrollView style={styles.col} showsVerticalScrollIndicator={false} bounces={false}>
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
                    {isSelected && <CheckCircleIcon size={20} color={COLORS.gold} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.colDivider} />

            <ScrollView style={styles.col} showsVerticalScrollIndicator={false} bounces={false}>
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
                      {isSelected && <CheckCircleIcon size={20} color={COLORS.gold} />}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>{'시/도를 먼저\n선택하세요'}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} bounces={false} style={styles.overseasScroll}>
          {OVERSEAS_COUNTRY_GROUPS.map((group) => (
            <View key={group.region} style={styles.countryGroup}>
              <Text style={styles.countryGroupLabel}>{group.region}</Text>
              <View style={styles.countryRow}>
                {group.countries.map((country) => {
                  const isSelected = selectedCountryCode === country.code;
                  return (
                    <TouchableOpacity
                      key={country.code}
                      style={[styles.countryChip, isSelected && styles.countryChipActive]}
                      onPress={() => handleCountryPress(country.code, country.name)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.countryChipText, isSelected && styles.countryChipTextActive]}>
                        {country.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
});

LocationFilter.displayName = 'LocationFilter';
export default LocationFilter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeTab: {
    flexDirection: 'row',
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  modeBtnActive: {
    backgroundColor: COLORS.gold,
  },
  modeBtnText: {
    color: COLORS.gray,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  modeBtnTextActive: {
    color: COLORS.black,
    fontWeight: '700',
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
    maxHeight: 260,
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
  overseasScroll: {
    maxHeight: 300,
  },
  countryGroup: {
    marginBottom: 20,
  },
  countryGroupLabel: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  countryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  countryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
  },
  countryChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  countryChipText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
  },
  countryChipTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
});
