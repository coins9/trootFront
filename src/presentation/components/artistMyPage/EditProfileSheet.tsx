import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated,
  Dimensions, Platform, TextInput, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Config from 'react-native-config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import {
  XIcon, LocationPinIcon, CameraSolidIcon, PersonSilhouette,
} from '../icons';
import { ArtistSelfProfile } from '../../../domain/entities/artistMyPageTypes';
import { ARTIST_TAGS } from '../../../domain/entities/artistTags';

interface LocationMeta {
  lat?: number;
  lng?: number;
  countryCode?: string | null;
  countryName?: string | null;
  regionSido?: string | null;
  regionSigungu?: string | null;
}

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
  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);
  const [nickname, setNickname] = useState(profile.nickname);
  const [location, setLocation] = useState(profile.location);
  const [locationMeta, setLocationMeta] = useState<LocationMeta>({});
  const [intro, setIntro] = useState(profile.intro);
  const [tags, setTags] = useState<string[]>(profile.tags ?? []);

  const toggleTag = useCallback((code: string) => {
    setTags((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }, []);

  useEffect(() => {
    if (visible) {
      setNickname(profile.nickname);
      setLocation(profile.location);
      setLocationMeta({});
      setIntro(profile.intro);
      setTags(profile.tags ?? []);
      // 기존 위치 텍스트를 Places 입력창에 미리 채운다
      setTimeout(() => {
        placesRef.current?.setAddressText(profile.location ?? '');
      }, 80);
    }
    Animated.timing(translate, {
      toValue: visible ? 0 : SH,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [visible, profile, translate]);

  const handleSave = useCallback(() => {
    const addressText = placesRef.current?.getAddressText() ?? location;
    onSave({
      nickname: nickname.trim() || profile.nickname,
      location: addressText.trim() || profile.location,
      intro: intro.trim() || profile.intro,
      tags,
      ...locationMeta,
    });
  }, [nickname, location, locationMeta, intro, tags, profile, onSave]);

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

                {/* Location — Google Places Autocomplete */}
                <View style={styles.field}>
                  <Text style={styles.label}>활동 지역</Text>
                  <View style={styles.placesRow}>
                    <View style={styles.placesIcon}>
                      <LocationPinIcon size={15} color={COLORS.gray} />
                    </View>
                    <GooglePlacesAutocomplete
                      ref={placesRef}
                      placeholder="도시 검색 (예: 서울, Tokyo, Paris...)"
                      query={{
                        key: Config.GOOGLE_PLACES_API_KEY ?? '',
                        language: 'ko',
                        types: '(cities)',
                      }}
                      fetchDetails
                      onPress={(data, details) => {
                        const address = data.description;
                        const lat = details?.geometry?.location?.lat;
                        const lng = details?.geometry?.location?.lng;
                        const comps = details?.address_components ?? [];
                        const countryComp = comps.find((c) => c.types.includes('country'));
                        const adminComp = comps.find((c) =>
                          c.types.includes('administrative_area_level_1'),
                        );
                        const subComp = comps.find((c) =>
                          c.types.includes('administrative_area_level_2') ||
                          c.types.includes('locality'),
                        );
                        setLocation(address);
                        setLocationMeta({
                          lat,
                          lng,
                          countryCode: countryComp?.short_name ?? null,
                          countryName: countryComp?.long_name ?? null,
                          regionSido: adminComp?.long_name ?? null,
                          regionSigungu: subComp?.long_name ?? null,
                        });
                      }}
                      textInputProps={{
                        placeholderTextColor: COLORS.gray2,
                        onChangeText: setLocation,
                      }}
                      enablePoweredByContainer={false}
                      styles={{
                        container: placesStyles.container,
                        textInputContainer: placesStyles.textInputContainer,
                        textInput: placesStyles.textInput,
                        listView: placesStyles.listView,
                        row: placesStyles.row,
                        description: placesStyles.description,
                        separator: placesStyles.separator,
                      }}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  title: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  scroll: {
    maxHeight: SH * 0.55,
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
  placesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    paddingLeft: 12,
    zIndex: 10,
  },
  placesIcon: {
    marginTop: 14,
    marginRight: 4,
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

const placesStyles = {
  container: {
    flex: 1,
  },
  textInputContainer: {
    backgroundColor: 'transparent',
  },
  textInput: {
    backgroundColor: 'transparent',
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 21,
    height: 44,
    paddingLeft: 4,
    margin: 0,
  },
  listView: {
    position: 'absolute' as const,
    top: 48,
    left: -16,
    right: 0,
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    zIndex: 200,
    elevation: 10,
  },
  row: {
    backgroundColor: COLORS.elevated,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  description: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
  },
  separator: {
    backgroundColor: COLORS.border,
    height: 1,
  },
};
