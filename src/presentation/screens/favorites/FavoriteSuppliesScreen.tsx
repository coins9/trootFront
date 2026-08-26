import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image,
  StatusBar, Dimensions, ScrollView, ActivityIndicator,
} from 'react-native';
// 🚨 1. 하단 안전 여백 처리를 위해 useSafeAreaInsets 훅 추가
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// 🚨 2. 화면 복귀 시 갱신을 위해 useFocusEffect 추가
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import {
  BackArrowIcon, HeartIcon, TattooPlaceholderIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useTranslation } from '../../store/languageStore';
import {
  TattooSupply, SupplyCategory, SUPPLY_CATEGORIES,
} from '../../../domain/entities/supplyTypes';
import { usePagedApi } from '../../hooks/useApi';
import {
  favoriteApi, type FavoriteItem, type SupplyProduct, type ProductCategory,
} from '../../../data/api';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import type { TranslationKey } from '../../../infrastructure/i18n';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type CategoryFilter = '전체' | SupplyCategory;

const CATEGORY_FILTERS: CategoryFilter[] = ['전체', ...SUPPLY_CATEGORIES];

const CATEGORY_LABEL_KEY: Record<CategoryFilter, TranslationKey> = {
  '전체': 'common.all',
  '머신 & 장비': 'supplies.category.machine',
  '니들 (바늘)': 'supplies.category.needle',
  '잉크': 'supplies.category.ink',
  '위생·소모품': 'supplies.category.hygiene',
  '스탠실 용품': 'supplies.category.stencil',
  '애프터케어': 'supplies.category.aftercare',
  '가구·인테리어': 'supplies.category.furniture',
  '기타': 'supplies.category.etc',
};

// 백엔드 카테고리 코드 → 화면 카테고리 라벨 (필터 유지)
const CATEGORY_MAP: Record<ProductCategory, SupplyCategory> = {
  machine: '머신 & 장비',
  needle: '니들 (바늘)',
  ink: '잉크',
  hygiene: '위생·소모품',
  stencil: '스탠실 용품',
  aftercare: '애프터케어',
  furniture: '가구·인테리어',
  etc: '기타',
};

const toSupply = (f: FavoriteItem<SupplyProduct>, sellerFallback: string): TattooSupply | null => {
  if (!f.target) return null;
  const images = f.target.images.filter(Boolean);
  return {
    id: f.target.id,
    category: CATEGORY_MAP[f.target.category],
    name: f.target.name,
    subtitle: f.target.subtitle ?? '',
    brand: f.target.brand ?? undefined,
    imageUri: f.target.thumbnail || images[0] || '',
    images,
    price: f.target.priceKrw,
    description: f.target.description ?? undefined,
    seller: { id: f.target.vendorId, nickname: f.target.vendorName || sellerFallback },
    openChatUrl: f.target.openChatUrl,
    storeUrl: f.target.storeUrl,
    nameEn: f.target.nameEn,
    descriptionEn: f.target.descriptionEn,
    isBookmarked: true,
    popularityScore: f.target.likeCount ?? f.target.soldCount ?? 0,
  };
};

const { width: W } = Dimensions.get('window');
const H_PAD = 16;
const COL_GAP = 10;
const CARD_W = (W - H_PAD * 2 - COL_GAP) / 2;
const IMG_H = CARD_W;

interface SupplyCardProps {
  supply: TattooSupply;
  onToggleFavorite: () => void;
  onOpenDetail: () => void;
}

const SupplyCard = React.memo(({
                                 supply, onToggleFavorite, onOpenDetail,
                               }: SupplyCardProps) => (
    <View style={styles.card}>
      <TouchableOpacity
          activeOpacity={0.9}
          onPress={onOpenDetail}
          style={styles.imageWrap}
      >
        {supply.imageUri ? (
            <Image source={{ uri: supply.imageUri }} style={styles.image} resizeMode="contain" />
        ) : (
            <View style={styles.placeholder}>
              <TattooPlaceholderIcon size={54} color="#c8c8c8" />
            </View>
        )}

        <TouchableOpacity
            onPress={onToggleFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.75}
            style={styles.heartBtn}
        >
          <HeartIcon size={22} color={COLORS.gold} filled={supply.isBookmarked} />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{supply.name}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {supply.brand ?? supply.subtitle}
        </Text>
      </View>
    </View>
));
SupplyCard.displayName = 'SupplyCard';

const FavoriteSuppliesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets(); // 🚨 안전 여백(Insets) 추가
  const { toast } = useToast();
  const [category, setCategory] = useState<CategoryFilter>('전체');
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  // 🚨 3. 리로드(reload) 함수 추출
  const {
    items, loading, loadingMore, error, loadMore, reload,
  } = usePagedApi(
      (cursor) => favoriteApi.list<SupplyProduct>('supply', { cursor, limit: 20 }),
      [],
  );

  // 🚨 4. 화면 복귀 시 조용히 새로고침 (Silent Reload)
  const hasFocused = useRef(false);
  useFocusEffect(
      useCallback(() => {
        if (!hasFocused.current) {
          hasFocused.current = true;
          return;
        }
        reload();
      }, [reload])
  );

  // 🚨 TS2345 방어 (as any)
  const sellerFallback = t('supplies.seller' as any);
  const supplies = useMemo(
      () => (items.map((f) => toSupply(f, sellerFallback)).filter(Boolean) as TattooSupply[]).filter((s) => !removed.has(s.id)),
      [items, removed, sellerFallback],
  );

  const filtered = useMemo(() => (
      category === '전체'
          ? supplies
          : supplies.filter((s) => s.category === category)
  ), [supplies, category]);

  const handleToggle = useCallback(async (supply: TattooSupply) => {
    setRemoved((prev) => new Set(prev).add(supply.id));
    // 🚨 TS2345 방어
    toast(t('favorites.unfavorited' as any).replace('{{name}}', supply.name));
    try {
      await favoriteApi.toggle('supply', supply.id);
    } catch {
      setRemoved((prev) => {
        const next = new Set(prev);
        next.delete(supply.id);
        return next;
      });
      toast(t('common.error' as any), { variant: 'error' });
    }
  }, [toast, t]);

  const handleOpenDetail = useCallback((supply: TattooSupply) => {
    navigation.navigate('TattooSupplyDetail', { productId: supply.id });
  }, [navigation]);

  return (
      // 🚨 5. 하단 잘림을 막기 위해 edges=['top'] 으로 수정
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
          <View style={styles.titleGroup}>
            <Text style={styles.title}>{t('favorites.supplies' as any)}</Text>
            <Text style={styles.subHeaderText}>{t('favorites.suppliesSubtitle' as any)}</Text>
          </View>
        </View>

        <View style={styles.categoryWrap}>
          <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
          >
            {CATEGORY_FILTERS.map((c) => {
              const active = c === category;
              return (
                  <TouchableOpacity
                      key={c}
                      onPress={() => setCategory(c)}
                      activeOpacity={0.75}
                      style={[styles.categoryChip, active && styles.categoryChipActive]}
                  >
                    {/* 🚨 TS2345 방어 */}
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                      {t(CATEGORY_LABEL_KEY[c] as any)}
                    </Text>
                  </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <SupplyCard
                    supply={item}
                    onToggleFavorite={() => handleToggle(item)}
                    onOpenDetail={() => handleOpenDetail(item)}
                />
            )}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            // 🚨 6. 기기마다 다른 하단 인디케이터 영역을 고려하여 안전한 여백을 제공 (Math.max)
            contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 24) + 20 }]}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            refreshing={loading && supplies.length > 0}
            onRefresh={reload}
            ListFooterComponent={
              loadingMore ? <ActivityIndicator color={COLORS.gold} style={{ paddingVertical: 20 }} /> : null
            }
            ListEmptyComponent={
              loading ? (
                  <View style={styles.empty}><ActivityIndicator color={COLORS.gold} /></View>
              ) : (
                  <View style={styles.empty}>
                    <Text style={styles.emptyText}>
                      {error ?? (category === '전체' ? t('favorites.emptySupplies' as any) : t('favorites.emptySuppliesCategory' as any))}
                    </Text>
                    {error && (
                        <TouchableOpacity onPress={reload} style={styles.retryBtn} activeOpacity={0.8}>
                          <Text style={styles.retryBtnText}>{t('common.retry' as any)}</Text>
                        </TouchableOpacity>
                    )}
                  </View>
              )
            }
        />
      </SafeAreaView>
  );
};

export default FavoriteSuppliesScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: COLORS.black,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  titleGroup: { flex: 1, gap: 4 },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
  },
  subHeaderText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },

  /* Category strip */
  categoryWrap: {
    backgroundColor: COLORS.black,
    paddingBottom: 14,
  },
  categoryRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 8,
  },
  categoryChip: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: COLORS.elevated,
  },
  categoryChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'transparent',
  },
  categoryText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  categoryTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },

  /* List */
  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 14,
  },
  columnWrapper: {
    gap: COL_GAP,
    marginBottom: 14,
  },

  /* Card */
  card: {
    width: CARD_W,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageWrap: {
    width: CARD_W,
    height: IMG_H,
    position: 'relative',
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 2,
    zIndex: 2,
  },

  body: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 3,
  },
  name: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },

  empty: {
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
