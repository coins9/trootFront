import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, StatusBar, ActivityIndicator, TouchableOpacity, ScrollView, ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
import { artistApi, favoriteApi, adApi, type AdType } from '../../../data/api';
import { toTattoo } from '../../../data/api/mappers';
import { FilterType, Tattoo, Artist } from '../../../domain/entities/types';
import { HomeAd } from '../../../domain/entities/adTypes';
import HomeAdBanner from '../../components/home/HomeAdBanner';
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

  // 🚨 1. 화면(탭)에 다시 돌아올 때마다 피드와 광고 데이터를 최신으로 갱신
  // Fallback: 세그먼트 매칭 광고가 없으면 전체 활성 광고로 대체 (당근·번개 방식)
  const hasFocused = useRef(false);
  const { data: adArtworks, reload: reloadAds } = useApi(
      async () => {
        const regionKey = regionMode === 'domestic' ? (region.city ?? undefined) : undefined;
        const genreKey = genres[0] ?? undefined;
        // 1차: 현재 필터 세그먼트 매칭 광고
        const segmented = await adApi.servingArtworks(regionKey, genreKey);
        if (segmented.length > 0) return segmented;
        // Fallback: 세그먼트 불일치 시 targeting 없이 전체 활성 광고 요청
        if (regionKey || genreKey) {
          return adApi.servingArtworks(undefined, undefined);
        }
        return segmented;
      },
      [regionMode, region.city, genres],
  );

  useFocusEffect(
      useCallback(() => {
        if (!hasFocused.current) {
          hasFocused.current = true;
          return;
        }
        reload();
        reloadAds();
      }, [reload, reloadAds])
  );

  const cardAds = useMemo(
      () => (adArtworks ?? []).filter((a) => a.type === 'cardad'),
      [adArtworks],
  );

  // banner 타입 광고를 HomeAdBanner 형식으로 변환 (artwork null 방어)
  const bannerAds = useMemo<HomeAd[]>(
      () =>
        (adArtworks ?? [])
          .filter((a) => a.type === 'banner' && a.artwork != null)
          .map((a) => ({
            id: a.campaignId,
            category: '도안 광고' as const,
            title: a.artwork!.title,
            subtitle: a.artwork!.description ?? '',
            advertiserName: a.artwork!.artist?.pageName ?? '',
            location:
              a.artwork!.artist?.regionSigungu ??
              a.artwork!.artist?.regionSido ??
              undefined,
            priceLabel: a.artwork!.priceKrw
              ? `${Math.floor(a.artwork!.priceKrw / 10000)}만원~`
              : undefined,
            imageUri: a.artwork!.thumbnail ?? a.artwork!.images[0] ?? '',
            ctaLabel: '상세 보기',
            targetType: 'tattoo' as const,
            targetId: a.artwork!.id,
            isSponsored: true as const,
          })),
      [adArtworks],
  );

  const campaignByArtworkId = useMemo(() => {
    const m = new Map<string, string>();
    (adArtworks ?? []).forEach((a) => {
      if (a.artwork) m.set(a.artwork.id, a.campaignId);
    });
    return m;
  }, [adArtworks]);

  // 🚨 2. 광고 노출(Impression) 추적: 상단 고정 광고 및 피드 내 광고 모두 지원
  const trackedImpressions = useRef<Set<string>>(new Set());

  useEffect(() => {
    cardAds.forEach(({ campaignId }) => {
      if (!trackedImpressions.current.has(campaignId)) {
        trackedImpressions.current.add(campaignId);
        adApi.impression(campaignId).catch(() => {});
      }
    });
  }, [cardAds]);

  // 🚨 3. FlatList 스크롤 시 피드 내에 보이는 광고들의 노출(impression) 통계를 서버로 쏴줌
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 500,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    viewableItems.forEach((viewable) => {
      const item = viewable.item as FeedRow;
      if (viewable.isViewable) {
        // 왼쪽 카드 광고 체크
        const leftCampaignId = campaignByArtworkId.get(item.left.id);
        if (leftCampaignId && !trackedImpressions.current.has(leftCampaignId)) {
          trackedImpressions.current.add(leftCampaignId);
          adApi.impression(leftCampaignId).catch(() => {});
        }
        // 오른쪽 카드 광고 체크
        if (item.right) {
          const rightCampaignId = campaignByArtworkId.get(item.right.id);
          if (rightCampaignId && !trackedImpressions.current.has(rightCampaignId)) {
            trackedImpressions.current.add(rightCampaignId);
            adApi.impression(rightCampaignId).catch(() => {});
          }
        }
      }
    });
  }).current;

  const handleSearchPress = useCallback(() => {
    setSearchVisible(true);
  }, []);

  const handleSearchCancel = useCallback(() => {
    setSearchVisible(false);
    setKeyword('');
  }, []);

  const syncFavorites = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      const result = await favoriteApi.check('artwork', ids);
      setFavorites((prev) => ({ ...prev, ...result }));
    } catch {}
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

  // 🚨 4. 작품 클릭 시 캠페인(광고) 아이디가 있다면 서버로 클릭(click) 통계 전송
  const handleTattooPress = useCallback((tattoo: Tattoo) => {
    const campaignId = campaignByArtworkId.get(tattoo.id);
    if (campaignId) {
      adApi.click(campaignId).catch(() => {});
    }
    navigation.navigate('TattooDetail', { tattoo });
  }, [navigation, campaignByArtworkId]);

  const handleBookmark = useCallback(async (tattoo: Tattoo) => {
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

        {/* 배너 광고 (banner 타입) — 당근/번개 방식: 활성 광고 항상 노출 */}
        {bannerAds.map((ad) => (
            <HomeAdBanner
                key={ad.id}
                ad={ad}
                onPress={() => {
                  if (ad.targetType === 'tattoo' && ad.targetId) {
                    const matched = (adArtworks ?? []).find((a) => a.artwork.id === ad.targetId);
                    if (matched) {
                      adApi.click(ad.id).catch(() => {});
                      navigation.navigate('TattooDetail', {
                        tattoo: toTattoo(matched.artwork, favorites[matched.artwork.id] ?? false),
                      });
                    }
                  }
                }}
                onWhyAdPress={() => {}}
            />
        ))}

        {/* 카드 광고 (cardad 타입) — 수평 스크롤 */}
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
  ), [handleArtistPress, openFilter, sponsoredTattoos, bannerAds, adArtworks, favorites,
      handleTattooPress, handleBookmark, navigation, t]);

  const listEmpty = useMemo(() => {
    if (loading) {
      return (
          <View style={styles.state}>
            <ActivityIndicator color={COLORS.gold} />
          </View>
      );
    }
    // 키워드 검색 중 서버 오류 시 전용 안내 메시지
    const emptyText = error
        ? (debouncedKeyword ? t('home.searchError' as any) : error)
        : t('home.empty');
    return (
        <View style={styles.state}>
          <Text style={styles.stateText}>{emptyText}</Text>
          {error && !debouncedKeyword && (
              <TouchableOpacity onPress={reload} style={styles.retry} activeOpacity={0.8}>
                <Text style={styles.retryText}>{t('common.retry')}</Text>
              </TouchableOpacity>
          )}
        </View>
    );
  }, [loading, error, debouncedKeyword, reload, t]);

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
            onRefresh={() => { reload(); reloadAds(); }}
            // 🚨 5. FlatList에 노출 감지 속성 연결 (스크롤 시 광고 노출 통계가 위로 전송됨)
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
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