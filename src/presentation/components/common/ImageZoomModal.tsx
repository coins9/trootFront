import React, { useCallback, useRef, useState } from 'react';
import {
  Modal, View, Image, ScrollView, FlatList,
  TouchableOpacity, Dimensions, StyleSheet, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XIcon } from '../icons';
import { COLORS } from '../../theme/colors';

const { width: W, height: H } = Dimensions.get('window');

interface Props {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageZoomModal = ({ visible, images, initialIndex = 0, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleLayout = useCallback(() => {
    if (initialIndex > 0) {
      listRef.current?.scrollToIndex({ index: initialIndex, animated: false });
    }
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const renderItem = useCallback(({ item: uri }: { item: string }) => (
    <ScrollView
      style={styles.imageWrapper}
      contentContainerStyle={styles.imageContent}
      maximumZoomScale={4}
      minimumZoomScale={1}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      centerContent
    >
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
    </ScrollView>
  ), []);

  const keyExtractor = useCallback((_: string, i: number) => `zoom-${i}`, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({ length: W, offset: W * index, index }),
    [],
  );

  const onMomentumScrollEnd = useCallback(
    (e: any) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / W);
      setCurrentIndex(idx);
    },
    [],
  );

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={images}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={getItemLayout}
          onLayout={handleLayout}
          onMomentumScrollEnd={onMomentumScrollEnd}
          windowSize={3}
          maxToRenderPerBatch={2}
          initialNumToRender={1}
        />

        <TouchableOpacity
          style={[styles.closeBtn, { top: insets.top + 12 }]}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <XIcon size={22} color={COLORS.white} />
        </TouchableOpacity>

        {images.length > 1 && (
          <View style={[styles.dots, { bottom: insets.bottom + 20 }]}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

export default ImageZoomModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageWrapper: {
    width: W,
    height: H,
  },
  imageContent: {
    width: W,
    height: H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: W,
    height: H,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: COLORS.white,
    width: 18,
  },
});
