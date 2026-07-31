import React, { memo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Alert, TextInput,
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import { CameraAddIcon, XIcon } from '../../icons';

interface ReferenceStepProps {
  images: string[];
  text: string;
  onImagesChange: (images: string[]) => void;
  onTextChange: (text: string) => void;
}

const MAX_IMAGES = 5;
const MAX_TEXT = 500;

const MOCK_REFS = [
  'https://picsum.photos/seed/tref1/300/300',
  'https://picsum.photos/seed/tref2/300/300',
  'https://picsum.photos/seed/tref3/300/300',
  'https://picsum.photos/seed/tref4/300/300',
  'https://picsum.photos/seed/tref5/300/300',
];

const ReferenceStep = memo(({ images, text, onImagesChange, onTextChange }: ReferenceStepProps) => {
  const hasAny = images.length > 0 || text.trim().length > 0;

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
          <Text style={styles.sectionTitle}>레퍼런스</Text>
        </View>
        <Text style={styles.required}>필수</Text>
      </View>
      <Text style={styles.sectionSub}>
        원하는 타투 스타일의 <Text style={styles.highlight}>사진 또는 설명 텍스트</Text> 중{'\n'}
        최소 하나는 반드시 입력해 주세요.
      </Text>

      {/* 사진 첨부 */}
      <Text style={styles.subLabel}>사진 첨부 (최대 {MAX_IMAGES}장)</Text>
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

      {/* OR divider */}
      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>또는</Text>
        <View style={styles.orLine} />
      </View>

      {/* 텍스트 입력 */}
      <Text style={styles.subLabel}>글로 설명하기</Text>
      <View style={styles.textAreaWrap}>
        <TextInput
          style={styles.textArea}
          value={text}
          onChangeText={(t) => onTextChange(t.slice(0, MAX_TEXT))}
          placeholder={
            '예) 검정 잉크로 미니멀한 라인, 손목 안쪽 3cm 정도, 참고할 만한 인스타 링크 등 자유롭게 적어주세요.'
          }
          placeholderTextColor={COLORS.gray2}
          multiline
          textAlignVertical="top"
          maxLength={MAX_TEXT}
        />
        <Text style={styles.charCount}>
          {text.length} / {MAX_TEXT}
        </Text>
      </View>

      {!hasAny && (
        <Text style={styles.hint}>
          사진 또는 설명 텍스트 중 하나는 반드시 입력해야 합니다.
        </Text>
      )}
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
  required: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sectionSub: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  highlight: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  subLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 10,
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
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 18,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  textAreaWrap: {
    position: 'relative',
  },
  textArea: {
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 28,
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 21,
    minHeight: 110,
  },
  charCount: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  hint: {
    color: COLORS.gray2,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
    textAlign: 'center',
  },
});
