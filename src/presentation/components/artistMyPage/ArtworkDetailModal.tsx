import React, { memo, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated,
  Dimensions, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import {
  XIcon, HeartIcon, EyeIcon, EditPenIcon, TattooPlaceholderIcon,
  StarIcon,
} from '../icons';
import { ArtistArtwork } from '../../../domain/entities/artistMyPageTypes';
import { useTranslation } from '../../store/languageStore';

interface Props {
  artwork: ArtistArtwork | null;
  onClose: () => void;
  onEdit: (aw: ArtistArtwork) => void;
  onDelete: (id: string) => void;
}

const { height: SH } = Dimensions.get('window');

const ArtworkDetailModal = memo(({ artwork, onClose, onEdit, onDelete }: Props) => {
  const visible = artwork !== null;
  const translate = useRef(new Animated.Value(SH)).current;
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();

  useEffect(() => {
    Animated.timing(translate, {
      toValue: visible ? 0 : SH,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, translate]);

  const handleDelete = useCallback(() => {
    if (!artwork) return;
    Alert.alert(
      t('artistMyPage.deleteArtworkTitle'),
      `'${artwork.title}' ${t('artistMyPage.deleteArtworkMsg')}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => onDelete(artwork.id),
        },
      ],
      { cancelable: true },
    );
  }, [artwork, onDelete]);

  if (!artwork) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 16, transform: [{ translateY: translate }] }]}
        >
          <Pressable onPress={() => {}}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              {artwork.isPromoted && (
                <View style={styles.adBadge}>
                  <Text style={styles.adBadgeText}>{t('artistMyPage.adRunning')}</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
                style={{ marginLeft: 'auto' }}
              >
                <XIcon size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.imageBox}>
              <TattooPlaceholderIcon size={60} color="#3a3a3a" />
            </View>

            <Text style={styles.title}>{artwork.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{artwork.genre}</Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{artwork.bodyPart}</Text>
              </View>
              <Text style={styles.priceText}>
                {language === 'ko' ? `${artwork.priceFrom.toLocaleString()}원~` : `₩${artwork.priceFrom.toLocaleString()}+`}
              </Text>
            </View>

            {(artwork.subjects.length > 0 || artwork.moods.length > 0) && (
              <View style={styles.tagRow}>
                {[...artwork.subjects, ...artwork.moods].map((t) => (
                  <View key={t} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}

            {artwork.description && (
              <Text style={styles.description}>{artwork.description}</Text>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <HeartIcon size={14} color={COLORS.gold} filled />
                <Text style={styles.statText}>{artwork.likes.toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                <EyeIcon size={14} color={COLORS.gold} />
                <Text style={styles.statText}>{artwork.views.toLocaleString()}</Text>
              </View>
              {!!artwork.sizePreset && (
                <View style={styles.statItem}>
                  <StarIcon size={14} color={COLORS.gold} filled />
                  <Text style={styles.statText}>{artwork.sizePreset}</Text>
                </View>
              )}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={handleDelete}
                activeOpacity={0.85}
                style={[styles.actionBtn, styles.actionDanger]}
              >
                <Text style={styles.actionDangerText}>{t('common.delete')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onEdit(artwork)}
                activeOpacity={0.85}
                style={[styles.actionBtn, styles.actionPrimary]}
              >
                <EditPenIcon size={14} color={COLORS.black} strokeWidth={1.8} />
                <Text style={styles.actionPrimaryText}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
});
ArtworkDetailModal.displayName = 'ArtworkDetailModal';
export default ArtworkDetailModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
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
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  mediaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mediaPillVideo: {
    borderColor: '#4E8CFF',
  },
  mediaPillText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
  adBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.gold,
  },
  adBadgeText: {
    color: COLORS.black,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },

  imageBox: {
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  metaChip: {
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.5)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metaChipText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  priceText: {
    marginLeft: 'auto',
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 12,
  },
  tagChip: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagChipText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  description: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 18,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionDanger: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(232,85,85,0.1)',
  },
  actionDangerText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  actionPrimary: {
    flex: 1.5,
    backgroundColor: COLORS.gold,
  },
  actionPrimaryText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
});
