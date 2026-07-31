import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Artist, Tattoo } from '../../domain/entities/types';
import { TattooShareShop, BeginnerModelRecruit, MediaExpert } from '../../domain/entities/shopTypes';
import BottomTabNavigator from './BottomTabNavigator';
import TattooDetailScreen from '../../presentation/screens/tattooDetail/TattooDetailScreen';
import ArtistProfileScreen from '../../presentation/screens/artistProfile/ArtistProfileScreen';
import TattooShareDetailScreen from '../../presentation/screens/shopMatching/TattooShareDetailScreen';
import BeginnerModelDetailScreen from '../../presentation/screens/shopMatching/BeginnerModelDetailScreen';
import MediaExpertDetailScreen from '../../presentation/screens/shopMatching/MediaExpertDetailScreen';

export type RootStackParamList = {
  Main: undefined;
  TattooDetail: { tattoo: Tattoo };
  ArtistProfile: { artist: Artist };
  TattooShareDetail: { shop: TattooShareShop };
  BeginnerModelDetail: { post: BeginnerModelRecruit };
  MediaExpertDetail: { expert: MediaExpert };
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
  </Stack.Navigator>
);

export default RootNavigator;
