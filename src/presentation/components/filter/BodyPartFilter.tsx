import React, { useState, memo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import {
  ChevronDownIcon, ChevronUpIcon,
  HeadNeckIcon, ArmFlexIcon, TorsoIcon, BackIcon, LegFootIcon, SpecialIcon,
} from '../icons';
import { BODY_PARTS } from '../../../data/mock/mockData';

interface BodyPartFilterProps {
  selected: string[];
  onToggle: (part: string) => void;
}

const CATEGORY_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  '머리·목': HeadNeckIcon,
  '팔·손': ArmFlexIcon,
  '상체': TorsoIcon,
  '등': BackIcon,
  '하체·발': LegFootIcon,
  '특수/연장': SpecialIcon,
};

const BodyPartFilter = memo(({ selected, onToggle }: BodyPartFilterProps) => {
  const [expanded, setExpanded] = useState<string[]>(['머리·목', '팔·손', '하체·발']);

  const toggleExpand = useCallback((category: string) => {
    setExpanded((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  }, []);

  return (
    <View style={styles.container}>
      {BODY_PARTS.map((section, idx) => {
        const isExpanded = expanded.includes(section.category);
        const selectedCount = section.parts.filter((p) => selected.includes(p)).length;
        const Icon = CATEGORY_ICONS[section.category] ?? SpecialIcon;

        return (
          <View key={section.category} style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => toggleExpand(section.category)}
              activeOpacity={0.8}
            >
              <View style={styles.headerLeft}>
                <Icon size={20} color={COLORS.gold} />
                <Text style={styles.headerNum}>{idx + 1}.</Text>
                <Text style={styles.headerTitle}>{section.category}</Text>
                {selectedCount > 0 && <View style={styles.dot} />}
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
    </View>
  );
});

BodyPartFilter.displayName = 'BodyPartFilter';
export default BodyPartFilter;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  headerNum: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.gold,
    marginLeft: 2,
  },
  partsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 2,
  },
  partChip: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.sheet,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  partChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.gold,
  },
  partText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  partTextActive: {
    color: COLORS.black,
    fontWeight: '700',
  },
});
