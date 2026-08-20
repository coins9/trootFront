import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  View, Text, Modal, Animated, StyleSheet, Dimensions,
  TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, TextInput, Linking, Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import {
  XIcon, ChevronDownIcon, CalendarIcon, CopyIcon, CheckCircleIcon,
} from '../icons';
import {
  ModelApplicationForm,
  INITIAL_MODEL_APPLICATION_FORM,
  isModelApplicationValid,
  formatModelApplicationMessage,
  Gender,
  BodyStatus,
} from '../../../domain/entities/shopTypes';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.92;

const GENDERS: Gender[] = ['남성', '여성', '기타'];
const BODY_STATUSES: BodyStatus[] = [
  '타투/흉터 없음',
  '기존 타투 있음',
  '흉터 있음 (커버업 요망)',
];

interface Props {
  visible: boolean;
  postTitle: string;
  artistName: string;
  artistKakaoLink?: string;
  artistSmsPhone?: string;
  onClose: () => void;
}

const ModelApplicationBottomSheet = memo(({
  visible, postTitle, artistName, artistKakaoLink, artistSmsPhone, onClose,
}: Props) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [form, setForm] = useState<ModelApplicationForm>(INITIAL_MODEL_APPLICATION_FORM);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showCopiedNotice, setShowCopiedNotice] = useState(false);
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
        setForm(INITIAL_MODEL_APPLICATION_FORM);
        setShowGenderDropdown(false);
        setShowCopiedNotice(false);
      });
    }
  }, [visible, translateY]);

  const handleClose = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT, duration: 240, useNativeDriver: true,
    }).start(() => {
      onClose();
      setForm(INITIAL_MODEL_APPLICATION_FORM);
      setShowGenderDropdown(false);
      setShowCopiedNotice(false);
    });
  }, [onClose, translateY]);

  const update = useCallback(<K extends keyof ModelApplicationForm>(key: K, value: ModelApplicationForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const runToast = useCallback(() => {
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setShowToast(false));
  }, [toastOpacity]);

  const handleSubmit = useCallback(async () => {
    const message = formatModelApplicationMessage(postTitle, artistName, form);
    Clipboard.setString(message);

    let target: string | null = null;
    if (artistKakaoLink) target = artistKakaoLink;
    else if (artistSmsPhone) target = `sms:${artistSmsPhone}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;

    setShowCopiedNotice(true);
    runToast();

    if (target) {
      setTimeout(() => Linking.openURL(target!).catch(() => {}), 600);
    } else {
      setTimeout(() => {
        Alert.alert(
          '연락처 준비 중',
          '타투이스트가 등록한 연락망이 아직 없습니다.\n지원 내용은 클립보드에 복사되었습니다.',
        );
      }, 400);
    }
  }, [form, postTitle, artistName, artistKakaoLink, artistSmsPhone, runToast]);

  const valid = isModelApplicationValid(form);
  const messageLen = form.message.length;

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
              <Text style={styles.headerTitle}>모델 지원하기</Text>
              <Text style={styles.headerSub}>
                아래 정보를 작성하시면 타투이스트에게 전달됩니다.
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
            {/* 1. 성별 및 나이 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>1.</Text>
                <Text style={styles.fieldLabel}>성별 및 나이</Text>
                <Text style={styles.required}>필수</Text>
              </View>
              <View style={styles.rowGap}>
                <View style={styles.genderWrap}>
                  <TouchableOpacity
                    onPress={() => setShowGenderDropdown((v) => !v)}
                    activeOpacity={0.8}
                    style={styles.dropdownBtn}
                  >
                    <Text
                      style={[styles.dropdownText, !form.gender && styles.dropdownPlaceholder]}
                    >
                      {form.gender ?? '성별 선택'}
                    </Text>
                    <ChevronDownIcon size={14} color={COLORS.gray} />
                  </TouchableOpacity>
                  {showGenderDropdown && (
                    <View style={styles.dropdownList}>
                      {GENDERS.map((g) => {
                        const isSelected = form.gender === g;
                        return (
                          <TouchableOpacity
                            key={g}
                            onPress={() => {
                              update('gender', g);
                              setShowGenderDropdown(false);
                            }}
                            activeOpacity={0.8}
                            style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                          >
                            <Text
                              style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}
                            >
                              {g}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                <Text style={styles.dashSeparator}>-</Text>

                <View style={styles.ageWrap}>
                  <TextInput
                    style={styles.textInput}
                    value={form.age}
                    onChangeText={(t) => update('age', t.replace(/[^0-9]/g, '').slice(0, 3))}
                    placeholder="나이 입력"
                    placeholderTextColor={COLORS.gray2}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                  <Text style={styles.ageSuffix}>세</Text>
                </View>
              </View>
            </View>

            {/* 2. 희망 작업일 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>2.</Text>
                <Text style={styles.fieldLabel}>희망 작업일</Text>
                <Text style={styles.required}>필수</Text>
              </View>
              <View style={styles.dateInputWrap}>
                <TextInput
                  style={[styles.textInput, { flex: 1, paddingRight: 40 }]}
                  value={form.desiredDate}
                  onChangeText={(t) => update('desiredDate', t)}
                  placeholder="날짜 선택"
                  placeholderTextColor={COLORS.gray2}
                />
                <View style={styles.dateIconAbs}>
                  <CalendarIcon size={18} color={COLORS.gray} />
                </View>
              </View>
            </View>

            {/* 3. 작업 부위 상태 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>3.</Text>
                <Text style={styles.fieldLabel}>작업 부위 상태</Text>
                <Text style={styles.required}>필수</Text>
              </View>
              <View style={styles.radioColumn}>
                {BODY_STATUSES.map((s) => {
                  const isSelected = form.bodyStatus === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      onPress={() => update('bodyStatus', s)}
                      activeOpacity={0.8}
                      style={styles.radioRow}
                    >
                      <View style={[styles.radioDot, isSelected && styles.radioDotActive]}>
                        {isSelected && <View style={styles.radioDotInner} />}
                      </View>
                      <Text style={[styles.radioText, isSelected && styles.radioTextActive]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. 사진 안내 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>4.</Text>
                <Text style={styles.fieldLabel}>기존 타투/피부 상태 사진</Text>
              </View>
              <View style={styles.photoNotice}>
                <CalendarIcon size={22} color={COLORS.gray} />
                <View style={styles.photoNoticeText}>
                  <Text style={styles.photoNoticeMain}>
                    사진은 업로드 기능이 지원되지 않습니다.
                  </Text>
                  <Text style={styles.photoNoticeSub}>
                    사진은 채팅방 입장 후{'\n'}직접 전송해주세요.
                  </Text>
                </View>
              </View>
            </View>

            {/* 5. 사전 문의 및 남길 말 */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.numLabel}>5.</Text>
                <Text style={styles.fieldLabel}>사전 문의 및 남길 말</Text>
                <Text style={styles.optional}>선택</Text>
              </View>
              <View>
                <TextInput
                  style={styles.textArea}
                  value={form.message}
                  onChangeText={(t) => update('message', t.slice(0, 500))}
                  placeholder={'궁금한 점이나 하고 싶은 말을 남겨주세요.\n(최대 500자)'}
                  placeholderTextColor={COLORS.gray2}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.charCount}>{messageLen} / 500</Text>
              </View>
            </View>

            <View style={{ height: 8 }} />
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity
              onPress={valid ? handleSubmit : undefined}
              activeOpacity={valid ? 0.85 : 1}
              style={[styles.submitBtn, !valid && styles.submitBtnDisabled]}
            >
              <CopyIcon
                size={17}
                color={valid ? COLORS.black : COLORS.gray2}
                strokeWidth={2}
              />
              <Text style={[styles.submitText, !valid && styles.submitTextDisabled]}>
                {valid ? '[ 지원 내용 복사 및 연락하기 ]' : '필수 항목을 모두 입력해 주세요'}
              </Text>
            </TouchableOpacity>

            {showCopiedNotice && (
              <View style={styles.copiedNotice}>
                <CheckCircleIcon size={20} color={COLORS.gold} />
                <View>
                  <Text style={styles.copiedTitle}>지원 내용이 복사되었습니다.</Text>
                  <Text style={styles.copiedSub}>채팅창에 붙여넣기 해주세요!</Text>
                </View>
              </View>
            )}
          </View>

          {showToast && (
            <Animated.View
              style={[
                styles.toast,
                { bottom: insets.bottom + 110, opacity: toastOpacity },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.toastText}>
                지원 내용이 복사되었습니다.{'\n'}채팅창에 붙여넣기 해주세요!
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

ModelApplicationBottomSheet.displayName = 'ModelApplicationBottomSheet';
export default ModelApplicationBottomSheet;

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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  headerSub: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -4,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    gap: 22,
  },
  fieldBlock: {
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  numLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  fieldLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  required: {
    color: COLORS.gold,
    fontSize: 11,
    lineHeight: 15,
    marginLeft: 2,
  },
  optional: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    marginLeft: 2,
  },

  rowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genderWrap: {
    flex: 1,
  },
  dashSeparator: {
    color: COLORS.gray,
    fontSize: 16,
    lineHeight: 22,
  },
  ageWrap: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  ageSuffix: {
    position: 'absolute',
    right: 14,
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 20,
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
    paddingTop: 12,
    paddingBottom: 30,
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 21,
    minHeight: 120,
  },
  charCount: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },

  dateInputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  dateIconAbs: {
    position: 'absolute',
    right: 14,
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
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
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

  radioColumn: {
    gap: 12,
    marginTop: 2,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.gray2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDotActive: {
    borderColor: COLORS.gold,
  },
  radioDotInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.gold,
  },
  radioText: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 20,
  },
  radioTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },

  photoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    padding: 16,
  },
  photoNoticeText: {
    flex: 1,
    gap: 4,
  },
  photoNoticeMain: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
  },
  photoNoticeSub: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 18,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.sheet,
    gap: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
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

  copiedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  copiedTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  copiedSub: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
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
