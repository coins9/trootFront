import React, { memo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Dimensions, Image,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { ArrowRightIcon } from '../icons';

const { width: W } = Dimensions.get('window');
const SIDE_PAD = 16;
const BANNER_HEIGHT = 100;

interface Props {
  /** WebP 이미지 URL. 있으면 이미지 배너, 없으면 텍스트 배너로 표시 */
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  linkUrl?: string;
  onPress?: () => void;
}

const ScreenBanner = memo(({
  imageUrl, title, subtitle, ctaLabel, linkUrl, onPress,
}: Props) => {
  if (!imageUrl && !title) return null;

  const handlePress = () => {
    if (linkUrl) {
      Linking.openURL(linkUrl).catch(() => {});
    } else {
      onPress?.();
    }
  };

  if (imageUrl) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.92}
        style={styles.imageWrap}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={styles.textBanner}
    >
      <View style={styles.textLeft}>
        {title ? (
          <Text style={styles.textTitle} numberOfLines={1}>{title}</Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.textSub} numberOfLines={1}>{subtitle}</Text>
        ) : null}
        <View style={styles.ctaRow}>
          <Text style={styles.ctaLabel}>{ctaLabel}</Text>
          <ArrowRightIcon size={13} color={COLORS.gold} strokeWidth={2} />
        </View>
      </View>
      <View style={styles.deco} pointerEvents="none" />
    </TouchableOpacity>
  );
});

ScreenBanner.displayName = 'ScreenBanner';
export default ScreenBanner;

const styles = StyleSheet.create({
  imageWrap: {
    marginHorizontal: SIDE_PAD,
    marginTop: 6,
    marginBottom: 4,
    borderRadius: 14,
    overflow: 'hidden',
    height: BANNER_HEIGHT,
  },
  image: {
    width: W - SIDE_PAD * 2,
    height: BANNER_HEIGHT,
  },
  textBanner: {
    marginHorizontal: SIDE_PAD,
    marginTop: 6,
    marginBottom: 4,
    height: BANNER_HEIGHT,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.35)',
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  textLeft: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-around',
    zIndex: 2,
  },
  textTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  textSub: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 16,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  deco: {
    position: 'absolute',
    right: -30,
    top: -20,
    bottom: -20,
    width: 200,
    backgroundColor: 'rgba(212,168,67,0.06)',
    transform: [{ rotate: '20deg' }],
  },
});
