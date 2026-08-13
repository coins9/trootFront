import React, { useState, useCallback } from 'react';
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
  BackArrowIcon, HeartIcon, StarIcon, CrownIcon,
  PersonSilhouette, TattooPlaceholderIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { usePagedApi } from '../../hooks/useApi';
import { favoriteApi, type FavoriteItem, type ArtistPage } from '../../../data/api';
import { toArtist } from '../../../data/api/mappers';
import { Artist } from '../../../domain/entities/types';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: W } = Dimensions.get('window');
const CARD_H_PAD = 16;
const CARD_INNER_PAD = 18;
const GALLERY_GAP = 6;
const GALLERY_ITEM_SIZE =
  (W - CARD_H_PAD * 2 - CARD_INNER_PAD * 2 - GALLERY_GAP * 2) / 3;

// 갤러리 자리(백엔드 작품 썸네일 연동 전까지 placeholder 3칸 유지)
const EMPTY_WORKS = ['', '', ''];

interface FavoriteCardProps {
  artist: Artist;
  works: string[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onVisitProfile: () => void;
}

const FavoriteCard = React.memo(({
  artist, works, isFavorite, onToggleFavorite, onVisitProfile,
}: FavoriteCardProps) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <View style={styles.avatarCircle}>
          {artist.profileImage ? (
            <Image
              source={{ uri: artist.profileImage }}
              style={styles.avatarImg}
              resizeMode="cover"
            />
          ) : (
            <PersonSilhouette size={44} color="#3a3a3a" />
          )}
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{artist.nickname}</Text>
            <CrownIcon size={16} color={COLORS.gold} />
          </View>
          <View style={styles.metaRow}>
            <StarIcon size={12} color={COLORS.gold} filled />
            <Text style={styles.rating}>{artist.rating}</Text>
            <Text style={styles.metaDivider}>|</Text>
            <Text style={styles.location}>
              {artist.city} · {artist.district}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={onToggleFavorite}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.75}
      >
        <HeartIcon
          size={24}
          color={COLORS.gold}
          filled={isFavorite}
        />
      </TouchableOpacity>
    </View>

    <View style={styles.gallery}>
      {works.map((uri, i) => (
        <View key={i} style={styles.galleryItem}>
          {uri ? (
            <Image source={{ uri }} style={styles.galleryImg} resizeMode="cover" />
          ) : (
            <View style={styles.galleryPlaceholder}>
              <TattooPlaceholderIcon size={36} color="#2e2e2e" />
            </View>
          )}
        </View>
      ))}
    </View>

    <TouchableOpacity
      onPress={onVisitProfile}
      activeOpacity={0.85}
      style={styles.visitBtn}
    >
      <Text style={styles.visitText}>프로필 방문하기</Text>
    </TouchableOpacity>
  </View>
));
FavoriteCard.displayName = 'FavoriteCard';

const FavoriteArtistsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const {
    items, loading, loadingMore, error, loadMore, reload,
  } = usePagedApi(
    (cursor) => favoriteApi.list<ArtistPage>('artist', { cursor, limit: 20 }),
    [],
  );

  const favoriteArtists = (items
    .map((f: FavoriteItem<ArtistPage>) => (f.target ? toArtist(f.target) : null))
    .filter(Boolean) as Artist[])
    .filter((a) => !removed.has(a.id));

  const handleToggle = useCallback(async (artist: Artist) => {
    setRemoved((prev) => new Set(prev).add(artist.id));
    toast(`${artist.nickname} 찜을 해제했습니다.`);
    try {
      await favoriteApi.toggle('artist', artist.id);
    } catch {
      setRemoved((prev) => {
        const next = new Set(prev);
        next.delete(artist.id);
        return next;
      });
      toast('처리에 실패했습니다.', { variant: 'error' });
    }
  }, [toast]);

  const handleVisit = useCallback((artist: Artist) => {
    navigation.navigate('ArtistProfile', { artist });
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
          <Text style={styles.title}>찜한 타투이스트</Text>
          <Text style={styles.subtitle}>저장한 작가를 한눈에 모아보세요.</Text>
        </View>
      </View>

      <FlatList
        data={favoriteArtists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FavoriteCard
            artist={item}
            works={EMPTY_WORKS}
            isFavorite
            onToggleFavorite={() => handleToggle(item)}
            onVisitProfile={() => handleVisit(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshing={loading && favoriteArtists.length > 0}
        onRefresh={reload}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={COLORS.gold} style={{ paddingVertical: 20 }} /> : null
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}><ActivityIndicator color={COLORS.gold} /></View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{error ?? '아직 찜한 타투이스트가 없습니다.'}</Text>
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

export default FavoriteArtistsScreen;

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

  listContent: {
    paddingHorizontal: CARD_H_PAD,
    paddingTop: 18,
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
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    gap: 4,
    flexShrink: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rating: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  metaDivider: {
    color: COLORS.gray3,
    fontSize: 12,
    lineHeight: 17,
    marginHorizontal: 2,
  },
  location: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },

  /* Gallery */
  gallery: {
    flexDirection: 'row',
    gap: GALLERY_GAP,
    marginBottom: 14,
  },
  galleryItem: {
    width: GALLERY_ITEM_SIZE,
    height: GALLERY_ITEM_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
  },
  galleryImg: {
    width: '100%',
    height: '100%',
  },
  galleryPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* CTA */
  visitBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingVertical: 13,
    alignItems: 'center',
  },
  visitText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
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
