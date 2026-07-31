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
const CARD_H_PAD = 16;
const MAIN_IMG_H = 168;
const THUMB_SIZE = (W - CARD_H_PAD * 2 - 16 - 16) / 3;

interface Props {
  shop: TattooShareShop;
  onPress: () => void;
  onBookmark: () => void;
}

const formatWon = (n: number) => `일 ${n.toLocaleString()}원`;

const ShopShareCard = memo(({ shop, onPress, onBookmark }: Props) => {
  const thumbs = shop.images.slice(0, 3);
  const extra = Math.max(0, shop.images.length - 3);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <View style={styles.imagesRow}>
        <View style={styles.mainImage}>
          {shop.images[0] ? (
            <Image source={{ uri: shop.images[0] }} style={styles.imgFill} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <TattooPlaceholderIcon size={44} color="#2e2e2e" />
            </View>
          )}
        </View>

        <View style={styles.rightBlock}>
          {shop.isNew && (
            <View style={styles.newBadgeAbs}>
              <Text style={styles.newBadgeText}>신규</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onBookmark}
            style={styles.bookmarkAbs}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <BookmarkIcon size={20} color={COLORS.white} filled={shop.isBookmarked} />
          </TouchableOpacity>

          <View style={styles.rightBody}>
            <Text style={styles.title} numberOfLines={2}>{shop.title}</Text>
            <Text style={styles.price}>{formatWon(shop.pricePerDay)}</Text>
            <View style={styles.addressRow}>
              <LocationPinIcon size={12} color={COLORS.gray} />
              <Text style={styles.addressText} numberOfLines={1}>{shop.address}</Text>
            </View>

            <View style={styles.specGrid}>
              <View style={styles.specCell}>
                <Text style={styles.specLabel}>평수</Text>
                <Text style={styles.specValue}>{shop.areaPyeong}평</Text>
              </View>
              <View style={styles.specCell}>
                <Text style={styles.specLabel}>베드 수</Text>
                <Text style={styles.specValue}>{shop.bedCount}대</Text>
              </View>
              <View style={styles.specCell}>
                <Text style={styles.specLabel}>조명</Text>
                <Text style={styles.specValue}>{shop.lighting}</Text>
              </View>
              <View style={styles.specCell}>
                <Text style={styles.specLabel}>프라이빗 룸</Text>
                <Text style={styles.specValue} numberOfLines={1}>
                  {shop.privateRoomInfo ?? (shop.hasPrivateRoom ? '있음' : '없음')}
                </Text>
              </View>
              <View style={styles.specCell}>
                <Text style={styles.specLabel}>최대 수용 인원</Text>
                <Text style={styles.specValue}>{shop.maxOccupancy}명</Text>
              </View>
              <View style={styles.specCell}>
                <Text style={styles.specLabel}>현재 / 필요 인원</Text>
                <Text style={styles.specValue}>
                  {shop.currentOccupancy} / {shop.requiredOccupancy}명
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.thumbRow}>
        {thumbs.map((uri, i) => (
          <View key={i} style={styles.thumb}>
            {uri ? (
              <Image source={{ uri }} style={styles.imgFill} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <TattooPlaceholderIcon size={26} color="#2e2e2e" />
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

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.hostBlock}>
          <View style={styles.hostAvatar}>
            {shop.host.profileImage ? (
              <Image source={{ uri: shop.host.profileImage }} style={styles.imgFill} resizeMode="cover" />
            ) : (
              <PersonSilhouette size={28} color="#3a3a3a" />
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
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mainImage: {
    width: (W - CARD_H_PAD * 2 - 32) * 0.42,
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
  rightBlock: {
    flex: 1,
    position: 'relative',
  },
  newBadgeAbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 2,
  },
  newBadgeText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  bookmarkAbs: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 2,
    padding: 2,
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
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  specCell: {
    width: '33.33%',
    paddingVertical: 4,
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
    marginTop: 1,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    position: 'relative',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbOverlayText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
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
    gap: 8,
    flexShrink: 1,
  },
  hostAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    fontSize: 10,
    lineHeight: 14,
  },
  statsRow: {
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
