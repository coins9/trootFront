import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  View, Text, Modal, Animated, StyleSheet, Dimensions,
  TouchableWithoutFeedback, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import { XIcon, CheckCircleIcon } from '../icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props<T extends string> {
  visible: boolean;
  title: string;
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

function ShareFilterBottomSheetInner<T extends string>({
  visible, title, options, selected, onSelect, onClose,
}: Props<T>) {
  const insets = useSafeAreaInsets();
  const maxSheetH = SCREEN_HEIGHT * 0.7;
  const translateY = useRef(new Animated.Value(maxSheetH)).current;
  const [draft, setDraft] = useState<T>(selected);

  useEffect(() => {
    if (visible) {
      setDraft(selected);
      Animated.spring(translateY, {
        toValue: 0, useNativeDriver: true, tension: 65, friction: 12,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: maxSheetH, duration: 240, useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY, selected, maxSheetH]);

  const handleClose = useCallback(() => {
    Animated.timing(translateY, {
      toValue: maxSheetH, duration: 220, useNativeDriver: true,
    }).start(() => onClose());
  }, [onClose, translateY, maxSheetH]);

  const handleApply = useCallback(() => {
    onSelect(draft);
    handleClose();
  }, [draft, onSelect, handleClose]);

  const handleReset = useCallback(() => {
    setDraft(options[0]);
  }, [options]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            { maxHeight: maxSheetH, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <XIcon size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {options.map((opt) => {
              const isActive = opt === draft;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setDraft(opt)}
                  activeOpacity={0.75}
                  style={[styles.row, isActive && styles.rowActive]}
                >
                  <Text style={[styles.rowText, isActive && styles.rowTextActive]}>
                    {opt}
                  </Text>
                  {isActive && <CheckCircleIcon size={22} color={COLORS.gold} />}
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 8 }} />
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity
              onPress={handleReset}
              style={styles.resetBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.resetText}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={styles.applyBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.applyText}>적용하기</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const ShareFilterBottomSheet = memo(ShareFilterBottomSheetInner) as typeof ShareFilterBottomSheetInner;

export default ShareFilterBottomSheet;

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: COLORS.overlay },
  sheet: {
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.gray3,
    marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowActive: {
    backgroundColor: COLORS.goldDim,
  },
  rowText: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 20,
    flexShrink: 1,
  },
  rowTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.sheet,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    alignItems: 'center',
  },
  resetText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  applyText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
});
