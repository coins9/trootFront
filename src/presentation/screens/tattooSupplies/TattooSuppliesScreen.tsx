import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import SearchBar from '../../components/common/SearchBar';
import SupplyCard from '../../components/supplies/SupplyCard';
import { ChevronDownIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import {
  SUPPLY_CATEGORIES, SUPPLY_SORTS, SupplyCategory, SupplySort,
  TattooSupply,
} from '../../../domain/entities/supplyTypes';
import { usePagedApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import {
  supplyApi, favoriteApi, type SupplyProduct, type ProductCategory,
} from '../../../data/api';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import ScreenBanner from '../../components/common/ScreenBanner';
import BannerCarousel from '../../components/common/BannerCarousel';
import { useTranslation } from '../../store/languageStore';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CODE_BY_CATEGORY: Record<SupplyCategory, ProductCategory> = {
  '머신 & 장비': 'machine',
  '니들 (바늘)': 'needle',
  '잉크': 'ink',
  '위생·소모품': 'hygiene',
  '스탠실 용품': 'stencil',
  '애프터케어': 'aftercare',
  '가구·인테리어': 'furniture',
};

const CATEGORY_T_KEY: Record<SupplyCategory, string> = {
  '머신 & 장비': 'machine',
  '니들 (바늘)': 'needle',
  '잉크': 'ink',
  '위생·소모품': 'hygiene',
  '스탠실 용품': 'stencil',
  '애프터케어': 'aftercare',
  '가구·인테리어': 'furniture',
};

const SORT_T_KEY: Record<SupplySort, string> = {
  '인기순': 'popular',
  '최신순': 'recent',
  '가격순': 'price',
};

const CATEGORY_BY_CODE = Object.fromEntries(
    Object.entries(CODE_BY_CATEGORY).map(([label, code]) => [code, label]),
) as Record<ProductCategory, SupplyCategory>;

const SORT_BY_LABEL: Record<SupplySort, 'popular' | 'price_asc' | 'recent'> = {
  '인기순': 'popular',
  '최신순': 'recent',
  '가격순': 'price_asc',
};

// 🚨 1. 데이터 매핑 로직 수정: 부제목(subtitle)과 한글 카테고리 대응
const toSupply = (p: SupplyProduct, sellerFallback: string): TattooSupply => {
  const mappedCategory = CATEGORY_BY_CODE[p.category] ?? p.category;

  return {
    id: p.id,
    category: mappedCategory as SupplyCategory,
    name: p.name,
    // 등록 폼에서 저장한 부제목을 우선 사용하고, 없으면 description 활용
    subtitle: (p as any).subtitle ?? p.description ?? '',
    brand: p.brand ?? undefined,
    imageUri: p.thumbnail ?? p.images[0] ?? '',
    images: p.images,
    price: p.priceKrw ?? (p as any).price ?? 0,
    seller: { id: p.vendorId, nickname: sellerFallback },
    isBookmarked: false,
    popularityScore: (p as any).popularityScore ?? 0,
    externalUrl: (p as any).externalUrl,
  };
};

const TattooSuppliesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const settings = usePublicSettings();
  const [category, setCategory] = useState<SupplyCategory>('머신 & 장비');
  const [sort, setSort] = useState<SupplySort>('최신순');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [searchVisible, setSearchVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 400);

  // 🚨 2. API 호출 파라미터 안전망 추가
  const {
    items, loading, loadingMore, error, loadMore, reload,
  } = usePagedApi(
      (cursor) => supplyApi.list({
        category: (CODE_BY_CATEGORY[category] || category) as any,
        sort: SORT_BY_LABEL[sort],
        keyword: debouncedKeyword || undefined,
        cursor,
        limit: 20,
      }),
      [category, sort, debouncedKeyword],
  );

  const handleSearchPress = useCallback(() => setSearchVisible(true), []);
  const handleSearchCancel = useCallback(() => {
    setSearchVisible(false);
    setKeyword('');
  }, []);

  // 🚨 3. 클라이언트 화면에서 확실하게 카테고리와 정렬이 적용되도록 처리
  const filtered = useMemo(() => {
    let mapped = items.map((p) => toSupply(p, '판매자'));

    // 카테고리가 일치하는 항목만 필터링
    if (category) {
      mapped = mapped.filter(item => item.category === category);
    }

    // 인기순 / 최신순 / 가격순 기준 정렬 적용
    return mapped.sort((a, b) => {
      switch (sort) {
        case '가격순':
          return (a.price || 0) - (b.price || 0); // 가격 낮은 순
        case '최신순':
          return 0; // API가 이미 최신순으로 반환
        case '인기순':
        default:
          return (b.popularityScore || 0) - (a.popularityScore || 0);
      }
    });
  }, [items, category, sort]);

  const handleBookmark = useCallback(async (id: string) => {
    const willAdd = !bookmarkedIds.has(id);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    toast(willAdd ? t('common.bookmarked') : t('common.unbookmarked'), {
      variant: willAdd ? 'success' : undefined,
    });
    try {
      await favoriteApi.toggle('supply', id);
    } catch {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (willAdd) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  }, [bookmarkedIds, toast, t]);

  const handleOpenDetail = useCallback((supply: TattooSupply) => {
    navigation.navigate('TattooSupplyDetail', { supply });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: TattooSupply }) => (
      <SupplyCard
          supply={{ ...item, isBookmarked: bookmarkedIds.has(item.id) }}
          onBookmark={() => handleBookmark(item.id)}
          onInquiry={() => handleOpenDetail(item)}
          onPress={() => handleOpenDetail(item)}
      />
  ), [bookmarkedIds, handleBookmark, handleOpenDetail]);

  const Header = (
      <View>
        {settings.bannerSupplyImages.length > 0
            ? <BannerCarousel items={settings.bannerSupplyImages} />
            : (settings.suppliesBannerImage || settings.suppliesBannerUrl)
                ? <ScreenBanner imageUrl={settings.suppliesBannerImage || undefined} linkUrl={settings.suppliesBannerUrl || undefined} />
                : null
        }

        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
            style={styles.categoryScrollView}
        >
          {SUPPLY_CATEGORIES.map((c) => {
            const isActive = c === category;
            return (
                <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    activeOpacity={0.8}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {t(`supplies.category.${CATEGORY_T_KEY[c]}` as any)}
                  </Text>
                </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.filterRow}>
          {SUPPLY_SORTS.map((s) => {
            const isActive = s === sort;
            return (
                <TouchableOpacity
                    key={s}
                    onPress={() => setSort(s)}
                    activeOpacity={0.8}
                    style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{t(`supplies.sort.${SORT_T_KEY[s]}` as any)}</Text>
                  <ChevronDownIcon
                      size={12}
                      color={isActive ? COLORS.gold : COLORS.gray}
                  />
                </TouchableOpacity>
            );
          })}
        </View>
      </View>
  );

  return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <LogoHeader showSearch onSearchPress={handleSearchPress} />
        {searchVisible && (
            <SearchBar
                value={keyword}
                onChangeText={setKeyword}
                onCancel={handleSearchCancel}
                placeholder={t('supplies.searchPlaceholder')}
            />
        )}
        <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            ListHeaderComponent={Header}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            refreshing={loading && filtered.length > 0}
            onRefresh={reload}
            ListFooterComponent={
              loadingMore ? <ActivityIndicator color={COLORS.gold} style={{ paddingVertical: 20 }} /> : null
            }
            ListEmptyComponent={
              loading ? (
                  <View style={styles.emptyState}><ActivityIndicator color={COLORS.gold} /></View>
              ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>{error ?? t('supplies.emptyProducts')}</Text>
                    {error && (
                        <TouchableOpacity onPress={reload} style={styles.retryBtn} activeOpacity={0.8}>
                          <Text style={styles.retryBtnText}>{t('common.retry')}</Text>
                        </TouchableOpacity>
                    )}
                  </View>
              )
            }
        />
      </SafeAreaView>
  );
};

export default TattooSuppliesScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  listContent: { paddingBottom: 32 },
  columnWrapper: { paddingHorizontal: 16, gap: 10 },
  categoryScrollView: { marginTop: 6 },
  categoryScroll: { gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1, borderColor: COLORS.chipBorder, backgroundColor: COLORS.elevated },
  categoryChipActive: { borderColor: COLORS.white, backgroundColor: COLORS.card },
  categoryText: { color: COLORS.gray, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  categoryTextActive: { color: COLORS.white, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: COLORS.chipBorder, backgroundColor: COLORS.elevated },
  filterBtnActive: { borderColor: COLORS.gold },
  filterText: { color: COLORS.gray, fontSize: 13, lineHeight: 18 },
  filterTextActive: { color: COLORS.gold, fontWeight: '600' },
  emptyState: { paddingVertical: 80, alignItems: 'center', gap: 14 },
  emptyText: { color: COLORS.gray, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gold },
  retryBtnText: { color: COLORS.gold, fontSize: 13, fontWeight: '600', lineHeight: 18 },
});