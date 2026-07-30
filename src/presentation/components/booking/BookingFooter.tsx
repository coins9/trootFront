import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

interface BookingFooterProps {
  isValid: boolean;
  onSubmit: () => void;
  bottomInset: number;
}

const BookingFooter = memo(({ isValid, onSubmit, bottomInset }: BookingFooterProps) => (
  <View style={[styles.footer, { paddingBottom: bottomInset + 12 }]}>
    {!isValid && (
      <Text style={styles.hint}>필수 항목을 모두 확인해 주세요</Text>
    )}
    <TouchableOpacity
      onPress={isValid ? onSubmit : undefined}
      activeOpacity={isValid ? 0.85 : 1}
      style={[styles.btn, !isValid && styles.btnDisabled]}
    >
      <Text style={[styles.btnText, !isValid && styles.btnTextDisabled]}>
        {isValid ? '예약하기' : '필수 항목을 확인해 주세요'}
      </Text>
    </TouchableOpacity>
  </View>
));

BookingFooter.displayName = 'BookingFooter';
export default BookingFooter;

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.sheet,
    gap: 8,
  },
  hint: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: COLORS.elevated,
  },
  btnText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  btnTextDisabled: {
    color: COLORS.gray2,
  },
});
