import React, { memo, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated,
  Dimensions, Platform,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { XIcon } from '../icons';

export interface SuperUpPlan {
  id: string;
  label: string;
  price: number;
  isBest?: boolean;
}

const PLANS: SuperUpPlan[] = [
  { id: 'su1',  label: '1회권',  price: 8900 },
  { id: 'su3',  label: '3회권',  price: 11000, isBest: true },
  { id: 'su5',  label: '5회권',  price: 16000 },
  { id: 'su10', label: '10회권', price: 29000 },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onPurchase: (plan: SuperUpPlan) => void;
}

const { height: SH } = Dimensions.get('window');
const formatPrice = (v: number) => v.toLocaleString();

const SuperUpBottomSheet = memo(({ visible, onClose, onPurchase }: Props) => {
  const translate = useRef(new Animated.Value(SH)).current;
  const defaultId = useMemo(() => PLANS.find((p) => p.isBest)?.id ?? PLANS[0].id, []);
  const [selectedId, setSelectedId] = useState<string>(defaultId);

  const selected = useMemo(
    () => PLANS.find((p) => p.id === selectedId) ?? PLANS[0],
    [selectedId],
  );

  useEffect(() => {
    if (visible) setSelectedId(defaultId);
    Animated.timing(translate, {
      toValue: visible ? 0 : SH,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [visible, translate, defaultId]);

  const handlePay = useCallback(() => {
    onPurchase(selected);
  }, [onPurchase, selected]);

  if (!visible) return null;

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
          style={[styles.sheet, { transform: [{ translateY: translate }] }]}
        >
          <Pressable onPress={() => {}}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>슈퍼UP 횟수권 선택</Text>
                <Text style={styles.desc}>
                  게시물을 상단으로 강제 노출시키는 유료 광고 상품입니다.
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <XIcon size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.options}>
              {PLANS.map((plan) => {
                const selectedActive = plan.id === selectedId;
                const goldBorder = selectedActive || plan.isBest;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    onPress={() => setSelectedId(plan.id)}
                    activeOpacity={0.85}
                    style={[
                      styles.optionRow,
                      goldBorder && styles.optionRowGold,
                      selectedActive && styles.optionRowSelected,
                    ]}
                  >
                    <View style={styles.optionLeft}>
                      <View style={[
                        styles.radio,
                        selectedActive && styles.radioActive,
                      ]}>
                        {selectedActive && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[
                        styles.optionLabel,
                        selectedActive && styles.optionLabelActive,
                      ]}>
                        {plan.label}
                      </Text>
                    </View>
                    <View style={styles.optionRight}>
                      <Text style={styles.optionPrice}>
                        {formatPrice(plan.price)}원
                      </Text>
                    </View>
                    {plan.isBest && (
                      <View style={styles.bestBadge}>
                        <Text style={styles.bestBadgeText}>PREMIUM</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handlePay}
              activeOpacity={0.85}
              style={styles.payBtn}
            >
              <Text style={styles.payText}>
                {formatPrice(selected.price)}원 결제하기
              </Text>
            </TouchableOpacity>

            <Text style={styles.noteText}>
              결제 후 즉시 슈퍼UP 노출이 시작되며 부분 환불이 불가합니다.
            </Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
});
SuperUpBottomSheet.displayName = 'SuperUpBottomSheet';
export default SuperUpBottomSheet;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 32 : 22,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  handle: {
    alignSelf: 'center',
    width: 42, height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray3,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 8,
  },
  title: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    marginBottom: 6,
  },
  desc: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 18,
  },

  options: {
    gap: 10,
    marginBottom: 18,
  },
  optionRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  optionRowGold: {
    borderColor: COLORS.gold,
  },
  optionRowSelected: {
    backgroundColor: 'rgba(212,168,67,0.08)',
    borderWidth: 1.5,
  },

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  radio: {
    width: 20, height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.gray3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: COLORS.gold,
  },
  radioDot: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },
  optionLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  optionLabelActive: {
    color: COLORS.white,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionPrice: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },

  bestBadge: {
    position: 'absolute',
    top: -8, right: 12,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  bestBadgeText: {
    color: COLORS.black,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 14,
    letterSpacing: 0.5,
  },

  payBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  noteText: {
    color: COLORS.gray2,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
  },
});
