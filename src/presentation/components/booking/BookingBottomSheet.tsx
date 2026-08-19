import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  View, Text, Modal, Animated, StyleSheet, Dimensions,
  TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
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
        ? await uploadImages('misc', form.referenceImages.map((uri) => ({ uri })))
        : undefined;

      await reservationApi.create({
        artistPageId,
        artworkId,
        scheduledAt: toScheduledAt(form.selectedDate!, form.selectedTime!),
        bodyPart: form.bodyPart ?? undefined,
        sizePreset: form.size ?? undefined,
        memo: form.referenceText.trim() || undefined,
        referenceImages,
      });

      handleClose();
      // 접수 직후 작가 오픈톡으로 연결 (없으면 토스트 안내)
      setTimeout(async () => {
        if (artistKakaoLink && (await Linking.canOpenURL(artistKakaoLink))) {
          Linking.openURL(artistKakaoLink).catch(() => {});
        } else {
          toast('예약 요청이 접수되었습니다. 작가가 확인 후 연락드립니다.', { variant: 'success' });
        }
      }, 350);
    } catch (e) {
      toast(
        e instanceof ApiError ? e.userMessage : '잠시 후 다시 시도해주세요.',
        { variant: 'error' },
      );
    } finally {
      setSubmitting(false);
    }
  }, [submitting, form, artistPageId, artworkId, artistKakaoLink, handleClose]);

  const handleSubmit = useCallback(() => {
    const summary = formatBookingMessage(artistName, designTitle, form);
    setConfirm({
      title: '예약 요청 확인',
      message: `${summary}\n\n요청을 보내면 작가 오픈톡으로 연결됩니다.\n상담 후 작가가 확정하면 예약이 등록돼요.`,
      cancelLabel: '취소',
      confirmLabel: '예약 요청',
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

  const valid = isBookingFormValid(form);

  return (
    <>
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              <Text style={styles.headerTitle}>예약 / 상담 요청서</Text>
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
            <Text style={styles.artistLabel}>작가</Text>
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
              bodyPart={form.bodyPart}
              size={form.size}
              onBodyPartChange={(p) => updateForm('bodyPart', p)}
              onSizeChange={(s) => updateForm('size', s)}
            />

            <Separator />

            <ReferenceStep
              images={form.referenceImages}
              text={form.referenceText}
              onImagesChange={(imgs) => updateForm('referenceImages', imgs)}
              onTextChange={(t) => updateForm('referenceText', t)}
            />

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
      </KeyboardAvoidingView>
    </Modal>
    <ConfirmModal config={confirm} onDismiss={() => setConfirm(null)} />
    </>
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
});
