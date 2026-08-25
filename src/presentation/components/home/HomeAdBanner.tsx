import React, { memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import CachedImage from '../common/CachedImage';
import { COLORS } from '../../theme/colors';
import {
  TattooPlaceholderIcon, LocationPinIcon, ChevronRightIcon,
} from '../icons';
import { HomeAd } from '../../../domain/entities/adTypes';
import { useTranslation } from '../../store/languageStore';

const { width: W } = Dimensions.get('window');
const H_PAD = 16;
const CARD_W = W - H_PAD * 2;
const IMG_SIZE = 96;

interface Props {
  ad: HomeAd;
  onPress: () => void;
  onWhyAdPress?: () => void;
}

const HomeAdBanner = memo(({ ad, onPress, onWhyAdPress }: Props) => {
  const { t } = useTranslation();

  return (
      <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.88}
          style={styles.card}
      >
        <View style={styles.imageWrap}>
          {ad.imageUri ? (
              <CachedImage uri={ad.imageUri} style={styles.image} resizeMode="cover" />
          ) : (
              <View style={styles.placeholder}>
                <TattooPlaceholderIcon size={38} color="#2e2e2e" />
              </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>AD</Text>
            </View>
            <Text style={styles.category} numberOfLines={1}>{ad.category}</Text>

            {/* 🚨 1. onWhyAdPress가 있을 때만 '광고 안내' 버튼 렌더링 */}
            {onWhyAdPress && (
                <TouchableOpacity
                    onPress={(e) => {
                      // 🚨 2. 자식 버튼을 눌렀을 때 부모(전체 카드)의 onPress가 같이 실행되는 것을 방지
                      e.stopPropagation();
                      onWhyAdPress();
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    activeOpacity={0.7}
                    style={styles.whyBtn}
                >
                  <Text style={styles.whyText}>{t('common.adInfo')}</Text>
                </TouchableOpacity>
            )}
          </View>

          <Text style={styles.title} numberOfLines={2}>{ad.title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{ad.subtitle}</Text>

          <View style={styles.bottomRow}>
            <Text style={styles.advertiser} numberOfLines={1}>{ad.advertiserName}</Text>
            {ad.location && (
                <>
                  <View style={styles.dot} />
                  <LocationPinIcon size={11} color={COLORS.gray} />
                  <Text style={styles.location} numberOfLines={1}>{ad.location}</Text>
                </>
            )}
            {ad.priceLabel && (
                <>
                  <View style={styles.dot} />
                  <Text style={styles.price} numberOfLines={1}>{ad.priceLabel}</Text>
                </>
            )}
          </View>
        </View>

        <View style={styles.chevWrap}>
          <ChevronRightIcon size={16} color={COLORS.gray} />
        </View>
      </TouchableOpacity>
  );
});

HomeAdBanner.displayName = 'HomeAdBanner';
export default HomeAdBanner;

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.35)',
    padding: 12,
    marginHorizontal: H_PAD,
    marginBottom: 12,
    gap: 12,
  },
  imageWrap: {
    width: IMG_SIZE,
    height: IMG_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
  },
  image: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  adBadge: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  adBadgeText: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
    letterSpacing: 0.4,
  },
  category: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    flex: 1,
  },
  whyBtn: {
    paddingHorizontal: 2,
  },
  whyText: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.gray,
  },
  title: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  advertiser: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    maxWidth: '55%',
  },
  dot: {
    width: 2, height: 2, borderRadius: 1,
    backgroundColor: COLORS.gray,
    marginHorizontal: 2,
  },
  location: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  price: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  chevWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
});