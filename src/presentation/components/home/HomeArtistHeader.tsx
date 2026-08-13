import React, { memo, useCallback, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Dimensions, TouchableOpacity,
  NativeScrollEvent, NativeSyntheticEvent, Image, Linking,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import ArtistCard from './ArtistCard';
import { useApi } from '../../hooks/useApi';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { artistApi } from '../../../data/api';
import { toArtist } from '../../../data/api/mappers';
import { Artist } from '../../../domain/entities/types';
import { ArrowRightIcon } from '../icons';

const { width: W } = Dimensions.get('window');
const ARTIST_CARD_WIDTH = 130;
const ARTIST_GAP = 8;
const SIDE_PAD = 16;

interface Props {
  onArtistPress: (artist: Artist) => void;
  onBannerPress?: () => void;
}

const HomeArtistHeader = memo(({ onArtistPress, onBannerPress }: Props) => {
  const [activeIdx, setActiveIdx] = useState(0);

  // 홈 상단 Selected Master — 서버 캐시가 걸려 있어 자주 호출해도 부담이 적다
  const { data } = useApi(async () => (await artistApi.selectedMasters()).map(toArtist), []);
  const artists = data ?? [];
  const activeRef = useRef(0);

  // 루트 배너 — 관리자 설정(API)에서 내려온 값, 없으면 기본 문구
  const settings = usePublicSettings();
  const bannerTitle = settings.homeBannerTitle || '이번 주 추천 작가';
  const bannerSub = settings.homeBannerSubtitle || '지금 인기 아티스트와 상담해보세요';
  const handleBanner = useCallback(() => {
    if (settings.homeBannerUrl) {
      Linking.openURL(settings.homeBannerUrl).catch(() => {});
    } else {
      onBannerPress?.();
    }
  }, [settings.homeBannerUrl, onBannerPress]);

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
        <Text style={styles.countText}>전체 {artists.length}명</Text>
      </View>

      {/* Feature banner - 이번 주 추천 작가 */}
      <TouchableOpacity
        onPress={handleBanner}
        activeOpacity={0.9}
        style={styles.banner}
      >
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerLabel}>루트 배너</Text>
          <Text style={styles.bannerTitle} numberOfLines={1}>{bannerTitle}</Text>
          <Text style={styles.bannerSub} numberOfLines={1}>{bannerSub}</Text>
          <View style={styles.bannerCtaRow}>
            <Text style={styles.bannerCta}>바로 보기</Text>
            <ArrowRightIcon size={14} color={COLORS.gold} strokeWidth={2} />
          </View>
        </View>
        <View style={styles.bannerDeco} pointerEvents="none" />
      </TouchableOpacity>
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

  /* Banner */
  banner: {
    marginHorizontal: SIDE_PAD,
    marginTop: 6,
    marginBottom: 4,
    height: 100,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.35)',
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  bannerLeft: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  bannerLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    lineHeight: 14,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
    marginTop: 2,
  },
  bannerSub: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  bannerCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerCta: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    letterSpacing: 0.5,
  },
  bannerDeco: {
    position: 'absolute',
    right: -30,
    top: -20,
    bottom: -20,
    width: 200,
    backgroundColor: 'rgba(212,168,67,0.06)',
    transform: [{ rotate: '20deg' }],
  },
});
