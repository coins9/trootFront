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
  onInquiry: () => void;
  onPress?: () => void;
}

const SupplyCard = memo(({ supply, onBookmark, onInquiry, onPress }: Props) => (
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
      <Text
        style={styles.name}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {supply.name}
      </Text>
      <Text
        style={styles.subtitle}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {supply.subtitle}
      </Text>
    </View>

    {/* Inquiry button */}
    <TouchableOpacity
      style={styles.inquiryBtn}
      activeOpacity={0.85}
      onPress={onInquiry}
    >
      <Text style={styles.inquiryText}>구매 문의</Text>
    </TouchableOpacity>
  </TouchableOpacity>
));

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
  inquiryBtn: {
    marginHorizontal: 14,
    marginBottom: 14,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    alignItems: 'center',
  },
  inquiryText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
