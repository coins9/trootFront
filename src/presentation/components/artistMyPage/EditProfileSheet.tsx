import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated,
  Dimensions, Platform, TextInput, ScrollView, KeyboardAvoidingView, Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import {
  XIcon, LocationPinIcon, CameraSolidIcon, PersonSilhouette,
  ClockIcon, CalendarIcon, ChatBubbleIcon,
} from '../icons';
import { ArtistSelfProfile } from '../../../domain/entities/artistMyPageTypes';
import { ARTIST_TAGS } from '../../../domain/entities/artistTags';
import { CITIES, DISTRICTS } from '../../../data/mock/mockData';

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
  const [coverImage, setCoverImage] = useState<string | null>(profile.coverImage ?? null);
  const [avatarImage, setAvatarImage] = useState<string | null>((profile as any).avatarImage ?? null);
  const [regionSido, setRegionSido] = useState<string | null>(profile.regionSido ?? null);
  const [regionSigungu, setRegionSigungu] = useState<string | null>(profile.regionSigungu ?? null);
  const [detailAddress, setDetailAddress] = useState((profile as any).detailAddress ?? '');
  const [intro, setIntro] = useState(profile.intro);
  const [tags, setTags] = useState<string[]>(profile.tags ?? []);
  const [openChatUrl, setOpenChatUrl] = useState(profile.openChatUrl ?? '');
  const [availableHours, setAvailableHours] = useState(profile.availableHours ?? '');
  const [closedDay, setClosedDay] = useState(profile.closedDay ?? '');

  const districtOptions: string[] = regionSido ? (DISTRICTS[regionSido] ?? []) : [];

  const handlePickCover = useCallback(async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1, selectionLimit: 1 });
    if (result.assets?.[0]?.uri) setCoverImage(result.assets[0].uri);
  }, []);

  const handlePickAvatar = useCallback(async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1, selectionLimit: 1 });
    if (result.assets?.[0]?.uri) setAvatarImage(result.assets[0].uri);
  }, []);

  const toggleTag = useCallback((code: string) => {
    setTags((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }, []);

  const handleCityPress = useCallback((city: string) => {
    if (regionSido === city) {
      setRegionSido(null);
      setRegionSigungu(null);
    } else {
      setRegionSido(city);
      setRegionSigungu(null);
    }
  }, [regionSido]);

  const handleDistrictPress = useCallback((dist: string) => {
    setRegionSigungu((prev) => (prev === dist ? null : dist));
  }, []);

  useEffect(() => {
    if (visible) {
      setNickname(profile.nickname);
      setCoverImage(profile.coverImage ?? null);
      setAvatarImage((profile as any).avatarImage ?? null);
      setRegionSido(profile.regionSido ?? null);
      setRegionSigungu(profile.regionSigungu ?? null);
      setDetailAddress((profile as any).detailAddress ?? '');
      setIntro(profile.intro);
      setTags(profile.tags ?? []);
      setOpenChatUrl(profile.openChatUrl ?? '');
      setAvailableHours(profile.availableHours ?? '');
      setClosedDay(profile.closedDay ?? '');
    }
    Animated.timing(translate, {
      toValue: visible ? 0 : SH,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [visible, profile, translate]);

  const handleSave = useCallback(() => {
    const location = [regionSido, regionSigungu].filter(Boolean).join(' ') || profile.location;
    onSave({
      nickname: nickname.trim() || profile.nickname,
      coverImage,
      ...(avatarImage !== null ? { avatarImage } : {}),
      location,
      intro: intro.trim() || profile.intro,
      tags,
      openChatUrl: openChatUrl.trim() || null,
      availableHours: availableHours.trim() || null,
      closedDay: closedDay.trim() || null,
      regionSido: regionSido ?? null,
      regionSigungu: regionSigungu ?? null,
      countryCode: regionSido ? 'KR' : null,
      countryName: regionSido ? '대한민국' : null,
      detailAddress: detailAddress.trim() || null,
    } as any);
  }, [nickname, coverImage, avatarImage, regionSido, regionSigungu, detailAddress, intro, tags, openChatUrl, availableHours, closedDay, profile, onSave]);

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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kavWrap}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 24) + 20 },
              { transform: [{ translateY: translate }] },
            ]}
          >
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
              contentContainerStyle={styles.scrollContent}
            >
              {/* Cover Image */}
              <TouchableOpacity onPress={handlePickCover} activeOpacity={0.8} style={styles.coverBlock}>
                {coverImage ? (
                  <Image source={{ uri: coverImage }} style={styles.coverImg} resizeMode="cover" />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <Text style={styles.coverPlaceholderText}>배경 사진 없음</Text>
                  </View>
                )}
                <View style={styles.coverEditBadge}>
                  <CameraSolidIcon size={13} color={COLORS.black} strokeWidth={1.9} />
                  <Text style={styles.coverEditText}>배경 변경</Text>
                </View>
              </TouchableOpacity>

              {/* Avatar */}
              <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8} style={styles.avatarBlock}>
                <View style={styles.avatarCircle}>
                  {avatarImage ? (
                    <Image source={{ uri: avatarImage }} style={styles.avatarImg} resizeMode="cover" />
                  ) : (
                    <PersonSilhouette size={72} color="#3a3a3a" />
                  )}
                  <View style={styles.avatarBadge}>
                    <CameraSolidIcon size={14} color={COLORS.black} strokeWidth={1.9} />
                  </View>
                </View>
                <Text style={styles.avatarHint}>프로필 사진 변경</Text>
              </TouchableOpacity>

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

              {/* 활동 지역 — 칩 선택 */}
              <View style={styles.field}>
                <Text style={styles.label}>활동 지역</Text>
                <View style={styles.chipRow}>
                  {CITIES.map((city) => {
                    const active = regionSido === city;
                    return (
                      <TouchableOpacity
                        key={city}
                        onPress={() => handleCityPress(city)}
                        activeOpacity={0.75}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{city}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 구/군 선택 — 시/도 선택 후 표시 */}
                {districtOptions.length > 0 && (
                  <>
                    <Text style={[styles.label, { marginTop: 10 }]}>구/군 선택 <Text style={{ color: COLORS.gray2 }}>(선택)</Text></Text>
                    <View style={styles.chipRow}>
                      {districtOptions.map((dist) => {
                        const active = regionSigungu === dist;
                        return (
                          <TouchableOpacity
                            key={dist}
                            onPress={() => handleDistrictPress(dist)}
                            activeOpacity={0.75}
                            style={[styles.chip, active && styles.chipActive]}
                          >
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{dist}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}
              </View>

              {/* 상세 주소 */}
              <View style={styles.field}>
                <Text style={styles.label}>상세 주소 <Text style={{ color: COLORS.gray2, fontSize: 11 }}>(선택)</Text></Text>
                <View style={styles.inputRow}>
                  <LocationPinIcon size={15} color={COLORS.gray} />
                  <TextInput
                    value={detailAddress}
                    onChangeText={setDetailAddress}
                    placeholder="건물명, 층수, 상세 위치 (예: B1F 스튜디오 루츠)"
                    placeholderTextColor={COLORS.gray2}
                    style={[styles.input, { marginLeft: 8 }]}
                    maxLength={200}
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

              {/* Available Hours */}
              <View style={styles.field}>
                <Text style={styles.label}>상담 가능 시간</Text>
                <View style={styles.inputRow}>
                  <ClockIcon size={15} color={COLORS.gray} />
                  <TextInput
                    value={availableHours}
                    onChangeText={setAvailableHours}
                    placeholder="예: 10:00~22:00"
                    placeholderTextColor={COLORS.gray2}
                    style={[styles.input, { marginLeft: 8 }]}
                    maxLength={30}
                  />
                </View>
              </View>

              {/* Closed Day */}
              <View style={styles.field}>
                <Text style={styles.label}>휴무일</Text>
                <View style={styles.inputRow}>
                  <CalendarIcon size={15} color={COLORS.gray} />
                  <TextInput
                    value={closedDay}
                    onChangeText={setClosedDay}
                    placeholder="예: 매주 월요일"
                    placeholderTextColor={COLORS.gray2}
                    style={[styles.input, { marginLeft: 8 }]}
                    maxLength={30}
                  />
                </View>
              </View>

              {/* Open KakaoTalk URL */}
              <View style={styles.field}>
                <Text style={styles.label}>카카오 오픈채팅 링크</Text>
                <View style={styles.inputRow}>
                  <ChatBubbleIcon size={15} color={COLORS.gray} />
                  <TextInput
                    value={openChatUrl}
                    onChangeText={setOpenChatUrl}
                    placeholder="https://open.kakao.com/o/..."
                    placeholderTextColor={COLORS.gray2}
                    style={[styles.input, { marginLeft: 8 }]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                </View>
              </View>

              {/* Tags */}
              <View style={styles.field}>
                <Text style={styles.label}>편의 · 특성 태그</Text>
                <View style={styles.tagWrap}>
                  {ARTIST_TAGS.map((t) => {
                    const on = tags.includes(t.code);
                    return (
                      <TouchableOpacity
                        key={t.code}
                        onPress={() => toggleTag(t.code)}
                        activeOpacity={0.75}
                        style={[styles.tagChip, on && styles.tagChipOn]}
                      >
                        <Text style={[styles.tagChipText, on && styles.tagChipTextOn]}>{t.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
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
    maxHeight: SH * 0.90,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  coverBlock: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    color: COLORS.gray2,
    fontSize: 13,
    lineHeight: 18,
  },
  coverEditBadge: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  coverEditText: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  avatarBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 21,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
  },
  chipActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  chipText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  chipTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  introWrap: {
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    padding: 12,
  },
  introInput: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 60,
  },
  counter: {
    color: COLORS.gray3,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
    marginTop: 6,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
  },
  tagChipOn: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  tagChipText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
  },
  tagChipTextOn: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  saveText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
});
