import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  View, Text, Modal, Animated, StyleSheet, Dimensions,
  TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, TextInput, Linking, Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import {
  XIcon, CalendarIcon, CopyIcon, CheckCircleIcon, InfoIcon,
} from '../icons';
import {
  WorkInquiryForm,
  INITIAL_WORK_INQUIRY_FORM,
  isWorkInquiryValid,
  formatWorkInquiryMessage,
  MediaWorkKind,
} from '../../../domain/entities/shopTypes';
import { useTranslation } from '../../store/languageStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.92;

const WORK_KINDS: MediaWorkKind[] = ['사진 촬영', '영상 촬영', '사진 보정', '영상 편집'];

interface Props {
  visible: boolean;
  expertName: string;
  defaultWorkKind: MediaWorkKind;
  expertKakaoLink?: string;
  expertSmsPhone?: string;
  onClose: () => void;
}

const WorkInquiryBottomSheet = memo(({
  visible, expertName, defaultWorkKind, expertKakaoLink, expertSmsPhone, onClose,
}: Props) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [form, setForm] = useState<WorkInquiryForm>({
    ...INITIAL_WORK_INQUIRY_FORM,
    workKind: defaultWorkKind,
  });
  const [showToast, setShowToast] = useState(false);
  const [showCopiedNotice, setShowCopiedNotice] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setForm({ ...INITIAL_WORK_INQUIRY_FORM, workKind: defaultWorkKind });
      Animated.spring(translateY, {
        toValue: 0, useNativeDriver: true, tension: 60, friction: 12,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT, duration: 260, useNativeDriver: true,
      }).start(() => {
        setShowCopiedNotice(false);
      });
    }
  }, [visible, translateY, defaultWorkKind]);

  const handleClose = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT, duration: 240, useNativeDriver: true,
    }).start(() => {
      onClose();
      setShowCopiedNotice(false);
    });
  }, [onClose, translateY]);

  const update = useCallback(<K extends keyof WorkInquiryForm>(key: K, value: WorkInquiryForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const runToast = useCallback(() => {
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setShowToast(false));
  }, [toastOpacity]);

  const handleSubmit = useCallback(async () => {
    const message = formatWorkInquiryMessage(expertName, form);
    Clipboard.setString(message);

    let target: string | null = null;
    if (expertKakaoLink) target = expertKakaoLink;
    else if (expertSmsPhone) {
      target = `sms:${expertSmsPhone}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
    }

    setShowCopiedNotice(true);
    runToast();

    if (target) {
      setTimeout(() => Linking.openURL(target!).catch(() => {}), 600);
    } else {
      setTimeout(() => {
        Alert.alert(
          t('common.noContactTitle'),
          t('shop.bs.noContactExpertMsg'),
        );
      }, 400);
    }
  }, [form, expertName, expertKakaoLink, expertSmsPhone, runToast]);

  const valid = isWorkInquiryValid(form);
  const extraLen = form.extraRequest.length;

  const workKindLabels: Record<MediaWorkKind, string> = {
    '사진 촬영': t('shop.workKindPhoto'),
    '영상 촬영': t('shop.workKindVideo'),
    '사진 보정': t('shop.workKindPhotoEdit'),
    '영상 편집': t('shop.workKindVideoEdit'),
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{t('shop.workInquiryTitle')}</Text>
              <Text style={styles.headerSub}>{t('shop.workHeaderSub')}</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <XIcon size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. 의뢰 분류 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>1.</Text>
                <Text style={styles.fieldLabel}>{t('shop.workCategoryLabel')}</Text>
                <Text style={styles.required}>{t('common.required')}</Text>
              </View>
              <View style={styles.radioColumn}>
                {WORK_KINDS.map((k) => {
                  const isSelected = form.workKind === k;
                  return (
                    <TouchableOpacity
                      key={k}
                      onPress={() => update('workKind', k)}
                      activeOpacity={0.8}
                      style={styles.radioRow}
                    >
                      <View style={[styles.radioDot, isSelected && styles.radioDotActive]}>
                        {isSelected && <View style={styles.radioDotInner} />}
                      </View>
                      <Text style={[styles.radioText, isSelected && styles.radioTextActive]}>
                        {workKindLabels[k]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. 희망 일정 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>2.</Text>
                <Text style={styles.fieldLabel}>{t('shop.workScheduleLabel')}</Text>
                <Text style={styles.required}>{t('common.required')}</Text>
              </View>
              <View style={styles.dateInputWrap}>
                <TextInput
                  style={[styles.textInput, { paddingRight: 40 }]}
                  value={form.desiredDate}
                  onChangeText={(t) => update('desiredDate', t)}
                  placeholder={t('shop.bs.datePlaceholder')}
                  placeholderTextColor={COLORS.gray2}
                />
                <View style={styles.dateIconAbs}>
                  <CalendarIcon size={18} color={COLORS.gray} />
                </View>
              </View>
            </View>

            {/* 3. 작업 분량 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>3.</Text>
                <Text style={styles.fieldLabel}>{t('shop.workVolumeLabel')}</Text>
                <Text style={styles.required}>{t('common.required')}</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={form.workVolume}
                onChangeText={(t) => update('workVolume', t)}
                placeholder={t('shop.bs.volumePlaceholder')}
                placeholderTextColor={COLORS.gray2}
              />
            </View>

            {/* 4. 레퍼런스 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>4.</Text>
                <Text style={styles.fieldLabel}>{t('shop.workReferenceLabel')}</Text>
                <Text style={styles.optional}>{t('common.optional')}</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={form.referenceUrl}
                onChangeText={(t) => update('referenceUrl', t)}
                placeholder={t('shop.bs.refUrlPlaceholder')}
                placeholderTextColor={COLORS.gray2}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>

            {/* 5. 추가 요청 사항 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>5.</Text>
                <Text style={styles.fieldLabel}>{t('shop.workExtraLabel')}</Text>
                <Text style={styles.optional}>{t('common.optional')}</Text>
              </View>
              <View>
                <TextInput
                  style={styles.textArea}
                  value={form.extraRequest}
                  onChangeText={(t) => update('extraRequest', t.slice(0, 500))}
                  placeholder={t('shop.bs.extraRequestPlaceholder')}
                  placeholderTextColor={COLORS.gray2}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.charCount}>{extraLen} / 500</Text>
              </View>
            </View>

            {/* 알려드려요 박스 */}
            <View style={styles.infoBox}>
              <View style={styles.infoTitleRow}>
                <InfoIcon size={14} color={COLORS.gray} />
                <Text style={styles.infoTitle}>{t('shop.workInfoTitle')}</Text>
              </View>
              <View style={styles.infoBullets}>
                <View style={styles.infoRow}>
                  <View style={styles.infoDot} />
                  <Text style={styles.infoText}>{t('shop.workInfo1')}</Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoDot} />
                  <Text style={styles.infoText}>{t('shop.workInfo2')}</Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoDot} />
                  <Text style={styles.infoText}>{t('shop.workInfo3')}</Text>
                </View>
              </View>
            </View>

            <View style={{ height: 8 }} />
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity
              onPress={valid ? handleSubmit : undefined}
              activeOpacity={valid ? 0.85 : 1}
              style={[styles.submitBtn, !valid && styles.submitBtnDisabled]}
            >
              <CopyIcon
                size={17}
                color={valid ? COLORS.black : COLORS.gray2}
                strokeWidth={2}
              />
              <Text style={[styles.submitText, !valid && styles.submitTextDisabled]}>
                {valid ? t('shop.workCopyAndContact') : t('common.fillAllRequired')}
              </Text>
            </TouchableOpacity>

            <Text style={styles.footerHint}>* {t('shop.workFooterHint')}</Text>

            {showCopiedNotice && (
              <View style={styles.copiedNotice}>
                <CheckCircleIcon size={20} color={COLORS.gold} />
                <View>
                  <Text style={styles.copiedTitle}>{t('shop.workCopiedMsg')}</Text>
                  <Text style={styles.copiedSub}>{t('common.copiedToChat')}</Text>
                </View>
              </View>
            )}
          </View>

          {showToast && (
            <Animated.View
              style={[
                styles.toast,
                { bottom: insets.bottom + 110, opacity: toastOpacity },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.toastText}>{t('common.copiedToChat')}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

WorkInquiryBottomSheet.displayName = 'WorkInquiryBottomSheet';
export default WorkInquiryBottomSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray3,
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  headerSub: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -4,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    gap: 22,
  },
  fieldBlock: {
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  numLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  fieldLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  required: {
    color: COLORS.gold,
    fontSize: 11,
    lineHeight: 15,
    marginLeft: 2,
  },
  optional: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    marginLeft: 2,
  },

  textInput: {
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
  },
  textArea: {
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 30,
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 21,
    minHeight: 120,
  },
  charCount: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },

  dateInputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  dateIconAbs: {
    position: 'absolute',
    right: 14,
  },

  radioColumn: {
    gap: 12,
    marginTop: 2,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.gray2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDotActive: {
    borderColor: COLORS.gold,
  },
  radioDotInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.gold,
  },
  radioText: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 20,
  },
  radioTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },

  infoBox: {
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  infoBullets: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  infoDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gray,
    marginTop: 8,
  },
  infoText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 18,
    flexShrink: 1,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.sheet,
    gap: 8,
  },
  submitBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.elevated,
  },
  submitText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  submitTextDisabled: {
    color: COLORS.gray2,
  },
  footerHint: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  copiedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  copiedTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  copiedSub: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },

  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30,30,30,0.96)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
  },
  toastText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
