import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, StatusBar, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import SearchBar from '../../components/common/SearchBar';
import HomeArtistHeader from '../../components/home/HomeArtistHeader';
import TattooCard from '../../components/home/TattooCard';
import FilterBar from '../../components/home/FilterBar';
import ActiveFilterRow from '../../components/home/ActiveFilterRow';
import FilterBottomSheet from '../../components/filter/FilterBottomSheet';
import FullFilterModal from '../../components/filter/FullFilterModal';
import { usePagedApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { artistApi, favoriteApi } from '../../../data/api';
import { toTattoo } from '../../../data/api/mappers';
import { FilterType, Tattoo, Artist } from '../../../domain/entities/types';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

const COLUMN_GAP = 8;
const SIDE_PAD = 16;
const PAGE_SIZE = 20;

type FeedRow = { key: string; left: Tattoo; right?: Tattoo };
type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeNavProp>();
  const [bottomSheetType, setBottomSheetType] = useState<FilterType | null>(null);
  const [fullFilterVisible, setFullFilterVisible] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [searchVisible, setSearchVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 400);

  const {
    items: artworks, loading, loadingMore, error, loadMore, reload,
  } = usePagedApi(
    (cursor) => artistApi.feed({
      cursor,
      limit: PAGE_SIZE,
      keyword: debouncedKeyword || undefined,
    }),
    [debouncedKeyword],
  );

  const handleSearchPress = useCallback(() => {
    setSearchVisible(true);
  }, []);

  const handleSearchCancel = useCallback(() => {
    setSearchVisible(false);
    setKeyword('');
  }, []);

  // 찜 여부는 목록 렌더링 후 한 번에 조회해 카드마다 요청하지 않는다
  const syncFavorites = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      const result = await favoriteApi.check('artwork', ids);
      setFavorites((prev) => ({ ...prev, ...result }));
    } catch {
      // 찜 표시는 부가 정보이므로 실패해도 피드는 그대로 노출한다
    }
  }, []);

  const feed = useMemo<FeedRow[]>(() => {
    const tattoos = artworks.map((a) => toTattoo(a, favorites[a.id] ?? false));
    const rows: FeedRow[] = [];
    for (let i = 0; i < tattoos.length; i += 2) {
      rows.push({ key: `row-${tattoos[i].id}`, left: tattoos[i], right: tattoos[i + 1] });
    }
    return rows;
  }, [artworks, favorites]);

  const openFilter = useCallback((type: FilterType) => {
    if (type === 'full') setFullFilterVisible(true);
    else setBottomSheetType(type);
  }, []);

  const handleArtistPress = useCallback(
    (artist: Artist) => navigation.navigate('ArtistProfile', { artist }),
    [navigation],
  );

  const handleTattooPress = useCallback(
    (tattoo: Tattoo) => navigation.navigate('TattooDetail', { tattoo }),
    [navigation],
  );

  const handleBookmark = useCallback(async (tattoo: Tattoo) => {
    // 응답을 기다리지 않고 먼저 반영해 체감 반응 속도를 높인다
    setFavorites((prev) => ({ ...prev, [tattoo.id]: !prev[tattoo.id] }));
    try {
      const { favorited } = await favoriteApi.toggle('artwork', tattoo.id);
      setFavorites((prev) => ({ ...prev, [tattoo.id]: favorited }));
    } catch {
      setFavorites((prev) => ({ ...prev, [tattoo.id]: !prev[tattoo.id] }));
    }
  }, []);

  const renderItem = useCallback(({ item }: { item: FeedRow }) => (
    <View style={styles.rowWrap}>
      <View style={[styles.cell, { marginRight: COLUMN_GAP / 2 }]}>
        <TattooCard
          tattoo={item.left}
          onPress={() => handleTattooPress(item.left)}
          onArtistPress={() => handleArtistPress(item.left.artist)}
          onBookmark={() => handleBookmark(item.left)}
        />
      </View>
      <View style={[styles.cell, { marginLeft: COLUMN_GAP / 2 }]}>
        {item.right ? (
          <TattooCard
            tattoo={item.right}
            onPress={() => handleTattooPress(item.right!)}
            onArtistPress={() => handleArtistPress(item.right!.artist)}
            onBookmark={() => handleBookmark(item.right!)}
          />
        ) : (
          <View />
        )}
      </View>
    </View>
  ), [handleTattooPress, handleArtistPress, handleBookmark]);

  const listHeader = useMemo(() => (
    <View>
      <HomeArtistHeader onArtistPress={handleArtistPress} onBannerPress={() => {}} />
      <FilterBar onFilterPress={openFilter} />
      <ActiveFilterRow onAddPress={() => openFilter('full')} />
    </View>
  ), [handleArtistPress, openFilter]);

  const listEmpty = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator color={COLORS.gold} />
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <Text style={styles.stateText}>{error ?? '아직 등록된 작품이 없습니다.'}</Text>
        {error && (
          <TouchableOpacity onPress={reload} style={styles.retry} activeOpacity={0.8}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [loading, error, reload]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader onSearchPress={handleSearchPress} />
      {searchVisible && (
        <SearchBar
          value={keyword}
          onChangeText={setKeyword}
          onCancel={handleSearchCancel}
          placeholder="작품, 타투이스트 검색"
        />
      )}
      <FlatList
        data={feed}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={COLORS.gold} style={styles.footer} /> : null
        }
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        onMomentumScrollEnd={() => syncFavorites(artworks.map((a) => a.id))}
        removeClippedSubviews
        windowSize={5}
        refreshing={loading && feed.length > 0}
        onRefresh={reload}
      />

      <FilterBottomSheet
        visible={bottomSheetType !== null}
        filterType={bottomSheetType}
        onClose={() => setBottomSheetType(null)}
      />
      <FullFilterModal visible={fullFilterVisible} onClose={() => setFullFilterVisible(false)} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  feedContent: { paddingBottom: 32, backgroundColor: COLORS.bg, flexGrow: 1 },
  rowWrap: { flexDirection: 'row', paddingHorizontal: SIDE_PAD },
  cell: { flex: 1 },
  state: { paddingVertical: 70, alignItems: 'center', gap: 14 },
  stateText: { color: COLORS.gray, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retry: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.gold,
  },
  retryText: { color: COLORS.gold, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  footer: { paddingVertical: 20 },
});
