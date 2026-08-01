import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import SupplyCard from '../../components/supplies/SupplyCard';
import { ChevronDownIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { MOCK_SUPPLIES } from '../../../data/mock/supplyMockData';
import {
  SUPPLY_CATEGORIES, SUPPLY_SORTS, SupplyCategory, SupplySort,
  TattooSupply,
} from '../../../domain/entities/supplyTypes';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TattooSuppliesScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [category, setCategory] = useState<SupplyCategory>('머신 & 장비');
  const [sort, setSort] = useState<SupplySort>('인기순');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const list = MOCK_SUPPLIES.filter((s) => s.category === category);
    if (sort === '인기순') return list.slice().sort((a, b) => b.popularityScore - a.popularityScore);
    if (sort === '가격대') return list.slice().sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    return list;
  }, [category, sort]);

  const handleBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast('찜을 해제했습니다.');
      } else {
        next.add(id);
        toast('찜 목록에 추가되었습니다.', { variant: 'success' });
      }
      return next;
    });
  }, [toast]);

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
      <LogoHeader />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={Header}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>등록된 상품이 없습니다.</Text>
          </View>
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
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
});
