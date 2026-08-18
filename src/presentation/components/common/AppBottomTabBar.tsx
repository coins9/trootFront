import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  HomeTabIcon, PaletteTabIcon, MatchingIcon, ShoppingBagIcon, PersonIcon,
} from '../icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

import { TranslationKey } from '../../../infrastructure/i18n';

type TabKey = 'HomeTab' | 'ArtistTab' | 'TattooSuppliesTab' | 'ShopMatchingTab' | 'ProfileTab';

interface TabItem {
  key: TabKey;
  tKey: TranslationKey;
  Icon: React.ComponentType<{ size?: number; color?: string; active?: boolean }>;
}

const ITEMS: TabItem[] = [
  { key: 'HomeTab',           tKey: 'tabs.home',         Icon: HomeTabIcon },
  { key: 'ArtistTab',         tKey: 'tabs.artist',       Icon: PaletteTabIcon },
  { key: 'TattooSuppliesTab', tKey: 'tabs.supplies',     Icon: ShoppingBagIcon },
  { key: 'ShopMatchingTab',   tKey: 'tabs.shopMatching', Icon: MatchingIcon },
  { key: 'ProfileTab',        tKey: 'tabs.profile',      Icon: PersonIcon },
];

interface Props {
  activeTab?: TabKey;
}

const AppBottomTabBar = memo(({ activeTab = 'ProfileTab' }: Props) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();

  const handlePress = useCallback((key: TabKey) => () => {
    navigation.navigate('Main');
    setTimeout(() => {
      (navigation as any).navigate('Main', { screen: key });
    }, 0);
  }, [navigation]);

  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.bar, { paddingBottom: bottomPad }]}>
      {ITEMS.map((it) => {
        const isActive = it.key === activeTab;
        const color = isActive ? COLORS.gold : COLORS.gray;
        return (
          <TouchableOpacity
            key={it.key}
            onPress={handlePress(it.key)}
            activeOpacity={0.75}
            style={styles.item}
            hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
          >
            <it.Icon size={22} color={color} active={isActive} />
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {t(it.tKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});
AppBottomTabBar.displayName = 'AppBottomTabBar';
export default AppBottomTabBar;

/** 컨텐츠 하단 여백 계산용 헬퍼 */
export const useBottomTabHeight = () => {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);
  // 아이콘 22 + gap 3 + label 14 + paddingTop 6 + paddingBottom(item) 6
  return 22 + 3 + 14 + 6 + 6 + bottomPad;
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    textAlign: 'center',
  },
});
