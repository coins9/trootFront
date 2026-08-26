import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Artist, Tattoo } from '../../domain/entities/types';
import { TattooShareShop, BeginnerModelRecruit, MediaExpert, ShopMatchingCategory } from '../../domain/entities/shopTypes';
import { TattooSupply } from '../../domain/entities/supplyTypes';
import { WritableReview } from '../../domain/entities/reviewTypes';
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
import ShopWriteScreen from '../../presentation/screens/shopMatching/ShopWriteScreen';
import MyShopPostsScreen from '../../presentation/screens/myShopPosts/MyShopPostsScreen';
import ShopApplicationsScreen from '../../presentation/screens/shopMatching/ShopApplicationsScreen';
import SafetyPolicyScreen from '../../presentation/screens/safetyPolicy/SafetyPolicyScreen';
import ReviewWriteScreen from '../../presentation/screens/review/ReviewWriteScreen';
import LoginScreen from '../../presentation/screens/auth/LoginScreen';
import OnboardingScreen from '../../presentation/screens/auth/OnboardingScreen';
import LanguageScreen from '../../presentation/screens/settings/LanguageScreen';
import SupportScreen from '../../presentation/screens/support/SupportScreen';
import MyProductsScreen from '../../presentation/screens/vendor/MyProductsScreen';
import VendorApplyScreen from '../../presentation/screens/vendor/VendorApplyScreen';
import ProductFormScreen from '../../presentation/screens/vendor/ProductFormScreen';
import SellerInfoScreen from '../../presentation/screens/vendor/SellerInfoScreen';
import AdManageScreen from '../../presentation/screens/ad/AdManageScreen';
import ArtistReservationRequestsScreen from '../../presentation/screens/artistReservation/ArtistReservationRequestsScreen';
import NotificationListScreen from '../../presentation/screens/notificationList/NotificationListScreen';
import RootsPickScreen from '../../presentation/screens/rootsPick/RootsPickScreen';
import SettingsScreen from '../../presentation/screens/settings/SettingsScreen';
// 🚨 1. UserProfileScreen 임포트 추가
import UserProfileScreen from '../../presentation/screens/profile/UserProfileScreen';
import { useAuthStore } from '../../presentation/store/authStore';

export type AdManageParams = {
  placement: 'artwork' | 'product' | 'booth' | 'media' | 'model';
  targetId?: string;
};

export type RootStackParamList = {
  Main: undefined;
  TattooDetail: { tattoo: Tattoo; campaignId?: string };
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
  ShopWrite: { initialCategory?: ShopMatchingCategory; boothKind?: 'domestic' | 'overseas'; postId?: string } | undefined;
  MyShopPosts: { defaultCategory?: ShopMatchingCategory } | undefined;
  ShopApplications: { category: ShopMatchingCategory };
  SafetyPolicy: undefined;
  ReviewWrite: { review: WritableReview };
  Login: undefined;
  Onboarding: undefined;
  Language: undefined;
  Support: undefined;
  MyProducts: undefined;
  VendorApply: undefined;
  ProductForm: { productId?: string } | undefined;
  SellerInfo: undefined;
  AdManage: AdManageParams;
  ArtistReservationRequests: undefined;
  NotificationList: undefined;
  RootsPick: undefined;
  Settings: undefined;
  // 🚨 2. UserProfile 화면 파라미터 타입 정의 추가
  UserProfile: { userId: string; nickname?: string | null; profileImage?: string | null };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const session = useAuthStore((s) => s.session);

  // 세션 없음 → 로그인, 온보딩 미완료 → 온보딩, 그 외 → 메인
  const initialRouteName: keyof RootStackParamList = !session
      ? 'Login'
      : !session.user.onboarded
          ? 'Onboarding'
          : 'Main';

  return (
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen
            name="Language"
            component={LanguageScreen}
            options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
            name="Support"
            component={SupportScreen}
            options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
            name="MyProducts"
            component={MyProductsScreen}
            options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
            name="VendorApply"
            component={VendorApplyScreen}
            options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
            name="ProductForm"
            component={ProductFormScreen}
            options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
            name="SellerInfo"
            component={SellerInfoScreen}
            options={{ animation: 'slide_from_right' }}
        />
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
        <Stack.Screen
            name="ShopWrite"
            component={ShopWriteScreen}
            options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
            name="MyShopPosts"
            component={MyShopPostsScreen}
            options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
            name="ShopApplications"
            component={ShopApplicationsScreen}
            options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
            name="SafetyPolicy"
            component={SafetyPolicyScreen}
            options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
            name="ReviewWrite"
            component={ReviewWriteScreen}
            options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
            name="AdManage"
            component={AdManageScreen}
            options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
            name="ArtistReservationRequests"
            component={ArtistReservationRequestsScreen}
            options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
            name="NotificationList"
            component={NotificationListScreen}
            options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
            name="RootsPick"
            component={RootsPickScreen}
            options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ animation: 'slide_from_right' }}
        />
        {/* 🚨 3. Stack 화면 등록 추가 */}
        <Stack.Screen
            name="UserProfile"
            component={UserProfileScreen}
            options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
  );
};

export default RootNavigator;