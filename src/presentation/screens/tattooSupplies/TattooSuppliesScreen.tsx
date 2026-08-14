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
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// 화면 라벨 ↔ 백엔드 코드 매핑
const CODE_BY_CATEGORY: Record<SupplyCategory, ProductCategory> = {
  '머신 & 장비': 'machine',
  '니들 (바늘)': 'needle',
  '잉크': 'ink',
  '위생·소모품': 'hygiene',
  '스탠실 용품': 'stencil',
  '애프터케어': 'aftercare',
  '가구·인테리어': 'furniture',
};
const CATEGORY_BY_CODE = Object.fromEntries(
  Object.entries(CODE_BY_CATEGORY).map(([label, code]) => [code, label]),
) as Record<ProductCategory, SupplyCategory>;
const SORT_BY_LABEL: Record<SupplySort, 'popular' | 'price_asc' | 'recent'> = {
  '인기순': 'popular',
  '가격대': 'price_asc',
  '카테고리': 'recent',
};

const toSupply = (p: SupplyProduct): TattooSupply => ({
  id: p.id,
  category: CATEGORY_BY_CODE[p.category] ?? '위생·소모품',
  name: p.name,
  subtitle: p.description ?? '',
  brand: p.brand ?? undefined,
  imageUri: p.thumbnail ?? p.images[0] ?? '',
  images: p.images,
  price: p.priceKrw,
  seller: { id: p.vendorId, nickname: '판매자' },
  isBookmarked: false,
  popularityScore: 0,
});

const TattooSuppliesScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [category, setCategory] = useState<SupplyCategory>('머신 & 장비');
  const [sort, setSort] = useState<SupplySort>('인기순');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [searchVisible, setSearchVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 400);

  const {
    items, loading, loadingMore, error, loadMore, reload,
  } = usePagedApi(
    (cursor) => supplyApi.list({
      category: CODE_BY_CATEGORY[category],
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

  const filtered = useMemo(() => items.map(toSupply), [items]);

  const handleBookmark = useCallback(async (id: string) => {
    const willAdd = !bookmarkedIds.has(id);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    toast(willAdd ? '찜 목록에 추가되었습니다.' : '찜을 해제했습니다.', {
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
  }, [bookmarkedIds, toast]);

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
      {/* Category chips */}
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
                {c}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sort/filter dropdowns */}
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
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{s}</Text>
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
      <LogoHeader onSearchPress={handleSearchPress} />
      {searchVisible && (
        <SearchBar
          value={keyword}
          onChangeText={setKeyword}
          onCancel={handleSearchCancel}
          placeholder="타투용품 검색"
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
              <Text style={styles.emptyText}>{error ?? '등록된 상품이 없습니다.'}</Text>
              {error && (
                <TouchableOpacity onPress={reload} style={styles.retryBtn} activeOpacity={0.8}>
                  <Text style={styles.retryBtnText}>다시 시도</Text>
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
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  listContent: {
    paddingBottom: 32,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    gap: 10,
  },

  /* Category */
  categoryScrollView: {
    marginTop: 6,
  },
  categoryScroll: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
  },
  categoryChipActive: {
    borderColor: COLORS.white,
    backgroundColor: COLORS.card,
  },
  categoryText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },

  /* Filter row */
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
  },
  filterBtnActive: {
    borderColor: COLORS.gold,
  },
  filterText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  filterTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },

  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 14,
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.gold,
  },
  retryBtnText: { color: COLORS.gold, fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
