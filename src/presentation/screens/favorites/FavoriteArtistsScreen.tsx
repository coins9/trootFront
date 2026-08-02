import React, { useState, useCallback } from 'react';
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
  BackArrowIcon, HeartIcon, StarIcon, CrownIcon,
  PersonSilhouette, TattooPlaceholderIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { MOCK_ARTISTS, PORTFOLIO_IMAGES } from '../../../data/mock/mockData';
import { Artist } from '../../../domain/entities/types';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: W } = Dimensions.get('window');
const CARD_H_PAD = 16;
const CARD_INNER_PAD = 18;
const GALLERY_GAP = 6;
const GALLERY_ITEM_SIZE =
  (W - CARD_H_PAD * 2 - CARD_INNER_PAD * 2 - GALLERY_GAP * 2) / 3;

// 초기 찜 아티스트: 앞 4명 (Home mock에 있는)
const INITIAL_FAVORITE_IDS = ['a1', 'a2', 'a3', 'a4'];

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
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(INITIAL_FAVORITE_IDS),
  );

  const favoriteArtists = MOCK_ARTISTS.filter((a) => favoriteIds.has(a.id));

  const handleToggle = useCallback((artist: Artist) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(artist.id)) {
        next.delete(artist.id);
        toast(`${artist.nickname} 찜을 해제했습니다.`);
      } else {
        next.add(artist.id);
        toast(`${artist.nickname}을(를) 찜했습니다.`, { variant: 'success' });
      }
      return next;
    });
  }, [toast]);

  const handleVisit = useCallback((artist: Artist) => {
    navigation.navigate('ArtistProfile', { artist });
  }, [navigation]);

  const getWorksForArtist = useCallback((artistId: string): string[] => {
    // artistId 해시로 3장씩 다르게 배정 (mock)
    const hash = artistId.charCodeAt(artistId.length - 1) || 0;
    const start = hash % Math.max(PORTFOLIO_IMAGES.length - 2, 1);
    return PORTFOLIO_IMAGES.slice(start, start + 3);
  }, []);

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
            works={getWorksForArtist(item.id)}
            isFavorite={favoriteIds.has(item.id)}
            onToggleFavorite={() => handleToggle(item)}
            onVisitProfile={() => handleVisit(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              아직 찜한 타투이스트가 없습니다.
            </Text>
          </View>
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
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
});
