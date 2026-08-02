import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { ArtistPromoBanner } from '../../../domain/entities/artistAdTypes';

interface Props {
  banner: ArtistPromoBanner;
  onPress: () => void;
}

const PromoBanner = memo(({ banner, onPress }: Props) => (
  <View style={styles.card}>
    <View style={styles.body}>
      <Text style={styles.title}>{banner.title}</Text>
      <Text style={styles.desc} numberOfLines={2}>{banner.description}</Text>
    </View>
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.ctaBtn}
    >
      <Text style={styles.ctaText}>{banner.ctaLabel}</Text>
      <View style={styles.ctaUnderline} />
    </TouchableOpacity>
  </View>
));
PromoBanner.displayName = 'PromoBanner';
export default PromoBanner;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  desc: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  ctaBtn: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  ctaText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  ctaUnderline: {
    height: 1,
    backgroundColor: COLORS.gold,
    marginTop: 2,
    alignSelf: 'stretch',
  },
});
