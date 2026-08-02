import React, { useCallback, useMemo, useState } from 'react';
import {
  View, FlatList, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import HomeArtistHeader from '../../components/home/HomeArtistHeader';
import TattooCard from '../../components/home/TattooCard';
import FilterBar from '../../components/home/FilterBar';
import ActiveFilterRow from '../../components/home/ActiveFilterRow';
import HomeAdBanner from '../../components/home/HomeAdBanner';
import FilterBottomSheet from '../../components/filter/FilterBottomSheet';
import FullFilterModal from '../../components/filter/FullFilterModal';
import { useToast } from '../../components/common/Toast';
import { MOCK_TATTOOS } from '../../../data/mock/mockData';
import { MOCK_HOME_ADS } from '../../../data/mock/adMockData';
import { FilterType, Tattoo, Artist } from '../../../domain/entities/types';
import { HomeAd } from '../../../domain/entities/adTypes';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

const COLUMN_GAP = 8;
const SIDE_PAD = 16;

/** 광고 삽입 주기 (당근 유사: 3행 = 6개 카드 마다 1개 광고) */
const AD_EVERY_N_ROWS = 3;

type FeedItem =
  | { type: 'row'; key: string; left: Tattoo; right?: Tattoo }
  | { type: 'ad'; key: string; ad: HomeAd };

type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const buildFeed = (tattoos: Tattoo[], ads: HomeAd[]): FeedItem[] => {
  const feed: FeedItem[] = [];
  let adIndex = 0;
  let rowCounter = 0;

  for (let i = 0; i < tattoos.length; i += 2) {
    feed.push({
      type: 'row',
      key: `row-${tattoos[i].id}`,
      left: tattoos[i],
      right: tattoos[i + 1],
    });
    rowCounter += 1;

    if (rowCounter % AD_EVERY_N_ROWS === 0 && ads.length > 0) {
      const ad = ads[adIndex % ads.length];
      feed.push({ type: 'ad', key: `ad-${ad.id}-${rowCounter}`, ad });
      adIndex += 1;
    }
  }

  return feed;
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeNavProp>();
  const { toast } = useToast();
  const [bottomSheetType, setBottomSheetType] = useState<FilterType | null>(null);
  const [fullFilterVisible, setFullFilterVisible] = useState(false);

  const openFilter = useCallback((type: FilterType) => {
    if (type === 'full') {
      setFullFilterVisible(true);
    } else {
      setBottomSheetType(type);
    }
  }, []);

  const closeBottomSheet = useCallback(() => setBottomSheetType(null), []);
  const closeFullFilter = useCallback(() => setFullFilterVisible(false), []);

  const handleArtistPress = useCallback(
    (artist: Artist) => navigation.navigate('ArtistProfile', { artist }),
    [navigation],
  );

  const handleTattooPress = useCallback(
    (tattoo: Tattoo) => navigation.navigate('TattooDetail', { tattoo }),
    [navigation],
  );

  const handleAdPress = useCallback((ad: HomeAd) => {
    toast(`${ad.advertiserName} — ${ad.ctaLabel}`);
  }, [toast]);

  const handleWhyAd = useCallback(() => {
    toast('내 관심사·활동 기반으로 노출된 광고입니다.');
  }, [toast]);

  const feed = useMemo(
    () => buildFeed(MOCK_TATTOOS, MOCK_HOME_ADS),
    [],
  );

  const renderItem = useCallback(({ item }: { item: FeedItem }) => {
    if (item.type === 'ad') {
      return (
        <HomeAdBanner
          ad={item.ad}
          onPress={() => handleAdPress(item.ad)}
          onWhyAdPress={handleWhyAd}
        />
      );
    }

    return (
      <View style={styles.rowWrap}>
        <View style={[styles.cell, { marginRight: COLUMN_GAP / 2 }]}>
          <TattooCard
            tattoo={item.left}
            onPress={() => handleTattooPress(item.left)}
            onArtistPress={() => handleArtistPress(item.left.artist)}
            onBookmark={() => {}}
          />
        </View>
        <View style={[styles.cell, { marginLeft: COLUMN_GAP / 2 }]}>
          {item.right ? (
            <TattooCard
              tattoo={item.right}
              onPress={() => handleTattooPress(item.right!)}
              onArtistPress={() => handleArtistPress(item.right!.artist)}
              onBookmark={() => {}}
            />
          ) : (
            <View />
          )}
        </View>
      </View>
    );
  }, [handleTattooPress, handleArtistPress, handleAdPress, handleWhyAd]);

  const listHeader = useMemo(() => (
    <View>
      <HomeArtistHeader
        onArtistPress={handleArtistPress}
        onBannerPress={() => {}}
      />
      <FilterBar onFilterPress={openFilter} />
      <ActiveFilterRow onAddPress={() => openFilter('full')} />
    </View>
  ), [handleArtistPress, openFilter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />
      <FlatList
        data={feed}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        windowSize={5}
      />

      <FilterBottomSheet
        visible={bottomSheetType !== null}
        filterType={bottomSheetType}
        onClose={closeBottomSheet}
      />
      <FullFilterModal
        visible={fullFilterVisible}
        onClose={closeFullFilter}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  feedContent: {
    paddingBottom: 32,
    backgroundColor: COLORS.bg,
  },
  rowWrap: {
    flexDirection: 'row',
    paddingHorizontal: SIDE_PAD,
  },
  cell: {
    flex: 1,
  },
});
