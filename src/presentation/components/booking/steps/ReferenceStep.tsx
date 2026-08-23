import React, { memo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Alert, TextInput,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../../../theme/colors';
import { CameraAddIcon, XIcon } from '../../icons';
import { BookingReferenceImage } from '../../../../domain/entities/bookingTypes';
import { useTranslation } from '../../../store/languageStore';

interface ReferenceStepProps {
  images: BookingReferenceImage[];
  text: string;
  onImagesChange: (images: BookingReferenceImage[]) => void;
  onTextChange: (text: string) => void;
}

const MAX_IMAGES = 5;
const MAX_TEXT = 500;

const ReferenceStep = memo(({ images, text, onImagesChange, onTextChange }: ReferenceStepProps) => {
  const { t } = useTranslation();
  const hasAny = images.length > 0 || text.trim().length > 0;

  // Android content:// URI 는 확장자가 없어 fetch().blob() 전 MIME 추론이 실패하기 쉬우므로
  // 피커가 제공하는 type/fileSize 를 그대로 보존해 업로드 단계로 넘긴다.
  const handleAdd = useCallback(async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert(t('booking.steps.refPhotoMax', { max: MAX_IMAGES }));
      return;
    }
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: MAX_IMAGES - images.length,
        quality: 0.8,
      });
      if (response.didCancel || response.errorCode) return;
      const picked = (response.assets ?? [])
        .filter((a) => !!a.uri)
        .map((a) => ({ uri: a.uri!, type: a.type, fileSize: a.fileSize }));
      if (!picked.length) return;
      onImagesChange([...images, ...picked].slice(0, MAX_IMAGES));
    } catch {
      Alert.alert(t('booking.steps.refPhotoError'));
    }
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
          <Text style={styles.sectionTitle}>{t('booking.steps.refTitle')}</Text>
        </View>
        <Text style={styles.required}>{t('common.required')}</Text>
      </View>
      <Text style={styles.sectionSub}>{t('booking.steps.refSub')}</Text>

      <Text style={styles.subLabel}>{t('booking.steps.refPhotoAttach', { max: MAX_IMAGES })}</Text>
      <View style={styles.imageRow}>
        {images.map((img, idx) => (
          <View key={`${img.uri}-${idx}`} style={styles.thumbWrapper}>
            {img.uri ? (
              <Image source={{ uri: img.uri }} style={styles.thumb} resizeMode="cover" />
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
            <Text style={styles.addText}>{t('booking.steps.refPhotoAdd')}</Text>
            <Text style={styles.addCount}>
              {images.length} / {MAX_IMAGES}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* OR divider */}
      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>{t('booking.steps.refOr')}</Text>
        <View style={styles.orLine} />
      </View>

      {/* 텍스트 입력 */}
      <Text style={styles.subLabel}>{t('booking.steps.refTextLabel')}</Text>
      <View style={styles.textAreaWrap}>
        <TextInput
          style={styles.textArea}
          value={text}
          onChangeText={(v) => onTextChange(v.slice(0, MAX_TEXT))}
          placeholder={t('booking.steps.refTextPlaceholder')}
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
          {t('booking.steps.refRequired')}
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
