import React, { useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { BackArrowIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useLanguageStore, type LanguagePreference } from '../../store/languageStore';
import { getDeviceLanguage, type TranslationKey } from '../../../infrastructure/i18n';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const OPTIONS: { key: LanguagePreference; labelKey: TranslationKey }[] = [
  { key: 'system', labelKey: 'settings.auto' },
  { key: 'ko',     labelKey: 'settings.languageKo' },
  { key: 'en',     labelKey: 'settings.languageEn' },
];

const LanguageScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets(); // 🚨 안전 여백 훅 추가
  const { toast } = useToast();
  const preference = useLanguageStore((s) => s.preference);
  const setPreference = useLanguageStore((s) => s.setPreference);
  const t = useLanguageStore((s) => s.t);

  const deviceLang = getDeviceLanguage();
  // 🚨 방어코드: findIndex가 -1을 반환할 경우를 대비해 기본값 0(최소값) 보장
  const activeIndex = Math.max(0, OPTIONS.findIndex((o) => o.key === preference));

  // sliding indicator animation
  const slideAnim = useRef(new Animated.Value(activeIndex)).current;

  const handleSelect = useCallback(
      (pref: LanguagePreference, idx: number) => async () => {
        if (pref === preference) return;
        Animated.spring(slideAnim, {
          toValue: idx,
          useNativeDriver: false,
          tension: 120,
          friction: 10,
        }).start();
        await setPreference(pref);

        // 🚨 TS2345 방어 (as any)
        toast(useLanguageStore.getState().t('settings.languageChanged' as any), { variant: 'success' });
      },
      [preference, setPreference, slideAnim, toast],
  );

  // 🚨 TS2345 방어 (as any)
  const systemDesc = t('settings.deviceHint' as any).replace(
      '{{lang}}',
      deviceLang === 'ko' ? t('settings.languageKo' as any) : t('settings.languageEn' as any),
  );

  return (
      // 🚨 하단 잘림을 막기 위해 edges=['top'] 으로 수정
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

        <View style={styles.header}>
          <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
          </TouchableOpacity>
          {/* 🚨 TS2345 방어 (as any) */}
          <Text style={styles.headerTitle}>{t('settings.language' as any)}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 🚨 기기별 안전 여백(insets.bottom)을 적용해 하단 짤림 방지 */}
        <View style={[styles.body, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <Text style={styles.desc}>{t('settings.languageDesc' as any)}</Text>

          {/* segmented toggle */}
          <View style={styles.toggleWrap}>
            {/* sliding highlight */}
            <Animated.View
                style={[
                  styles.toggleThumb,
                  {
                    left: slideAnim.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: ['0%', '33.33%', '66.66%'],
                    }),
                  },
                ]}
            />
            {OPTIONS.map((opt, i) => {
              const active = preference === opt.key;
              return (
                  <TouchableOpacity
                      key={opt.key}
                      onPress={handleSelect(opt.key, i)}
                      activeOpacity={0.8}
                      style={styles.toggleSegment}
                  >
                    <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                      {t(opt.labelKey as any)}
                    </Text>
                  </TouchableOpacity>
              );
            })}
          </View>

          {/* active option subtitle */}
          {preference === 'system' && (
              <Text style={styles.subDesc}>{systemDesc}</Text>
          )}
        </View>
      </SafeAreaView>
  );
};

export default LanguageScreen;

const TOGGLE_HEIGHT = 52;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.black,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white, letterSpacing: 0.3 },

  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    alignItems: 'center',
  },
  desc: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 19,
    marginBottom: 28,
    textAlign: 'center',
  },

  toggleWrap: {
    flexDirection: 'row',
    width: '100%',
    height: TOGGLE_HEIGHT,
    backgroundColor: COLORS.card,
    borderRadius: TOGGLE_HEIGHT / 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    position: 'relative',
  },
  toggleThumb: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '33.33%',
    backgroundColor: COLORS.gold,
    borderRadius: (TOGGLE_HEIGHT - 8) / 2,
  },
  toggleSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray2,
    lineHeight: 20,
  },
  segmentLabelActive: {
    color: COLORS.black,
    fontWeight: '700',
  },

  subDesc: {
    marginTop: 16,
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 18,
  },
});