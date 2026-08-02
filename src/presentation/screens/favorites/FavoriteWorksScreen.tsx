import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image,
  StatusBar, Dimensions,
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
  MOCK_FAVORITE_WORKS, FAVORITE_WORK_CATEGORIES,
  FavoriteWork, FavoriteWorkCategory,
} from '../../../data/mock/favoriteWorksMockData';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: W } = Dimensions.get('window');
const H_PAD = 16;
const COL_GAP = 10;
const CARD_W = (W - H_PAD * 2 - COL_GAP) / 2;
const IMG_H = CARD_W;

interface WorkCardProps {
  work: FavoriteWork;
  onToggleFavorite: () => void;
}

const WorkCard = React.memo(({ work, onToggleFavorite }: WorkCardProps) => (
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
            <Text style={styles.soldOutTop}>예약 완료</Text>
            <Text style={styles.soldOutBottom}>(SOLD OUT)</Text>
          </View>
        </View>
      )}
    </View>

    <View style={styles.body}>
      <Text style={styles.artistName}>{work.artistNickname}</Text>
      <Text style={styles.price}>{work.price.toLocaleString()}원~</Text>
    </View>
  </View>
));
WorkCard.displayName = 'WorkCard';

const FavoriteWorksScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [category, setCategory] = useState<FavoriteWorkCategory>('전체');
  const [unfavoritedIds, setUnfavoritedIds] = useState<Set<string>>(new Set());

  const works = useMemo(() => MOCK_FAVORITE_WORKS.map((w) => ({
    ...w,
    isFavorite: !unfavoritedIds.has(w.id),
  })), [unfavoritedIds]);

  const filtered = useMemo(() => (
    category === '전체'
      ? works
      : works.filter((w) => w.category === category)
  ), [works, category]);

  const handleToggle = useCallback((work: FavoriteWork) => {
    setUnfavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(work.id)) {
        next.delete(work.id);
        toast('찜 목록에 추가되었습니다.', { variant: 'success' });
      } else {
        next.add(work.id);
        toast('찜을 해제했습니다.');
      }
      return next;
    });
  }, [toast]);

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
          <Text style={styles.title}>찜한 작품</Text>
          <Text style={styles.subtitle}>마음에 담아둔 타투 작품을 모아보세요.</Text>
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
          <WorkCard work={item} onToggleFavorite={() => handleToggle(item)} />
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>찜한 작품이 없습니다.</Text>
          </View>
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
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
});
