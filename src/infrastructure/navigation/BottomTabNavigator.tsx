import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../presentation/theme/colors';
import {
  HomeTabIcon, StarTabIcon, MatchingIcon, ShoppingBagIcon, PersonIcon,
} from '../../presentation/components/icons';
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

const TAB_ITEMS = [
  { name: 'HomeTab' as const, label: 'Home', Icon: HomeTabIcon },
  { name: 'RootsPickTab' as const, label: "Root's Pick", Icon: StarTabIcon },
  { name: 'ShopMatchingTab' as const, label: '샵 & 매칭', Icon: MatchingIcon },
  { name: 'TattooSuppliesTab' as const, label: '타투용품', Icon: ShoppingBagIcon },
  { name: 'ProfileTab' as const, label: '프로필', Icon: PersonIcon },
];

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tabItem = TAB_ITEMS[index];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.75}
            style={styles.tabItem}
          >
            <tabItem.Icon
              size={22}
              color={isFocused ? COLORS.gold : COLORS.gray}
              active={isFocused}
            />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tabItem.label}
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
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: COLORS.gold,
  },
});
