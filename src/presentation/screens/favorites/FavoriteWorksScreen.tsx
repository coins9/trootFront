import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image,
  StatusBar, Dimensions, ActivityIndicator,
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
  FAVORITE_WORK_CATEGORIES,
  FavoriteWork, FavoriteWorkCategory,
} from '../../../data/mock/favoriteWorksMockData';
import { usePagedApi } from '../../hooks/useApi';
import { favoriteApi, type FavoriteItem, type Artwork } from '../../../data/api';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// 찜한 작품(API) → 기존 카드 모델. 백엔드에 없는 필드는 안전한 기본값.
const toWork = (f: FavoriteItem<Artwork>): FavoriteWork | null => (
  f.target
    ? {
        id: f.target.id,
        imageUri: f.target.thumbnail ?? f.target.images[0] ?? '',
        artistNickname: f.target.artist?.pageName ?? '',
        price: f.target.priceKrw ?? 0,
        isFavorite: true,
        isSoldOut: false,
        category: '내 첫 타투',
      }
    : null
);

const { width: W } = Dimensions.get('window');
const H_PAD = 16;
const COL_GAP = 10;
const CARD_W = (W - H_PAD * 2 - COL_GAP) / 2;
const IMG_H = CARD_W;

interface WorkCardProps {
  work: FavoriteWork;
  onToggleFavorite: () => void;
  soldOutLabel: string;
  priceText: string;
}

const WorkCard = React.memo(({ work, onToggleFavorite, soldOutLabel, priceText }: WorkCardProps) => (
  <View style={styles.card}>
    <View style={styles.imageWrap}>
      {work.imageUri ? (
        <Image source={{ uri: work.imageUri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <TattooPlaceholderIcon size={54} color="#2e2e2e" />
        </View>
      )}

      <TouchableOpacity
        onPress={onToggleFavorite}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.heartBtn}
      >
        <HeartIcon size={22} color={COLORS.gold} filled={work.isFavorite} />
      </TouchableOpacity>

      {work.isSoldOut && (
        <View style={styles.soldOutOverlay} pointerEvents="none">
          <View style={styles.soldOutChip}>
            <Text style={styles.soldOutTop}>{soldOutLabel}</Text>
            <Text style={styles.soldOutBottom}>(SOLD OUT)</Text>
          </View>
        </View>
      )}
    </View>

    <View style={styles.body}>
      <Text style={styles.artistName}>{work.artistNickname}</Text>
      <Text style={styles.price}>{priceText}</Text>
    </View>
  </View>
));
WorkCard.displayName = 'WorkCard';

const FavoriteWorksScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [category, setCategory] = useState<FavoriteWorkCategory>('전체');
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const {
    items, loading, loadingMore, error, loadMore, reload,
  } = usePagedApi(
    (cursor) => favoriteApi.list<Artwork>('artwork', { cursor, limit: 20 }),
    [],
  );

  const works = useMemo(
    () => (items.map(toWork).filter(Boolean) as FavoriteWork[]).filter((w) => !removed.has(w.id)),
    [items, removed],
  );
  // 찜 폴더 분류는 백엔드 데이터가 없어 전체를 노출 (칩 UI 는 유지)
  const filtered = works;

  const handleToggle = useCallback(async (work: FavoriteWork) => {
    setRemoved((prev) => new Set(prev).add(work.id));
    toast(t('favorites.unfavoritedPlain'));
    try {
      await favoriteApi.toggle('artwork', work.id);
    } catch {
      setRemoved((prev) => {
        const next = new Set(prev);
        next.delete(work.id);
        return next;
      });
      toast(t('common.error'), { variant: 'error' });
    }
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
          <Text style={styles.title}>{t('favorites.works')}</Text>
          <Text style={styles.subtitle}>{t('favorites.worksSubtitle')}</Text>
        </View>
      </View>

      <View style={styles.categoryRow}>
        {FAVORITE_WORK_CATEGORIES.map((c) => {
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
          <WorkCard
            work={item}
            onToggleFavorite={() => handleToggle(item)}
            soldOutLabel={t('favorites.bookingDone')}
            priceText={t('favorites.priceFrom').replace('{{price}}', item.price.toLocaleString())}
          />
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshing={loading && works.length > 0}
        onRefresh={reload}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={COLORS.gold} style={{ paddingVertical: 20 }} /> : null
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}><ActivityIndicator color={COLORS.gold} /></View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{error ?? t('favorites.emptyWorks')}</Text>
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

export default FavoriteWorksScreen;

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
  titleGroup: {
    flex: 1,
    gap: 4,
  },
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
  },
  columnWrapper: {
    gap: COL_GAP,
    marginBottom: COL_GAP,
  },

  /* Card */
  card: {
    width: CARD_W,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  imageWrap: {
    width: CARD_W,
    height: IMG_H,
    position: 'relative',
    backgroundColor: COLORS.elevated,
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
  soldOutOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutChip: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  soldOutTop: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  soldOutBottom: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  body: {
    paddingHorizontal: 4,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 3,
  },
  artistName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    letterSpacing: 0.5,
  },
  price: {
    color: COLORS.white,
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
