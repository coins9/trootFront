import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { BackArrowIcon, CheckIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useLanguageStore, type LanguagePreference } from '../../store/languageStore';
import { getDeviceLanguage } from '../../../infrastructure/i18n';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LanguageScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const preference = useLanguageStore((s) => s.preference);
  const setPreference = useLanguageStore((s) => s.setPreference);
  const t = useLanguageStore((s) => s.t);

  const deviceLang = getDeviceLanguage();

  const handleSelect = useCallback(
    (pref: LanguagePreference) => async () => {
      if (pref === preference) return;
      await setPreference(pref);
      toast(useLanguageStore.getState().t('settings.languageChanged'), { variant: 'success' });
    },
    [preference, setPreference, toast],
  );

  const options: { key: LanguagePreference; title: string; desc?: string }[] = [
    {
      key: 'system',
      title: t('settings.systemDefault'),
      desc: `${t('settings.systemDefaultDesc')} · ${deviceLang === 'ko' ? '한국어' : 'English'}`,
    },
    { key: 'ko', title: t('settings.languageKo') },
    { key: 'en', title: t('settings.languageEn') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.language')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.desc}>{t('settings.languageDesc')}</Text>

        <View style={styles.card}>
          {options.map((opt, i) => {
            const active = preference === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={handleSelect(opt.key)}
                activeOpacity={0.75}
                style={[styles.row, i < options.length - 1 && styles.rowBorder]}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, active && styles.rowTitleActive]}>{opt.title}</Text>
                  {opt.desc && <Text style={styles.rowDesc}>{opt.desc}</Text>}
                </View>
                {active && <CheckIcon size={18} color={COLORS.gold} strokeWidth={2.2} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguageScreen;

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

  content: { padding: 20 },
  desc: { fontSize: 13, color: COLORS.gray, lineHeight: 19, marginBottom: 16 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 17,
    gap: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 15, fontWeight: '500', color: COLORS.white, lineHeight: 21, flexShrink: 1 },
  rowTitleActive: { color: COLORS.gold, fontWeight: '700' },
  rowDesc: { fontSize: 12, color: COLORS.gray2, lineHeight: 17, flexShrink: 1 },
});
