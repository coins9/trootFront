import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  FlatList, Dimensions, StyleSheet, View,
  ViewToken, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PagerCarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  width?: number;
  height: number;
  onIndexChange?: (idx: number) => void;
  initialIndex?: number;
  keyExtractor?: (item: T, index: number) => string;
  ItemSeparatorHeight?: number;
}

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 55,
  minimumViewTime: 40,
};

function PagerCarouselInner<T>(
  {
    data,
    renderItem,
    width = SCREEN_WIDTH,
    height,
    onIndexChange,
    initialIndex = 0,
    keyExtractor,
  }: PagerCarouselProps<T>,
  ref: React.Ref<FlatList<T>>,
) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeRef = useRef(initialIndex);

  const handleViewable = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first && typeof first.index === 'number' && first.index !== activeRef.current) {
        activeRef.current = first.index;
        setActiveIndex(first.index);
        onIndexChange?.(first.index);
      }
    },
    [onIndexChange],
  );

  const viewabilityPairs = useRef([
    { viewabilityConfig: VIEWABILITY_CONFIG, onViewableItemsChanged: handleViewable },
  ]).current;

  const getItemLayout = useCallback(
    (_: ArrayLike<T> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActiveIndex(idx);
        onIndexChange?.(idx);
      }
    },
    [width, onIndexChange],
  );

  const renderRow = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <View style={{ width, height }}>{renderItem(item, index)}</View>
    ),
    [width, height, renderItem],
  );

  const defaultKeyExtractor = useCallback(
    (item: T, index: number) => keyExtractor?.(item, index) ?? String(index),
    [keyExtractor],
  );

  const listStyle = useMemo(() => ({ width, height }), [width, height]);

  return (
    <FlatList
      ref={ref}
      data={data}
      renderItem={renderRow}
      keyExtractor={defaultKeyExtractor}
      horizontal
      pagingEnabled
      snapToInterval={width}
      snapToAlignment="start"
      disableIntervalMomentum
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      getItemLayout={getItemLayout}
      initialScrollIndex={initialIndex}
      onMomentumScrollEnd={onMomentumScrollEnd}
      viewabilityConfigCallbackPairs={viewabilityPairs}
      windowSize={3}
      maxToRenderPerBatch={2}
      initialNumToRender={1}
      removeClippedSubviews
      style={listStyle}
      scrollEventThrottle={16}
      overScrollMode="never"
      bounces={false}
      // hint to native driver
      extraData={activeIndex}
    />
  );
}

const PagerCarousel = React.forwardRef(PagerCarouselInner) as <T>(
  props: PagerCarouselProps<T> & { ref?: React.Ref<FlatList<T>> },
) => React.ReactElement;

export default PagerCarousel;

// convenience Dot Indicator component (uncontrolled by pager)
export const PagerDots = ({
  count,
  activeIndex,
  dotColor = 'rgba(255,255,255,0.4)',
  activeColor = '#FFFFFF',
}: {
  count: number;
  activeIndex: number;
  dotColor?: string;
  activeColor?: string;
}) => (
  <View style={dotStyles.row} pointerEvents="none">
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        style={[
          dotStyles.dot,
          { backgroundColor: dotColor },
          i === activeIndex && [dotStyles.dotActive, { backgroundColor: activeColor }],
        ]}
      />
    ))}
  </View>
);

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
  },
});
