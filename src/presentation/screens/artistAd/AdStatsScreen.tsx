import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
  Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import { BackArrowIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import AppBottomTabBar, { useBottomTabHeight } from '../../components/common/AppBottomTabBar';
import PromoBanner from '../../components/artistAd/PromoBanner';
import AdCard from '../../components/artistAd/AdCard';
import SuperUpBottomSheet, { SuperUpPlan } from '../../components/artistAd/SuperUpBottomSheet';
import CardAdBottomSheet, { CardAdPlan } from '../../components/artistAd/CardAdBottomSheet';
import {
  MOCK_PROMO_BANNERS, MOCK_ARTIST_ADS,
} from '../../../data/mock/artistAdMockData';
import { ArtistAdItem } from '../../../domain/entities/artistAdTypes';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SheetKind = 'superUp' | 'cardAd';

const AdStatsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const bottomTabHeight = useBottomTabHeight();

  const openBottomSheet = useCallback((kind: SheetKind) => {
    // NOTE: superUp → 슈퍼UP 횟수권 결제 바텀시트가 올라옵니다.
    // NOTE: cardAd  → 홈 화면 고정 노출 카드광고 결제 바텀시트가 올라옵니다.
    setSheet(kind);
  }, []);
  const closeBottomSheet = useCallback(() => setSheet(null), []);

  const openPromoUrl = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      toast('링크를 열 수 없습니다. 잠시 후 다시 시도해주세요.', { variant: 'error' });
    });
  }, [toast]);

  const handleOpenDetail = useCallback((item: ArtistAdItem) => () => {
    // NOTE: 상세 통계 페이지가 열립니다. (준비 중)
    toast(`${item.title} 상세 통계 — 준비 중입니다`);
    // 실제 라우트 등록 후 아래로 교체
    // navigation.navigate('AdDetail', { id: item.id });
  }, [toast]);

  const handleUp = useCallback((item: ArtistAdItem) => () => {
    Alert.alert(
      'UP 적용',
      '해당 도안을 상단으로 무료로 끌어올리시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'default',
          onPress: () => {
            toast(`${item.title} 이(가) 상단으로 UP 되었습니다.`, { variant: 'success' });
          },
        },
      ],
      { cancelable: true },
    );
  }, [toast]);

  const handleSuperUp = useCallback((_item: ArtistAdItem) => () => {
    openBottomSheet('superUp');
  }, [openBottomSheet]);

  const handleCardAd = useCallback((_item: ArtistAdItem) => () => {
    openBottomSheet('cardAd');
  }, [openBottomSheet]);

  const handleSuperUpPurchase = useCallback((plan: SuperUpPlan) => {
    closeBottomSheet();
    setTimeout(() => {
      toast(
        `슈퍼UP ${plan.label} · ${plan.price.toLocaleString()}원 결제 — 준비 중입니다`,
        { variant: 'success' },
      );
    }, 200);
  }, [closeBottomSheet, toast]);

  const handleCardAdPurchase = useCallback((plan: CardAdPlan) => {
    closeBottomSheet();
    setTimeout(() => {
      toast(
        `카드광고 ${plan.label} · ${plan.price.toLocaleString()}원 결제 — 준비 중입니다`,
        { variant: 'success' },
      );
    }, 200);
  }, [closeBottomSheet, toast]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />

      <View style={styles.subHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <BackArrowIcon size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>광고 및 통계 관리</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomTabHeight + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Promo banners */}
        {MOCK_PROMO_BANNERS.map((b) => (
          <PromoBanner
            key={b.id}
            banner={b}
            onPress={() => openPromoUrl(b.ctaUrl)}
          />
        ))}

        {/* Section title */}
        <Text style={styles.sectionTitle}>도안 광고 관리</Text>

        {MOCK_ARTIST_ADS.map((ad) => (
          <AdCard
            key={ad.id}
            ad={ad}
            onOpenDetail={handleOpenDetail(ad)}
            onUp={handleUp(ad)}
            onSuperUp={handleSuperUp(ad)}
            onCardAd={handleCardAd(ad)}
          />
        ))}
      </ScrollView>

      <AppBottomTabBar activeTab="ProfileTab" />

      <SuperUpBottomSheet
        visible={sheet === 'superUp'}
        onClose={closeBottomSheet}
        onPurchase={handleSuperUpPurchase}
      />
      <CardAdBottomSheet
        visible={sheet === 'cardAd'}
        onClose={closeBottomSheet}
        onPurchase={handleCardAdPurchase}
      />
    </SafeAreaView>
  );
};

export default AdStatsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.black,
  },
  backBtn: {
    width: 36, height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginLeft: 4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
});
