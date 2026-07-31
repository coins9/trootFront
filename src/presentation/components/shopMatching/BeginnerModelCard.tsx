import React, { memo } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import {
  LocationPinIcon, BookmarkIcon, HeartIcon, CommentIcon,
  PersonSilhouette, TattooPlaceholderIcon, CalendarIcon,
} from '../icons';
import { BeginnerModelRecruit } from '../../../domain/entities/shopTypes';

const { width: W } = Dimensions.get('window');
const CARD_PAD = 16;
const MAIN_IMG_W = (W - CARD_PAD * 2 - 32) * 0.38;
const MAIN_IMG_H = 180;

interface Props {
  post: BeginnerModelRecruit;
  onPress: () => void;
  onBookmark: () => void;
}

const BeginnerModelCard = memo(({ post, onPress, onBookmark }: Props) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
    <View style={styles.top}>
      <View style={styles.mainImage}>
        {post.images[0] ? (
          <Image source={{ uri: post.images[0] }} style={styles.imgFill} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <TattooPlaceholderIcon size={44} color="#2e2e2e" />
          </View>
        )}
      </View>

      <View style={styles.right}>
        {post.isNew && (
          <View style={styles.newBadgeAbs}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={onBookmark}
          style={styles.bookmarkAbs}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <BookmarkIcon size={20} color={COLORS.white} filled={post.isBookmarked} />
        </TouchableOpacity>

        <View style={styles.rightBody}>
          <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
          <Text style={styles.price}>
            {post.materialFee.toLocaleString()}원 <Text style={styles.priceSub}>(재료비)</Text>
          </Text>
          <View style={styles.metaRow}>
            <LocationPinIcon size={11} color={COLORS.gray} />
            <Text style={styles.metaText} numberOfLines={1}>{post.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <CalendarIcon size={11} color={COLORS.gray} />
            <Text style={styles.metaText} numberOfLines={1}>{post.workPeriod}</Text>
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
    </View>

    <View style={styles.divider} />

    <View style={styles.footerRow}>
      <View style={styles.artistBlock}>
        <View style={styles.artistAvatar}>
          {post.artist.profileImage ? (
            <Image source={{ uri: post.artist.profileImage }} style={styles.imgFill} resizeMode="cover" />
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
));

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
  mainImage: {
    width: MAIN_IMG_W,
    height: MAIN_IMG_H,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
  },
  imgFill: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
  },
  right: {
    flex: 1,
    position: 'relative',
  },
  newBadgeAbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 2,
  },
  newBadgeText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
    letterSpacing: 0.4,
  },
  bookmarkAbs: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 2,
    zIndex: 2,
  },
  rightBody: {
    paddingTop: 28,
  },
  title: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  price: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
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
    marginTop: 10,
  },
  tag: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
