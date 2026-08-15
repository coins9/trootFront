import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image,
  StatusBar, Dimensions, ScrollView, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
  formatSupplyInquiryMessage,
} from '../../../domain/entities/supplyTypes';
import { usePagedApi } from '../../hooks/useApi';
import {
  favoriteApi, type FavoriteItem, type SupplyProduct, type ProductCategory,
} from '../../../data/api';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type CategoryFilter = '전체' | SupplyCategory;

const CATEGORY_FILTERS: CategoryFilter[] = ['전체', ...SUPPLY_CATEGORIES];

// 백엔드 카테고리 코드 → 화면 카테고리 라벨 (필터 유지)
const CATEGORY_MAP: Record<ProductCategory, SupplyCategory> = {
  machine: '머신 & 장비',
  needle: '니들 (바늘)',
  ink: '잉크',
  hygiene: '위생·소모품',
  stencil: '스탠실 용품',
  aftercare: '애프터케어',
  furniture: '가구·인테리어',
  etc: '위생·소모품',
};

// 찜한 용품(API) → 기존 카드 모델. 판매자 연락처는 아직 백엔드 미제공 → 비움(문의 시 안내).
const toSupply = (f: FavoriteItem<SupplyProduct>): TattooSupply | null => (
  f.target
    ? {
        id: f.target.id,
        category: CATEGORY_MAP[f.target.category],
        name: f.target.name,
        subtitle: f.target.description ?? '',
        brand: f.target.brand ?? undefined,
        imageUri: f.target.thumbnail ?? f.target.images[0] ?? '',
        images: f.target.images,
        price: f.target.priceKrw,
        seller: { id: f.target.vendorId, nickname: '판매자' },
        isBookmarked: true,
        popularityScore: 0,
      }
    : null
);

const { width: W } = Dimensions.get('window');
const H_PAD = 16;
const COL_GAP = 10;
const CARD_W = (W - H_PAD * 2 - COL_GAP) / 2;
const IMG_H = CARD_W;

interface SupplyCardProps {
  supply: TattooSupply;
  onToggleFavorite: () => void;
  onInquiry: () => void;
  onOpenDetail: () => void;
  buyInquireLabel: string;
}

const SupplyCard = React.memo(({
  supply, onToggleFavorite, onInquiry, onOpenDetail, buyInquireLabel,
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

      <TouchableOpacity
        onPress={onInquiry}
        activeOpacity={0.75}
        style={styles.ctaBtn}
      >
        <Text style={styles.ctaText}>{buyInquireLabel}</Text>
      </TouchableOpacity>
    </View>
  </View>
));
SupplyCard.displayName = 'SupplyCard';

const FavoriteSuppliesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [category, setCategory] = useState<CategoryFilter>('전체');
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const {
    items, loading, loadingMore, error, loadMore, reload,
  } = usePagedApi(
    (cursor) => favoriteApi.list<SupplyProduct>('supply', { cursor, limit: 20 }),
    [],
  );

  const supplies = useMemo(
    () => (items.map(toSupply).filter(Boolean) as TattooSupply[]).filter((s) => !removed.has(s.id)),
    [items, removed],
  );

  const filtered = useMemo(() => (
    category === '전체'
      ? supplies
      : supplies.filter((s) => s.category === category)
  ), [supplies, category]);

  const handleToggle = useCallback(async (supply: TattooSupply) => {
    setRemoved((prev) => new Set(prev).add(supply.id));
    toast(t('favorites.unfavorited').replace('{{name}}', supply.name));
    try {
      await favoriteApi.toggle('supply', supply.id);
    } catch {
      setRemoved((prev) => {
        const next = new Set(prev);
        next.delete(supply.id);
        return next;
      });
      toast(t('common.error'), { variant: 'error' });
    }
  }, [toast, t]);

  const handleInquiry = useCallback(async (supply: TattooSupply) => {
    if (supply.seller.kakaoLink) {
      const can = await Linking.canOpenURL(supply.seller.kakaoLink);
      if (can) {
        Linking.openURL(supply.seller.kakaoLink);
        return;
      }
    }
    if (supply.seller.smsPhone) {
      const smsUrl = `sms:${supply.seller.smsPhone}?body=${encodeURIComponent(formatSupplyInquiryMessage(supply))}`;
      const can = await Linking.canOpenURL(smsUrl);
      if (can) {
        Linking.openURL(smsUrl);
        return;
      }
    }
    toast(t('favorites.inquiryChannelError').replace('{{name}}', supply.seller.nickname), { variant: 'error' });
  }, [toast, t]);

  const handleOpenDetail = useCallback((supply: TattooSupply) => {
    navigation.navigate('TattooSupplyDetail', { supply });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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
          <Text style={styles.title}>{t('favorites.supplies')}</Text>
          <Text style={styles.subHeaderText}>{t('favorites.suppliesSubtitle')}</Text>
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
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                  {c}
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
            onInquiry={() => handleInquiry(item)}
            onOpenDetail={() => handleOpenDetail(item)}
            buyInquireLabel={t('common.buyInquire')}
          />
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
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
                {error ?? (category === '전체' ? t('favorites.emptySupplies') : t('favorites.emptySuppliesCategory'))}
              </Text>
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
    paddingBottom: 40,
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
    marginBottom: 10,
  },
  ctaBtn: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ctaText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.3,
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
