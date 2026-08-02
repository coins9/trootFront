import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { COLORS } from '../../theme/colors';
import { AdStatMetric } from '../../../domain/entities/artistAdTypes';

interface Props {
  label: string;
  metric: AdStatMetric;
}

const StatBar = memo(({ label, metric }: Props) => {
  const ratio = useMemo(() => {
    if (metric.goal <= 0) return 0;
    return Math.min(1, Math.max(0, metric.current / metric.goal));
  }, [metric]);
  const pct: DimensionValue = `${Math.round(ratio * 100)}%` as DimensionValue;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {metric.current.toLocaleString()}
        <Text style={styles.unit}>{metric.unit}</Text>
      </Text>
      <Text style={styles.goal}>/ {metric.goal.toLocaleString()}{metric.unit}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: pct }]} />
      </View>
    </View>
  );
});
StatBar.displayName = 'StatBar';
export default StatBar;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  value: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  unit: {
    fontSize: 12,
    fontWeight: '700',
  },
  goal: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray3,
    overflow: 'hidden',
    marginTop: 6,
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.gold,
  },
});
