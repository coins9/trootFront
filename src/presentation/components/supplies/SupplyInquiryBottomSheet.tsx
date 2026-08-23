import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  View, Text, Modal, Animated, StyleSheet, Dimensions,
  TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, TextInput, Linking,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import { XIcon, CopyIcon, InfoIcon } from '../icons';
import { useToast } from '../common/Toast';
import { TattooSupply } from '../../../domain/entities/supplyTypes';
import { useTranslation } from '../../store/languageStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;

interface Props {
  visible: boolean;
  supply: TattooSupply | null;
  selectedOptions: Record<string, string>;
  onClose: () => void;
}

const SupplyInquiryBottomSheet = memo(({
  visible, supply, selectedOptions, onClose,
}: Props) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { toast } = useToast();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [quantity, setQuantity] = useState('1');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0, useNativeDriver: true, tension: 60, friction: 12,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT, duration: 240, useNativeDriver: true,
      }).start(() => {
        setQuantity('1');
        setPhone('');
        setMessage('');
      });
    }
  }, [visible, translateY]);

  const handleClose = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT, duration: 220, useNativeDriver: true,
    }).start(() => {
      onClose();
      setQuantity('1');
      setPhone('');
      setMessage('');
    });
  }, [onClose, translateY]);

  const qtyNum = parseInt(quantity, 10) || 1;
  const valid = !!(supply && qtyNum > 0);

  const buildMessage = useCallback(() => {
    if (!supply) return '';
    const lines = [
      t('supplies.inquiryMsgHeader'),
      `${t('supplies.inquiryMsgProduct')}: ${supply.name}`,
      ...(supply.subtitle ? [`${t('supplies.inquiryMsgDesc')}: ${supply.subtitle}`] : []),
      ...(supply.brand ? [`${t('supplies.inquiryMsgBrand')}: ${supply.brand}`] : []),
      ...(supply.price ? [`${t('supplies.inquiryMsgListPrice')}: ₩${supply.price.toLocaleString()}`] : []),
      `${t('supplies.inquiryMsgQty')}: ${qtyNum}${t('supplies.inquiryMsgQtyUnit')}`,
    ];
    Object.entries(selectedOptions).forEach(([k, v]) => {
      if (v) lines.push(`${k}: ${v}`);
    });
    if (phone.trim()) lines.push(`${t('supplies.inquiryMsgContact')}: ${phone.trim()}`);
    if (message.trim()) {
      lines.push('');
      lines.push(`${t('supplies.inquiryMsgContent')}:`);
      lines.push(message.trim());
    }
    return lines.join('\n');
  }, [supply, qtyNum, selectedOptions, phone, message]);

  const handleSubmit = useCallback(async () => {
    if (!supply) return;
    const text = buildMessage();
    Clipboard.setString(text);

    let target: string | null = null;
    if (supply.seller.kakaoLink) target = supply.seller.kakaoLink;
    else if (supply.seller.smsPhone) {
      target = `sms:${supply.seller.smsPhone}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(text)}`;
    }

    toast(t('common.copiedToChat'), { variant: 'success' });

    if (target) {
      setTimeout(() => Linking.openURL(target!).catch(() => {}), 500);
    }
    setTimeout(handleClose, 900);
  }, [supply, buildMessage, toast, handleClose]);

  if (!supply) return null;

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
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{t('supplies.inquiryTitle')}</Text>
              <Text
                style={styles.headerSub}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {supply.name}
              </Text>
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
            {/* Selected options summary */}
            {Object.keys(selectedOptions).length > 0 && (
              <View style={styles.optionSummary}>
                <Text style={styles.optionSummaryLabel}>{t('supplies.inquirySelectedOption')}</Text>
                <View style={styles.optionChipRow}>
                  {Object.entries(selectedOptions).map(([k, v]) =>
                    v ? (
                      <View key={k} style={styles.optionChip}>
                        <Text style={styles.optionChipText}>{k}: {v}</Text>
                      </View>
                    ) : null,
                  )}
                </View>
              </View>
            )}

            {/* 수량 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>1.</Text>
                <Text style={styles.fieldLabel}>{t('supplies.inquiryFieldQty')}</Text>
                <Text style={styles.required}>{t('common.required')}</Text>
              </View>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  onPress={() => setQuantity(String(Math.max(1, qtyNum - 1)))}
                  activeOpacity={0.75}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.qtyInput}
                  value={quantity}
                  onChangeText={(t) => setQuantity(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                <TouchableOpacity
                  onPress={() => setQuantity(String(qtyNum + 1))}
                  activeOpacity={0.75}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 연락처 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>2.</Text>
                <Text style={styles.fieldLabel}>{t('supplies.inquiryFieldContact')}</Text>
                <Text style={styles.optional}>{t('common.optional')}</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="010-0000-0000"
                placeholderTextColor={COLORS.gray2}
                keyboardType="phone-pad"
              />
            </View>

            {/* 문의 내용 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>3.</Text>
                <Text style={styles.fieldLabel}>{t('supplies.inquiryFieldMessage')}</Text>
                <Text style={styles.optional}>{t('common.optional')}</Text>
              </View>
              <TextInput
                style={styles.textArea}
                value={message}
                onChangeText={(t) => setMessage(t.slice(0, 500))}
                placeholder={t('supplies.inquiryMsgPlaceholder')}
                placeholderTextColor={COLORS.gray2}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>{message.length} / 500</Text>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <View style={styles.infoTitleRow}>
                <InfoIcon size={14} color={COLORS.gray} />
                <Text style={styles.infoTitle}>{t('common.infoTitle')}</Text>
              </View>
              <Text style={styles.infoText}>
                · 결제는 앱 내에서 진행되지 않습니다.{'\n'}
                · 문의 내용이 클립보드에 복사되고 판매자의{'\n'}  오픈카톡으로 연결됩니다.{'\n'}
                · 재고/배송/세금계산서는 판매자와 직접 협의해 주세요.
              </Text>
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity
              onPress={valid ? handleSubmit : undefined}
              activeOpacity={valid ? 0.85 : 1}
              style={[styles.submitBtn, !valid && styles.submitBtnDisabled]}
            >
              <CopyIcon size={17} color={valid ? COLORS.black : COLORS.gray2} strokeWidth={2} />
              <Text style={[styles.submitText, !valid && styles.submitTextDisabled]}>
                {t('supplies.inquiryCopyContact')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

SupplyInquiryBottomSheet.displayName = 'SupplyInquiryBottomSheet';
export default SupplyInquiryBottomSheet;

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: COLORS.overlay },
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
  headerCenter: { flex: 1, alignItems: 'center', gap: 4 },
  headerTitle: {
    color: COLORS.white, fontSize: 18, fontWeight: '700', lineHeight: 24,
  },
  headerSub: {
    color: COLORS.gray, fontSize: 12, lineHeight: 17,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: -4,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 22, paddingBottom: 20 },

  optionSummary: {
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  optionSummaryLabel: {
    color: COLORS.gray, fontSize: 12, lineHeight: 17,
  },
  optionChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  optionChipText: {
    color: COLORS.gold, fontSize: 12, fontWeight: '600', lineHeight: 17,
  },

  fieldBlock: { gap: 10 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  numLabel: { color: COLORS.white, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  fieldLabel: { color: COLORS.white, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  required: {
    color: COLORS.gold, fontSize: 11, lineHeight: 15, marginLeft: 2,
  },
  optional: {
    color: COLORS.gray, fontSize: 11, lineHeight: 15, marginLeft: 2,
  },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: {
    color: COLORS.white, fontSize: 18, fontWeight: '600', lineHeight: 22,
  },
  qtyInput: {
    flex: 1, textAlign: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.chipBorder,
    paddingVertical: 10,
    color: COLORS.white, fontSize: 15, fontWeight: '600', lineHeight: 20,
  },

  textInput: {
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.chipBorder,
    paddingHorizontal: 14, paddingVertical: 13,
    color: COLORS.white, fontSize: 14, lineHeight: 20,
  },
  textArea: {
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.chipBorder,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 28,
    color: COLORS.white, fontSize: 14, lineHeight: 21,
    minHeight: 110,
  },
  charCount: {
    alignSelf: 'flex-end',
    color: COLORS.gray, fontSize: 11, lineHeight: 15,
    marginTop: -22, marginRight: 12,
  },

  infoBox: {
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 14, gap: 8,
  },
  infoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoTitle: {
    color: COLORS.white, fontSize: 13, fontWeight: '600', lineHeight: 18,
  },
  infoText: {
    color: COLORS.gray, fontSize: 12, lineHeight: 19,
  },

  footer: {
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.sheet,
  },
  submitBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8,
  },
  submitBtnDisabled: { backgroundColor: COLORS.elevated },
  submitText: {
    color: COLORS.black, fontSize: 15, fontWeight: '700', lineHeight: 20,
  },
  submitTextDisabled: { color: COLORS.gray2 },
});
