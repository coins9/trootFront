import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  View, Text, Modal, Animated, StyleSheet, Dimensions,
  TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, Linking, Keyboard, TextInput,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import { useTranslation } from '../../store/languageStore';
import { XIcon } from '../icons';
import ConfirmModal, { ConfirmConfig } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';
import {
  BookingFormData,
  INITIAL_BOOKING_FORM,
  isBookingFormValid,
  formatBookingMessage,
  toScheduledAt,
} from '../../../domain/entities/bookingTypes';
import { reservationApi } from '../../../data/api';
import { ApiError } from '../../../data/api/client';
import { uploadImages } from '../../../data/api/upload';
import DatePickerStep from './steps/DatePickerStep';
import BodySizeStep from './steps/BodySizeStep';
import ReferenceStep from './steps/ReferenceStep';
import AgreementStep from './steps/AgreementStep';
import BookingFooter from './BookingFooter';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.92;

interface BookingBottomSheetProps {
  visible: boolean;
  artistPageId: string;
  artistName: string;
  artistKakaoLink?: string;
  artworkId?: string;
  designTitle?: string;
  onClose: () => void;
}

const Separator = () => <View style={styles.separator} />;

const BookingBottomSheet = memo(({
  visible,
  artistPageId,
  artistName,
  artistKakaoLink,
  artworkId,
  designTitle,
  onClose,
}: BookingBottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [form, setForm] = useState<BookingFormData>(INITIAL_BOOKING_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 12,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      }).start(() => {
        setForm(INITIAL_BOOKING_FORM);
      });
    }
  }, [visible, translateY]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setForm(INITIAL_BOOKING_FORM);
    });
  }, [onClose, translateY]);

  // 예약 요청을 서버에 남기고(대기 상태) 곧바로 작가 오픈톡으로 연결한다.
  // 이후 작가가 오픈톡 상담 뒤 '확정'하면 예약관리에 정식 등록된다.
  const submit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const referenceImages = form.referenceImages.length
        ? await uploadImages('misc', form.referenceImages)
        : undefined;

      // 요청 내용을 클립보드에 복사 → 오픈톡 채팅창에 바로 붙여넣기 가능
      Clipboard.setString(formatBookingMessage(artistName, designTitle, form));

      await reservationApi.create({
        artistPageId,
        artworkId,
        scheduledAt: toScheduledAt(form.selectedDate!, form.selectedTime!),
        // 복수 선택 → 콤마 결합해 저장(백엔드 단일 문자열 컬럼과 호환)
        bodyPart: form.bodyParts.join(', ') || undefined,
        sizePreset: form.sizes.join(', ') || undefined,
        memo: form.referenceText.trim() || undefined,
        // 연락 수단(전부 선택) — 오픈톡 이탈 대비 예약 DB 에도 저장(2중 안전장치)
        customerContact: form.contact.trim() || undefined,
        customerInstagram: form.instagram.trim() || undefined,
        customerOpenChat: form.openChat.trim() || undefined,
        referenceImages,
      });

      handleClose();
      // 접수 직후 작가 오픈톡으로 연결 + 붙여넣기 안내 (오픈톡 없으면 접수 안내)
      setTimeout(() => {
        if (artistKakaoLink) {
          Linking.openURL(artistKakaoLink)
            .then(() => toast(t('booking.copiedToChat'), { variant: 'success' }))
            .catch(() => toast(t('booking.successNoChat'), { variant: 'success' }));
        } else {
          toast(t('booking.successNoChat'), { variant: 'success' });
        }
      }, 350);
    } catch (e) {
      toast(
        e instanceof ApiError ? e.userMessage : t('booking.errorRetry'),
        { variant: 'error' },
      );
    } finally {
      setSubmitting(false);
    }
  }, [submitting, form, artistPageId, artworkId, artistKakaoLink, handleClose]);

  const handleSubmit = useCallback(() => {
    // [10] CTA 클릭 직전 키보드를 내려 확정 모달/화면 위에 남지 않게 함
    Keyboard.dismiss();
    const summary = formatBookingMessage(artistName, designTitle, form);
    setConfirm({
      title: t('booking.confirmTitle'),
      message: t('booking.confirmMessage').replace('{{summary}}', summary),
      cancelLabel: t('booking.cancelLabel'),
      confirmLabel: t('booking.confirmLabel'),
      variant: 'default',
      onConfirm: () => { void submit(); },
    });
  }, [artistName, designTitle, form, submit]);

  const updateForm = useCallback(<K extends keyof BookingFormData>(
    key: K,
    value: BookingFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleBodyPart = useCallback((part: string) => {
    setForm((prev) => ({
      ...prev,
      bodyParts: prev.bodyParts.includes(part)
        ? prev.bodyParts.filter((p) => p !== part)
        : [...prev.bodyParts, part],
    }));
  }, []);

  const toggleSize = useCallback((size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  }, []);

  const valid = isBookingFormValid(form);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {designTitle ? (
                <Text
                  style={styles.headerSub}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {designTitle}
                </Text>
              ) : null}
              <Text style={styles.headerTitle}>{t('booking.sheetTitle')}</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <XIcon size={20} color={COLORS.white} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Artist name row */}
          <View style={styles.artistRow}>
            <Text style={styles.artistLabel}>{t('booking.artistLabel')}</Text>
            <Text style={styles.artistName}>{artistName}</Text>
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <DatePickerStep
              selectedDate={form.selectedDate}
              selectedTime={form.selectedTime}
              onDateChange={(d) => updateForm('selectedDate', d)}
              onTimeChange={(t) => updateForm('selectedTime', t)}
            />

            <Separator />

            <BodySizeStep
              bodyParts={form.bodyParts}
              sizes={form.sizes}
              onToggleBodyPart={toggleBodyPart}
              onToggleSize={toggleSize}
            />

            <Separator />

            <ReferenceStep
              images={form.referenceImages}
              text={form.referenceText}
              onImagesChange={(imgs) => updateForm('referenceImages', imgs)}
              onTextChange={(t) => updateForm('referenceText', t)}
            />

            <Separator />

            {/* 연락 수단 — 전화/인스타/오픈톡 모두 선택(비필수). 오픈톡 이탈 대비 예약 DB 에도 저장 */}
            <View style={styles.contactBlock}>
              <View style={styles.contactLabelRow}>
                <Text style={styles.contactTitle}>{t('booking.contactTitle')}</Text>
                <Text style={styles.contactOptional}>{t('common.optional')}</Text>
              </View>
              <Text style={styles.contactSub}>{t('booking.contactSub')}</Text>
              <TextInput
                style={styles.contactInput}
                value={form.contact}
                onChangeText={(v) => updateForm('contact', v)}
                placeholder={t('booking.contactPhonePlaceholder')}
                placeholderTextColor={COLORS.gray2}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.contactInput}
                value={form.instagram}
                onChangeText={(v) => updateForm('instagram', v)}
                placeholder={t('booking.contactInstagramPlaceholder')}
                placeholderTextColor={COLORS.gray2}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.contactInput}
                value={form.openChat}
                onChangeText={(v) => updateForm('openChat', v)}
                placeholder={t('booking.contactOpenChatPlaceholder')}
                placeholderTextColor={COLORS.gray2}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Separator />

            <AgreementStep
              agreed={form.agreedToTerms}
              onToggle={() => updateForm('agreedToTerms', !form.agreedToTerms)}
            />

            <View style={{ height: 12 }} />
          </ScrollView>

          {/* Sticky footer */}
          <BookingFooter
            isValid={valid && !submitting}
            onSubmit={handleSubmit}
            bottomInset={insets.bottom}
          />
        </Animated.View>

        {/* 확정 다이얼로그 — 부모 Modal 위에 Modal 을 겹치면 iOS 가 멈추므로
            같은 Modal 내부에서 inline(View 오버레이)으로 렌더 */}
        <ConfirmModal config={confirm} onDismiss={() => setConfirm(null)} inline />
      </KeyboardAvoidingView>
    </Modal>
  );
});

BookingBottomSheet.displayName = 'BookingBottomSheet';
export default BookingBottomSheet;

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
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    height: SHEET_HEIGHT,
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
  headerLeft: {
    flexShrink: 1,
    gap: 2,
  },
  headerSub: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
    flexShrink: 1,
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
    flexShrink: 0,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  artistLabel: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  artistName: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 0,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  contactBlock: { gap: 8 },
  contactLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', lineHeight: 22 },
  contactReq: {
    color: COLORS.gold, fontSize: 11, fontWeight: '700', lineHeight: 15,
    borderWidth: 1, borderColor: COLORS.gold, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1,
  },
  contactOptional: {
    color: COLORS.gray, fontSize: 11, fontWeight: '600', lineHeight: 15,
    borderWidth: 1, borderColor: COLORS.chipBorder, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1,
  },
  contactSub: { color: COLORS.gray, fontSize: 13, lineHeight: 19 },
  contactInput: {
    backgroundColor: COLORS.elevated, borderRadius: 10, borderWidth: 1, borderColor: COLORS.chipBorder,
    paddingHorizontal: 14, paddingVertical: 13, color: COLORS.white, fontSize: 14, lineHeight: 20, marginTop: 2,
  },
});
