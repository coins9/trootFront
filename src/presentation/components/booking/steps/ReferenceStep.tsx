import React, { memo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Alert,
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import { CameraAddIcon, XIcon } from '../../icons';

interface ReferenceStepProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const MAX_IMAGES = 5;

const MOCK_REFS = [
  'https://picsum.photos/seed/tref1/300/300',
  'https://picsum.photos/seed/tref2/300/300',
  'https://picsum.photos/seed/tref3/300/300',
  'https://picsum.photos/seed/tref4/300/300',
  'https://picsum.photos/seed/tref5/300/300',
];

const ReferenceStep = memo(({ images, onImagesChange }: ReferenceStepProps) => {
  const handleAdd = useCallback(() => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('최대 5장까지 첨부 가능합니다.');
      return;
    }
    // 실제 구현 시 react-native-image-picker 연동
    const next = MOCK_REFS[images.length % MOCK_REFS.length];
    onImagesChange([...images, next]);
  }, [images, onImagesChange]);

  const handleRemove = useCallback((idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    onImagesChange(next);
  }, [images, onImagesChange]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLeft}>
          <Text style={styles.sectionNum}>03</Text>
          <CameraAddIcon size={16} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>레퍼런스 첨부</Text>
        </View>
        <Text style={styles.optional}>선택</Text>
      </View>
      <Text style={styles.sectionSub}>
        원하는 타투 스타일의 사진을 첨부해 주세요 (최대 {MAX_IMAGES}장)
      </Text>

      <View style={styles.imageRow}>
        {images.map((uri, idx) => (
          <View key={`${uri}-${idx}`} style={styles.thumbWrapper}>
            {uri ? (
              <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <View style={[styles.thumb, { backgroundColor: COLORS.elevated }]} />
            )}
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(idx)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <XIcon size={10} color={COLORS.white} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        ))}

        {images.length < MAX_IMAGES && (
          <TouchableOpacity
            onPress={handleAdd}
            activeOpacity={0.8}
            style={styles.addBox}
          >
            <CameraAddIcon size={28} color={COLORS.gray2} />
            <Text style={styles.addText}>사진 추가</Text>
            <Text style={styles.addCount}>
              {images.length} / {MAX_IMAGES}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

ReferenceStep.displayName = 'ReferenceStep';
export default ReferenceStep;

const THUMB_SIZE = 88;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionNum: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  optional: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sectionSub: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  thumbWrapper: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    overflow: 'visible',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gray2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBox: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.chipBorder,
    borderStyle: 'dashed',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addText: {
    color: COLORS.gray2,
    fontSize: 11,
    lineHeight: 15,
  },
  addCount: {
    color: COLORS.gray3,
    fontSize: 10,
    lineHeight: 13,
  },
});
