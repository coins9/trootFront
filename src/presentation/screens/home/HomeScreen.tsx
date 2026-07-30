import React, { useCallback, useState, useRef } from 'react';
import {
  View, FlatList, StyleSheet, Text, StatusBar,
  Dimensions, NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import ArtistCard from '../../components/home/ArtistCard';
import TattooCard from '../../components/home/TattooCard';
import FilterBar from '../../components/home/FilterBar';
import ActiveFilterRow from '../../components/home/ActiveFilterRow';
import FilterBottomSheet from '../../components/filter/FilterBottomSheet';
import FullFilterModal from '../../components/filter/FullFilterModal';
import { MOCK_ARTISTS, MOCK_TATTOOS } from '../../../data/mock/mockData';
import { FilterType, Tattoo, Artist } from '../../../domain/entities/types';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTIST_CARD_WIDTH = 130;
const ARTIST_GAP = 8;
const COLUMN_GAP = 8;
const SIDE_PAD = 16;

type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeNavProp>();
  const [bottomSheetType, setBottomSheetType] = useState<FilterType | null>(null);
  const [fullFilterVisible, setFullFilterVisible] = useState(false);
  const [activeArtistIdx, setActiveArtistIdx] = useState(0);

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

  const handleArtistScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offset / (ARTIST_CARD_WIDTH + ARTIST_GAP));
    if (idx !== activeArtistIdx) setActiveArtistIdx(idx);
  }, [activeArtistIdx]);

  const renderArtistCard = useCallback(
    ({ item, index }: { item: Artist; index: number }) => (
      <View style={{ marginRight: index === MOCK_ARTISTS.length - 1 ? 0 : ARTIST_GAP }}>
        <ArtistCard
          artist={item}
          isActive={index === activeArtistIdx}
          onPress={() => handleArtistPress(item)}
        />
      </View>
    ),
    [handleArtistPress, activeArtistIdx],
  );

  const renderTattooCard = useCallback(
    ({ item, index }: { item: Tattoo; index: number }) => {
      const isLeft = index % 2 === 0;
      return (
        <View
          style={[
            styles.tattooCardWrapper,
            isLeft ? { marginRight: COLUMN_GAP / 2 } : { marginLeft: COLUMN_GAP / 2 },
          ]}
        >
          <TattooCard
            tattoo={item}
            onPress={() => handleTattooPress(item)}
            onArtistPress={() => handleArtistPress(item.artist)}
            onBookmark={() => {}}
          />
        </View>
      );
    },
    [handleTattooPress, handleArtistPress],
  );

  const ListHeader = useCallback(() => (
    <View>
      <FlatList
        data={MOCK_ARTISTS}
        keyExtractor={(item) => item.id}
        renderItem={renderArtistCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.artistList}
        onScroll={handleArtistScroll}
        scrollEventThrottle={32}
      />
      <View style={styles.dotsRow}>
        <View style={styles.dotsGroup}>
          {MOCK_ARTISTS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeArtistIdx && styles.dotActive]}
            />
          ))}
        </View>
        <View style={styles.countGroup}>
          <Text style={styles.countText}>전체 {MOCK_ARTISTS.length}명</Text>
          <Text style={styles.countInfinity}> ∞</Text>
        </View>
      </View>
      <FilterBar onFilterPress={openFilter} />
      <ActiveFilterRow onAddPress={() => openFilter('full')} />
    </View>
  ), [renderArtistCard, openFilter, handleArtistScroll, activeArtistIdx]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />
      <FlatList
        data={MOCK_TATTOOS}
        keyExtractor={(item) => item.id}
        renderItem={renderTattooCard}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.feedContent}
        columnWrapperStyle={styles.columnWrapper}
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
  artistList: {
    paddingLeft: SIDE_PAD,
    paddingRight: SIDE_PAD,
    paddingVertical: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 8,
  },
  dotsGroup: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray3,
  },
  dotActive: {
    backgroundColor: COLORS.gold,
    width: 18,
  },
  countGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  countInfinity: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 15,
  },
  feedContent: {
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 32,
    backgroundColor: COLORS.bg,
  },
  columnWrapper: {
    marginBottom: 0,
  },
  tattooCardWrapper: {
    flex: 1,
  },
});
