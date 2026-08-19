import React, { memo, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated,
  Dimensions, Platform, TextInput, ScrollView, KeyboardAvoidingView, Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import {
  XIcon, TattooPlaceholderIcon,
  CheckCircleIcon, PlusIcon,
} from '../icons';
import { ArtistArtwork } from '../../../domain/entities/artistMyPageTypes';
import {
  GENRES, BODY_PARTS, SUBJECTS, MOODS,
} from '../../../data/mock/mockData';
import { useTranslation } from '../../store/languageStore';
import { useImageUpload } from '../../hooks/useImageUpload';
import { deleteUpload } from '../../../data/api/upload';

/* ---- English display labels (same index as Korean arrays) ---- */
const GENRES_EN = [
  'Black & Gray', 'Linework', 'Mini Tattoo', 'Lettering',
  'Irezumi', 'Old School', 'New School', 'Watercolor',
  'Chicano', 'Blackwork', 'Realism', 'Tribal',
  'Illustration', 'Geometric',
];
const SUBJECTS_EN = [
  'Animals/Pets', 'Plants/Flowers', 'Nature/Space', 'Objects',
  'People/Characters', 'Symbols/Patterns', 'Words/Numbers',
];
const MOODS_EN = [
  'Dark/Decadent', 'Simple/Minimal', 'Cute/Kitsch', 'Dreamy/Mystical',
  'Vintage/Rough', 'Oriental', 'Delicate',
];
const BODY_PARTS_EN = [
  { category: 'Head & Neck', parts: ['Behind Ear', 'Back Neck', 'Side Neck', 'Front Neck', 'Face', 'Scalp'] },
  { category: 'Arms & Hands', parts: ['Shoulder', 'Upper Arm', 'Forearm', 'Elbow', 'Wrist', 'Back of Hand', 'Finger'] },
  { category: 'Upper Body', parts: ['Chest', 'Abdomen', 'Ribs', 'Collarbone'] },
  { category: 'Back', parts: ['Upper Back', 'Shoulder Blade', 'Full Back', 'Spine', 'Lower Back'] },
  { category: 'Lower Body & Feet', parts: ['Hip/Pelvis', 'Thigh', 'Knee', 'Calf', 'Ankle', 'Instep', 'Toes'] },
  { category: 'Special', parts: ['Sleeve', 'Full Body', 'Cover-up', 'Touch-up'] },
];

type Lang = 'ko' | 'en';

interface Props {
  visible: boolean;
  editing: ArtistArtwork | null;
  onClose: () => void;
  onSubmit: (aw: ArtistArtwork) => void;
}

const { height: SH } = Dimensions.get('window');
const DESC_MAX = 120;
const MAX_IMAGES = 10;

const flatBodyParts: string[] = BODY_PARTS.flatMap((c) => c.parts);

const emptyForm = (): ArtistArtwork => ({
  id: `aw-${Date.now()}`,
  type: 'image',
  thumbnailUri: '',
  imageUris: [],
  title: '',
  titleEn: '',
  genre: GENRES[0],
  bodyPart: flatBodyParts[0],
  subjects: [],
  moods: [],
  priceFrom: 100000,
  duration: '2시간',
  description: '',
  descriptionEn: '',
  likes: 0,
  views: 0,
});

const ArtworkFormSheet = memo(({ visible, editing, onClose, onSubmit }: Props) => {
  const { t } = useTranslation();
  const translate = useRef(new Animated.Value(SH)).current;
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<ArtistArtwork>(emptyForm());
  const [lang, setLang] = useState<Lang>('ko');
  const isEdit = editing !== null;

  useEffect(() => {
    if (visible) setForm(editing ? { ...editing } : emptyForm());
    Animated.timing(translate, {
      toValue: visible ? 0 : SH,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [visible, editing, translate]);

  const canSubmit = useMemo(
    () => form.title.trim().length >= 2 && form.genre && form.bodyPart,
    [form],
  );

  const toggleMulti = useCallback((field: 'subjects' | 'moods', v: string) => {
    setForm((prev) => {
      const cur = prev[field];
      const next = cur.includes(v)
        ? cur.filter((x) => x !== v)
        : [...cur, v];
      return { ...prev, [field]: next };
    });
  }, []);

  const setSingle = useCallback((field: keyof ArtistArtwork, v: any) => {
    setForm((prev) => ({ ...prev, [field]: v }));
  }, []);

  const { pickWithChoice, uploading: imgUploading } = useImageUpload({
    scope: 'artwork',
    max: MAX_IMAGES,
    current: form.imageUris?.length ?? 0,
  });

  const handleAddImages = useCallback(async () => {
    const urls = await pickWithChoice();
    if (urls.length > 0) {
      setForm((prev) => {
        const next = [...(prev.imageUris ?? []), ...urls].slice(0, MAX_IMAGES);
        return { ...prev, imageUris: next, thumbnailUri: next[0] ?? prev.thumbnailUri };
      });
    }
  }, [pickWithChoice]);

  const handleRemoveImage = useCallback((idx: number) => {
    setForm((prev) => {
      const removed = prev.imageUris?.[idx];
      if (removed) deleteUpload(removed);
      const next = (prev.imageUris ?? []).filter((_, i) => i !== idx);
      return { ...prev, imageUris: next, thumbnailUri: next[0] ?? '' };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onSubmit(form);
  }, [canSubmit, form, onSubmit]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kavWrap}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 12) + 12 },
              { transform: [{ translateY: translate }] },
            ]}
          >
            <View>
              <View style={styles.handle} />
              <View style={styles.headerRow}>
                <Text style={styles.title}>
                  {isEdit ? t('artistMyPage.artworkFormTitleEdit') : t('artistMyPage.artworkFormTitleAdd')}
                </Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <XIcon size={20} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              {/* Language tab switcher */}
              <View style={styles.langTabRow}>
                <TouchableOpacity
                  onPress={() => setLang('ko')}
                  activeOpacity={0.8}
                  style={[styles.langTab, lang === 'ko' && styles.langTabActive]}
                >
                  <Text style={[styles.langTabText, lang === 'ko' && styles.langTabTextActive]}>한국어</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setLang('en')}
                  activeOpacity={0.8}
                  style={[styles.langTab, lang === 'en' && styles.langTabActive]}
                >
                  <Text style={[styles.langTabText, lang === 'en' && styles.langTabTextActive]}>English</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 12 }}
              >
                {/* 이미지 스트립 (최대 10장, 다중 선택 + 미리보기) */}
                <View style={styles.imageStripRow}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.imageStripContent}
                  >
                    {(form.imageUris?.length ?? 0) < MAX_IMAGES && (
                      <TouchableOpacity
                        style={styles.imgAddBtn}
                        onPress={handleAddImages}
                        disabled={imgUploading}
                        activeOpacity={0.8}
                      >
                        {imgUploading ? (
                          <ActivityIndicator color={COLORS.gold} size="small" />
                        ) : (
                          <>
                            <PlusIcon size={22} color={COLORS.gold} />
                            <Text style={styles.imgAddText}>사진 추가</Text>
                            <Text style={styles.imgAddSub}>
                              {(form.imageUris?.length ?? 0)}/{MAX_IMAGES}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                    {(form.imageUris ?? []).map((uri, idx) => (
                      <View key={`${uri}-${idx}`} style={styles.imgThumbWrap}>
                        <Image source={{ uri }} style={styles.imgThumb} resizeMode="cover" />
                        {idx === 0 && (
                          <View style={styles.imgMainBadge}>
                            <Text style={styles.imgMainBadgeText}>대표</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.imgRemoveBtn}
                          onPress={() => handleRemoveImage(idx)}
                          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                        >
                          <XIcon size={10} color={COLORS.white} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {lang === 'ko' ? (
                  <>
                    {/* Title (Korean) */}
                    <FieldLabel>작품명</FieldLabel>
                    <View style={styles.inputRow}>
                      <TextInput
                        value={form.title}
                        onChangeText={(v) => setSingle('title', v)}
                        placeholder={t('artistMyPage.artworkFormTitlePlaceholder')}
                        placeholderTextColor={COLORS.gray2}
                        style={styles.input}
                        maxLength={30}
                      />
                    </View>

                    {/* Genre */}
                    <FieldLabel>장르 (필수)</FieldLabel>
                    <View style={styles.chipGrid}>
                      {GENRES.map((g) => {
                        const active = form.genre === g;
                        return (
                          <TouchableOpacity key={g} onPress={() => setSingle('genre', g)} activeOpacity={0.85} style={[styles.chip, active && styles.chipActive]}>
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{g}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Body part (grouped) */}
                    <FieldLabel>시술 부위 (필수)</FieldLabel>
                    {BODY_PARTS.map((cat) => (
                      <View key={cat.category} style={styles.bodyCatWrap}>
                        <Text style={styles.bodyCatLabel}>{cat.category}</Text>
                        <View style={styles.chipGrid}>
                          {cat.parts.map((p) => {
                            const active = form.bodyPart === p;
                            return (
                              <TouchableOpacity key={p} onPress={() => setSingle('bodyPart', p)} activeOpacity={0.85} style={[styles.chip, active && styles.chipActive]}>
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>{p}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    ))}

                    {/* Subject */}
                    <FieldLabel>주제 (복수 선택)</FieldLabel>
                    <View style={styles.chipGrid}>
                      {SUBJECTS.map((s) => {
                        const active = form.subjects.includes(s);
                        return (
                          <TouchableOpacity key={s} onPress={() => toggleMulti('subjects', s)} activeOpacity={0.85} style={[styles.chip, active && styles.chipActive]}>
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{s}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Moods */}
                    <FieldLabel>감성 (복수 선택)</FieldLabel>
                    <View style={styles.chipGrid}>
                      {MOODS.map((m) => {
                        const active = form.moods.includes(m);
                        return (
                          <TouchableOpacity key={m} onPress={() => toggleMulti('moods', m)} activeOpacity={0.85} style={[styles.chip, active && styles.chipActive]}>
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{m}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Price + duration */}
                    <View style={styles.rowFields}>
                      <View style={{ flex: 1 }}>
                        <FieldLabel>시작 가격</FieldLabel>
                        <View style={styles.inputRow}>
                          <TextInput
                            value={String(form.priceFrom)}
                            onChangeText={(v) => setSingle('priceFrom', Number(v.replace(/\D/g, '') || 0))}
                            placeholder="0"
                            placeholderTextColor={COLORS.gray2}
                            keyboardType="number-pad"
                            style={styles.input}
                          />
                          <Text style={styles.suffix}>원~</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <FieldLabel>소요 시간</FieldLabel>
                        <View style={styles.inputRow}>
                          <TextInput
                            value={form.duration}
                            onChangeText={(v) => setSingle('duration', v)}
                            placeholder={t('artistMyPage.artworkFormDurationPlaceholder')}
                            placeholderTextColor={COLORS.gray2}
                            style={styles.input}
                            maxLength={20}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Description (Korean) */}
                    <FieldLabel>설명</FieldLabel>
                    <View style={styles.descWrap}>
                      <TextInput
                        value={form.description}
                        onChangeText={(v) => v.length <= DESC_MAX && setSingle('description', v)}
                        placeholder={t('artistMyPage.artworkFormDescPlaceholder')}
                        placeholderTextColor={COLORS.gray2}
                        multiline
                        maxLength={DESC_MAX}
                        style={styles.descInput}
                        textAlignVertical="top"
                      />
                      <Text style={styles.counter}>{form.description.length}/{DESC_MAX}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Title (English) */}
                    <FieldLabel>Artwork Name</FieldLabel>
                    <View style={styles.inputRow}>
                      <TextInput
                        value={form.titleEn ?? ''}
                        onChangeText={(v) => setSingle('titleEn', v)}
                        placeholder="e.g. Blackwork Angel"
                        placeholderTextColor={COLORS.gray2}
                        style={styles.input}
                        maxLength={30}
                      />
                    </View>

                    {/* Genre (English) */}
                    <FieldLabel>Genre (required)</FieldLabel>
                    <View style={styles.chipGrid}>
                      {GENRES.map((g, i) => {
                        const active = form.genre === g;
                        return (
                          <TouchableOpacity key={g} onPress={() => setSingle('genre', g)} activeOpacity={0.85} style={[styles.chip, active && styles.chipActive]}>
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{GENRES_EN[i] ?? g}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Body part (English) */}
                    <FieldLabel>Body Part (required)</FieldLabel>
                    {BODY_PARTS.map((cat, ci) => (
                      <View key={cat.category} style={styles.bodyCatWrap}>
                        <Text style={styles.bodyCatLabel}>{BODY_PARTS_EN[ci]?.category ?? cat.category}</Text>
                        <View style={styles.chipGrid}>
                          {cat.parts.map((p, pi) => {
                            const active = form.bodyPart === p;
                            return (
                              <TouchableOpacity key={p} onPress={() => setSingle('bodyPart', p)} activeOpacity={0.85} style={[styles.chip, active && styles.chipActive]}>
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>{BODY_PARTS_EN[ci]?.parts[pi] ?? p}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    ))}

                    {/* Subject (English) */}
                    <FieldLabel>Subject (multiple)</FieldLabel>
                    <View style={styles.chipGrid}>
                      {SUBJECTS.map((s, i) => {
                        const active = form.subjects.includes(s);
                        return (
                          <TouchableOpacity key={s} onPress={() => toggleMulti('subjects', s)} activeOpacity={0.85} style={[styles.chip, active && styles.chipActive]}>
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{SUBJECTS_EN[i] ?? s}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Moods (English) */}
                    <FieldLabel>Mood (multiple)</FieldLabel>
                    <View style={styles.chipGrid}>
                      {MOODS.map((m, i) => {
                        const active = form.moods.includes(m);
                        return (
                          <TouchableOpacity key={m} onPress={() => toggleMulti('moods', m)} activeOpacity={0.85} style={[styles.chip, active && styles.chipActive]}>
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{MOODS_EN[i] ?? m}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Price + duration (shared, shown in both tabs) */}
                    <View style={styles.rowFields}>
                      <View style={{ flex: 1 }}>
                        <FieldLabel>Starting Price</FieldLabel>
                        <View style={styles.inputRow}>
                          <TextInput
                            value={String(form.priceFrom)}
                            onChangeText={(v) => setSingle('priceFrom', Number(v.replace(/\D/g, '') || 0))}
                            placeholder="0"
                            placeholderTextColor={COLORS.gray2}
                            keyboardType="number-pad"
                            style={styles.input}
                          />
                          <Text style={styles.suffix}>KRW~</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <FieldLabel>Duration</FieldLabel>
                        <View style={styles.inputRow}>
                          <TextInput
                            value={form.duration}
                            onChangeText={(v) => setSingle('duration', v)}
                            placeholder="e.g. 2h"
                            placeholderTextColor={COLORS.gray2}
                            style={styles.input}
                            maxLength={20}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Description (English) */}
                    <FieldLabel>Description</FieldLabel>
                    <View style={styles.descWrap}>
                      <TextInput
                        value={form.descriptionEn ?? ''}
                        onChangeText={(v) => v.length <= DESC_MAX && setSingle('descriptionEn', v)}
                        placeholder="Size, sessions, concept, etc."
                        placeholderTextColor={COLORS.gray2}
                        multiline
                        maxLength={DESC_MAX}
                        style={styles.descInput}
                        textAlignVertical="top"
                      />
                      <Text style={styles.counter}>{(form.descriptionEn ?? '').length}/{DESC_MAX}</Text>
                    </View>
                  </>
                )}
              </ScrollView>

              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={!canSubmit}
                style={[styles.saveBtn, !canSubmit && styles.saveBtnDisabled]}
              >
                <CheckCircleIcon size={16} color={COLORS.black} />
                <Text style={styles.saveText}>
                  {isEdit ? t('artistMyPage.artworkFormSubmitEdit') : t('artistMyPage.artworkFormSubmitAdd')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});
ArtworkFormSheet.displayName = 'ArtworkFormSheet';
export default ArtworkFormSheet;

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.label}>{children}</Text>
);

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  kavWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: SH * 0.9,
  },
  handle: {
    alignSelf: 'center',
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray3,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },
  scroll: { maxHeight: SH * 0.63 },

  langTabRow: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: COLORS.elevated,
    padding: 3,
    marginBottom: 14,
  },
  langTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langTabActive: {
    backgroundColor: COLORS.gold,
  },
  langTabText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  langTabTextActive: {
    color: COLORS.black,
    fontWeight: '800',
  },

  mediaToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingVertical: 10,
  },
  mediaBtnActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  mediaBtnText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  mediaBtnTextActive: {
    color: COLORS.black,
    fontWeight: '800',
  },

  imageStripRow: {
    marginBottom: 18,
  },
  imageStripContent: {
    gap: 8,
    paddingVertical: 2,
  },
  imgAddBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(212,168,67,0.4)',
    borderStyle: 'dashed',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  imgAddText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
  },
  imgAddSub: {
    color: COLORS.gray,
    fontSize: 9,
    lineHeight: 12,
  },
  imgThumbWrap: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  imgThumb: {
    width: 80,
    height: 80,
  },
  imgRemoveBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgMainBadge: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  imgMainBadgeText: {
    color: COLORS.black,
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },

  label: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
    padding: 0,
  },
  suffix: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212,168,67,0.15)',
  },
  chipText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  chipTextActive: {
    color: COLORS.gold,
    fontWeight: '800',
  },

  bodyCatWrap: {
    marginBottom: 10,
  },
  bodyCatLabel: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginBottom: 6,
  },

  rowFields: {
    flexDirection: 'row',
    gap: 10,
  },

  descWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    minHeight: 100,
  },
  descInput: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
    padding: 0,
    minHeight: 60,
  },
  counter: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
    marginTop: 4,
  },

  saveBtn: {
    marginTop: 12,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
});
