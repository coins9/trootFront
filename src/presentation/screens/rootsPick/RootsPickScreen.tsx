import React, { useCallback, memo } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, StyleSheet,
  Dimensions, StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import { ArrowRightIcon, TattooPlaceholderIcon } from '../../components/icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { ROOTS_PICK_ARTISTS, MOCK_ARTISTS } from '../../../data/mock/mockData';
import { RootsPickArtist } from '../../../data/mock/mockData';
import { Artist } from '../../../domain/entities/types';

const { width: W, height: H } = Dimensions.get('window');
const HERO_HEIGHT = H * 0.55;
const GRID_CARD_W = (W - 2) / 2;
const GRID_CARD_H = GRID_CARD_W * 1.5;

// 시스템 세리프 (커스텀 폰트 로드 없이) — 목업 Playfair Display 근사
const SERIF = Platform.select({
  ios: 'Didot',              // iOS 기본 세리프 (얇고 우아함)
  android: 'serif',          // Android 기본 세리프 (Noto Serif)
  default: 'serif',
});

// 산세리프 트래킹 강조 라벨용
const SANS_MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

type RootsPickNavProp = NativeStackNavigationProp<RootStackParamList>;

const resolveArtist = (artistRef: string): Artist =>
  MOCK_ARTISTS.find((a) => a.id === artistRef) ?? MOCK_ARTISTS[0];

const GridCard = memo(({ item, onPress }: { item: RootsPickArtist; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.gridCard}>
    {item.coverImage ? (
      <Image source={{ uri: item.coverImage }} style={styles.gridImage} resizeMode="cover" />
    ) : (
      <View style={styles.gridPlaceholder}>
        <TattooPlaceholderIcon size={72} color="#2a2a2a" />
      </View>
    )}
    <View style={styles.gridDarkOverlay} pointerEvents="none" />
    <View style={styles.gridTopInfo} pointerEvents="none">
      <Text style={styles.gridName}>{item.nickname}</Text>
      <Text style={styles.gridMeta}>
        {item.city} <Text style={styles.gridDot}>·</Text> {item.genre}
      </Text>
    </View>
    <View style={styles.gridBottomAction} pointerEvents="none">
      <Text style={styles.viewProfile}>VIEW PROFILE</Text>
      <ArrowRightIcon size={14} color={COLORS.gold} />
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} bounces>
        {/* ── Hero: image + overlay text ── */}
        <View style={styles.hero}>
          {featured.coverImage ? (
            <Image source={{ uri: featured.coverImage }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <TattooPlaceholderIcon size={120} color="#2a2a2a" />
            </View>
          )}

          {/* dark gradient overlay */}
          <View style={styles.heroGradient} pointerEvents="none" />

          {/* Top-left content: label + title + subtitle + view artists */}
          <View style={styles.heroTopLeft} pointerEvents="box-none">
            <View style={styles.labelBlock}>
              <Text style={styles.labelSmall}>ROOT'S PICK</Text>
              <View style={styles.labelUnderline} />
            </View>
            <Text
              style={styles.titleLarge}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              CURATED.
            </Text>
            <Text
              style={styles.titleLarge}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              TIMELESS.
            </Text>
            <Text style={styles.subtitle}>
              루트가 선정한{'\n'}프리미엄 타투 아티스트
            </Text>

            <View style={styles.viewArtistsDivider} />
            <TouchableOpacity
              onPress={() => handleArtistPress(featured)}
              activeOpacity={0.75}
              style={styles.viewArtistsRow}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.viewArtistsText}>VIEW ARTISTS</Text>
              <ArrowRightIcon size={20} color={COLORS.gold} strokeWidth={1.8} />
            </TouchableOpacity>
          </View>

          {/* Bottom-left: featured artist name */}
          <View style={styles.heroBottomLeft} pointerEvents="box-none">
            <Text style={styles.featuredName}>{featured.nickname}</Text>
            <Text style={styles.featuredMeta}>
              {featured.city}   <Text style={styles.featuredDot}>·</Text>   {featured.genre}
            </Text>
          </View>

        </View>

        {/* ── 2-column grid ── */}
        <View style={styles.grid}>
          {pairs.map((pair, rowIdx) => (
            <View key={rowIdx} style={styles.gridRow}>
              {pair.map((item) => (
                <GridCard key={item.id} item={item} onPress={() => handleArtistPress(item)} />
              ))}
              {pair.length === 1 && <View style={styles.gridCard} />}
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RootsPickScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  scroll: {
    flex: 1,
  },

  /* Hero */
  hero: {
    width: W,
    height: HERO_HEIGHT,
    position: 'relative',
    backgroundColor: '#0a0a0a',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: W * 0.15,
    backgroundColor: '#0a0a0a',
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: W * 0.6,
  },
  labelBlock: {
    marginBottom: 10,
  },
  labelSmall: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    lineHeight: 16,
    fontFamily: SANS_MONO,
  },
  labelUnderline: {
    width: 34,
    height: 1,
    backgroundColor: COLORS.gold,
    marginTop: 5,
  },
  titleLarge: {
    color: COLORS.white,
    fontSize: 38,
    fontWeight: '400',
    letterSpacing: -0.5,
    lineHeight: 44,
    fontFamily: SERIF,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  viewArtistsDivider: {
    width: 70,
    height: 1,
    backgroundColor: COLORS.gold,
    marginTop: 16,
  },
  viewArtistsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  viewArtistsText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    lineHeight: 17,
    fontFamily: SANS_MONO,
  },
  heroBottomLeft: {
    position: 'absolute',
    left: 20,
    bottom: 22,
  },
  featuredName: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: '400',
    letterSpacing: 2,
    lineHeight: 46,
    fontFamily: SERIF,
  },
  featuredMeta: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    lineHeight: 18,
    marginTop: 4,
    opacity: 0.9,
  },
  featuredDot: {
    color: COLORS.gold,
    fontSize: 16,
  },
  /* Grid */
  grid: {
    marginTop: 0,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 2,
  },
  gridCard: {
    width: GRID_CARD_W,
    height: GRID_CARD_H,
    backgroundColor: '#0a0a0a',
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  gridDarkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  gridTopInfo: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
  },
  gridName: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '400',
    letterSpacing: 1.5,
    lineHeight: 38,
    fontFamily: SERIF,
  },
  gridMeta: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.8,
    lineHeight: 15,
    marginTop: 4,
    opacity: 0.9,
  },
  gridDot: {
    color: COLORS.gold,
    fontSize: 14,
  },
  gridBottomAction: {
    position: 'absolute',
    left: 18,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewProfile: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    lineHeight: 15,
    fontFamily: SANS_MONO,
  },
});
