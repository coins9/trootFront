import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  View, Text, Modal, Animated, StyleSheet, Dimensions,
  TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, TextInput, Linking, Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import { XIcon, ChevronDownIcon } from '../icons';
import {
  ShareBookingForm,
  INITIAL_SHARE_BOOKING_FORM,
  isShareBookingFormValid,
  formatShareBookingMessage,
  ShareBookingPurpose,
  BedRequest,
} from '../../../domain/entities/shopTypes';
import { useTranslation } from '../../store/languageStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;

const PURPOSES: ShareBookingPurpose[] = ['단기 쉐어', '장기 쉐어', '게스트 워크'];
const BED_OPTIONS: BedRequest[] = ['1대', '2대', '무관'];

interface Props {
  visible: boolean;
  shopTitle: string;
  hostName: string;
  hostKakaoLink?: string;
  hostSmsPhone?: string;
  onClose: () => void;
}

const ShareBookingBottomSheet = memo(({
  visible, shopTitle, hostName, hostKakaoLink, hostSmsPhone, onClose,
}: Props) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [form, setForm] = useState<ShareBookingForm>(INITIAL_SHARE_BOOKING_FORM);
  const [showBedDropdown, setShowBedDropdown] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0, useNativeDriver: true, tension: 60, friction: 12,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT, duration: 260, useNativeDriver: true,
      }).start(() => {
        setForm(INITIAL_SHARE_BOOKING_FORM);
        setShowBedDropdown(false);
      });
    }
  }, [visible, translateY]);

  const handleClose = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT, duration: 240, useNativeDriver: true,
    }).start(() => {
      onClose();
      setForm(INITIAL_SHARE_BOOKING_FORM);
      setShowBedDropdown(false);
    });
  }, [onClose, translateY]);

  const update = useCallback(<K extends keyof ShareBookingForm>(key: K, value: ShareBookingForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const showToast = useCallback(() => {
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  }, [toastOpacity]);

  const handleSubmit = useCallback(async () => {
    const message = formatShareBookingMessage(shopTitle, hostName, form);
    Clipboard.setString(message);

    let target: string | null = null;
    if (hostKakaoLink) target = hostKakaoLink;
    else if (hostSmsPhone) target = `sms:${hostSmsPhone}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;

    showToast();

    if (target) {
      const can = await Linking.canOpenURL(target);
      if (can) {
        Linking.openURL(target);
      }
    } else {
      Alert.alert(
        t('common.noContactTitle'),
        '호스트가 등록한 연락망이 아직 없습니다.\n문의 내용은 클립보드에 복사되었습니다.',
      );
    }

    setTimeout(handleClose, 900);
  }, [form, shopTitle, hostName, hostKakaoLink, hostSmsPhone, showToast, handleClose]);

  const valid = isShareBookingFormValid(form);

  const purposeLabels: Record<ShareBookingPurpose, string> = {
    '단기 쉐어': t('shop.purposeShortTerm'),
    '장기 쉐어': t('shop.purposeLongTerm'),
    '게스트 워크': t('shop.purposeGuestWork'),
  };
  const bedLabels: Record<BedRequest, string> = {
    '1대': t('shop.bedOption1'),
    '2대': t('shop.bedOption2'),
    '무관': t('shop.bedOptionAny'),
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('shop.shareBookingTitle')}</Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <XIcon size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>{t('shop.fieldSpace')}</Text>
            <Text
              style={styles.contextValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {shopTitle.replace(/\n/g, ' ')}
            </Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. 이용 목적 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>{t('shop.purposeLabel')}</Text>
                <Text style={styles.required}>{t('common.required')}</Text>
              </View>
              <View style={styles.radioRow}>
                {PURPOSES.map((p) => {
                  const isSelected = form.purpose === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => update('purpose', p)}
                      activeOpacity={0.8}
                      style={[styles.radioChip, isSelected && styles.radioChipActive]}
                    >
                      <View style={[styles.radioDot, isSelected && styles.radioDotActive]}>
                        {isSelected && <View style={styles.radioDotInner} />}
                      </View>
                      <Text style={[styles.radioText, isSelected && styles.radioTextActive]}>
                        {purposeLabels[p]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. 희망 일정 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>{t('shop.shareDateLabel')}</Text>
                <Text style={styles.required}>{t('common.required')}</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={form.scheduleText}
                onChangeText={(t) => update('scheduleText', t)}
                placeholder="예: 2026-08-15 ~ 08-20 (5일)"
                placeholderTextColor={COLORS.gray2}
              />
            </View>

            {/* 3. 필요 베드 수 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>{t('shop.bedLabel')}</Text>
                <Text style={styles.required}>{t('common.required')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowBedDropdown((v) => !v)}
                activeOpacity={0.8}
                style={styles.dropdownBtn}
              >
                <Text style={[styles.dropdownText, !form.bedRequest && styles.dropdownPlaceholder]}>
                  {form.bedRequest ? bedLabels[form.bedRequest] : t('common.selectPlaceholder')}
                </Text>
                <ChevronDownIcon size={14} color={COLORS.gray} />
              </TouchableOpacity>
              {showBedDropdown && (
                <View style={styles.dropdownList}>
                  {BED_OPTIONS.map((b) => {
                    const isSelected = form.bedRequest === b;
                    return (
                      <TouchableOpacity
                        key={b}
                        onPress={() => {
                          update('bedRequest', b);
                          setShowBedDropdown(false);
                        }}
                        activeOpacity={0.8}
                        style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                      >
                        <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>
                          {bedLabels[b]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* 4. 포트폴리오 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>게스트 포트폴리오</Text>
                <Text style={styles.optional}>선택</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={form.portfolioUrl}
                onChangeText={(t) => update('portfolioUrl', t)}
                placeholder="작업물을 확인할 수 있는 인스타그램/포트폴리오 링크를 남겨주세요"
                placeholderTextColor={COLORS.gray2}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>

            {/* 5. 사전 문의 사항 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>사전 문의 사항</Text>
                <Text style={styles.optional}>선택</Text>
              </View>
              <TextInput
                style={styles.textArea}
                value={form.message}
                onChangeText={(t) => update('message', t)}
                placeholder="호스트에게 미리 확인하고 싶은 내용을 자유롭게 작성해 주세요."
                placeholderTextColor={COLORS.gray2}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity
              onPress={valid ? handleSubmit : undefined}
              activeOpacity={valid ? 0.85 : 1}
              style={[styles.submitBtn, !valid && styles.submitBtnDisabled]}
            >
              <Text style={[styles.submitText, !valid && styles.submitTextDisabled]}>
                {valid ? t('shop.sendToHost') : t('common.fillAllRequired')}
              </Text>
            </TouchableOpacity>
          </View>

          {toastVisible && (
            <Animated.View
              style={[
                styles.toast,
                { bottom: insets.bottom + 100, opacity: toastOpacity },
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

ShareBookingBottomSheet.displayName = 'ShareBookingBottomSheet';
export default ShareBookingBottomSheet;

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contextLabel: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  contextValue: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    flexShrink: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 22,
  },
  fieldBlock: {
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  required: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  optional: {
    color: COLORS.gray,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  radioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
  },
  radioChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.gray2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDotActive: {
    borderColor: COLORS.gold,
  },
  radioDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  radioText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  radioTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
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
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 21,
    minHeight: 110,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dropdownText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
  },
  dropdownPlaceholder: {
    color: COLORS.gray2,
  },
  dropdownList: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.goldDim,
  },
  dropdownItemText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
  },
  dropdownItemTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.sheet,
  },
  submitBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
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
