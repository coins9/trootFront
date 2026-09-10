import React, { memo, useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import { LocationPinIcon, EditPenIcon, XIcon } from '../icons';
import { studioApi, type Studio } from '../../../data/api';
import { ApiError } from '../../../data/api/client';
import { useToast } from '../common/Toast';
import { useTranslation } from '../../store/languageStore';

const INFO_MAX = 2000;

interface Props {
  studio: Studio;
  isOwner: boolean;
  onUpdated: (studio: Studio) => void;
}

/**
 * [#3] 샵 정보 카드 — 이름/주소 + 주소 밑 자유 정보(소개·영업시간·공지).
 * 샵오너만 편집 가능.
 */
const StudioInfoCard = memo(({ studio, isOwner, onUpdated }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const insets = useSafeAreaInsets();
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const openEdit = useCallback(() => {
    setDraft(studio.info ?? '');
    setEditOpen(true);
  }, [studio.info]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const updated = await studioApi.updateMine({ info: draft.trim() });
      onUpdated(updated);
      setEditOpen(false);
      toast(t('shopInfo.saved' as any), { variant: 'success' });
    } catch (e) {
      toast(e instanceof ApiError ? e.userMessage : t('common.error' as any), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  }, [saving, draft, onUpdated, toast, t]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name} numberOfLines={1}>{studio.name}</Text>
        {isOwner && (
          <TouchableOpacity onPress={openEdit} activeOpacity={0.8} style={styles.editBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <EditPenIcon size={13} color={COLORS.gold} strokeWidth={1.8} />
            <Text style={styles.editText}>{t('shopInfo.edit' as any)}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.addressRow}>
        <LocationPinIcon size={13} color={COLORS.gray} />
        <Text style={styles.address} numberOfLines={2}>{studio.address}</Text>
      </View>

      {/* 주소 밑 정보 */}
      {studio.info ? (
        <Text style={styles.info}>{studio.info}</Text>
      ) : isOwner ? (
        <TouchableOpacity onPress={openEdit} activeOpacity={0.8}>
          <Text style={styles.infoAddHint}>{t('shopInfo.addHint' as any)}</Text>
        </TouchableOpacity>
      ) : null}

      {/* 편집 모달 */}
      <Modal visible={editOpen} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setEditOpen(false)}>
        <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => !saving && setEditOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('shopInfo.editTitle' as any)}</Text>
              <TouchableOpacity onPress={() => !saving && setEditOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <XIcon size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetDesc}>{t('shopInfo.editDesc' as any)}</Text>
            <TextInput
              value={draft}
              onChangeText={(v) => v.length <= INFO_MAX && setDraft(v)}
              placeholder={t('shopInfo.placeholder' as any)}
              placeholderTextColor={COLORS.gray2}
              style={styles.input}
              multiline
              textAlignVertical="top"
              maxLength={INFO_MAX}
            />
            <Text style={styles.counter}>{draft.length}/{INFO_MAX}</Text>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={styles.saveBtn} disabled={saving}>
              {saving ? <ActivityIndicator color={COLORS.black} size="small" /> : (
                <Text style={styles.saveText}>{t('common.save' as any)}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
});
StudioInfoCard.displayName = 'StudioInfoCard';
export default StudioInfoCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 16,
    gap: 8,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  address: {
    flex: 1,
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
  info: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoAddHint: {
    color: COLORS.gold,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },
  sheetDesc: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 21,
    minHeight: 120,
  },
  counter: {
    color: COLORS.gray3,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
  },
  saveBtn: {
    marginTop: 4,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
});
