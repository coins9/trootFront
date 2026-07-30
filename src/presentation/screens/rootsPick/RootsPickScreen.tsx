import React, { useCallback, memo } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, StyleSheet,
  Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import { RootsPickBadge, ArrowRightIcon } from '../../components/icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { ROOTS_PICK_ARTISTS, MOCK_ARTISTS } from '../../../data/mock/mockData';
import { RootsPickArtist } from '../../../data/mock/mockData';
import { Artist } from '../../../domain/entities/types';

const { width: W, height: H } = Dimensions.get('window');
const FEATURED_HEIGHT = H * 0.6;
const GRID_CARD_W = (W - 2) / 2;
const GRID_CARD_H = GRID_CARD_W * 1.35;

type RootsPickNavProp = NativeStackNavigationProp<RootStackParamList>;

const resolveArtist = (artistRef: string): Artist => {
  return MOCK_ARTISTS.find((a) => a.id === artistRef) ?? MOCK_ARTISTS[0];
};

const GridCard = memo(({ item, onPress }: { item: RootsPickArtist; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.gridCard}>
    <View style={styles.gridImageWrapper}>
      {item.coverImage ? (
        <Image
          source={{ uri: item.coverImage }}
          style={styles.gridImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.gridImage, { backgroundColor: COLORS.card }]} />
      )}
      <View style={styles.gridOverlay} pointerEvents="box-none" />
      <View style={styles.gridInfo}>
        <Text style={styles.gridName}>{item.nickname}</Text>
        <Text style={styles.gridMeta}>{item.city} · {item.genre}</Text>
      </View>
    </View>
    <View style={styles.gridFooter}>
      <Text style={styles.viewProfile}>VIEW PROFILE</Text>
      <ArrowRightIcon size={14} color={COLORS.white} />
    </View>
  </TouchableOpacity>
));

GridCard.displayName = 'GridCard';

const RootsPickScreen = () => {
  const navigation = useNavigation<RootsPickNavProp>();

  const featured = ROOTS_PICK_ARTISTS[0];
  const gridArtists = ROOTS_PICK_ARTISTS.slice(1);

  const handleArtistPress = useCallback(
    (item: RootsPickArtist) => {
      const artist = resolveArtist(item.artistRef);
      navigation.navigate('ArtistProfile', { artist });
    },
    [navigation],
  );

  const pairs: RootsPickArtist[][] = [];
  for (let i = 0; i < gridArtists.length; i += 2) {
    pairs.push(gridArtists.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <LogoHeader />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Header Section ───────────────────────────── */}
        <View style={styles.headerSection}>
          <Text style={styles.labelSmall}>ROOT'S PICK</Text>
          <View style={styles.titleRow}>
            <View style={styles.titles}>
              <Text style={styles.titleLarge}>CURATED.</Text>
              <Text style={styles.titleLarge}>TIMELESS.</Text>
            </View>
            <TouchableOpacity
              style={styles.arrowCircle}
              activeOpacity={0.8}
              onPress={() => handleArtistPress(featured)}
            >
              <ArrowRightIcon size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>T:ROOT이 선정한 최고의 타투 아티스트</Text>
        </View>

        {/* ── Featured Artist Card ──────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleArtistPress(featured)}
          style={styles.featuredCard}
        >
          {featured.coverImage ? (
            <Image
              source={{ uri: featured.coverImage }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.featuredImage, { backgroundColor: COLORS.card }]} />
          )}

          {/* Dark gradient overlay at bottom */}
          <View style={styles.featuredGradient} pointerEvents="box-none" />

          {/* Bottom info + badge */}
          <View style={styles.featuredBottom} pointerEvents="box-none">
            <View style={styles.featuredInfoBlock}>
              <Text style={styles.featuredName}>{featured.nickname}</Text>
              <Text style={styles.featuredMeta}>
                {featured.city} · {featured.genre}
              </Text>
              <View style={styles.divider} />
              <View style={styles.viewProfileRow}>
                <Text style={styles.viewProfile}>VIEW PROFILE</Text>
                <ArrowRightIcon size={14} color={COLORS.white} />
              </View>
            </View>
            <View style={styles.badgeWrapper}>
              <RootsPickBadge size={72} />
            </View>
          </View>
        </TouchableOpacity>

        {/* ── 2-Column Grid ────────────────────────────── */}
        <View style={styles.grid}>
          {pairs.map((pair, rowIdx) => (
            <View key={rowIdx} style={styles.gridRow}>
              {pair.map((item) => (
                <GridCard
                  key={item.id}
                  item={item}
                  onPress={() => handleArtistPress(item)}
                />
              ))}
              {pair.length === 1 && <View style={styles.gridCard} />}
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RootsPickScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },

  /* Header */
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.bg,
  },
  labelSmall: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    lineHeight: 16,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titles: {
    gap: 0,
    flexShrink: 1,
  },
  titleLarge: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 46,
  },
  arrowCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    flexShrink: 0,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 20,
  },

  /* Featured Card */
  featuredCard: {
    width: W,
    height: FEATURED_HEIGHT,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(0,0,0,0)',
    // layered gradient simulation
  },
  featuredBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 80,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  featuredInfoBlock: {
    flexShrink: 1,
    gap: 4,
  },
  featuredName: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  featuredMeta: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
  },
  divider: {
    width: 100,
    height: 1,
    backgroundColor: COLORS.gold,
    marginVertical: 10,
  },
  viewProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewProfile: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  badgeWrapper: {
    marginBottom: 4,
  },

  /* Grid */
  grid: {
    gap: 2,
    marginTop: 2,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 2,
  },
  gridCard: {
    width: GRID_CARD_W,
    backgroundColor: COLORS.card,
  },
  gridImageWrapper: {
    width: GRID_CARD_W,
    height: GRID_CARD_H,
    position: 'relative',
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  gridInfo: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 8,
  },
  gridName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 27,
  },
  gridMeta: {
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.8,
    marginTop: 2,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
});
