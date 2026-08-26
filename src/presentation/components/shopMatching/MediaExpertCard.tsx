import React, { memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import CachedImage from '../common/CachedImage';
import { COLORS } from '../../theme/colors';
import {
  LocationPinIcon, BookmarkIcon, TattooPlaceholderIcon, PlayCircleIcon, HeartIcon,
} from '../icons';
import { MediaExpert } from '../../../domain/entities/shopTypes';
import { useTranslation } from '../../store/languageStore';

const { width: W } = Dimensions.get('window');
const CARD_PAD = 16;
const MAIN_IMG_W = (W - CARD_PAD * 2 - 32) * 0.38;
const MAIN_IMG_H = 180;

interface Props {
  expert: MediaExpert;
  onPress: () => void;
  onBookmark: () => void;
}

const MediaExpertCard = memo(({ expert, onPress, onBookmark }: Props) => {
  const { t, language } = useTranslation();
  const cover = expert.portfolio[0];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <View style={styles.row}>
        {/* Left cover image */}
        <View style={styles.mainImage}>
          {cover?.uri ? (
            <CachedImage uri={cover.uri} style={styles.imgFill} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <TattooPlaceholderIcon size={44} color="#2e2e2e" />
            </View>
          )}
          {cover?.isVideo && (
            <View style={styles.playOverlay} pointerEvents="none">
              <PlayCircleIcon size={40} color={COLORS.white} />
            </View>
          )}
        </View>

        {/* Right content */}
        <View style={styles.right}>
          {/* Bookmark absolute top-right */}
          <TouchableOpacity
            onPress={onBookmark}
            style={styles.bookmarkAbs}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <BookmarkIcon size={20} color={COLORS.white} filled={expert.isBookmarked} />
          </TouchableOpacity>

          {/* Name */}
          <Text
            style={styles.nickname}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {(language === 'en' && expert.titleEn) ? expert.titleEn : expert.nickname}
          </Text>

          {/* Experience gold */}
          <Text style={styles.experience}>{expert.experience}</Text>

          {/* Tag lines (up to 2 rows) */}
          <View style={styles.tagList}>
            {expert.tags.slice(0, 2).map((tag) => (
              <Text
                key={tag}
                style={styles.tagLine}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {tag}
              </Text>
            ))}
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <LocationPinIcon size={11} color={COLORS.gray} />
            <Text
              style={styles.locationText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {expert.location}
            </Text>
          </View>

          {/* Price block */}
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>{t('shop.card.estimatedPrice')}</Text>
            <Text style={styles.priceRange}>
              {language === 'en'
                ? `₩${expert.priceMin.toLocaleString()} ~ ₩${expert.priceMax.toLocaleString()}`
                : `${expert.priceMin.toLocaleString()}${t('shop.card.wonSuffix')} ~ ${expert.priceMax.toLocaleString()}${t('shop.card.wonSuffix')}`}
            </Text>
            <Text style={styles.priceNote}>{t('shop.card.priceFlexNote')}</Text>
          </View>

          {/* Heart count */}
          <View style={styles.statsRow}>
            <HeartIcon size={13} color={COLORS.gray} />
            <Text style={styles.statsText}>{expert.likeCount ?? 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

MediaExpertCard.displayName = 'MediaExpertCard';
export default MediaExpertCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: CARD_PAD,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  mainImage: {
    width: MAIN_IMG_W,
    height: MAIN_IMG_H,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    position: 'relative',
  },
  imgFill: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },

  right: {
    flex: 1,
    position: 'relative',
  },
  bookmarkAbs: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 2,
    zIndex: 2,
  },
  nickname: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
    paddingRight: 28,
  },
  experience: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 3,
  },
  tagList: {
    marginTop: 8,
    gap: 2,
  },
  tagLine: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  locationText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    flexShrink: 1,
  },
  priceBlock: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  priceLabel: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  priceRange: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 3,
  },
  priceNote: {
    color: COLORS.gray3,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  statsText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
});
