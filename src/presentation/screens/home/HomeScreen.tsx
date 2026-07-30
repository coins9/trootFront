import React, { useCallback, useState, useRef } from 'react';
import {
  View, FlatList, StyleSheet, Text, StatusBar, TouchableOpacity,
  Dimensions,
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
import { useFilterStore } from '../../store/filterStore';
import { MOCK_ARTISTS, MOCK_TATTOOS } from '../../../data/mock/mockData';
import { FilterType, Tattoo, Artist } from '../../../domain/entities/types';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = 8;
const SIDE_PAD = 16;
const CARD_WIDTH = (SCREEN_WIDTH - SIDE_PAD * 2 - COLUMN_GAP) / 2;

type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeNavProp>();
  const [bottomSheetType, setBottomSheetType] = useState<FilterType | null>(null);
  const [fullFilterVisible, setFullFilterVisible] = useState(false);
  const { getActiveFilterChips } = useFilterStore();

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

  const renderArtistCard = useCallback(
    ({ item, index }: { item: Artist; index: number }) => (
      <View style={{ marginLeft: index === 0 ? 16 : 8, marginRight: index === MOCK_ARTISTS.length - 1 ? 16 : 0 }}>
        <ArtistCard
          artist={item}
          isActive={index === 0}
          onPress={() => handleArtistPress(item)}
        />
      </View>
    ),
    [handleArtistPress],
  );

  const renderTattooCard = useCallback(
    ({ item, index }: { item: Tattoo; index: number }) => {
      const isLeft = index % 2 === 0;
      return (
        <View style={[styles.tattooCardWrapper, isLeft ? { marginRight: COLUMN_GAP / 2 } : { marginLeft: COLUMN_GAP / 2 }]}>
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
      />
      <View style={styles.artistCountRow}>
        <Text style={styles.artistCountText}>전체 {MOCK_ARTISTS.length}명</Text>
        <Text style={styles.artistCountInfinity}> ∞</Text>
      </View>
      <FilterBar onFilterPress={openFilter} />
      <ActiveFilterRow onAddPress={() => openFilter('full')} />
    </View>
  ), [renderArtistCard, openFilter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
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
    backgroundColor: COLORS.bg,
  },
  artistList: {
    paddingVertical: 12,
    gap: 8,
  },
  artistCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 16,
    paddingBottom: 6,
  },
  artistCountText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  artistCountInfinity: {
    color: COLORS.gold,
    fontSize: 14,
    lineHeight: 17,
  },
  feedContent: {
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 32,
  },
  columnWrapper: {
    marginBottom: COLUMN_GAP,
  },
  tattooCardWrapper: {
    flex: 1,
  },
});
