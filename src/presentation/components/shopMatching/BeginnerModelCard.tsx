import React, { memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import CachedImage from '../common/CachedImage';
import { COLORS } from '../../theme/colors';
import {
  LocationPinIcon, BookmarkIcon, HeartIcon, CommentIcon,
  PersonSilhouette, TattooPlaceholderIcon, CalendarIcon,
} from '../icons';
import { BeginnerModelRecruit } from '../../../domain/entities/shopTypes';

const { width: W } = Dimensions.get('window');
const CARD_PAD = 16;
const CARD_INNER_W = W - CARD_PAD * 2 - CARD_PAD * 2;
const GALLERY_W = CARD_INNER_W * 0.5;
const THUMB_GAP = 4;
const THUMB_SIZE = (GALLERY_W - THUMB_GAP) / 2 - THUMB_GAP;
const MAIN_IMG_W = GALLERY_W - THUMB_SIZE - THUMB_GAP;
const MAIN_IMG_H = THUMB_SIZE * 2 + THUMB_GAP;

interface Props {
  post: BeginnerModelRecruit;
  onPress: () => void;
  onBookmark: () => void;
}

const BeginnerModelCard = memo(({ post, onPress, onBookmark }: Props) => {
  const totalImages = post.images.length;
  const extraCount = Math.max(0, totalImages - 2);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <View style={styles.top}>
        {/* Gallery block: main + 2 square thumbs (stacked vertically) */}
        <View style={styles.gallery}>
          <View style={styles.mainImage}>
            {post.images[0] ? (
              <CachedImage uri={post.images[0]} style={styles.imgFill} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <TattooPlaceholderIcon size={38} color="#2e2e2e" />
              </View>
            )}
          </View>
          <View style={styles.thumbCol}>
            <View style={styles.thumb}>
              {post.images[1] ? (
                <CachedImage uri={post.images[1]} style={styles.imgFill} resizeMode="cover" />
              ) : (
                <View style={styles.placeholder}>
                  <TattooPlaceholderIcon size={22} color="#2e2e2e" />
                </View>
              )}
            </View>
            <View style={styles.thumb}>
              {post.images[2] ? (
                <CachedImage uri={post.images[2]} style={styles.imgFill} resizeMode="cover" />
              ) : (
                <View style={styles.placeholder}>
                  <TattooPlaceholderIcon size={22} color="#2e2e2e" />
                </View>
              )}
              {extraCount > 0 && (
                <View style={styles.thumbOverlay}>
                  <Text style={styles.thumbOverlayText}>+{extraCount}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Right content */}
        <View style={styles.right}>
          <View style={styles.topRow}>
            {post.isNew ? (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            ) : <View />}
            <TouchableOpacity
              onPress={onBookmark}
              style={styles.bookmarkBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <BookmarkIcon size={20} color={COLORS.white} filled={post.isBookmarked} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
            {post.title}
          </Text>
          <Text style={styles.price}>
            {post.materialFee.toLocaleString()}원 <Text style={styles.priceSub}>(재료비)</Text>
          </Text>
          <View style={styles.metaRow}>
            <LocationPinIcon size={11} color={COLORS.gray} />
            <Text
              style={styles.metaText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {post.location}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <CalendarIcon size={11} color={COLORS.gray} />
            <Text
              style={styles.metaText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {post.workPeriod}
            </Text>
          </View>
          <View style={styles.tagRow}>
            {post.tags.slice(0, 3).map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>#{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.artistBlock}>
          <View style={styles.artistAvatar}>
            {post.artist.profileImage ? (
              <CachedImage uri={post.artist.profileImage} style={styles.imgFill} resizeMode="cover" />
            ) : (
              <PersonSilhouette size={28} color="#3a3a3a" />
            )}
          </View>
          <View style={styles.artistTextGroup}>
            <Text style={styles.artistName}>{post.artist.nickname}</Text>
            <Text style={styles.artistExp}>{post.artist.experience}</Text>
          </View>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <HeartIcon size={14} color={COLORS.gray} />
            <Text style={styles.statText}>{post.likeCount}</Text>
          </View>
          {post.commentCount > 0 && (
            <View style={styles.stat}>
              <CommentIcon size={14} color={COLORS.gray} />
              <Text style={styles.statText}>{post.commentCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

BeginnerModelCard.displayName = 'BeginnerModelCard';
export default BeginnerModelCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: CARD_PAD,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  top: {
    flexDirection: 'row',
    gap: 12,
  },
  gallery: {
    flexDirection: 'row',
    gap: THUMB_GAP,
    height: MAIN_IMG_H,
  },
  mainImage: {
    width: MAIN_IMG_W,
    height: MAIN_IMG_H,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
  },
  thumbCol: {
    gap: THUMB_GAP,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    position: 'relative',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbOverlayText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  imgFill: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
  },

  right: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    minHeight: 22,
  },
  newBadge: {
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newBadgeText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
    letterSpacing: 0.4,
  },
  bookmarkBtn: {
    padding: 2,
  },
  title: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  price: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 6,
  },
  priceSub: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    flexShrink: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  tag: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 14,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  artistBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  artistAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistTextGroup: {
    gap: 1,
  },
  artistName: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  artistExp: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
});
