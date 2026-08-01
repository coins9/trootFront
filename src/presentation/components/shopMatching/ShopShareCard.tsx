import React, { memo } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import {
  LocationPinIcon, BookmarkIcon, HeartIcon, CommentIcon,
  PersonSilhouette, TattooPlaceholderIcon,
} from '../icons';
import { TattooShareShop } from '../../../domain/entities/shopTypes';

const { width: W } = Dimensions.get('window');
const CARD_PAD = 16;
const CARD_INNER_W = W - CARD_PAD * 2 - CARD_PAD * 2;
const LEFT_COL_W = CARD_INNER_W * 0.42;
const MAIN_IMG_SIZE = LEFT_COL_W;
const THUMB_GAP = 4;
const THUMB_SIZE = (LEFT_COL_W - THUMB_GAP * 2) / 3;

interface Props {
  shop: TattooShareShop;
  onPress: () => void;
  onBookmark: () => void;
}

const formatWon = (n: number) => `일 ${n.toLocaleString()}원`;

const ShopShareCard = memo(({ shop, onPress, onBookmark }: Props) => {
  const thumbs = [shop.images[1], shop.images[2], shop.images[3]];
  const extra = Math.max(0, shop.images.length - 4);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <View style={styles.mainRow}>
        {/* ── Left column: square main + square thumb row ── */}
        <View style={styles.leftCol}>
          <View style={styles.mainImage}>
            {shop.images[0] ? (
              <Image source={{ uri: shop.images[0] }} style={styles.imgFill} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <TattooPlaceholderIcon size={44} color="#2e2e2e" />
              </View>
            )}
          </View>
          <View style={styles.thumbRow}>
            {thumbs.map((uri, i) => (
              <View key={i} style={styles.thumb}>
                {uri ? (
                  <Image source={{ uri }} style={styles.imgFill} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholder}>
                    <TattooPlaceholderIcon size={20} color="#2e2e2e" />
                  </View>
                )}
                {i === 2 && extra > 0 && (
                  <View style={styles.thumbOverlay}>
                    <Text style={styles.thumbOverlayText}>+{extra}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ── Right column: info + spec grid ── */}
        <View style={styles.rightCol}>
          <View style={styles.topRow}>
            {shop.isNew ? (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>신규</Text>
              </View>
            ) : <View />}
            <TouchableOpacity
              onPress={onBookmark}
              style={styles.bookmarkBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <BookmarkIcon size={20} color={COLORS.white} filled={shop.isBookmarked} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{shop.title}</Text>
          <Text style={styles.price}>{formatWon(shop.pricePerDay)}</Text>
          <View style={styles.addressRow}>
            <LocationPinIcon size={11} color={COLORS.gray} />
            <Text style={styles.addressText}>{shop.address}</Text>
          </View>

          {/* Spec grid 3x2 — 한 줄 안에 다 들어가도록 자동 폰트 축소 */}
          <View style={styles.specGrid}>
            <View style={styles.specCell}>
              <Text style={styles.specLabel} adjustsFontSizeToFit minimumFontScale={0.8}>평수</Text>
              <Text style={styles.specValue} adjustsFontSizeToFit minimumFontScale={0.8}>
                {shop.areaPyeong}평
              </Text>
            </View>
            <View style={styles.specCell}>
              <Text style={styles.specLabel} adjustsFontSizeToFit minimumFontScale={0.8}>베드 수</Text>
              <Text style={styles.specValue} adjustsFontSizeToFit minimumFontScale={0.8}>
                {shop.bedCount}대
              </Text>
            </View>
            <View style={styles.specCell}>
              <Text style={styles.specLabel} adjustsFontSizeToFit minimumFontScale={0.8}>조명</Text>
              <Text style={styles.specValue} adjustsFontSizeToFit minimumFontScale={0.8}>
                {shop.lighting}
              </Text>
            </View>
            <View style={styles.specCell}>
              <Text style={styles.specLabel} adjustsFontSizeToFit minimumFontScale={0.8}>프라이빗 룸</Text>
              <Text style={styles.specValue} adjustsFontSizeToFit minimumFontScale={0.75}>
                {shop.privateRoomInfo ?? (shop.hasPrivateRoom ? '있음' : '없음')}
              </Text>
            </View>
            <View style={styles.specCell}>
              <Text style={styles.specLabel} adjustsFontSizeToFit minimumFontScale={0.8}>최대 수용 인원</Text>
              <Text style={styles.specValue} adjustsFontSizeToFit minimumFontScale={0.8}>
                {shop.maxOccupancy}명
              </Text>
            </View>
            <View style={styles.specCell}>
              <Text style={styles.specLabel} adjustsFontSizeToFit minimumFontScale={0.75}>현재 / 필요 인원</Text>
              <Text style={styles.specValue} adjustsFontSizeToFit minimumFontScale={0.8}>
                {shop.currentOccupancy} / {shop.requiredOccupancy}명
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.hostBlock}>
          <View style={styles.hostAvatar}>
            {shop.host.profileImage ? (
              <Image source={{ uri: shop.host.profileImage }} style={styles.imgFill} resizeMode="cover" />
            ) : (
              <PersonSilhouette size={30} color="#3a3a3a" />
            )}
          </View>
          <View style={styles.hostTextGroup}>
            <Text style={styles.hostName}>{shop.host.nickname}</Text>
            <Text style={styles.hostRole}>{shop.host.role}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <HeartIcon size={14} color={COLORS.gray} />
            <Text style={styles.statText}>{shop.likeCount}</Text>
          </View>
          {shop.commentCount > 0 && (
            <View style={styles.stat}>
              <CommentIcon size={14} color={COLORS.gray} />
              <Text style={styles.statText}>{shop.commentCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

ShopShareCard.displayName = 'ShopShareCard';
export default ShopShareCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: CARD_PAD,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mainRow: {
    flexDirection: 'row',
    gap: 12,
  },

  /* Left column */
  leftCol: {
    width: LEFT_COL_W,
    gap: THUMB_GAP,
  },
  mainImage: {
    width: MAIN_IMG_SIZE,
    height: MAIN_IMG_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
  },
  thumbRow: {
    flexDirection: 'row',
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
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  imgFill: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
  },

  /* Right column */
  rightCol: {
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
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newBadgeText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
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
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  addressText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    flexShrink: 1,
  },

  /* Spec grid — 자동 폰트 축소로 wrap 방지 */
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginHorizontal: -2,
  },
  specCell: {
    width: '33.33%',
    paddingVertical: 5,
    paddingHorizontal: 3,
  },
  specLabel: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
  },
  specValue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 2,
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
  hostBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostTextGroup: {
    gap: 1,
  },
  hostName: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  hostRole: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
});
