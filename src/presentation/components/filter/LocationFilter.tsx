import React, { useState, memo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { CheckCircleIcon } from '../icons';
import { CITIES, DISTRICTS } from '../../../data/mock/mockData';

interface LocationFilterProps {
  selectedCity: string | null;
  selectedDistrict: string | null;
  onSelect: (city: string | null, district: string | null) => void;
}

const LocationFilter = memo(({ selectedCity, selectedDistrict, onSelect }: LocationFilterProps) => {
  const [activeTab, setActiveTab] = useState<'city' | 'district'>('city');
  const districts = selectedCity ? (DISTRICTS[selectedCity] ?? []) : [];

  const handleCityPress = (city: string) => {
    if (selectedCity === city) {
      onSelect(null, null);
    } else {
      onSelect(city, null);
    }
  };

  const handleDistrictPress = (district: string) => {
    if (selectedDistrict === district) {
      onSelect(selectedCity, null);
    } else {
      onSelect(selectedCity, district);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'city' && styles.tabActive]}
          onPress={() => setActiveTab('city')}
        >
          <Text style={[styles.tabText, activeTab === 'city' && styles.tabTextActive]}>시 / 도</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'district' && styles.tabActive]}
          onPress={() => setActiveTab('district')}
        >
          <Text style={[styles.tabText, activeTab === 'district' && styles.tabTextActive]}>구 / 군</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'city' ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {CITIES.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                style={[styles.listItem, isSelected && styles.listItemActive]}
                onPress={() => handleCityPress(city)}
              >
                <Text style={[styles.listItemText, isSelected && styles.listItemTextActive]}>
                  {city}
                </Text>
                {isSelected && <CheckCircleIcon size={22} color={COLORS.gold} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {selectedCity ? (
            districts.map((dist) => {
              const isSelected = selectedDistrict === dist;
              return (
                <TouchableOpacity
                  key={dist}
                  style={[styles.listItem, isSelected && styles.listItemActive]}
                  onPress={() => handleDistrictPress(dist)}
                >
                  <Text style={[styles.listItemText, isSelected && styles.listItemTextActive]}>
                    {dist}
                  </Text>
                  {isSelected && <CheckCircleIcon size={22} color={COLORS.gold} />}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>시/도를 먼저 선택해주세요</Text>
            </View>
          )}
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
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
  },
  tabActive: {
    backgroundColor: COLORS.gold,
  },
  tabText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  tabTextActive: {
    color: COLORS.black,
  },
  list: {
    maxHeight: 300,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  listItemActive: {
    borderColor: COLORS.gold,
  },
  listItemText: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 20,
  },
  listItemTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 20,
  },
});
