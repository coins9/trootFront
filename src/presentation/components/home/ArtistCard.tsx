import React, { memo } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import {
  LocationPinIcon, StarIcon, PersonSilhouette,
} from '../icons';
import { Artist } from '../../../domain/entities/types';

const CARD_WIDTH = 130;
const IMAGE_HEIGHT = 172;

interface ArtistCardProps {
  artist: Artist;
  isActive?: boolean;
  onPress: () => void;
}

const ArtistCard = memo(({ artist, isActive, onPress }: ArtistCardProps) => {
  const ratingCount = artist.reviewCount >= 1000
    ? `${(artist.reviewCount / 1000).toFixed(1)}K`
    : String(artist.reviewCount);

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
        ) : (
          <View style={styles.placeholder}>
            <PersonSilhouette size={64} color="#2e2e2e" />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.nickname} numberOfLines={1}>
            {artist.nickname}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <LocationPinIcon size={10} color={COLORS.gray} />
          <Text style={styles.location} numberOfLines={1}>
            {artist.city} · {artist.district}
          </Text>
        </View>
        <View style={styles.chipsRow}>
          {artist.genres.slice(0, 2).map((g) => (
            <View key={g} style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>{g}</Text>
            </View>
          ))}
        </View>
        <View style={styles.ratingRow}>
          <StarIcon size={11} color={COLORS.gold} filled />
          <Text style={styles.ratingText}>
            {artist.rating} ({ratingCount})
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
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  containerActive: {
    borderColor: COLORS.gold,
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  info: {
    paddingHorizontal: 9,
    paddingVertical: 8,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nickname: {
    flexShrink: 1,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    lineHeight: 17,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  location: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
    flexShrink: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  chip: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 1,
  },
  chipText: {
    color: COLORS.gray,
    fontSize: 9,
    lineHeight: 13,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  ratingText: {
    color: COLORS.white,
    fontSize: 10,
    lineHeight: 14,
  },
});
