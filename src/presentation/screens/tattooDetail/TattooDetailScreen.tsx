import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, ShareIcon, HeartIcon, ChevronRightIcon,
  StarIcon,
} from '../../components/icons';
import PagerCarousel, { PagerDots } from '../../components/common/PagerCarousel';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import BookingBottomSheet from '../../components/booking/BookingBottomSheet';

const { width: W, height: H } = Dimensions.get('window');
const IMAGE_HEIGHT = H * 0.5;

type DetailRoute = RouteProp<RootStackParamList, 'TattooDetail'>;
type DetailNav = NativeStackNavigationProp<RootStackParamList>;

const TattooDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { tattoo } = route.params;

  const [liked, setLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingVisible, setBookingVisible] = useState(false);

  const handleArtistPress = useCallback(() => {
    navigation.navigate('ArtistProfile', { artist: tattoo.artist });
  }, [navigation, tattoo.artist]);

  const formatPrice = (price: number) => {
    if (price >= 10000) {
      return `${Math.floor(price / 10000).toLocaleString()}만원~`;
    }
    return `${price.toLocaleString()}원~`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.imageContainer}>
        <PagerCarousel
          data={tattoo.images}
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
            >
              <ShareIcon size={22} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLiked((v) => !v)}
              style={styles.overlayBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <HeartIcon size={22} color={liked ? COLORS.gold : COLORS.white} filled={liked} />
            </TouchableOpacity>
          </View>
        </View>

        {tattoo.images.length > 1 && (
          <View style={styles.dotsAbs}>
            <PagerDots count={tattoo.images.length} activeIndex={activeImage} />
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        <Text style={styles.title}>{tattoo.title}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>예상가</Text>
          <Text style={styles.price}>{formatPrice(tattoo.minPrice)}</Text>
        </View>

        <View style={styles.tagsRow}>
          {tattoo.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.description}>{tattoo.description}</Text>

        <TouchableOpacity
          onPress={handleArtistPress}
          style={styles.artistCard}
          activeOpacity={0.85}
        >
          <View style={styles.artistCardLeft}>
            <View style={styles.artistAvatarWrapper}>
              {tattoo.artist.profileImage ? (
                <Image
                  source={{ uri: tattoo.artist.profileImage }}
                  style={styles.artistAvatar}
                  resizeMode="cover"
                />
              ) : null}
            </View>
            <View style={styles.artistCardInfo}>
              <Text style={styles.artistCardLabel}>타투이스트</Text>
              <Text style={styles.artistCardName}>{tattoo.artist.nickname}</Text>
              <View style={styles.artistRatingRow}>
                <StarIcon size={13} color={COLORS.gold} filled />
                <Text style={styles.artistRating}>
                  {tattoo.artist.rating} (리뷰 {tattoo.artist.reviewCount})
                </Text>
              </View>
            </View>
          </View>
          <ChevronRightIcon size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.85}
          onPress={() => setBookingVisible(true)}
        >
          <Text style={styles.ctaText}>이 도안으로 1:1 상담하기</Text>
        </TouchableOpacity>
      </View>

      <BookingBottomSheet
        visible={bookingVisible}
        artistPageId={tattoo.artist.id}
        artistName={tattoo.artist.nickname}
        artistKakaoLink={tattoo.artist.kakaoLink}
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
