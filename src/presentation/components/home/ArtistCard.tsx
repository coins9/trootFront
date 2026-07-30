import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../theme/colors';
import { LocationPinIcon, StarIcon } from '../icons';
import { Artist } from '../../../domain/entities/types';

const CARD_WIDTH = 148;
const CARD_HEIGHT = 220;

interface ArtistCardProps {
  artist: Artist;
  isActive?: boolean;
  onPress: () => void;
}

const ArtistCard = memo(({ artist, isActive, onPress }: ArtistCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.container, isActive && styles.containerActive]}
    >
      <View style={styles.imageWrapper}>
        {artist.profileImage ? (
          <Image
            source={{ uri: artist.profileImage }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}
        <View style={styles.gradient} />
      </View>
      <View style={styles.info}>
        <Text style={styles.nickname} numberOfLines={1}>
          {artist.nickname}
        </Text>
        <View style={styles.locationRow}>
          <LocationPinIcon size={11} color={COLORS.gray} />
          <Text style={styles.location}>
            {artist.city} · {artist.district}
          </Text>
        </View>
        <View style={styles.chipsRow}>
          {artist.genres.slice(0, 2).map((g) => (
            <View key={g} style={styles.chip}>
              <Text style={styles.chipText}>{g}</Text>
            </View>
          ))}
        </View>
        <View style={styles.ratingRow}>
          <StarIcon size={13} color={COLORS.gold} filled />
          <Text style={styles.ratingText}>
            {artist.rating} ({artist.reviewCount >= 1000 ? `${(artist.reviewCount / 1000).toFixed(1)}K` : artist.reviewCount})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

ArtistCard.displayName = 'ArtistCard';
export default ArtistCard;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  containerActive: {
    borderColor: COLORS.gold,
  },
  imageWrapper: {
    width: CARD_WIDTH,
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
  },
  info: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  nickname: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  location: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 16,
    flexShrink: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  chip: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipText: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    color: COLORS.white,
    fontSize: 11,
    lineHeight: 16,
  },
});
