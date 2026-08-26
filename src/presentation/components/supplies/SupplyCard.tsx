import React, { memo } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { HeartIcon, TattooPlaceholderIcon } from '../icons';
import { TattooSupply } from '../../../domain/entities/supplyTypes';
const { width: W } = Dimensions.get('window');
const CARD_WIDTH = (W - 16 * 2 - 10) / 2;
const IMG_HEIGHT = CARD_WIDTH * 1.1;

interface Props {
  supply: TattooSupply;
  onBookmark: () => void;
  onPress?: () => void;
}

const SupplyCard = memo(({ supply, onBookmark, onPress }: Props) => {
  return (
  <TouchableOpacity
    activeOpacity={onPress ? 0.9 : 1}
    onPress={onPress}
    style={styles.card}
  >
    {/* Product image (light background) */}
    <View style={styles.imageWrap}>
      {supply.imageUri ? (
        <Image source={{ uri: supply.imageUri }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={styles.placeholder}>
          <TattooPlaceholderIcon size={54} color="#3a3a3a" />
        </View>
      )}
      <TouchableOpacity
        onPress={onBookmark}
        style={styles.heartBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <HeartIcon
          size={20}
          color={supply.isBookmarked ? COLORS.gold : COLORS.gray2}
          filled={supply.isBookmarked}
        />
      </TouchableOpacity>
      {supply.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
    </View>

    {/* Info */}
    <View style={styles.body}>
      {supply.brand ? (
        <Text style={styles.brand} numberOfLines={1}>{supply.brand}</Text>
      ) : null}
      <Text
        style={styles.name}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {supply.name}
      </Text>
      {supply.subtitle ? (
        <Text
          style={styles.subtitle}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {supply.subtitle}
        </Text>
      ) : null}
      {typeof supply.price === 'number' && supply.price > 0 ? (
        <Text style={styles.price}>{supply.price.toLocaleString()}원</Text>
      ) : null}
    </View>

  </TouchableOpacity>
  );
});

SupplyCard.displayName = 'SupplyCard';
export default SupplyCard;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imageWrap: {
    width: '100%',
    height: IMG_HEIGHT,
    backgroundColor: '#f2f2f2',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  heartBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    padding: 2,
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  newBadgeText: {
    color: COLORS.black,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 14,
    letterSpacing: 0.4,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 2,
  },
  brand: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    letterSpacing: 0.3,
  },
  name: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  price: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
    marginTop: 4,
  },
});
