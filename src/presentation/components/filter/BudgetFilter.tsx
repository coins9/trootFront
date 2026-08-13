import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import DualRangeSlider from './DualRangeSlider';

// 최대 1천만원, 최상단은 '무제한(그 이상)' 의미
const MAX_PRICE = 10000000;
const MIN_PRICE = 0;
const STEP = 100000;

interface BudgetFilterProps {
  budgetMin: number;
  budgetMax: number;
  onChangeBudget: (min: number, max: number) => void;
}

// 최대치(1천만)는 상한이 아니라 '그 이상' 이므로 무제한으로 표기
const formatWon = (value: number) =>
  value >= MAX_PRICE ? '무제한' : `${value.toLocaleString()}원`;

const BudgetFilter = memo(({ budgetMin, budgetMax, onChangeBudget }: BudgetFilterProps) => {
  const [localMin, setLocalMin] = useState(budgetMin);
  const [localMax, setLocalMax] = useState(budgetMax);

  useEffect(() => {
    setLocalMin(budgetMin);
    setLocalMax(budgetMax);
  }, [budgetMin, budgetMax]);

  const handleSliderChange = useCallback((min: number, max: number) => {
    setLocalMin(min);
    setLocalMax(max);
    onChangeBudget(min, max);
  }, [onChangeBudget]);

  const handleMinInput = (text: string) => {
    const val = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
    const clamped = Math.max(MIN_PRICE, Math.min(val, localMax - STEP));
    setLocalMin(clamped);
    onChangeBudget(clamped, localMax);
  };

  const handleMaxInput = (text: string) => {
    const val = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
    const clamped = Math.min(MAX_PRICE, Math.max(val, localMin + STEP));
    setLocalMax(clamped);
    onChangeBudget(localMin, clamped);
  };

  return (
    <View style={styles.container}>
      <DualRangeSlider
        min={localMin}
        max={localMax}
        step={STEP}
        totalMin={MIN_PRICE}
        totalMax={MAX_PRICE}
        onChange={handleSliderChange}
        formatLabel={formatWon}
      />

      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>0원</Text>
        <Text style={styles.rangeLabel}>1,000만원+ (무제한)</Text>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>최소 금액</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={localMin.toLocaleString()}
              onChangeText={handleMinInput}
              keyboardType="numeric"
              selectTextOnFocus
              placeholderTextColor={COLORS.gray2}
            />
            <Text style={styles.inputSuffix}>원</Text>
          </View>
        </View>
        <Text style={styles.separator}>~</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>최대 금액</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={localMax >= MAX_PRICE ? '무제한' : localMax.toLocaleString()}
              onChangeText={handleMaxInput}
              keyboardType="numeric"
              selectTextOnFocus
              placeholderTextColor={COLORS.gray2}
            />
            <Text style={styles.inputSuffix}>원</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

BudgetFilter.displayName = 'BudgetFilter';
export default BudgetFilter;

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  rangeLabel: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 26,
  },
  inputGroup: {
    flex: 1,
    gap: 8,
  },
  inputLabel: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: COLORS.elevated,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    padding: 0,
  },
  inputSuffix: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 4,
  },
  separator: {
    color: COLORS.gray,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 14,
  },
});
