import React, { useState, memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { ChevronDownIcon, ChevronUpIcon } from '../icons';
import { BODY_PARTS } from '../../../data/mock/mockData';

interface BodyPartFilterProps {
  selected: string[];
  onToggle: (part: string) => void;
}

const BodyPartFilter = memo(({ selected, onToggle }: BodyPartFilterProps) => {
  const [expanded, setExpanded] = useState<string[]>(['머리·목', '팔·손']);

  const toggleExpand = (category: string) => {
    setExpanded((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {BODY_PARTS.map((section) => {
        const isExpanded = expanded.includes(section.category);
        const selectedCount = section.parts.filter((p) => selected.includes(p)).length;

        return (
          <View key={section.category} style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleExpand(section.category)}
              activeOpacity={0.8}
            >
              <View style={styles.sectionLeft}>
                <Text style={styles.sectionNumber}>{section.icon}.</Text>
                <Text style={styles.sectionTitle}>{section.category}</Text>
                {selectedCount > 0 && (
                  <View style={styles.dot} />
                )}
              </View>
              {isExpanded
                ? <ChevronUpIcon size={18} color={COLORS.gray} />
                : <ChevronDownIcon size={18} color={COLORS.gray} />
              }
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.partsContainer}>
                {section.parts.map((part) => {
                  const isSelected = selected.includes(part);
                  return (
                    <TouchableOpacity
                      key={part}
                      onPress={() => onToggle(part)}
                      activeOpacity={0.75}
                      style={[styles.partChip, isSelected && styles.partChipActive]}
                    >
                      <Text style={[styles.partText, isSelected && styles.partTextActive]}>
                        {part}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
});

BodyPartFilter.displayName = 'BodyPartFilter';
export default BodyPartFilter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionNumber: {
    color: COLORS.gray,
    fontSize: 15,
    lineHeight: 20,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.gold,
    marginLeft: 4,
  },
  partsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 14,
  },
  partChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  partChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  partText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
  },
  partTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
});
