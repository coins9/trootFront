import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Polyline, Circle, Line, Defs, LinearGradient, Stop, Polygon,
} from 'react-native-svg';
import { COLORS } from '../../theme/colors';

interface Props {
  data: number[];
  height?: number;
}

const MiniLineChart = memo(({ data, height = 90 }: Props) => {
  const points = useMemo(() => {
    if (data.length === 0) return { line: '', area: '', last: { x: 0, y: 0 } };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const W = 100;
    const PAD_X = 4;
    const PAD_Y = 6;
    const stepX = (W - PAD_X * 2) / (data.length - 1 || 1);

    const coords = data.map((v, i) => {
      const x = PAD_X + i * stepX;
      const y = PAD_Y + (1 - (v - min) / range) * (height - PAD_Y * 2);
      return { x, y };
    });

    const line = coords.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    const area = `${PAD_X},${height} ${line} ${W - PAD_X},${height}`;
    const last = coords[coords.length - 1];
    return { line, area, last };
  }, [data, height]);

  return (
    <View style={[styles.wrap, { height }]}>
      <Svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.gold} stopOpacity="0.28" />
            <Stop offset="1" stopColor={COLORS.gold} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <Line x1="0" y1={height * 0.5} x2="100" y2={height * 0.5}
          stroke={COLORS.border} strokeWidth={0.4} strokeDasharray="1.2 1.6" />
        <Line x1="0" y1={height - 2} x2="100" y2={height - 2}
          stroke={COLORS.border} strokeWidth={0.4} />

        <Polygon points={points.area} fill="url(#fill)" />
        <Polyline
          points={points.line}
          fill="none"
          stroke={COLORS.gold}
          strokeWidth={1.4}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <Circle cx={points.last.x} cy={points.last.y} r={1.6} fill={COLORS.gold} />
        <Circle cx={points.last.x} cy={points.last.y} r={3.2} fill={COLORS.gold} fillOpacity={0.25} />
      </Svg>
    </View>
  );
});
MiniLineChart.displayName = 'MiniLineChart';
export default MiniLineChart;

const styles = StyleSheet.create({
  wrap: { width: '100%' },
});
