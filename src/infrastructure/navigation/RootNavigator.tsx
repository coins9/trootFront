import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Artist, Tattoo } from '../../domain/entities/types';
import BottomTabNavigator from './BottomTabNavigator';
import TattooDetailScreen from '../../presentation/screens/tattooDetail/TattooDetailScreen';
import ArtistProfileScreen from '../../presentation/screens/artistProfile/ArtistProfileScreen';

export type RootStackParamList = {
  Main: undefined;
  TattooDetail: { tattoo: Tattoo };
  ArtistProfile: { artist: Artist };
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
  </Stack.Navigator>
);

export default RootNavigator;
