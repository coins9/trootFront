import React, { memo, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import {
  XIcon, CalendarIcon, ClockOutlineIcon, PaletteIcon, ChatBubbleIcon,
  RefreshIcon, EditPenIcon, PersonSilhouette, CheckCircleIcon,
} from '../icons';
import { BookingStatus } from '../../../domain/entities/artistScheduleTypes';

export interface ReservationDetail {
  id: string;
  title: string;
  customerName?: string;
  columnLabel?: string;
  bodyPart?: string;
  tattooType?: string;
  memo?: string;
  isAppLinked: boolean;
  status: BookingStatus;
  timeLabel: string;
  dateLabel: string;
  kind: 'procedure' | 'consulting' | 'retouch' | 'meeting' | 'break';
}

interface Props {
  detail: ReservationDetail | null;
  onClose: () => void;
  onRequestNoShow: (id: string, customerName?: string) => void;
  onRequestComplete: (id: string) => void;
  onEdit: (id: string) => void;
}

const { height: SH } = Dimensions.get('window');

const kindIcon = (kind: ReservationDetail['kind']) => {
  switch (kind) {
    case 'consulting': return ChatBubbleIcon;
    case 'procedure':  return PaletteIcon;
    case 'retouch':    return RefreshIcon;
    case 'meeting':    return EditPenIcon;
    default:           return PaletteIcon;
  }
};

const ReservationDetailModal = memo(({
  detail, onClose, onRequestNoShow, onRequestComplete, onEdit,
}: Props) => {
  const visible = detail !== null;
  const translate = useRef(new Animated.Value(SH)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(translate, {
      toValue: visible ? 0 : SH,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, translate]);

  const handleNoShow = useCallback(() => {
    if (!detail) return;
    onRequestNoShow(detail.id, detail.customerName);
  }, [detail, onRequestNoShow]);

  const handleConfirmDone = useCallback(() => {
    if (!detail) return;
    onRequestComplete(detail.id);
  }, [detail, onRequestComplete]);

  const handleEdit = useCallback(() => {
    if (!detail) return;
    onEdit(detail.id);
  }, [detail, onEdit]);

  if (!detail) return null;

  const KindIcon = kindIcon(detail.kind);
  const isNoShow = detail.status === '노쇼';
  const isDone = detail.status === '완료';

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
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 12) + 14 },
            { transform: [{ translateY: translate }] },
          ]}
        >
          <Pressable onPress={() => {}}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <View style={styles.kindPill}>
                <KindIcon size={14} color={COLORS.gold} strokeWidth={1.7} />
                <Text style={styles.kindPillText}>
                  {detail.kind === 'consulting' ? '상담'
                    : detail.kind === 'procedure' ? '시술'
                    : detail.kind === 'retouch'   ? '리터치'
                    : detail.kind === 'meeting'   ? '미팅'
                    : '휴식'}
                </Text>
              </View>
              <View style={[
                styles.statusChip,
                isNoShow && styles.statusChipDanger,
                isDone && styles.statusChipDone,
              ]}>
                <Text style={[
                  styles.statusChipText,
                  isNoShow && styles.statusChipTextDanger,
                  isDone && styles.statusChipTextDone,
                ]}>
                  {detail.status}
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

            <Text style={styles.title}>{detail.title}</Text>

            {/* Customer */}
            <View style={styles.customerRow}>
              <View style={styles.avatar}>
                <PersonSilhouette size={44} color="#3a3a3a" />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.customerName}>
                  {detail.customerName ?? '고객명 미등록'}
                </Text>
                <View style={styles.appLinkRow}>
                  <View style={[
                    styles.appLinkDot,
                    { backgroundColor: detail.isAppLinked ? COLORS.gold : COLORS.gray },
                  ]} />
                  <Text style={styles.appLinkText}>
                    {detail.isAppLinked
                      ? 'T:ROOT 앱 연동 예약'
                      : '외부 유입 (오픈톡·수기)'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Meta */}
            <View style={styles.metaBlock}>
              <View style={styles.metaRow}>
                <CalendarIcon size={16} color={COLORS.gold} strokeWidth={1.7} />
                <Text style={styles.metaLabel}>날짜</Text>
                <Text style={styles.metaValue}>{detail.dateLabel}</Text>
              </View>
              <View style={styles.metaRow}>
                <ClockOutlineIcon size={16} color={COLORS.gold} strokeWidth={1.7} />
                <Text style={styles.metaLabel}>시간</Text>
                <Text style={styles.metaValue}>{detail.timeLabel}</Text>
              </View>
              {detail.columnLabel && (
                <View style={styles.metaRow}>
                  <PaletteIcon size={16} color={COLORS.gold} strokeWidth={1.7} />
                  <Text style={styles.metaLabel}>배정</Text>
                  <Text style={styles.metaValue}>{detail.columnLabel}</Text>
                </View>
              )}
              {(detail.bodyPart || detail.tattooType) && (
                <View style={styles.metaRow}>
                  <PaletteIcon size={16} color={COLORS.gold} strokeWidth={1.7} />
                  <Text style={styles.metaLabel}>내용</Text>
                  <Text style={styles.metaValue}>
                    {[detail.tattooType, detail.bodyPart].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              )}
            </View>

            {/* Memo */}
            {detail.memo && (
              <View style={styles.memoBox}>
                <Text style={styles.memoLabel}>기획서 메모</Text>
                <Text style={styles.memoText}>{detail.memo}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={handleNoShow}
                activeOpacity={0.85}
                style={[styles.actionBtn, styles.actionDanger]}
                disabled={isNoShow}
              >
                <Text style={[
                  styles.actionDangerText,
                  isNoShow && styles.actionDisabledText,
                ]}>
                  {isNoShow ? '노쇼 처리됨' : '노쇼 처리'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEdit}
                activeOpacity={0.85}
                style={[styles.actionBtn, styles.actionGhost]}
              >
                <Text style={styles.actionGhostText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDone}
                activeOpacity={0.85}
                style={[styles.actionBtn, styles.actionPrimary]}
                disabled={isDone}
              >
                <CheckCircleIcon size={16} color={COLORS.black} />
                <Text style={styles.actionPrimaryText}>
                  {isDone ? '완료됨' : '시술 완료'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
});
ReservationDetailModal.displayName = 'ReservationDetailModal';
export default ReservationDetailModal;

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
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  kindPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(212,168,67,0.08)',
  },
  kindPillText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  statusChip: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  statusChipDanger: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(232,85,85,0.12)',
  },
  statusChipTextDanger: {
    color: COLORS.danger,
  },
  statusChipDone: {
    borderColor: COLORS.gray3,
    backgroundColor: COLORS.elevated,
  },
  statusChipTextDone: {
    color: COLORS.gray,
  },

  title: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 16,
  },

  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  customerName: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  appLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appLinkDot: {
    width: 6, height: 6, borderRadius: 3,
  },
  appLinkText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },

  metaBlock: {
    gap: 10,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaLabel: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
    width: 40,
  },
  metaValue: {
    flex: 1,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  memoBox: {
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    gap: 4,
  },
  memoLabel: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  memoText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  actionDanger: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(232,85,85,0.1)',
  },
  actionDangerText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  actionGhost: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
  },
  actionGhostText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionPrimary: {
    backgroundColor: COLORS.gold,
    flex: 1.3,
  },
  actionPrimaryText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  actionDisabledText: {
    opacity: 0.55,
  },
});
