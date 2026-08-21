import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image,
  StatusBar, Dimensions, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import {
  BackArrowIcon, HeartIcon, StarIcon, TattooPlaceholderIcon,
  CameraSolidIcon, VideoFilmIcon, ImageMountainIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useTranslation } from '../../store/languageStore';
import {
  FavoritePhotoShop, PhotoShopCategory,
} from '../../../data/mock/favoritePhotoShopsMockData';
import { usePagedApi } from '../../hooks/useApi';
import { favoriteApi, type FavoriteItem, type ShopPost } from '../../../data/api';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: W } = Dimensions.get('window');
const H_PAD = 16;
const CARD_INNER_PAD = 16;
const WORK_GAP = 6;
const WORK_SIZE = (W - H_PAD * 2 - CARD_INNER_PAD * 2 - WORK_GAP * 2) / 3;

const CATEGORY_ICON: Record<PhotoShopCategory, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  '사진 촬영': CameraSolidIcon,
  '영상/숏폼': VideoFilmIcon,
  '보정 전문': ImageMountainIcon,
};

// 찜한 사진/영상 글(API) → 기존 카드 모델. 평점/후기는 백엔드 미제공 → 0, 갤러리는 이미지로 채움.
const toShop = (f: FavoriteItem<ShopPost>): FavoritePhotoShop | null => {
  if (!f.target) return null;
  const imgs = f.target.images ?? [];
  return {
    id: f.target.id,
    name: f.target.title,
    category: '사진 촬영',
    rating: 0,
    reviewCount: 0,
    estimatedPrice: f.target.priceKrw ?? 0,
    logoUri: imgs[0] ?? '',
    works: [imgs[0] ?? '', imgs[1] ?? '', imgs[2] ?? ''],
    kakaoLink: f.target.contact ?? undefined,
    isFavorite: true,
  };
};

interface ShopCardProps {
  shop: FavoritePhotoShop;
  onToggleFavorite: () => void;
  onInquiry: () => void;
}

const ShopCard = React.memo(({ shop, onToggleFavorite, onInquiry }: ShopCardProps) => {
  const { t } = useTranslation();
  const LogoIcon = CATEGORY_ICON[shop.category];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.logoCircle}>
          {shop.logoUri ? (
            <Image source={{ uri: shop.logoUri }} style={styles.logoImg} resizeMode="cover" />
          ) : (
            <LogoIcon size={26} color={COLORS.gold} strokeWidth={1.6} />
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>{shop.name}</Text>
          <View style={styles.metaRow}>
            <StarIcon size={13} color={COLORS.gold} filled />
            <Text style={styles.rating}>{shop.rating}</Text>
            <Text style={styles.reviewCount}>({shop.reviewCount})</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onToggleFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
        >
          <HeartIcon size={24} color={COLORS.gold} filled={shop.isFavorite} />
        </TouchableOpacity>
      </View>

      <View style={styles.gallery}>
        {shop.works.map((uri, i) => (
          <View key={i} style={styles.workItem}>
            {uri ? (
              <Image source={{ uri }} style={styles.workImg} resizeMode="cover" />
            ) : (
              <View style={styles.workPlaceholder}>
                <TattooPlaceholderIcon size={36} color="#2e2e2e" />
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.priceText}>
          {t('favorites.estimatedPriceLabel')}<Text style={styles.priceValue}>
            {t('favorites.priceFrom').replace('{{price}}', shop.estimatedPrice.toLocaleString())}
          </Text>
        </Text>
        <TouchableOpacity
          onPress={onInquiry}
          activeOpacity={0.85}
          style={styles.inquiryBtn}
        >
          <Text style={styles.inquiryText}>{t('common.inquire')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
ShopCard.displayName = 'ShopCard';

const FavoritePhotoShopsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const {
    items, loading, loadingMore, error, loadMore, reload,
  } = usePagedApi(
    (cursor) => favoriteApi.list<ShopPost>('shop_post', { cursor, limit: 20 }),
    [],
  );

  const shops = useMemo(
    () => (items.map(toShop).filter(Boolean) as FavoritePhotoShop[]).filter((s) => !removed.has(s.id)),
    [items, removed],
  );
  // 세부 카테고리(사진/영상/보정)는 백엔드 분류가 없어 전체 노출 (칩 UI 유지)
  const filtered = shops;

  const handleToggle = useCallback(async (shop: FavoritePhotoShop) => {
    setRemoved((prev) => new Set(prev).add(shop.id));
    toast(t('favorites.unfavorited').replace('{{name}}', shop.name));
    try {
      await favoriteApi.toggle('shop_post', shop.id);
    } catch {
      setRemoved((prev) => {
        const next = new Set(prev);
        next.delete(shop.id);
        return next;
      });
      toast(t('common.error'), { variant: 'error' });
    }
  }, [toast, t]);

  const handleInquiry = useCallback((shop: FavoritePhotoShop) => {
    if (shop.kakaoLink) {
      Linking.openURL(shop.kakaoLink).catch(() => {
        toast(t('favorites.inquiryChannelError').replace('{{name}}', shop.name), { variant: 'error' });
      });
      return;
    }
    toast(t('favorites.inquiryChannelError').replace('{{name}}', shop.name), { variant: 'error' });
  }, [toast, t]);

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
          <Text style={styles.title}>{t('favorites.photoShops')}</Text>
          <Text style={styles.subtitle}>{t('favorites.photoShopsSubtitle')}</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShopCard
            shop={item}
            onToggleFavorite={() => handleToggle(item)}
            onInquiry={() => handleInquiry(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshing={loading && shops.length > 0}
        onRefresh={reload}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={COLORS.gold} style={{ paddingVertical: 20 }} /> : null
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}><ActivityIndicator color={COLORS.gold} /></View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{error ?? t('favorites.emptyPhotoShops')}</Text>
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

export default FavoritePhotoShopsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
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
  subtitle: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },

  /* List */
  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 14,
  },

  /* Card */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: CARD_INNER_PAD,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  reviewCount: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
    marginLeft: 2,
  },

  /* Gallery */
  gallery: {
    flexDirection: 'row',
    gap: WORK_GAP,
    marginBottom: 14,
  },
  workItem: {
    width: WORK_SIZE,
    height: WORK_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
  },
  workImg: {
    width: '100%',
    height: '100%',
  },
  workPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Footer */
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  priceText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  priceValue: {
    color: COLORS.white,
    fontWeight: '700',
  },
  inquiryBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  inquiryText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
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
