import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated,
  Dimensions, Platform, TextInput, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import {
  XIcon, LocationPinIcon, CameraSolidIcon, PersonSilhouette,
} from '../icons';
import { ArtistSelfProfile } from '../../../domain/entities/artistMyPageTypes';

interface Props {
  visible: boolean;
  profile: ArtistSelfProfile;
  onClose: () => void;
  onSave: (next: Partial<ArtistSelfProfile>) => void;
}

const { height: SH } = Dimensions.get('window');
const INTRO_MAX = 80;

const EditProfileSheet = memo(({ visible, profile, onClose, onSave }: Props) => {
  const translate = useRef(new Animated.Value(SH)).current;
  const insets = useSafeAreaInsets();
  const [nickname, setNickname] = useState(profile.nickname);
  const [location, setLocation] = useState(profile.location);
  const [intro, setIntro] = useState(profile.intro);

  useEffect(() => {
    if (visible) {
      setNickname(profile.nickname);
      setLocation(profile.location);
      setIntro(profile.intro);
    }
    Animated.timing(translate, {
      toValue: visible ? 0 : SH,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [visible, profile, translate]);

  const handleSave = useCallback(() => {
    onSave({
      nickname: nickname.trim() || profile.nickname,
      location: location.trim() || profile.location,
      intro: intro.trim() || profile.intro,
    });
  }, [nickname, location, intro, profile, onSave]);

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
                <Text style={styles.title}>프로필 편집</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <XIcon size={20} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.scroll}
              >
                {/* Avatar */}
                <View style={styles.avatarBlock}>
                  <View style={styles.avatarCircle}>
                    <PersonSilhouette size={72} color="#3a3a3a" />
                    <View style={styles.avatarBadge}>
                      <CameraSolidIcon size={14} color={COLORS.black} strokeWidth={1.9} />
                    </View>
                  </View>
                  <Text style={styles.avatarHint}>프로필 사진 변경</Text>
                </View>

                {/* Nickname */}
                <View style={styles.field}>
                  <Text style={styles.label}>닉네임</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      value={nickname}
                      onChangeText={setNickname}
                      placeholder="아티스트명"
                      placeholderTextColor={COLORS.gray2}
                      style={styles.input}
                      maxLength={20}
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Location */}
                <View style={styles.field}>
                  <Text style={styles.label}>활동 지역</Text>
                  <View style={styles.inputRow}>
                    <LocationPinIcon size={15} color={COLORS.gray} />
                    <TextInput
                      value={location}
                      onChangeText={setLocation}
                      placeholder="예: 서울 · 성수"
                      placeholderTextColor={COLORS.gray2}
                      style={styles.input}
                      maxLength={30}
                    />
                  </View>
                </View>

                {/* Intro */}
                <View style={styles.field}>
                  <Text style={styles.label}>한 줄 소개</Text>
                  <View style={styles.introWrap}>
                    <TextInput
                      value={intro}
                      onChangeText={(v) => v.length <= INTRO_MAX && setIntro(v)}
                      placeholder="예: 블랙워크 · 라인워크 전문. 감성 디테일에 집중합니다."
                      placeholderTextColor={COLORS.gray2}
                      multiline
                      maxLength={INTRO_MAX}
                      style={styles.introInput}
                      textAlignVertical="top"
                    />
                    <Text style={styles.counter}>{intro.length}/{INTRO_MAX}</Text>
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.85}
                style={styles.saveBtn}
              >
                <Text style={styles.saveText}>저장하기</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});
EditProfileSheet.displayName = 'EditProfileSheet';
export default EditProfileSheet;

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
    maxHeight: SH * 0.85,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },
  scroll: { maxHeight: SH * 0.6 },

  avatarBlock: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  avatarCircle: {
    width: 96, height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarBadge: {
    position: 'absolute',
    right: 2, bottom: 2,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  avatarHint: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },

  field: { marginBottom: 16, gap: 8 },
  label: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  introWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    minHeight: 90,
  },
  introInput: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
    padding: 0,
    minHeight: 50,
  },
  counter: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
    marginTop: 4,
  },

  saveBtn: {
    marginTop: 8,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
});
