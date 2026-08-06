import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Artist, Tattoo } from '../../domain/entities/types';
import { TattooShareShop, BeginnerModelRecruit, MediaExpert } from '../../domain/entities/shopTypes';
import { TattooSupply } from '../../domain/entities/supplyTypes';
import BottomTabNavigator from './BottomTabNavigator';
import TattooDetailScreen from '../../presentation/screens/tattooDetail/TattooDetailScreen';
import ArtistProfileScreen from '../../presentation/screens/artistProfile/ArtistProfileScreen';
import TattooShareDetailScreen from '../../presentation/screens/shopMatching/TattooShareDetailScreen';
import BeginnerModelDetailScreen from '../../presentation/screens/shopMatching/BeginnerModelDetailScreen';
import MediaExpertDetailScreen from '../../presentation/screens/shopMatching/MediaExpertDetailScreen';
import TattooSupplyDetailScreen from '../../presentation/screens/tattooSupplies/TattooSupplyDetailScreen';
import ReservationManageScreen from '../../presentation/screens/reservation/ReservationManageScreen';
import FavoriteArtistsScreen from '../../presentation/screens/favorites/FavoriteArtistsScreen';
import FavoriteWorksScreen from '../../presentation/screens/favorites/FavoriteWorksScreen';
import FavoritePhotoShopsScreen from '../../presentation/screens/favorites/FavoritePhotoShopsScreen';
import FavoriteSuppliesScreen from '../../presentation/screens/favorites/FavoriteSuppliesScreen';
import TattooReviewScreen from '../../presentation/screens/review/TattooReviewScreen';
import AccountInfoScreen from '../../presentation/screens/accountInfo/AccountInfoScreen';
import NotificationSettingsScreen from '../../presentation/screens/notificationSettings/NotificationSettingsScreen';
import PrivacySecurityScreen from '../../presentation/screens/privacySecurity/PrivacySecurityScreen';
import ArtistReservationScreen from '../../presentation/screens/artistReservation/ArtistReservationScreen';
import DepositManagementScreen from '../../presentation/screens/deposit/DepositManagementScreen';
import AdStatsScreen from '../../presentation/screens/artistAd/AdStatsScreen';
import ArtistMyPageScreen from '../../presentation/screens/artistMyPage/ArtistMyPageScreen';

export type RootStackParamList = {
  Main: undefined;
  TattooDetail: { tattoo: Tattoo };
  ArtistProfile: { artist: Artist };
  TattooShareDetail: { shop: TattooShareShop };
  BeginnerModelDetail: { post: BeginnerModelRecruit };
  MediaExpertDetail: { expert: MediaExpert };
  TattooSupplyDetail: { supply: TattooSupply };
  ReservationManage: undefined;
  FavoriteArtists: undefined;
  FavoriteWorks: undefined;
  FavoritePhotoShops: undefined;
  FavoriteSupplies: undefined;
  TattooReview: undefined;
  AccountInfo: undefined;
  NotificationSettings: undefined;
  PrivacySecurity: undefined;
  ArtistReservation: undefined;
  DepositManagement: undefined;
  ArtistAdStats: undefined;
  ArtistMyPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={BottomTabNavigator} />
    <Stack.Screen
      name="TattooDetail"
      component={TattooDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="ArtistProfile"
      component={ArtistProfileScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="TattooShareDetail"
      component={TattooShareDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="BeginnerModelDetail"
      component={BeginnerModelDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="MediaExpertDetail"
      component={MediaExpertDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="TattooSupplyDetail"
      component={TattooSupplyDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="ReservationManage"
      component={ReservationManageScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="FavoriteArtists"
      component={FavoriteArtistsScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="FavoriteWorks"
      component={FavoriteWorksScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="FavoritePhotoShops"
      component={FavoritePhotoShopsScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="FavoriteSupplies"
      component={FavoriteSuppliesScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="TattooReview"
      component={TattooReviewScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="AccountInfo"
      component={AccountInfoScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="NotificationSettings"
      component={NotificationSettingsScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="PrivacySecurity"
      component={PrivacySecurityScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="ArtistReservation"
      component={ArtistReservationScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="DepositManagement"
      component={DepositManagementScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="ArtistAdStats"
      component={AdStatsScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="ArtistMyPage"
      component={ArtistMyPageScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </Stack.Navigator>
);

export default RootNavigator;
