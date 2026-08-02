import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image,
  StatusBar, Dimensions, ScrollView, Linking,
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
import {
  TattooSupply, SupplyCategory, SUPPLY_CATEGORIES,
  formatSupplyInquiryMessage,
} from '../../../domain/entities/supplyTypes';
import { MOCK_FAVORITE_SUPPLIES } from '../../../data/mock/favoriteSuppliesMockData';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type CategoryFilter = '전체' | SupplyCategory;

const CATEGORY_FILTERS: CategoryFilter[] = ['전체', ...SUPPLY_CATEGORIES];

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
}

const SupplyCard = React.memo(({
  supply, onToggleFavorite, onInquiry, onOpenDetail,
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
        <Text style={styles.ctaText}>1:1 구매 문의</Text>
      </TouchableOpacity>
    </View>
  </View>
));
SupplyCard.displayName = 'SupplyCard';

const FavoriteSuppliesScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [category, setCategory] = useState<CategoryFilter>('전체');
  const [unfavoritedIds, setUnfavoritedIds] = useState<Set<string>>(new Set());

  const supplies = useMemo(() => MOCK_FAVORITE_SUPPLIES.map((s) => ({
    ...s,
    isBookmarked: !unfavoritedIds.has(s.id),
  })), [unfavoritedIds]);

  const filtered = useMemo(() => (
    category === '전체'
      ? supplies
      : supplies.filter((s) => s.category === category)
  ), [supplies, category]);

  const handleToggle = useCallback((supply: TattooSupply) => {
    setUnfavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(supply.id)) {
        next.delete(supply.id);
        toast(`${supply.name} 찜을 다시 추가했습니다.`, { variant: 'success' });
      } else {
        next.add(supply.id);
        toast(`${supply.name} 찜을 해제했습니다.`);
      }
      return next;
    });
  }, [toast]);

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
    toast(`${supply.seller.nickname}의 문의 채널을 연결할 수 없습니다.`, { variant: 'error' });
  }, [toast]);

  const handleOpenDetail = useCallback((supply: TattooSupply) => {
    navigation.navigate('TattooSupplyDetail', { supply });
  }, [navigation]);

  return (
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
          <Text style={styles.title}>찜한 타투용품</Text>
          <Text style={styles.subHeaderText}>모아둔 머신·니들·잉크·소모품을 한 곳에서.</Text>
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
          />
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              해당 카테고리에 찜한 용품이 없습니다.
            </Text>
          </View>
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
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
});
