import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../theme/colors';
import {
  BookmarkIcon, HeartIcon, CommentIcon, EyeIcon,
  TattooPlaceholderIcon, PersonSilhouette,
} from '../icons';
import { Tattoo } from '../../../domain/entities/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 8) / 2;
const IMAGE_HEIGHT = CARD_WIDTH * 1.15;

interface TattooCardProps {
  tattoo: Tattoo;
  onPress: () => void;
  onArtistPress: () => void;
  onBookmark: () => void;
}

const formatCount = (n: number | string) => {
  if (typeof n === 'string') return n;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

const formatPrice = (price: number) => {
  if (price >= 10000) return `${Math.floor(price / 10000)}만원~`;
  return `${price.toLocaleString()}원~`;
};

const TattooCard = memo(({ tattoo, onPress, onArtistPress, onBookmark }: TattooCardProps) => {
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
            <View style={styles.placeholder}>
              <TattooPlaceholderIcon size={56} color="#2e2e2e" />
            </View>
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

      <View style={styles.body}>
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
            ) : (
              <PersonSilhouette size={28} color="#3a3a3a" />
            )}
          </View>
          <View style={styles.artistInfo}>
            <Text style={styles.artistName} numberOfLines={1}>
              {tattoo.artist.nickname}
            </Text>
            <Text style={styles.location} numberOfLines={1}>
              {tattoo.artist.city} · {tattoo.artist.district}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.price}>{formatPrice(tattoo.minPrice)}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <HeartIcon size={13} color="#B8A57E" />
            <Text style={styles.statText}>{formatCount(tattoo.likeCount)}</Text>
          </View>
          <View style={styles.statItem}>
            <CommentIcon size={13} color="#B8A57E" />
            <Text style={styles.statText}>{formatCount(tattoo.commentCount)}</Text>
          </View>
          <View style={styles.statItem}>
            <EyeIcon size={13} color="#B8A57E" />
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
    marginBottom: 12,
  },
  imageWrapper: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: COLORS.elevated,
    position: 'relative',
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
  bookmarkBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  adBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adText: {
    color: COLORS.white,
    fontSize: 10,
    lineHeight: 14,
  },
  body: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  avatarWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  artistInfo: {
    flexShrink: 1,
    gap: 1,
  },
  artistName: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  location: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
  },
  price: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    color: '#B8A57E',
    fontSize: 11,
    lineHeight: 15,
  },
});
