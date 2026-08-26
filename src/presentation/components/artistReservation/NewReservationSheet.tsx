import React, { memo, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated,
  Dimensions, Platform, TextInput, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import {
  XIcon, CheckCircleIcon, ChatBubbleIcon,
  PaletteIcon, RefreshIcon, EditPenIcon, WonIcon,
} from '../icons';
import {
  PersonalTimelineItem, DepositStatus,
} from '../../../domain/entities/artistScheduleTypes';
import { useTranslation } from '../../store/languageStore';

interface Props {
  visible: boolean;
  dateLabel: string;
  editing: PersonalTimelineItem | null;
  onClose: () => void;
  onSubmit: (item: PersonalTimelineItem) => void;
}

const { height: SH } = Dimensions.get('window');

type KindKey = 'procedure' | 'consulting' | 'retouch' | 'meeting';

const KIND_ITEMS: {
  key: KindKey;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}[] = [
  { key: 'procedure',  label: '시술',   Icon: PaletteIcon },
  { key: 'consulting', label: '상담',   Icon: ChatBubbleIcon },
  { key: 'retouch',    label: '리터치', Icon: RefreshIcon },
  { key: 'meeting',    label: '미팅',   Icon: EditPenIcon },
];

const HOURS = Array.from({ length: 12 }, (_, i) => 9 + i); // 09~20
const DURATIONS: { label: string; value: number }[] = [
  { label: '30분', value: 0.5 },
  { label: '1시간', value: 1 },
  { label: '1.5시간', value: 1.5 },
  { label: '2시간', value: 2 },
  { label: '3시간', value: 3 },
  { label: '4시간', value: 4 },
  { label: '5시간+', value: 5 },
];

const emptyForm = (): PersonalTimelineItem => ({
  id: `pi-${Date.now()}`,
  startHour: 14,
  durationH: 1,
  title: '',
  subtitle: '',
  status: '대기',
  kind: 'procedure',
  customerName: '',
  bodyPart: '',
  memo: '',
  isAppLinked: false,
  depositStatus: 'none',
});

const NewReservationSheet = memo(({
  visible, dateLabel, editing, onClose, onSubmit,
}: Props) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const translate = useRef(new Animated.Value(SH)).current;
  const [form, setForm] = useState<PersonalTimelineItem>(emptyForm());
  const isEdit = editing !== null;

  const kindLabelMap: Record<KindKey, string> = {
    procedure: t('reservation.kindSession'),
    consulting: t('reservation.kindConsult'),
    retouch: t('reservation.kindRetouch'),
    meeting: t('reservation.kindMeeting'),
  };
  const durationLabel = (value: number): string => {
    if (value === 0.5) return t('reservation.duration30m');
    if (value === 1) return t('reservation.duration1h');
    if (value === 1.5) return t('reservation.duration1h30m');
    if (value === 2) return t('reservation.duration2h');
    if (value === 3) return t('reservation.duration3h');
    if (value === 4) return t('reservation.duration4h');
    if (value >= 5) return t('reservation.duration5h');
    return `${value}h`;
  };
  const depositLabel = (s: DepositStatus): string => {
    if (s === 'none') return t('reservation.depositNone');
    if (s === 'pending') return t('reservation.depositPendingOption');
    return t('reservation.depositPaidOption');
  };

  useEffect(() => {
    if (visible) setForm(editing ? { ...editing } : emptyForm());
    Animated.timing(translate, {
      toValue: visible ? 0 : SH,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [visible, editing, translate]);

  const setField = useCallback(<K extends keyof PersonalTimelineItem>(
    k: K, v: PersonalTimelineItem[K],
  ) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  }, []);

  const canSubmit = useMemo(
    () => form.title.trim().length >= 2 && (form.customerName ?? '').trim().length >= 1,
    [form],
  );

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    // subtitle 자동 생성
    const kindLabel = kindLabelMap[form.kind] ?? '';
    const subtitle = [
      kindLabel,
      form.customerName,
      durationLabel(form.durationH),
    ].filter(Boolean).join(' · ');
    onSubmit({ ...form, subtitle });
  }, [canSubmit, form, onSubmit]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kavWrap}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 12) + 12 },
              { transform: [{ translateY: translate }] },
            ]}
          >
            <View>
              <View style={styles.handle} />
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>
                    {isEdit ? t('reservation.sheetTitleEdit') : t('reservation.sheetTitleNew')}
                  </Text>
                  <Text style={styles.dateText}>{dateLabel}</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <XIcon size={20} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 8 }}
              >
                {/* Kind */}
                <Label>{t('reservation.fieldKind')}</Label>
                <View style={styles.kindGrid}>
                  {KIND_ITEMS.map((k) => {
                    const active = form.kind === k.key;
                    return (
                      <TouchableOpacity
                        key={k.key}
                        onPress={() => setField('kind', k.key)}
                        activeOpacity={0.85}
                        style={[styles.kindBtn, active && styles.kindBtnActive]}
                      >
                        <k.Icon
                          size={15}
                          color={active ? COLORS.black : COLORS.gray}
                          strokeWidth={1.7}
                        />
                        <Text style={[styles.kindText, active && styles.kindTextActive]}>
                          {kindLabelMap[k.key]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Title */}
                <Label>{t('reservation.fieldTitle')}</Label>
                <View style={styles.inputRow}>
                  <TextInput
                    value={form.title}
                    onChangeText={(v) => setField('title', v)}
                    placeholder={t('reservation.placeholderTitle')}
                    placeholderTextColor={COLORS.gray2}
                    style={styles.input}
                    maxLength={40}
                  />
                </View>

                {/* Customer name */}
                <Label>{t('reservation.fieldCustomer')}</Label>
                <View style={styles.inputRow}>
                  <TextInput
                    value={form.customerName}
                    onChangeText={(v) => setField('customerName', v)}
                    placeholder={t('reservation.placeholderCustomer')}
                    placeholderTextColor={COLORS.gray2}
                    style={styles.input}
                    maxLength={20}
                  />
                </View>

                {/* Start hour */}
                <Label>{t('reservation.fieldTime')}</Label>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hourScroll}
                >
                  {HOURS.map((h) => {
                    const active = Math.floor(form.startHour) === h;
                    return (
                      <TouchableOpacity
                        key={h}
                        onPress={() => setField('startHour', h)}
                        activeOpacity={0.85}
                        style={[styles.hourChip, active && styles.hourChipActive]}
                      >
                        <Text style={[styles.hourText, active && styles.hourTextActive]}>
                          {String(h).padStart(2, '0')}:00
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Duration */}
                <Label>{t('reservation.fieldDuration')}</Label>
                <View style={styles.chipGrid}>
                  {DURATIONS.map((d) => {
                    const active = form.durationH === d.value;
                    return (
                      <TouchableOpacity
                        key={d.value}
                        onPress={() => setField('durationH', d.value)}
                        activeOpacity={0.85}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {durationLabel(d.value)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Body part */}
                <Label>{t('reservation.fieldBodyPart')}</Label>
                <View style={styles.inputRow}>
                  <TextInput
                    value={form.bodyPart}
                    onChangeText={(v) => setField('bodyPart', v)}
                    placeholder={t('reservation.placeholderBodyPart')}
                    placeholderTextColor={COLORS.gray2}
                    style={styles.input}
                    maxLength={30}
                  />
                </View>

                {/* Deposit */}
                <Label>{t('reservation.fieldDeposit')}</Label>
                <View style={styles.depositRow}>
                  {(['none', 'pending', 'paid'] as DepositStatus[]).map((s) => {
                    const active = (form.depositStatus ?? 'none') === s;
                    const label = depositLabel(s);
                    return (
                      <TouchableOpacity
                        key={s}
                        onPress={() => setField('depositStatus', s)}
                        activeOpacity={0.85}
                        style={[styles.depositBtn, active && styles.depositBtnActive]}
                      >
                        <Text style={[styles.depositText, active && styles.depositTextActive]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {form.depositStatus !== 'none' && (
                  <View style={styles.inputRow}>
                    <WonIcon size={14} color={COLORS.gray} strokeWidth={1.7} />
                    <TextInput
                      value={String(form.depositAmount ?? '')}
                      onChangeText={(v) =>
                        setField('depositAmount', Number(v.replace(/\D/g, '') || 0))
                      }
                      placeholder={t('reservation.placeholderDepositAmount')}
                      placeholderTextColor={COLORS.gray2}
                      keyboardType="number-pad"
                      style={styles.input}
                    />
                    <Text style={styles.suffix}>{t('common.won')}</Text>
                  </View>
                )}

                {/* Memo */}
                <Label>{t('reservation.fieldNote')}</Label>
                <View style={styles.memoWrap}>
                  <TextInput
                    value={form.memo}
                    onChangeText={(v) => setField('memo', v)}
                    placeholder={t('reservation.placeholderNote')}
                    placeholderTextColor={COLORS.gray2}
                    multiline
                    maxLength={200}
                    style={styles.memoInput}
                    textAlignVertical="top"
                  />
                </View>

                {/* App link toggle */}
                <TouchableOpacity
                  onPress={() => setField('isAppLinked', !form.isAppLinked)}
                  activeOpacity={0.85}
                  style={styles.linkRow}
                >
                  <View style={[
                    styles.checkbox,
                    form.isAppLinked && styles.checkboxActive,
                  ]}>
                    {form.isAppLinked && (
                      <CheckCircleIcon size={14} color={COLORS.black} />
                    )}
                  </View>
                  <Text style={styles.linkLabel}>{t('reservation.fieldAppLink')}</Text>
                </TouchableOpacity>
              </ScrollView>

              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={!canSubmit}
                style={[styles.saveBtn, !canSubmit && styles.saveBtnDisabled]}
              >
                <CheckCircleIcon size={16} color={COLORS.black} />
                <Text style={styles.saveText}>
                  {isEdit ? t('reservation.submitEdit') : t('reservation.submitNew')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});
NewReservationSheet.displayName = 'NewReservationSheet';
export default NewReservationSheet;

const Label = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.label}>{children}</Text>
);

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  kavWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: SH * 0.9,
  },
  handle: {
    alignSelf: 'center',
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray3,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },
  dateText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 3,
  },
  scroll: { maxHeight: SH * 0.68 },

  label: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
    padding: 0,
  },
  suffix: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },

  kindGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  kindBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingVertical: 10,
  },
  kindBtnActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  kindText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  kindTextActive: {
    color: COLORS.black,
    fontWeight: '800',
  },

  hourScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  hourChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hourChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212,168,67,0.15)',
  },
  hourText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  hourTextActive: {
    color: COLORS.gold,
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212,168,67,0.15)',
  },
  chipText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  chipTextActive: {
    color: COLORS.gold,
  },

  depositRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  depositBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingVertical: 10,
    alignItems: 'center',
  },
  depositBtnActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212,168,67,0.15)',
  },
  depositText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  depositTextActive: {
    color: COLORS.gold,
  },

  memoWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    minHeight: 80,
  },
  memoInput: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
    padding: 0,
    minHeight: 50,
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20, height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.gray3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  linkLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    flex: 1,
  },

  saveBtn: {
    marginTop: 14,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
});
