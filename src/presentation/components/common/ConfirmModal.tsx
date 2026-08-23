import React, { memo, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import {
  AlertInfoIcon, ShieldCheckIcon, CheckCircleIcon,
} from '../icons';
import { useTranslation } from '../../store/languageStore';

export type ConfirmVariant = 'default' | 'danger' | 'info';

export interface ConfirmConfig {
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface Props {
  config: ConfirmConfig | null;
  onDismiss: () => void;
}

const iconFor = (v: ConfirmVariant) => {
  switch (v) {
    case 'danger': return ShieldCheckIcon;
    case 'info':   return AlertInfoIcon;
    default:       return CheckCircleIcon;
  }
};

const colorFor = (v: ConfirmVariant) => {
  switch (v) {
    case 'danger': return COLORS.danger;
    default:       return COLORS.gold;
  }
};

const ConfirmModal = memo(({ config, onDismiss }: Props) => {
  const { t } = useTranslation();
  const visible = config !== null;
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.92);
      opacity.setValue(0);
    }
  }, [visible, scale, opacity]);

  if (!config) return null;

  const variant = config.variant ?? 'default';
  const Icon = iconFor(variant);
  const accent = colorFor(variant);
  const isDanger = variant === 'danger';

  const handleConfirm = () => {
    config.onConfirm();
    onDismiss();
  };
  const handleCancel = () => {
    config.onCancel?.();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
      hardwareAccelerated
    >
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
          <Pressable onPress={() => {}}>
            <View style={styles.card}>
              <View style={[
                styles.iconWrap,
                { backgroundColor: `${accent}22`, borderColor: `${accent}66` },
              ]}>
                <Icon size={28} color={accent} strokeWidth={1.8} />
              </View>
              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.message}>{config.message}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={handleCancel}
                  activeOpacity={0.85}
                  style={[styles.btn, styles.btnCancel]}
                >
                  <Text style={styles.btnCancelText}>
                    {config.cancelLabel ?? t('common.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirm}
                  activeOpacity={0.85}
                  style={[
                    styles.btn,
                    isDanger ? styles.btnDanger : styles.btnPrimary,
                  ]}
                >
                  <Text style={isDanger ? styles.btnDangerText : styles.btnPrimaryText}>
                    {config.confirmLabel ?? t('common.confirm')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
});
ConfirmModal.displayName = 'ConfirmModal';
export default ConfirmModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    minWidth: 260,
    borderRadius: 20,
    backgroundColor: COLORS.sheet,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 16,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56, height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnCancelText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  btnPrimary: {
    backgroundColor: COLORS.gold,
  },
  btnPrimaryText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  btnDanger: {
    backgroundColor: COLORS.danger,
  },
  btnDangerText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
});
