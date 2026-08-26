import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, StatusBar, Share, // 🚨 Share 모듈 추가
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { useTranslation } from '../../store/languageStore';
import {
  BackArrowIcon, ShareIcon, HeartIcon, ChevronRightIcon,
  StarIcon, PersonSilhouette, // 🚨 기본 프로필 아이콘 추가
} from '../../components/icons';
import PagerCarousel, { PagerDots } from '../../components/common/PagerCarousel';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import BookingBottomSheet from '../../components/booking/BookingBottomSheet';
import { favoriteApi } from '../../../data/api';
import { artistTagLabels } from '../../../domain/entities/artistTags';
import { translateTag, translateSizePreset } from '../../utils/tagTranslations';
import { useToast } from '../../components/common/Toast'; // 🚨 토스트 알림 추가

const { width: W, height: H } = Dimensions.get('window');
const IMAGE_HEIGHT = H * 0.5;

type DetailRoute = RouteProp<RootStackParamList, 'TattooDetail'>;
type DetailNav = NativeStackNavigationProp<RootStackParamList>;

const TattooDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { tattoo } = route.params;

  const { t, language } = useTranslation();
  const { toast } = useToast(); // 🚨 토스트 훅 초기화
  const [liked, setLiked] = useState(tattoo.isBookmarked ?? false); // 초기값 안전하게 처리
  const [likeLoading, setLikeLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingVisible, setBookingVisible] = useState(false);

  // 🚨 1. 공유하기 기능 연결
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `[T:ROOT] ${tattoo.title}\nhttps://t-root.app/tattoo/${tattoo.id}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }, [tattoo.title, tattoo.id]);

  // 🚨 2. 찜하기 API 연동 및 토스트 알림 추가
  const handleToggleLike = useCallback(async () => {
    if (likeLoading) return;
    const next = !liked;
    setLiked(next); // 낙관적 업데이트
    setLikeLoading(true);

    // 알림 표시 (TS2345 방어를 위해 as any 사용)
    toast(next ? t('common.bookmarked' as any) : t('common.unbookmarked' as any), {
      variant: next ? 'success' : 'default',
    });

    try {
      await favoriteApi.toggle('artwork', tattoo.id);
    } catch {
      setLiked(!next); // 실패 시 롤백
      toast(t('common.error' as any), { variant: 'error' });
    } finally {
      setLikeLoading(false);
    }
  }, [liked, likeLoading, tattoo.id, toast, t]);

  const handleArtistPress = useCallback(() => {
    navigation.navigate('ArtistProfile', { artist: tattoo.artist });
  }, [navigation, tattoo.artist]);

  const formatPrice = (price: number) => {
    if (language === 'ko') {
      if (price >= 10000) {
        return `${Math.floor(price / 10000).toLocaleString()}만원~`;
      }
      return `${price.toLocaleString()}원~`;
    }
    return `₩${price.toLocaleString()}~`;
  };

  return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.imageContainer}>
          <PagerCarousel
              data={tattoo.images ?? []} // 🚨 방어: images가 없을 경우 대비
              width={W}
              height={IMAGE_HEIGHT}
              renderItem={(img) =>
                  img ? (
                      <Image source={{ uri: img }} style={styles.heroImage} resizeMode="cover" />
                  ) : (
                      <View style={[styles.heroImage, { backgroundColor: COLORS.card }]} />
                  )
              }
              onIndexChange={setActiveImage}
              keyExtractor={(_, i) => `hero-${i}`}
          />

          <View style={[styles.imageOverlay, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.overlayBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BackArrowIcon size={22} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.overlayRight}>
              <TouchableOpacity
                  style={styles.overlayBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={handleShare} // 🚨 공유 기능 연결
              >
                <ShareIcon size={22} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                  onPress={handleToggleLike}
                  style={styles.overlayBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <HeartIcon size={22} color={liked ? COLORS.gold : COLORS.white} filled={liked} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 🚨 방어: images 배열 길이 안전하게 체크 */}
          {(tattoo.images?.length ?? 0) > 1 && (
              <View style={styles.dotsAbs}>
                <PagerDots count={tattoo.images.length} activeIndex={activeImage} />
              </View>
          )}
        </View>

        <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            // 🚨 3. 하단 시스템 버튼 가림 방지 (안전 여백 추가)
            contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 90 }]}
        >
          <Text style={styles.title}>
            {language === 'en' && tattoo.titleEn ? tattoo.titleEn : tattoo.title}
          </Text>

          {tattoo.minPrice > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('artist.estimatedPrice' as any)}</Text>
                <Text style={styles.price}>{formatPrice(tattoo.minPrice)}</Text>
              </View>
          )}

          {/* 🚨 방어: 배열이 존재하는지 확인 후 매핑 (?. 추가) */}
          {((tattoo.genres?.length ?? 0) > 0 || (tattoo.bodyParts?.length ?? 0) > 0 || tattoo.sizePreset) && (
              <View style={styles.tagsRow}>
                {tattoo.genres?.map((g) => (
                    <View key={`g-${g}`} style={styles.tag}>
                      <Text style={styles.tagText}>{translateTag(g, language)}</Text>
                    </View>
                ))}
                {tattoo.bodyParts?.map((b) => (
                    <View key={`b-${b}`} style={[styles.tag, styles.tagBodyPart]}>
                      <Text style={styles.tagText}>{translateTag(b, language)}</Text>
                    </View>
                ))}
                {tattoo.sizePreset ? (
                    <View style={[styles.tag, styles.tagSize]}>
                      <Text style={styles.tagText}>{translateSizePreset(tattoo.sizePreset, language)}</Text>
                    </View>
                ) : null}
              </View>
          )}

          {!!(language === 'en' && tattoo.descriptionEn ? tattoo.descriptionEn : tattoo.description) && (
              <Text style={styles.description}>
                {language === 'en' && tattoo.descriptionEn ? tattoo.descriptionEn : tattoo.description}
              </Text>
          )}

          <TouchableOpacity
              onPress={handleArtistPress}
              style={styles.artistCard}
              activeOpacity={0.85}
          >
            <View style={styles.artistCardLeft}>
              {/* 🚨 4. 아티스트 프로필 이미지가 없을 때의 Fallback 아이콘 적용 */}
              <View style={styles.artistAvatarWrapper}>
                {tattoo.artist?.profileImage ? (
                    <Image
                        source={{ uri: tattoo.artist.profileImage }}
                        style={styles.artistAvatar}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.fallbackAvatar}>
                      <PersonSilhouette size={34} color="#3a3a3a" />
                    </View>
                )}
              </View>
              <View style={styles.artistCardInfo}>
                <Text style={styles.artistCardLabel}>{t('booking.tattooist' as any)}</Text>
                <Text style={styles.artistCardName}>{tattoo.artist?.nickname}</Text>
                <View style={styles.artistRatingRow}>
                  <StarIcon size={13} color={COLORS.gold} filled />
                  <Text style={styles.artistRating}>
                    {tattoo.artist?.rating} {t('shop.reviewCountFmt' as any, { count: tattoo.artist?.reviewCount ?? 0 })}
                  </Text>
                </View>
                {artistTagLabels(tattoo.artist?.tags ?? [], language).length > 0 && (
                    <Text style={styles.artistTags} numberOfLines={1}>
                      {artistTagLabels(tattoo.artist.tags, language).join(' · ')}
                    </Text>
                )}
              </View>
            </View>
            <ChevronRightIcon size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </ScrollView>

        {/* 🚨 하단 여백 보장 적용 */}
        <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
              style={styles.ctaBtn}
              activeOpacity={0.85}
              onPress={() => setBookingVisible(true)}
          >
            <Text style={styles.ctaText}>{t('artist.consultWithDesign' as any)}</Text>
          </TouchableOpacity>
        </View>

        <BookingBottomSheet
            visible={bookingVisible}
            artistPageId={tattoo.artist?.id ?? ''}
            artistName={tattoo.artist?.nickname ?? ''}
            artistKakaoLink={tattoo.artist?.kakaoLink ?? ''}
            artworkId={tattoo.id}
            designTitle={tattoo.title}
            onClose={() => setBookingVisible(false)}
        />
      </View>
  );
};

export default TattooDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: W,
    height: IMAGE_HEIGHT,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  overlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayRight: {
    flexDirection: 'row',
    gap: 10,
  },
  dotsAbs: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
  },
  priceRow: {
    gap: 2,
  },
  priceLabel: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  price: {
    color: COLORS.gold,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  tagBodyPart: {
    borderColor: '#5A8A6A',
  },
  tagSize: {
    borderColor: COLORS.gold,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
  },
  description: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
  },
  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  artistCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexShrink: 1,
  },
  artistAvatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  artistAvatar: {
    width: '100%',
    height: '100%',
  },
  fallbackAvatar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistCardInfo: {
    gap: 2,
  },
  artistCardLabel: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 16,
  },
  artistCardName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  artistRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  artistRating: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
  },
  artistTags: {
    color: COLORS.gold,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 3,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ctaBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
});