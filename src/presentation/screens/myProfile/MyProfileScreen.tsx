import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Linking,
  Image, ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import {
  CalendarIcon, HeartIcon, StoreIcon, FolderIcon,
  ListIcon, UserOutlineIcon, BellIcon, LockIcon, GlobeIcon, ChatBubbleIcon, ChevronRightIcon,
  PersonSilhouette, PaletteIcon, BarChartIcon,
  EditPenIcon, LocationPinIcon, StarIcon, HandshakeIcon, CheckCircleIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useTranslation } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { artistApi, type ArtistPage, publicSettingsApi, type SiteSettings, userApi } from '../../../data/api';
import { uploadImage } from '../../../data/api/upload';
import { supplyVendorApi, type MyVendor } from '../../../data/api/vendor';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  description?: string;
  badge?: string;
  onPress?: () => void;
}

type ProfileMode = 'user' | 'artist' | 'vendor' | 'shopMatching';

const MODE_TAB_KEYS: { key: ProfileMode; tKey: 'profile.modeUser' | 'profile.modeArtist' | 'profile.modeVendor' | 'profile.modeShopMatching' }[] = [
  { key: 'user', tKey: 'profile.modeUser' },
  { key: 'artist', tKey: 'profile.modeArtist' },
  { key: 'vendor', tKey: 'profile.modeVendor' },
  { key: 'shopMatching', tKey: 'profile.modeShopMatching' },
];

const MODE_KEY = '@troot/profile_mode';

const MyProfileScreen = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const session = useAuthStore((s) => s.session);
  const patchUser = useAuthStore((s) => s.patchUser);
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<ProfileMode>('user');
  const [artistInfo, setArtistInfo] = useState<ArtistPage | null>(null);
  const [vendorInfo, setVendorInfo] = useState<MyVendor | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(session?.user.profileImage ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Restore persisted mode on mount
  useEffect(() => {
    AsyncStorage.getItem(MODE_KEY)
        .then((val) => {
          if (val === 'artist' || val === 'vendor' || val === 'user') setMode(val);
        })
        .catch(() => {});
  }, []);

  // Preload artist page, vendor profile, and site settings
  useEffect(() => {
    publicSettingsApi.get()
        .then(setSiteSettings)
        .catch(() => {});
  }, []);

  useEffect(() => {
    if (!session) return;
    artistApi.me()
        .then(setArtistInfo)
        .catch(() => setArtistInfo(null));
    supplyVendorApi.me()
        .then(setVendorInfo)
        .catch(() => setVendorInfo(null));
  }, [session]);

  /* ── Navigation helpers ── */
  const goTo = useCallback(
      (screen: keyof RootStackParamList) => () => navigation.navigate(screen as any),
      [navigation],
  );

  const handlePickAvatar = useCallback(async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.85, selectionLimit: 1 });
    if (result.didCancel || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (!asset.uri) return;
    setAvatarUploading(true);
    try {
      const publicUrl = await uploadImage('profile', { uri: asset.uri, type: asset.type, fileSize: asset.fileSize });
      await userApi.updateProfileImage(publicUrl);
      await patchUser({ profileImage: publicUrl });
      setAvatarUri(publicUrl);
      toast(t('account.saved'), { variant: 'success' });
    } catch {
      toast(t('common.error'), { variant: 'error' });
    } finally {
      setAvatarUploading(false);
    }
  }, [patchUser, toast, t]);

  /* ── Mode switching with registration guards ── */
  const handleTabPress = useCallback((next: ProfileMode) => {
    if (next === mode) return;

    if (next === 'artist') {
      const isTattooist =
          session?.user.role === 'TATTOOIST' ||
          session?.user.roles?.includes('TATTOOIST');
      if (!isTattooist || !artistInfo) {
        navigation.navigate('ArtistMyPage');
        return;
      }
    }

    if (next === 'vendor') {
      if (!vendorInfo) {
        navigation.navigate('VendorApply');
        return;
      }
    }

    void AsyncStorage.setItem(MODE_KEY, next);
    const entry = MODE_TAB_KEYS.find((m) => m.key === next);
    const label = entry ? t(entry.tKey) : '';
    toast(t('profile.modeSwitched').replace('{{mode}}', label), { variant: 'success' });
    setMode(next);
  }, [mode, session, artistInfo, vendorInfo, navigation, t, toast]);

  /* ── Derived profile data ── */
  const displayName = (() => {
    if (mode === 'artist' && artistInfo) return artistInfo.pageName;
    if (mode === 'vendor' && vendorInfo) return vendorInfo.name;
    return session?.user.nickname ?? 'root_user';
  })();

  /* ── Menu items ── */
  const userReservationItems: MenuItem[] = [
    { Icon: CalendarIcon, label: t('profile.bookingManage'), onPress: goTo('ReservationManage') },
    { Icon: HeartIcon, label: t('profile.favArtists'), onPress: goTo('FavoriteArtists') },
    { Icon: PaletteIcon, label: t('profile.favWorks'), onPress: goTo('FavoriteWorks') },
    { Icon: StoreIcon, label: t('profile.favPhotoShops'), onPress: goTo('FavoritePhotoShops') },
    { Icon: FolderIcon, label: t('profile.favSupplies'), onPress: goTo('FavoriteSupplies') },
  ];
  const userPostItems: MenuItem[] = [
    { Icon: ListIcon, label: t('profile.tattooReview'), onPress: goTo('TattooReview') },
  ];
  const openLink = useCallback((url?: string | null) => {
    if (!url) {
      toast(t('common.linkError'), { variant: 'error' });
      return;
    }
    Linking.openURL(url).catch(() => toast(t('common.linkError'), { variant: 'error' }));
  }, [t, toast]);

  const shopBoothItems: MenuItem[] = [
    {
      Icon: HandshakeIcon,
      label: t('profile.myPosts'),
      onPress: () => navigation.navigate('MyShopPosts', { defaultCategory: '부스 쉐어' }),
    },
    {
      Icon: CalendarIcon,
      label: t('profile.applicationStatus'),
      onPress: () => navigation.navigate('ShopApplications', { category: '부스 쉐어' }),
    },
  ];
  const shopModelItems: MenuItem[] = [
    {
      Icon: UserOutlineIcon,
      label: t('profile.myPosts'),
      onPress: () => navigation.navigate('MyShopPosts', { defaultCategory: '타투 모델 구인 (비기너)' }),
    },
    {
      Icon: CalendarIcon,
      label: t('profile.applicationStatus'),
      onPress: () => navigation.navigate('ShopApplications', { category: '타투 모델 구인 (비기너)' }),
    },
  ];
  const shopMediaItems: MenuItem[] = [
    {
      Icon: PaletteIcon,
      label: t('profile.myPosts'),
      onPress: () => navigation.navigate('MyShopPosts', { defaultCategory: '사진/영상 편집자' }),
    },
    {
      Icon: CalendarIcon,
      label: t('profile.applicationStatus'),
      onPress: () => navigation.navigate('ShopApplications', { category: '사진/영상 편집자' }),
    },
  ];
  const shopAdItems: MenuItem[] = [
    {
      Icon: BarChartIcon,
      label: t('profile.adInquiry'),
      onPress: () => openLink(siteSettings?.ad_inquiry_url),
    },
  ];
  const userSettingItems: MenuItem[] = [
    { Icon: UserOutlineIcon, label: t('settings.accountInfo'), onPress: goTo('AccountInfo') },
    { Icon: BellIcon, label: t('settings.notification'), onPress: goTo('NotificationSettings') },
    { Icon: LockIcon, label: t('settings.privacySecurity'), onPress: goTo('PrivacySecurity') },
    { Icon: GlobeIcon, label: t('settings.language'), onPress: goTo('Language') },
    { Icon: ChatBubbleIcon, label: t('profile.support'), onPress: goTo('Support') },
  ];

  const artistMenuItems: (MenuItem & { description: string })[] = [
    {
      Icon: CheckCircleIcon,
      label: t('profile.reservationRequests'),
      description: t('profile.artistDescRequests'),
      onPress: goTo('ArtistReservationRequests'),
    },
    {
      Icon: CalendarIcon,
      label: t('profile.bookingManage'),
      description: t('profile.artistDescSchedule'),
      onPress: goTo('ArtistReservation'),
    },
    {
      Icon: BarChartIcon,
      label: t('profile.adStats'),
      description: t('profile.artistDescAdStats'),
      onPress: goTo('ArtistAdStats'),
    },
    {
      Icon: EditPenIcon,
      label: t('profile.portfolioReview'),
      description: t('profile.artistDescPortfolio'),
      onPress: goTo('ArtistMyPage'),
    },
  ];

  const vendorMenuItems: (MenuItem & { description: string })[] = [
    {
      Icon: FolderIcon,
      label: t('profile.addProduct'),
      description: t('profile.vendorDescAddProduct'),
      onPress: goTo('ProductForm'),
    },
    {
      Icon: StoreIcon,
      label: t('profile.manageProducts'),
      description: t('profile.vendorDescManage'),
      onPress: goTo('MyProducts'),
    },
    {
      Icon: BarChartIcon,
      label: t('profile.sellerInfo'),
      description: t('profile.vendorDescSeller'),
      onPress: goTo('SellerInfo'),
    },
    {
      Icon: BarChartIcon,
      label: '용품샵 광고 문의하기',
      description: '왈라폼을 통해 광고를 문의하세요',
      onPress: () => openLink(siteSettings?.ad_inquiry_url),
    },
  ];

  /* ── Render helpers ── */
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
        <View style={styles.menuLabelWrap}>
          <Text style={styles.menuLabel}>{item.label}</Text>
          {!!item.description && <Text style={styles.menuDesc}>{item.description}</Text>}
        </View>
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


  return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <LogoHeader />

        {/* Profile card — outside ScrollView so tab bar stays sticky */}
        <View style={styles.profileBlock}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={handlePickAvatar}
            activeOpacity={0.85}
            disabled={avatarUploading}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <PersonSilhouette size={72} color="#3a3a3a" />
            )}
            {avatarUploading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={COLORS.gold} size="small" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.nickname} numberOfLines={1}>{displayName}</Text>
            {mode === 'artist' && artistInfo ? (
                <>
                  <View style={styles.artistMetaRow}>
                    <LocationPinIcon size={13} color={COLORS.gray} />
                    <Text style={styles.artistMetaText}>
                      {[artistInfo.regionSido, artistInfo.regionSigungu].filter(Boolean).join(' · ') || '—'}
                    </Text>
                  </View>
                  <View style={styles.artistRatingRow}>
                    <StarIcon size={14} color={COLORS.gold} filled />
                    <Text style={styles.artistRatingValue}>{Number(artistInfo.rating).toFixed(1)}</Text>
                    <Text style={styles.artistRatingCount}>({artistInfo.reviewCount})</Text>
                  </View>
                </>
            ) : mode === 'vendor' && vendorInfo ? (
                <Text style={styles.vendorStatus}>
                  {vendorInfo.status === 'approved' ? t('profile.vendorApproved') :
                      vendorInfo.status === 'pending' ? t('profile.vendorPending') :
                          vendorInfo.status === 'rejected' ? t('profile.vendorRejected') :
                              t('profile.vendorSuspended')}
                </Text>
            ) : (
                <Text style={styles.bio}>{session?.user.email ?? ''}</Text>
            )}
          </View>
        </View>

        {/* Mode selector — underline tab bar matching customer view */}
        <View style={styles.modeTabs}>
          {MODE_TAB_KEYS.map((tab) => {
            const active = mode === tab.key;
            return (
                <TouchableOpacity
                    key={tab.key}
                    onPress={() => handleTabPress(tab.key)}
                    activeOpacity={0.8}
                    style={styles.modeTab}
                >
                  <Text style={[styles.modeTabText, active && styles.modeTabTextActive]} numberOfLines={1}>
                    {t(tab.tKey)}
                  </Text>
                  {active && <View style={styles.modeTabUnderline} />}
                </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
            showsVerticalScrollIndicator={false}
        >
          {mode === 'artist' && (
              <>
                {renderCompactSection(t('profile.modeArtist'), artistMenuItems)}
              </>
          )}

          {mode === 'vendor' && (
              <>
                {renderCompactSection(t('profile.modeVendor'), vendorMenuItems)}
              </>
          )}

          {mode === 'user' && (
              <>
                {renderCompactSection(t('profile.myReservations'), userReservationItems)}
                {renderCompactSection(t('profile.myPosts'), userPostItems)}
                {renderCompactSection(t('settings.title'), userSettingItems)}
              </>
          )}

          {mode === 'shopMatching' && (
              <>
                {renderCompactSection('부스 쉐어', shopBoothItems)}
                {renderCompactSection('타투 모델 구인 (비기너)', shopModelItems)}
                {renderCompactSection('사진/영상 편집자', shopMediaItems)}
                {renderCompactSection(t('profile.adSection'), shopAdItems)}
              </>
          )}
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
    paddingTop: 16,
  },

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
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
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
  vendorStatus: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '600',
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
    flexShrink: 1,
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

  modeTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    position: 'relative',
  },
  modeTabText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  modeTabTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  modeTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 2.5,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },

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
  menuLabelWrap: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  menuDesc: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
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

});
