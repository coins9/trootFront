import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../theme/colors';
import { LocationPinIcon, BookmarkIcon, HeartIcon, CommentIcon, EyeIcon } from '../icons';
import { Tattoo } from '../../../domain/entities/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 8) / 2;
const IMAGE_HEIGHT = CARD_WIDTH * 1.25;

interface TattooCardProps {
  tattoo: Tattoo;
  onPress: () => void;
  onArtistPress: () => void;
  onBookmark: () => void;
}

const TattooCard = memo(({ tattoo, onPress, onArtistPress, onBookmark }: TattooCardProps) => {
  const formatCount = (n: number | string) => {
    if (typeof n === 'string') return n;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={styles.imageWrapper}>
          {tattoo.images[0] ? (
            <Image
              source={{ uri: tattoo.images[0] }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, { backgroundColor: COLORS.card }]} />
          )}
          <TouchableOpacity
            onPress={onBookmark}
            style={styles.bookmarkBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <BookmarkIcon size={18} color={COLORS.white} filled={tattoo.isBookmarked} />
          </TouchableOpacity>
          {tattoo.isPromoted && (
            <View style={styles.adBadge}>
              <Text style={styles.adText}>광고</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onArtistPress}
        style={styles.artistRow}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <View style={styles.avatarWrapper}>
          {tattoo.artist.profileImage ? (
            <Image
              source={{ uri: tattoo.artist.profileImage }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : null}
        </View>
        <View style={styles.artistInfo}>
          <Text style={styles.artistName}>{tattoo.artist.nickname}</Text>
          <View style={styles.locationRow}>
            <LocationPinIcon size={10} color={COLORS.gray} />
            <Text style={styles.location}>
              {tattoo.artist.city} · {tattoo.artist.district}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.bottomInfo}>
        <Text style={styles.price}>
          {tattoo.minPrice >= 10000
            ? `${(tattoo.minPrice / 10000).toFixed(0) === String(Math.floor(tattoo.minPrice / 10000)) ? Math.floor(tattoo.minPrice / 10000) : (tattoo.minPrice / 10000).toFixed(0)}만원~`
            : `${tattoo.minPrice.toLocaleString()}원~`}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <HeartIcon size={13} color={COLORS.gray} />
            <Text style={styles.statText}>{formatCount(tattoo.likeCount)}</Text>
          </View>
          <View style={styles.statItem}>
            <CommentIcon size={13} color={COLORS.gray} />
            <Text style={styles.statText}>{formatCount(tattoo.commentCount)}</Text>
          </View>
          <View style={styles.statItem}>
            <EyeIcon size={13} color={COLORS.gray} />
            <Text style={styles.statText}>{tattoo.viewCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

TattooCard.displayName = 'TattooCard';
export default TattooCard;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  imageWrapper: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  adBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
  },
  adText: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 6,
  },
  avatarWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  artistInfo: {
    flexShrink: 1,
  },
  artistName: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  location: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
    flexShrink: 1,
  },
  bottomInfo: {
    paddingHorizontal: 8,
    paddingBottom: 10,
    paddingTop: 4,
  },
  price: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
});
