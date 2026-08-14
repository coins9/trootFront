import React, { memo, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated,
  Dimensions, Platform, TextInput, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import {
  XIcon, TattooPlaceholderIcon,
  CheckCircleIcon,
} from '../icons';
import { ArtistArtwork } from '../../../domain/entities/artistMyPageTypes';
import {
  GENRES, BODY_PARTS, SUBJECTS, MOODS,
} from '../../../data/mock/mockData';
import BilingualSection from '../common/BilingualSection';
import { useTranslation } from '../../store/languageStore';

interface Props {
  visible: boolean;
  editing: ArtistArtwork | null;
  onClose: () => void;
  onSubmit: (aw: ArtistArtwork) => void;
}

const { height: SH } = Dimensions.get('window');
const DESC_MAX = 120;

const flatBodyParts: string[] = BODY_PARTS.flatMap((c) => c.parts);

const emptyForm = (): ArtistArtwork => ({
  id: `aw-${Date.now()}`,
  type: 'image',
  thumbnailUri: '',
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

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 12 }}
              >
                {/* Thumbnail pick (사진 전용) */}
                <TouchableOpacity activeOpacity={0.85} style={styles.thumbPickBox}>
                  {form.thumbnailUri ? (
                    <View style={styles.thumbPreview} />
                  ) : (
                    <>
                      <TattooPlaceholderIcon size={40} color="#3a3a3a" />
                      <Text style={styles.thumbHint}>사진 업로드</Text>
                      <Text style={styles.thumbSub}>탭하여 갤러리에서 선택</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Title */}
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
                      <TouchableOpacity
                        key={g}
                        onPress={() => setSingle('genre', g)}
                        activeOpacity={0.85}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {g}
                        </Text>
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
                          <TouchableOpacity
                            key={p}
                            onPress={() => setSingle('bodyPart', p)}
                            activeOpacity={0.85}
                            style={[styles.chip, active && styles.chipActive]}
                          >
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                              {p}
                            </Text>
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
                      <TouchableOpacity
                        key={s}
                        onPress={() => toggleMulti('subjects', s)}
                        activeOpacity={0.85}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {s}
                        </Text>
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
                      <TouchableOpacity
                        key={m}
                        onPress={() => toggleMulti('moods', m)}
                        activeOpacity={0.85}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {m}
                        </Text>
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

                {/* Description */}
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
                  <Text style={styles.counter}>
                    {form.description.length}/{DESC_MAX}
                  </Text>
                </View>

                {/* Bilingual (English) */}
                <BilingualSection
                  titleEn={form.titleEn ?? ''}
                  onChangeTitleEn={(v) => setSingle('titleEn', v)}
                  titlePlaceholder="e.g. Blackwork Angel"
                  titleMaxLength={30}
                  descEn={form.descriptionEn ?? ''}
                  onChangeDescEn={(v) => setSingle('descriptionEn', v)}
                  descPlaceholder="Size, sessions, concept, etc."
                  descMaxLength={DESC_MAX}
                />
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
  scroll: { maxHeight: SH * 0.7 },

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

  thumbPickBox: {
    height: 140,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(212,168,67,0.3)',
    borderStyle: 'dashed',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    gap: 6,
  },
  thumbPreview: {
    width: '100%', height: '100%',
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  thumbHint: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  thumbSub: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
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
