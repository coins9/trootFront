import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BannerImageItem } from '../../../data/content/settingsApi';
import { handleBannerLink } from '../../utils/bannerNavigation';

const { width: W } = Dimensions.get('window');
const H_PAD = 16;
const BANNER_W = W - H_PAD * 2;
const BANNER_H = 120;

interface Props {
  items: BannerImageItem[];
}

const BannerCarousel = memo(({ items }: Props) => {
  const valid = items.filter((x) => x.imageUrl);
  if (valid.length === 0) return null;

  const navigation = useNavigation<any>();
  const [active, setActive] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActive(viewableItems[0].index ?? 0);
  }, []);

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = useCallback(({ item }: { item: BannerImageItem }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.slide}
      onPress={() => handleBannerLink(item.linkUrl, (screen) => navigation.navigate(screen as never))}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.img} resizeMode="cover" />
    </TouchableOpacity>
  ), [navigation]);

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={valid}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_W + 8}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        contentContainerStyle={styles.listContent}
        getItemLayout={(_, index) => ({ length: BANNER_W + 8, offset: (BANNER_W + 8) * index, index })}
      />
      {valid.length > 1 && (
        <View style={styles.dots}>
          {valid.map((_, i) => (
            <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
});

BannerCarousel.displayName = 'BannerCarousel';
export default BannerCarousel;

const styles = StyleSheet.create({
  wrap: {
    marginTop: 6,
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    gap: 8,
  },
  slide: {
    width: BANNER_W,
    height: BANNER_H,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  img: {
    width: BANNER_W,
    height: BANNER_H,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    backgroundColor: '#D4A843',
    width: 14,
  },
});
