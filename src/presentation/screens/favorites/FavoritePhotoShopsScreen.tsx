import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image,
  StatusBar, Dimensions, Linking,
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
import {
  MOCK_FAVORITE_PHOTO_SHOPS, PHOTO_SHOP_CATEGORIES,
  FavoritePhotoShop, PhotoShopCategory,
} from '../../../data/mock/favoritePhotoShopsMockData';
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

interface ShopCardProps {
  shop: FavoritePhotoShop;
  onToggleFavorite: () => void;
  onInquiry: () => void;
}

const ShopCard = React.memo(({ shop, onToggleFavorite, onInquiry }: ShopCardProps) => {
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
          예상 견적: <Text style={styles.priceValue}>
            {shop.estimatedPrice.toLocaleString()}원~
          </Text>
        </Text>
        <TouchableOpacity
          onPress={onInquiry}
          activeOpacity={0.85}
          style={styles.inquiryBtn}
        >
          <Text style={styles.inquiryText}>1:1 문의</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
ShopCard.displayName = 'ShopCard';

const FavoritePhotoShopsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [category, setCategory] = useState<PhotoShopCategory>('사진 촬영');
  const [unfavoritedIds, setUnfavoritedIds] = useState<Set<string>>(new Set());

  const shops = useMemo(() => MOCK_FAVORITE_PHOTO_SHOPS.map((s) => ({
    ...s,
    isFavorite: !unfavoritedIds.has(s.id),
  })), [unfavoritedIds]);

  const filtered = useMemo(
    () => shops.filter((s) => s.category === category),
    [shops, category],
  );

  const handleToggle = useCallback((shop: FavoritePhotoShop) => {
    setUnfavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(shop.id)) {
        next.delete(shop.id);
        toast(`${shop.name} 찜을 다시 추가했습니다.`, { variant: 'success' });
      } else {
        next.add(shop.id);
        toast(`${shop.name} 찜을 해제했습니다.`);
      }
      return next;
    });
  }, [toast]);

  const handleInquiry = useCallback(async (shop: FavoritePhotoShop) => {
    if (shop.kakaoLink) {
      const can = await Linking.canOpenURL(shop.kakaoLink);
      if (can) {
        Linking.openURL(shop.kakaoLink);
        return;
      }
    }
    toast(`${shop.name}의 오픈카톡을 연결할 수 없습니다.`, { variant: 'error' });
  }, [toast]);

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
          <Text style={styles.title}>찜한 사진/영상 편집샵</Text>
          <Text style={styles.subtitle}>저장한 포토/영상 스튜디오를 모아보세요.</Text>
        </View>
      </View>

      <View style={styles.categoryRow}>
        {PHOTO_SHOP_CATEGORIES.map((c) => {
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              해당 카테고리에 찜한 스튜디오가 없습니다.
            </Text>
          </View>
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

  /* Category */
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: COLORS.black,
  },
  categoryChip: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 18,
    paddingVertical: 10,
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
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
});
