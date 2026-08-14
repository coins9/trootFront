import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
import {
  CalendarIcon, HeartIcon, StoreIcon, FolderIcon,
  ListIcon, UserOutlineIcon, BellIcon, LockIcon, GlobeIcon, ChatBubbleIcon, ChevronRightIcon,
  PersonSilhouette, PaletteIcon, BarChartIcon,
  EditPenIcon, LocationPinIcon, StarIcon, HandshakeIcon, CheckCircleIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useTranslation } from '../../store/languageStore';

interface MenuItem {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  description?: string;
  badge?: string;
  onPress?: () => void;
}

/** 프로필에서 전환 가능한 활동 모드 */
type ProfileMode = 'user' | 'artist' | 'vendor';

const MODE_TAB_KEYS: { key: ProfileMode; tKey: 'profile.modeUser' | 'profile.modeArtist' | 'profile.modeVendor' }[] = [
  { key: 'user', tKey: 'profile.modeUser' },
  { key: 'artist', tKey: 'profile.modeArtist' },
  { key: 'vendor', tKey: 'profile.modeVendor' },
];

const MyProfileScreen = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const [mode, setMode] = useState<ProfileMode>('user');
  const isArtistMode = mode === 'artist';

  const notImplemented = useCallback((label: string) => () => {
    toast(`${label} — 준비 중입니다`);
  }, [toast]);

  const goToReservationManage = useCallback(() => {
    navigation.navigate('ReservationManage');
  }, [navigation]);

  const goToFavoriteArtists = useCallback(() => {
    navigation.navigate('FavoriteArtists');
  }, [navigation]);

  const goToFavoriteWorks = useCallback(() => {
    navigation.navigate('FavoriteWorks');
  }, [navigation]);

  const goToFavoritePhotoShops = useCallback(() => {
    navigation.navigate('FavoritePhotoShops');
  }, [navigation]);

  const goToFavoriteSupplies = useCallback(() => {
    navigation.navigate('FavoriteSupplies');
  }, [navigation]);

  const goToTattooReview = useCallback(() => {
    navigation.navigate('TattooReview');
  }, [navigation]);

  const goToMyShopPosts = useCallback(() => {
    navigation.navigate('MyShopPosts');
  }, [navigation]);

  const goToReservationRequests = useCallback(() => {
    navigation.navigate('ArtistReservationRequests');
  }, [navigation]);

  const goToAccountInfo = useCallback(() => {
    navigation.navigate('AccountInfo');
  }, [navigation]);

  const goToNotificationSettings = useCallback(() => {
    navigation.navigate('NotificationSettings');
  }, [navigation]);

  const goToPrivacySecurity = useCallback(() => {
    navigation.navigate('PrivacySecurity');
  }, [navigation]);

  const goToLanguage = useCallback(() => {
    navigation.navigate('Language');
  }, [navigation]);

  const goToSupport = useCallback(() => {
    navigation.navigate('Support');
  }, [navigation]);

  const goToArtistReservation = useCallback(() => {
    navigation.navigate('ArtistReservation');
  }, [navigation]);


  const goToArtistAdStats = useCallback(() => {
    navigation.navigate('ArtistAdStats');
  }, [navigation]);

  const goToArtistMyPage = useCallback(() => {
    navigation.navigate('ArtistMyPage');
  }, [navigation]);

  const goToMyProducts = useCallback(() => {
    navigation.navigate('MyProducts');
  }, [navigation]);

  const goToProductForm = useCallback(() => {
    navigation.navigate('ProductForm', {});
  }, [navigation]);

  const changeMode = useCallback((next: ProfileMode) => () => {
    setMode((prev) => {
      if (prev === next) return prev;
      const tKey = MODE_TAB_KEYS.find((m) => m.key === next)?.tKey;
      const label = tKey ? t(tKey) : '';
      toast(t('profile.modeSwitched').replace('{{mode}}', label), { variant: 'success' });
      return next;
    });
  }, [t, toast]);

  /* ── 이용자 메뉴 ── */
  const userReservationItems: MenuItem[] = [
    { Icon: CalendarIcon, label: t('profile.bookingManage'), badge: t('profile.reservationPending'), onPress: goToReservationManage },
    { Icon: HeartIcon, label: t('profile.favArtists'), onPress: goToFavoriteArtists },
    { Icon: PaletteIcon, label: t('profile.favWorks'), onPress: goToFavoriteWorks },
    { Icon: StoreIcon, label: t('profile.favPhotoShops'), onPress: goToFavoritePhotoShops },
    { Icon: FolderIcon, label: t('profile.favSupplies'), onPress: goToFavoriteSupplies },
  ];
  const userPostItems: MenuItem[] = [
    { Icon: ListIcon, label: t('profile.tattooReview'), onPress: goToTattooReview },
    { Icon: HandshakeIcon, label: t('profile.shopPosts'), onPress: goToMyShopPosts },
  ];
  const userSettingItems: MenuItem[] = [
    { Icon: UserOutlineIcon, label: t('settings.accountInfo'), onPress: goToAccountInfo },
    { Icon: BellIcon, label: t('settings.notification'), onPress: goToNotificationSettings },
    { Icon: LockIcon, label: t('settings.privacySecurity'), onPress: goToPrivacySecurity },
    { Icon: GlobeIcon, label: t('settings.language'), onPress: goToLanguage },
    { Icon: ChatBubbleIcon, label: t('profile.support'), onPress: goToSupport },
  ];

  /* ── 타투이스트 메뉴 ── */
  const artistMenuItems: (MenuItem & { description: string })[] = [
    {
      Icon: CheckCircleIcon,
      label: t('profile.reservationRequests'),
      description: t('profile.artistDescRequests'),
      onPress: goToReservationRequests,
    },
    {
      Icon: CalendarIcon,
      label: t('profile.bookingManage'),
      description: t('profile.artistDescSchedule'),
      onPress: goToArtistReservation,
    },
    {
      Icon: BarChartIcon,
      label: t('profile.adStats'),
      description: t('profile.artistDescAdStats'),
      onPress: goToArtistAdStats,
    },
    {
      Icon: EditPenIcon,
      label: t('profile.portfolioReview'),
      description: t('profile.artistDescPortfolio'),
      onPress: goToArtistMyPage,
    },
  ];

  /* ── 용품 판매자 메뉴 ── */
  const vendorMenuItems: (MenuItem & { description: string })[] = [
    {
      Icon: FolderIcon,
      label: t('profile.addProduct'),
      description: t('profile.vendorDescAddProduct'),
      onPress: goToProductForm,
    },
    {
      Icon: StoreIcon,
      label: t('profile.manageProducts'),
      description: t('profile.vendorDescManage'),
      onPress: goToMyProducts,
    },
    {
      Icon: BarChartIcon,
      label: t('profile.sellerInfo'),
      description: t('profile.vendorDescSeller'),
      onPress: goToMyProducts,
    },
  ];

  const renderCompactMenuItem = (item: MenuItem, isLast: boolean) => (
    <TouchableOpacity
      key={item.label}
      onPress={item.onPress}
      activeOpacity={0.75}
      style={[styles.menuRow, isLast && styles.menuRowLast]}
    >
      <View style={styles.menuIconWrap}>
        <item.Icon size={22} color={COLORS.gold} strokeWidth={1.7} />
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
      <View style={styles.menuRight}>
        {item.badge && (
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>{item.badge}</Text>
            <View style={styles.badgeDot} />
          </View>
        )}
        <ChevronRightIcon size={18} color={COLORS.gray} />
      </View>
    </TouchableOpacity>
  );

  const renderCompactSection = (title: string, items: MenuItem[]) => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>
        {items.map((it, i) => renderCompactMenuItem(it, i === items.length - 1))}
      </View>
    </View>
  );

  const renderArtistMenuCard = (item: MenuItem & { description: string }) => (
    <TouchableOpacity
      key={item.label}
      onPress={item.onPress}
      activeOpacity={0.75}
      style={styles.artistCard}
    >
      <View style={styles.artistCardIconWrap}>
        <item.Icon size={26} color={COLORS.gold} strokeWidth={1.7} />
      </View>
      <View style={styles.artistCardBody}>
        <Text style={styles.artistCardLabel}>{item.label}</Text>
        <Text style={styles.artistCardDesc}>{item.description}</Text>
      </View>
      <ChevronRightIcon size={18} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile card ── */}
        <View style={styles.profileBlock}>
          <View style={styles.avatarCircle}>
            <PersonSilhouette size={72} color="#3a3a3a" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>
              {isArtistMode ? 'MINSOO' : 'root_user'}
            </Text>
            {isArtistMode ? (
              <>
                <View style={styles.artistMetaRow}>
                  <LocationPinIcon size={13} color={COLORS.gray} />
                  <Text style={styles.artistMetaText}>서울 · 강남</Text>
                </View>
                <View style={styles.artistRatingRow}>
                  <StarIcon size={14} color={COLORS.gold} filled />
                  <Text style={styles.artistRatingValue}>4.9</Text>
                  <Text style={styles.artistRatingCount}>(356)</Text>
                </View>
              </>
            ) : (
              <Text style={styles.bio}>
                타투를 사랑하는 사화{'\n'}나만의 감성을 찾아가는 중
              </Text>
            )}
          </View>
        </View>

        {/* 활동 모드 전환 — 손님 · 타투이스트 · 용품 판매자 */}
        <View style={styles.modeTabs}>
          {MODE_TAB_KEYS.map((tab) => {
            const active = mode === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={changeMode(tab.key)}
                activeOpacity={0.8}
                style={[styles.modeTab, active && styles.modeTabActive]}
              >
                <Text style={[styles.modeTabText, active && styles.modeTabTextActive]}>
                  {t(tab.tKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.headerDivider} />

        {/* ── Body: 모드에 따라 분기 ── */}
        {mode === 'artist' && (
          <View style={styles.artistMenuList}>
            {artistMenuItems.map(renderArtistMenuCard)}
          </View>
        )}

        {mode === 'vendor' && (
          <View style={styles.artistMenuList}>
            {vendorMenuItems.map(renderArtistMenuCard)}
          </View>
        )}

        {mode === 'user' && (
          <>
            {renderCompactSection(t('profile.myReservations'), userReservationItems)}
            {renderCompactSection(t('profile.myPosts'), userPostItems)}
            {renderCompactSection(t('settings.title'), userSettingItems)}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyProfileScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Profile top */
  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 14,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  nickname: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  bio: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  artistMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  artistMetaText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  artistRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  artistRatingValue: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  artistRatingCount: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },

  /* 활동 모드 세그먼트 */
  modeTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 4,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabActive: { backgroundColor: COLORS.gold },
  modeTabText: {
    color: COLORS.gray,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
  },
  modeTabTextActive: { color: COLORS.black, fontWeight: '700' },

  artistToggleWrap: {
    alignItems: 'center',
    gap: 6,
  },
  artistToggleLabel: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    maxWidth: 88,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: COLORS.gold,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  switchThumbOn: {
    transform: [{ translateX: 20 }],
    backgroundColor: COLORS.black,
  },

  headerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
    marginBottom: 20,
  },

  /* User section card */
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionBody: {
    paddingHorizontal: 6,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIconWrap: {
    width: 28,
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  /* Artist mode — 큰 카드 리스트 */
  artistMenuList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16,
  },
  artistCardIconWrap: {
    width: 32,
    alignItems: 'center',
  },
  artistCardBody: {
    flex: 1,
    gap: 3,
  },
  artistCardLabel: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  artistCardDesc: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
});
