import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  HomeTabIcon, StarTabIcon, MatchingIcon, ShoppingBagIcon, PersonIcon,
} from '../icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type TabKey = 'HomeTab' | 'RootsPickTab' | 'ShopMatchingTab' | 'TattooSuppliesTab' | 'ProfileTab';

interface TabItem {
  key: TabKey;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; active?: boolean }>;
}

const ITEMS: TabItem[] = [
  { key: 'HomeTab',          label: 'Home',        Icon: HomeTabIcon },
  { key: 'RootsPickTab',     label: "Root's Pick", Icon: StarTabIcon },
  { key: 'ShopMatchingTab',  label: '샵 & 매칭',   Icon: MatchingIcon },
  { key: 'TattooSuppliesTab', label: '타투용품',    Icon: ShoppingBagIcon },
  { key: 'ProfileTab',       label: '프로필',      Icon: PersonIcon },
];

interface Props {
  activeTab?: TabKey;
}

const AppBottomTabBar = memo(({ activeTab = 'ProfileTab' }: Props) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const handlePress = useCallback((key: TabKey) => () => {
    // Root Stack → Main (Tab) → 지정 탭으로 이동. 스택은 최상단으로 pop.
    navigation.navigate('Main');
    // 잠깐 지연 후 tab 전환 (nested navigator)
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
              {it.label}
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
