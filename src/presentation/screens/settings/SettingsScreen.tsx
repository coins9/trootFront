import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const items: MenuItem[] = [
    { Icon: UserOutlineIcon, label: t('settings.accountInfo'), screen: 'AccountInfo' },
    { Icon: BellIcon, label: t('settings.notification'), screen: 'NotificationSettings' },
    { Icon: LockIcon, label: t('settings.privacySecurity'), screen: 'PrivacySecurity' },
    { Icon: GlobeIcon, label: t('settings.language'), screen: 'Language' },
    { Icon: ChatBubbleIcon, label: t('profile.support'), screen: 'Support' },
  ];

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
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
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.list}>
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
      </View>
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
