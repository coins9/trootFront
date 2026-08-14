import React, { memo, useCallback, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Dimensions,
  NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import ArtistCard from './ArtistCard';
import ScreenBanner from '../common/ScreenBanner';
import { useApi } from '../../hooks/useApi';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { artistApi } from '../../../data/api';
import { toArtist } from '../../../data/api/mappers';
import { Artist } from '../../../domain/entities/types';
import { useTranslation } from '../../store/languageStore';

const { width: W } = Dimensions.get('window');
const ARTIST_CARD_WIDTH = 130;
const ARTIST_GAP = 8;
const SIDE_PAD = 16;

interface Props {
  onArtistPress: (artist: Artist) => void;
  onBannerPress?: () => void;
}

const HomeArtistHeader = memo(({ onArtistPress, onBannerPress }: Props) => {
  const { t } = useTranslation();
  const [activeIdx, setActiveIdx] = useState(0);

  // 홈 상단 Selected Master — 서버 캐시가 걸려 있어 자주 호출해도 부담이 적다
  const { data } = useApi(async () => (await artistApi.selectedMasters()).map(toArtist), []);
  const artists = data ?? [];
  const activeRef = useRef(0);

  const settings = usePublicSettings();
  const bannerTitle = settings.homeBannerTitle || '이번 주 추천 작가';
  const bannerSub = settings.homeBannerSubtitle || '지금 인기 아티스트와 상담해보세요';
  const handleBanner = useCallback(() => {
    onBannerPress?.();
  }, [onBannerPress]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (ARTIST_CARD_WIDTH + ARTIST_GAP));
    if (idx !== activeRef.current) {
      activeRef.current = idx;
      setActiveIdx(idx);
    }
  }, []);

  const renderItem = useCallback(({ item, index }: { item: Artist; index: number }) => (
    <View style={{ marginRight: index === artists.length - 1 ? 0 : ARTIST_GAP }}>
      <ArtistCard
        artist={item}
        isActive={index === activeIdx}
        onPress={() => onArtistPress(item)}
      />
    </View>
  ), [activeIdx, onArtistPress]);

  return (
    <View>
      <FlatList
        data={artists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.artistList}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="normal"
      />

      <View style={styles.dotsRow}>
        <View style={styles.dotsGroup}>
          {artists.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIdx && styles.dotActive]}
            />
          ))}
        </View>
        <Text style={styles.countText}>{t('home.totalArtists').replace('{{count}}', String(artists.length))}</Text>
      </View>

      <ScreenBanner
        imageUrl={settings.homeBannerImage || undefined}
        title={bannerTitle}
        subtitle={bannerSub}
        linkUrl={settings.homeBannerUrl || undefined}
        onPress={handleBanner}
      />
    </View>
  );
});

HomeArtistHeader.displayName = 'HomeArtistHeader';
export default HomeArtistHeader;

const styles = StyleSheet.create({
  artistList: {
    paddingLeft: SIDE_PAD,
    paddingRight: SIDE_PAD,
    paddingVertical: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 10,
  },
  dotsGroup: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray3,
  },
  dotActive: {
    backgroundColor: COLORS.gold,
    width: 18,
  },
  countText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },

});
