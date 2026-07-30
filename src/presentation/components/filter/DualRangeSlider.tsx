import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View, Text, PanResponder, Animated, StyleSheet, Dimensions,
} from 'react-native';
import { COLORS } from '../../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TRACK_PADDING = 48;
const TRACK_WIDTH = SCREEN_WIDTH - TRACK_PADDING * 2;
const THUMB_SIZE = 22;
const MIN_GAP = 20;
const BUBBLE_WIDTH = 84;

interface DualRangeSliderProps {
  min: number;
  max: number;
  step: number;
  totalMin: number;
  totalMax: number;
  onChange: (min: number, max: number) => void;
  formatLabel?: (value: number) => string;
}

const DualRangeSlider = ({
  min, max, step, totalMin, totalMax, onChange, formatLabel,
}: DualRangeSliderProps) => {
  const posToValue = useCallback(
    (pos: number) => {
      const ratio = pos / TRACK_WIDTH;
      const rawValue = totalMin + ratio * (totalMax - totalMin);
      return Math.round(rawValue / step) * step;
    },
    [totalMin, totalMax, step],
  );

  const valueToPos = useCallback(
    (value: number) => {
      return ((value - totalMin) / (totalMax - totalMin)) * TRACK_WIDTH;
    },
    [totalMin, totalMax],
  );

  const minPosRef = useRef(valueToPos(min));
  const maxPosRef = useRef(valueToPos(max));
  const minAnim = useRef(new Animated.Value(valueToPos(min))).current;
  const maxAnim = useRef(new Animated.Value(valueToPos(max))).current;

  const [minLabel, setMinLabel] = useState(min);
  const [maxLabel, setMaxLabel] = useState(max);

  useEffect(() => {
    minPosRef.current = valueToPos(min);
    maxPosRef.current = valueToPos(max);
    minAnim.setValue(valueToPos(min));
    maxAnim.setValue(valueToPos(max));
    setMinLabel(min);
    setMaxLabel(max);
  }, [min, max, valueToPos, minAnim, maxAnim]);

  const minPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const newPos = Math.max(0, Math.min(minPosRef.current + gs.dx, maxPosRef.current - MIN_GAP));
        minAnim.setValue(newPos);
        setMinLabel(posToValue(newPos));
      },
      onPanResponderRelease: (_, gs) => {
        const newPos = Math.max(0, Math.min(minPosRef.current + gs.dx, maxPosRef.current - MIN_GAP));
        minPosRef.current = newPos;
        const newMin = posToValue(newPos);
        setMinLabel(newMin);
        onChange(newMin, posToValue(maxPosRef.current));
      },
    }),
  ).current;

  const maxPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const newPos = Math.min(TRACK_WIDTH, Math.max(maxPosRef.current + gs.dx, minPosRef.current + MIN_GAP));
        maxAnim.setValue(newPos);
        setMaxLabel(posToValue(newPos));
      },
      onPanResponderRelease: (_, gs) => {
        const newPos = Math.min(TRACK_WIDTH, Math.max(maxPosRef.current + gs.dx, minPosRef.current + MIN_GAP));
        maxPosRef.current = newPos;
        const newMax = posToValue(newPos);
        setMaxLabel(newMax);
        onChange(posToValue(minPosRef.current), newMax);
      },
    }),
  ).current;

  const minBubbleLeft = minAnim.interpolate({
    inputRange: [0, TRACK_WIDTH],
    outputRange: [0, TRACK_WIDTH],
    extrapolate: 'clamp',
  });
  const maxBubbleLeft = maxAnim.interpolate({
    inputRange: [0, TRACK_WIDTH],
    outputRange: [0, TRACK_WIDTH],
    extrapolate: 'clamp',
  });

  const fmt = formatLabel ?? ((v: number) => `${v}`);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.bubble, { left: Animated.subtract(minBubbleLeft, BUBBLE_WIDTH / 2) }]}
        pointerEvents="none"
      >
        <Text style={styles.bubbleText}>{fmt(minLabel)}</Text>
      </Animated.View>
      <Animated.View
        style={[styles.bubble, { left: Animated.subtract(maxBubbleLeft, BUBBLE_WIDTH / 2) }]}
        pointerEvents="none"
      >
        <Text style={styles.bubbleText}>{fmt(maxLabel)}</Text>
      </Animated.View>

      <View style={styles.track}>
        <Animated.View
          style={[
            styles.activeTrack,
            {
              left: minAnim,
              right: Animated.subtract(TRACK_WIDTH, maxAnim),
            },
          ]}
        />
        <Animated.View
          style={[styles.thumb, { left: Animated.subtract(minAnim, THUMB_SIZE / 2) }]}
          {...minPanResponder.panHandlers}
        />
        <Animated.View
          style={[styles.thumb, { left: Animated.subtract(maxAnim, THUMB_SIZE / 2) }]}
          {...maxPanResponder.panHandlers}
        />
      </View>
    </View>
  );
};

export default DualRangeSlider;

const styles = StyleSheet.create({
  container: {
    width: TRACK_WIDTH,
    alignSelf: 'center',
    marginTop: 8,
    paddingTop: 40,
  },
  track: {
    height: 4,
    backgroundColor: COLORS.chipBorder,
    borderRadius: 2,
    position: 'relative',
  },
  activeTrack: {
    position: 'absolute',
    top: 0,
    height: 4,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: -THUMB_SIZE / 2 + 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: COLORS.gold,
    borderWidth: 3,
    borderColor: COLORS.bg,
    elevation: 4,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  bubble: {
    position: 'absolute',
    top: 0,
    width: BUBBLE_WIDTH,
    paddingVertical: 6,
    backgroundColor: COLORS.elevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
