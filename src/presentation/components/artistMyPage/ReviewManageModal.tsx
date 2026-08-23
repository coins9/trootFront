import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated,
  Dimensions, TextInput, KeyboardAvoidingView, Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import {
  XIcon, StarIcon, AlertInfoIcon, TattooPlaceholderIcon,
  ShieldCheckIcon,
} from '../icons';
import {
  ArtistReviewItem, ArtistReviewReply,
} from '../../../domain/entities/artistMyPageTypes';
import { useTranslation } from '../../store/languageStore';

interface Props {
  review: ArtistReviewItem | null;
  onClose: () => void;
  onSubmitReply: (reviewId: string, reply: ArtistReviewReply) => void;
  onRequestSupport: () => void;
}

const { height: SH } = Dimensions.get('window');
const REPLY_MAX = 200;

const ReviewManageModal = memo(({
  review, onClose, onSubmitReply, onRequestSupport,
}: Props) => {
  const visible = review !== null;
  const translate = useRef(new Animated.Value(SH)).current;
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (visible) setReply(review?.reply?.content ?? '');
    Animated.timing(translate, {
      toValue: visible ? 0 : SH,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, review, translate]);

  const openSupport = useCallback(() => {
    onRequestSupport();
  }, [onRequestSupport]);

  const handleSubmit = useCallback(() => {
    if (!review) return;
    const content = reply.trim();
    if (content.length < 2) return;
    onSubmitReply(review.id, {
      content,
      answeredAt: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    });
  }, [reply, review, onSubmitReply]);

  if (!review) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 12) + 12 },
              { transform: [{ translateY: translate }] },
            ]}
          >
            <Pressable onPress={() => {}}>
              <View style={styles.handle} />
              <View style={styles.headerRow}>
                <Text style={styles.title}>{t('artistMyPage.reviewDetailTitle')}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <XIcon size={20} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              {/* Review body */}
              <View style={styles.reviewBox}>
                <View style={styles.reviewHeaderRow}>
                  <Text style={styles.customerName}>{review.customer}</Text>
                  <View style={styles.starsRow}>
                    {[1,2,3,4,5].map((n) => (
                      <StarIcon key={n} size={12} color={COLORS.gold} filled={n <= review.rating} />
                    ))}
                    <Text style={styles.ratingText}>{review.rating}.0</Text>
                  </View>
                </View>
                <Text style={styles.artworkTitle}>{review.artworkTitle}</Text>
                <Text style={styles.reviewContent}>{review.content}</Text>
                {review.imageUris.length > 0 && (
                  <View style={styles.imageGallery}>
                    {review.imageUris.map((uri, i) => (
                      <View key={i} style={styles.imageThumb}>
                        {uri ? (
                          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                          <TattooPlaceholderIcon size={30} color="#3a3a3a" />
                        )}
                      </View>
                    ))}
                  </View>
                )}
                <Text style={styles.reviewDate}>{review.createdAt}</Text>
              </View>

              {/* Reply input */}
              <Text style={styles.sectionLabel}>{t('artistMyPage.replySection')}</Text>
              <View style={styles.replyWrap}>
                <TextInput
                  value={reply}
                  onChangeText={(v) => v.length <= REPLY_MAX && setReply(v)}
                  placeholder={t('artistMyPage.replyPlaceholder')}
                  placeholderTextColor={COLORS.gray2}
                  multiline
                  maxLength={REPLY_MAX}
                  style={styles.replyInput}
                  textAlignVertical="top"
                />
                <Text style={styles.counter}>{reply.length}/{REPLY_MAX}</Text>
              </View>

              {/* Policy notice */}
              <View style={styles.noticeBox}>
                <AlertInfoIcon size={16} color={COLORS.gold} strokeWidth={1.7} />
                <Text style={styles.noticeText}>
                  {t('artistMyPage.reviewPolicyNotice')}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={openSupport}
                  activeOpacity={0.85}
                  style={[styles.actionBtn, styles.actionSupport]}
                >
                  <ShieldCheckIcon size={14} color={COLORS.danger} strokeWidth={1.7} />
                  <Text style={styles.actionSupportText}>
                    {t('artistMyPage.supportDeleteInquiry')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                  disabled={reply.trim().length < 2}
                  style={[
                    styles.actionBtn, styles.actionPrimary,
                    reply.trim().length < 2 && styles.actionDisabled,
                  ]}
                >
                  <Text style={styles.actionPrimaryText}>
                    {review.reply ? t('artistMyPage.replyEdit') : t('artistMyPage.replyRegister')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Animated.View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
});
ReviewManageModal.displayName = 'ReviewManageModal';
export default ReviewManageModal;

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

  reviewBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    padding: 14,
    marginBottom: 14,
    gap: 8,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    marginLeft: 4,
  },
  artworkTitle: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  reviewContent: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
  },
  imageGallery: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  imageThumb: {
    width: 60, height: 60,
    borderRadius: 6,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  reviewDate: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },

  sectionLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    marginBottom: 8,
  },
  replyWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    minHeight: 90,
    marginBottom: 12,
  },
  replyInput: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
    padding: 0,
    minHeight: 50,
  },
  counter: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
    marginTop: 4,
  },

  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.3)',
    backgroundColor: 'rgba(212,168,67,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  noticeText: {
    flex: 1,
    color: COLORS.gray,
    fontSize: 11,
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
  actionSupport: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(232,85,85,0.08)',
  },
  actionSupportText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  actionPrimary: {
    flex: 1.2,
    backgroundColor: COLORS.gold,
  },
  actionPrimaryText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  actionDisabled: {
    opacity: 0.5,
  },
});
