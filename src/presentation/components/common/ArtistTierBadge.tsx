import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { useTranslation } from '../../store/languageStore';

interface Props {
  // 'main' = 메인 아티스트(파운딩 6인)
  tier?: 'main' | 'general' | 'beginner' | null;
  isSelectedMaster?: boolean | null;
  // Root's Pick — Selected Master 와 별개의 큐레이션
  isRootsPick?: boolean | null;
  size?: 'sm' | 'md';
}

/**
 * [18] 아티스트 등급 배지 — 메인 아티스트(파운딩)·셀렉티드 마스터·루트픽을 각각 구분해 노출.
 * 셋 다 없으면 아무것도 렌더링하지 않는다.
 */
const ArtistTierBadge = memo(({ tier, isSelectedMaster, isRootsPick, size = 'md' }: Props) => {
  const { t } = useTranslation();
  const isMain = tier === 'main';
  if (!isMain && !isSelectedMaster && !isRootsPick) return null;
  const sm = size === 'sm';

  return (
    <View style={styles.row}>
      {isMain && (
        <View style={[styles.badge, styles.mainBadge, sm && styles.badgeSm]}>
          <Text style={[styles.text, styles.mainText, sm && styles.textSm]}>
            {t('artistProfile.badgeMainArtist' as any)}
          </Text>
        </View>
      )}
      {isRootsPick && (
        <View style={[styles.badge, styles.rootsBadge, sm && styles.badgeSm]}>
          <Text style={[styles.text, styles.rootsText, sm && styles.textSm]}>
            {t('artistProfile.badgeRootsPick' as any)}
          </Text>
        </View>
      )}
      {isSelectedMaster && (
        <View style={[styles.badge, styles.smBadge, sm && styles.badgeSm]}>
          <Text style={[styles.text, styles.smText, sm && styles.textSm]}>
            {t('artistProfile.badgeSelectedMaster' as any)}
          </Text>
        </View>
      )}
    </View>
  );
});
ArtistTierBadge.displayName = 'ArtistTierBadge';
export default ArtistTierBadge;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  mainBadge: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.gold,
  },
  smBadge: {
    borderColor: 'rgba(212,168,67,0.6)',
    backgroundColor: 'rgba(212,168,67,0.12)',
  },
  rootsBadge: {
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 14,
  },
  textSm: {
    fontSize: 9,
    lineHeight: 12,
  },
  mainText: {
    color: COLORS.black,
  },
  smText: {
    color: COLORS.gold,
  },
  rootsText: {
    color: COLORS.white,
  },
});
