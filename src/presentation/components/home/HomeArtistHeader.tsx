import React, { memo, useCallback, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
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
// 🚨 1. 화면 포커스 감지를 위해 추가
import { useFocusEffect } from '@react-navigation/native';

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

  // 🚨 2. reload 함수를 꺼내줍니다.
  const { data, reload } = useApi(async () => (await artistApi.selectedMasters()).map(toArtist), []);
  const artists = data ?? [];
  const activeRef = useRef(0);

  // 🚨 3. 화면(탭)에 다시 돌아올 때마다 조용히 최신 데이터를 불러옵니다.
  const hasFocused = useRef(false);
  useFocusEffect(
      useCallback(() => {
        if (!hasFocused.current) {
          hasFocused.current = true;
          return; // 첫 렌더링은 useApi가 처리하므로 무시
        }
        reload();
      }, [reload])
  );

  const settings = usePublicSettings();
  const bannerTitle = settings.homeBannerTitle || t('home.bannerTitle');
  const bannerSub = settings.homeBannerSubtitle || t('home.bannerSubtitle');
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
  ), [activeIdx, onArtistPress, artists.length]);

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
            // 🚨 4. 카드가 딱딱 예쁘게 물리도록 스냅 속성 추가 (UX 개선)
            snapToInterval={ARTIST_CARD_WIDTH + ARTIST_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
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

        {/* 🚨 5. 광고/배너 설정이 켜져 있을 때만 렌더링되도록 방어막 추가 */}
        {(settings.homeBannerImage || settings.homeBannerTitle) && (
            <ScreenBanner
                imageUrl={settings.homeBannerImage || undefined}
                title={bannerTitle}
                subtitle={bannerSub}
                ctaLabel={t('home.bannerCta')}
                linkUrl={settings.homeBannerUrl || undefined}
                onPress={handleBanner}
            />
        )}
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