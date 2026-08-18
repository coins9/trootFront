import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  PaletteIcon, CalendarIcon, BarChartIcon, EditPenIcon,
  ChevronRightIcon, PlusIcon, StoreIcon, FolderIcon,
} from '../../components/icons';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../store/languageStore';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface MenuItemProps {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
  onPress: () => void;
}

const MenuItem = ({ Icon, title, description, onPress }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.menuIcon}>
      <Icon size={22} color={COLORS.gold} />
    </View>
    <View style={styles.menuText}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuDesc}>{description}</Text>
    </View>
    <ChevronRightIcon size={16} color={COLORS.gray2} />
  </TouchableOpacity>
);

const TattooistHubScreen = () => {
  const navigation = useNavigation<Nav>();
  const session = useAuthStore((s) => s.session);
  const { t } = useTranslation();

  const isArtist = session?.user.roles?.includes('TATTOOIST') ?? false;

  const goMyPage = useCallback(() => navigation.navigate('ArtistMyPage'), [navigation]);
  const goReservation = useCallback(() => navigation.navigate('ArtistReservation'), [navigation]);
  const goDeposit = useCallback(() => navigation.navigate('DepositManagement'), [navigation]);
  const goAdStats = useCallback(() => navigation.navigate('ArtistAdStats'), [navigation]);
  const goRequests = useCallback(() => navigation.navigate('ArtistReservationRequests'), [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tabs.artist')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isArtist ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('tattooistHub.myStudio')}</Text>
              <View style={styles.card}>
                <MenuItem
                  Icon={PaletteIcon}
                  title={t('tattooistHub.myPage')}
                  description={t('tattooistHub.myPageDesc')}
                  onPress={goMyPage}
                />
                <View style={styles.divider} />
                <MenuItem
                  Icon={EditPenIcon}
                  title={t('tattooistHub.portfolio')}
                  description={t('tattooistHub.portfolioDesc')}
                  onPress={goMyPage}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('tattooistHub.reservations')}</Text>
              <View style={styles.card}>
                <MenuItem
                  Icon={CalendarIcon}
                  title={t('tattooistHub.reservationManage')}
                  description={t('tattooistHub.reservationManageDesc')}
                  onPress={goReservation}
                />
                <View style={styles.divider} />
                <MenuItem
                  Icon={FolderIcon}
                  title={t('tattooistHub.requests')}
                  description={t('tattooistHub.requestsDesc')}
                  onPress={goRequests}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('tattooistHub.business')}</Text>
              <View style={styles.card}>
                <MenuItem
                  Icon={StoreIcon}
                  title={t('tattooistHub.deposit')}
                  description={t('tattooistHub.depositDesc')}
                  onPress={goDeposit}
                />
                <View style={styles.divider} />
                <MenuItem
                  Icon={BarChartIcon}
                  title={t('tattooistHub.adStats')}
                  description={t('tattooistHub.adStatsDesc')}
                  onPress={goAdStats}
                />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyWrap}>
            <PaletteIcon size={52} color={COLORS.gray2} />
            <Text style={styles.emptyTitle}>{t('tattooistHub.notArtistTitle')}</Text>
            <Text style={styles.emptyDesc}>{t('tattooistHub.notArtistDesc')}</Text>
            <TouchableOpacity
              style={styles.registerBtn}
              activeOpacity={0.85}
              onPress={goMyPage}
            >
              <PlusIcon size={16} color={COLORS.black} />
              <Text style={styles.registerBtnText}>{t('tattooistHub.register')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TattooistHubScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 27,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 24 },

  section: { gap: 8 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    lineHeight: 17,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    lineHeight: 20,
  },
  menuDesc: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 17,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 70,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 25,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 8,
  },
  registerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    lineHeight: 20,
  },
});
