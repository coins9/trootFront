import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, UserOutlineIcon, BellIcon, LockIcon,
  GlobeIcon, ChatBubbleIcon, ChevronRightIcon,
} from '../../components/icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  screen: keyof RootStackParamList;
}

const SettingsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets(); // 🚨 안전 여백(Insets) 훅 추가

  const items: MenuItem[] = [
    // 🚨 TS2345 에러 방어를 위해 t() 함수 인자에 as any 적용
    { Icon: UserOutlineIcon, label: t('settings.accountInfo' as any), screen: 'AccountInfo' },
    { Icon: BellIcon, label: t('settings.notification' as any), screen: 'NotificationSettings' },
    { Icon: LockIcon, label: t('settings.privacySecurity' as any), screen: 'PrivacySecurity' },
    { Icon: GlobeIcon, label: t('settings.language' as any), screen: 'Language' },
    { Icon: ChatBubbleIcon, label: t('profile.support' as any), screen: 'Support' },
  ];

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
      // 🚨 하단 잘림을 막기 위해 edges=['top'] 만 적용 (하단 여백은 ScrollView에서 제어)
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

        <View style={styles.header}>
          <TouchableOpacity
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.backBtn}
          >
            <BackArrowIcon size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings.title' as any)}</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 🚨 작은 기기에서도 스크롤이 가능하도록 ScrollView로 변경하고 안전 여백 적용 */}
        <ScrollView
            contentContainerStyle={[
              styles.list,
              { paddingBottom: Math.max(insets.bottom, 24) }
            ]}
            showsVerticalScrollIndicator={false}
        >
          {items.map((item, i) => (
              <TouchableOpacity
                  key={item.screen}
                  onPress={() => navigation.navigate(item.screen as any)}
                  activeOpacity={0.75}
                  style={[styles.row, i === items.length - 1 && styles.rowLast]}
              >
                <View style={styles.iconWrap}>
                  <item.Icon size={22} color={COLORS.gold} strokeWidth={1.7} />
                </View>
                <Text style={styles.label}>{item.label}</Text>
                <ChevronRightIcon size={18} color={COLORS.gray} />
              </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  headerRight: {
    width: 30,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 36,
    alignItems: 'center',
  },
  label: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 20,
    marginLeft: 8,
  },
});