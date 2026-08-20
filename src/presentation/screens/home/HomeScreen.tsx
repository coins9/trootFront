import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, StatusBar, ActivityIndicator, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { useTranslation } from '../../store/languageStore';
import LogoHeader from '../../components/common/LogoHeader';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import SearchBar from '../../components/common/SearchBar';
import HomeArtistHeader from '../../components/home/HomeArtistHeader';
import TattooCard from '../../components/home/TattooCard';
import FilterBar from '../../components/home/FilterBar';
import ActiveFilterRow from '../../components/home/ActiveFilterRow';
import FilterBottomSheet from '../../components/filter/FilterBottomSheet';
import FullFilterModal from '../../components/filter/FullFilterModal';
import { usePagedApi, useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { artistApi, favoriteApi, adApi } from '../../../data/api';
import { toTattoo } from '../../../data/api/mappers';
import { FilterType, Tattoo, Artist } from '../../../domain/entities/types';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useFilterStore } from '../../store/filterStore';

const COLUMN_GAP = 8;
const SIDE_PAD = 16;
const PAGE_SIZE = 20;

type FeedRow = { key: string; left: Tattoo; right?: Tattoo };
type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavProp>();
  const settings = usePublicSettings();
  const [bottomSheetType, setBottomSheetType] = useState<FilterType | null>(null);
  const [fullFilterVisible, setFullFilterVisible] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [searchVisible, setSearchVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const debouncedKeyword = useDebounce(keyword, 400);

  const { regionMode, region, overseasCountryCode, genres, bodyParts, budgetMin, budgetMax } = useFilterStore();

  const {
    items: artworks, loading, loadingMore, error, loadMore, reload,
  } = usePagedApi(
    (cursor) => artistApi.feed({
      cursor,
      limit: PAGE_SIZE,
      keyword: debouncedKeyword || undefined,
      countryCode: regionMode === 'overseas' ? (overseasCountryCode ?? undefined) : undefined,
      regionSido: regionMode === 'domestic' ? (region.city ?? undefined) : undefined,
      regionSigungu: regionMode === 'domestic' ? (region.district ?? undefined) : undefined,
      genre: genres.length > 0 ? genres.join(',') : undefined,
      bodyPart: bodyParts.length > 0 ? bodyParts.join(',') : undefined,
      priceMin: budgetMin > 0 ? budgetMin : undefined,
    }),
    [debouncedKeyword, regionMode, overseasCountryCode, region.city, region.district,
      genres, bodyParts, budgetMin, budgetMax],
  );

  // 결제된 카드광고/슈퍼UP 캠페인 — 대상 작품 정보 포함
  const { data: adArtworks } = useApi(
    () => adApi.servingArtworks(
      regionMode === 'domestic' ? (region.city ?? undefined) : undefined,
      genres[0],
    ),
    [regionMode, region.city, genres],
  );

  // 카드광고 = 피드 상단 고정 슬롯. 슈퍼UP은 랭킹 부스트라 별도 슬롯 없이 클릭만 추적한다.
  const cardAds = useMemo(
    () => (adArtworks ?? []).filter((a) => a.type === 'cardad'),
    [adArtworks],
  );
  const campaignByArtworkId = useMemo(() => {
    const m = new Map<string, string>();
    (adArtworks ?? []).forEach((a) => m.set(a.artwork.id, a.campaignId));
    return m;
  }, [adArtworks]);

  // 노출수는 세션당 캠페인 1회만 기록 (같은 화면에서 재조회돼도 중복 카운트하지 않는다)
  const trackedImpressions = useRef<Set<string>>(new Set());
  useEffect(() => {
    cardAds.forEach(({ campaignId }) => {
      if (!trackedImpressions.current.has(campaignId)) {
        trackedImpressions.current.add(campaignId);
        adApi.impression(campaignId).catch(() => {});
      }
    });
  }, [cardAds]);

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

  const handleTattooPress = useCallback((tattoo: Tattoo) => {
    const campaignId = campaignByArtworkId.get(tattoo.id);
    if (campaignId) adApi.click(campaignId).catch(() => {});
    navigation.navigate('TattooDetail', { tattoo });
  }, [navigation, campaignByArtworkId]);

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

  const sponsoredTattoos = useMemo(
    () => cardAds.map((a) => toTattoo(a.artwork, favorites[a.artwork.id] ?? false)),
    [cardAds, favorites],
  );

  const listHeader = useMemo(() => (
    <View>
      <HomeArtistHeader onArtistPress={handleArtistPress} onBannerPress={() => {}} />
      <FilterBar onFilterPress={openFilter} />
      <ActiveFilterRow onAddPress={() => openFilter('full')} />
      {sponsoredTattoos.length > 0 && (
        <View style={styles.sponsoredSection}>
          <Text style={styles.sponsoredTitle}>{t('home.sponsored')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sponsoredRow}
          >
            {sponsoredTattoos.map((tattoo) => (
              <TattooCard
                key={tattoo.id}
                tattoo={tattoo}
                onPress={() => handleTattooPress(tattoo)}
                onArtistPress={() => handleArtistPress(tattoo.artist)}
                onBookmark={() => handleBookmark(tattoo)}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  ), [handleArtistPress, openFilter, sponsoredTattoos, handleTattooPress, handleBookmark, t]);

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
        <Text style={styles.stateText}>{error ?? t('home.empty')}</Text>
        {error && (
          <TouchableOpacity onPress={reload} style={styles.retry} activeOpacity={0.8}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [loading, error, reload, t]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader showSearch onSearchPress={handleSearchPress} />
      {!!settings.noticeBanner && !noticeDismissed && (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText} numberOfLines={2}>{settings.noticeBanner}</Text>
          <TouchableOpacity
            onPress={() => setNoticeDismissed(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.noticeDismiss}
          >
            <Text style={styles.noticeDismissText}>×</Text>
          </TouchableOpacity>
        </View>
      )}
      {searchVisible && (
        <SearchBar
          value={keyword}
          onChangeText={setKeyword}
          onCancel={handleSearchCancel}
          placeholder={t('home.searchPlaceholder')}
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
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldDim,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,168,67,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  noticeText: {
    flex: 1,
    color: COLORS.gold,
    fontSize: 12,
    lineHeight: 18,
    flexShrink: 1,
  },
  noticeDismiss: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeDismissText: {
    color: COLORS.gold,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '300',
  },
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
  sponsoredSection: { backgroundColor: COLORS.bg, paddingTop: 16 },
  sponsoredTitle: {
    color: COLORS.gray, fontSize: 12, fontWeight: '700',
    lineHeight: 17, letterSpacing: 0.3, paddingHorizontal: SIDE_PAD, marginBottom: 10,
  },
  sponsoredRow: { paddingHorizontal: SIDE_PAD, gap: COLUMN_GAP, paddingBottom: 4 },
});
