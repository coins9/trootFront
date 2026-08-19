import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../presentation/theme/colors';
import {
  HomeTabIcon, PaletteTabIcon, ShoppingBagIcon, MatchingIcon, PersonIcon,
} from '../../presentation/components/icons';
import { useTranslation } from '../../presentation/store/languageStore';
import HomeScreen from '../../presentation/screens/home/HomeScreen';
import RootsPickScreen from '../../presentation/screens/rootsPick/RootsPickScreen';
import ShopMatchingScreen from '../../presentation/screens/shopMatching/ShopMatchingScreen';
import TattooSuppliesScreen from '../../presentation/screens/tattooSupplies/TattooSuppliesScreen';
import MyProfileScreen from '../../presentation/screens/myProfile/MyProfileScreen';

type TabParamList = {
  HomeTab: undefined;
  RootsPickTab: undefined;
  ShopMatchingTab: undefined;
  TattooSuppliesTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS = [
  { name: 'HomeTab' as const, Icon: HomeTabIcon, tKey: 'tabs.home' as const },
  { name: 'RootsPickTab' as const, Icon: PaletteTabIcon, tKey: 'tabs.rootsPick' as const },
  { name: 'ShopMatchingTab' as const, Icon: MatchingIcon, tKey: 'tabs.shopMatching' as const },
  { name: 'TattooSuppliesTab' as const, Icon: ShoppingBagIcon, tKey: 'tabs.supplies' as const },
  { name: 'ProfileTab' as const, Icon: PersonIcon, tKey: 'tabs.profile' as const },
];

const CustomTabBar = ({ state, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.tabBar, { paddingBottom: bottomPad }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tabItem = TAB_ICONS[index];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const color = isFocused ? COLORS.gold : COLORS.gray;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.75}
            style={styles.tabItem}
          >
            <tabItem.Icon size={22} color={color} active={isFocused} />
            <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
              {t(tabItem.tKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const BottomTabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="HomeTab" component={HomeScreen} />
    <Tab.Screen name="RootsPickTab" component={RootsPickScreen} />
    <Tab.Screen name="ShopMatchingTab" component={ShopMatchingScreen} />
    <Tab.Screen name="TattooSuppliesTab" component={TattooSuppliesScreen} />
    <Tab.Screen name="ProfileTab" component={MyProfileScreen} />
  </Tab.Navigator>
);

export default BottomTabNavigator;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    textAlign: 'center',
  },
});
