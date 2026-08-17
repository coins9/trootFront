import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, FlatList, StyleSheet, TouchableOpacity,
  Image, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import {
  BackArrowIcon, StarIcon, PersonSilhouette, TattooPlaceholderIcon,
  LocationPinIcon, CalendarIcon, PaletteIcon,
  CameraSolidIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import {
  WritableReview, WrittenReview, RATING_LABELS,
} from '../../../domain/entities/reviewTypes';
import { useApi, usePagedApi } from '../../hooks/useApi';
import {
  reservationApi, reviewApi,
  type ReviewableItem, type ReviewWithArtist,
} from '../../../data/api';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TabKey = 'writable' | 'written';

/* ---- Mappers ---- */
function toWritable(item: ReviewableItem, locationDefault: string): WritableReview {
  const scheduled = new Date(item.scheduledAt);
  const completedAt = new Date(item.updatedAt);
  const daysLeft = Math.max(0, 14 - Math.floor((Date.now() - completedAt.getTime()) / 86_400_000));
  const regionParts = [item.artist?.regionSido, item.artist?.regionSigungu].filter(Boolean);
  return {
    id: item.id,
    artist: {
      id: item.artist?.id ?? item.artistPageId,
      nickname: item.artist?.pageName ?? '',
      handle: item.artist?.pageName ? `@${item.artist.pageName}` : '',
      location: regionParts.join(' ') || locationDefault,
      avatarUri: item.artist?.profileImage ?? '',
    },
    procedureDate: scheduled.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
    procedureTime: scheduled.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    bodyPart: item.bodyPart ?? '',
    style: item.sizePreset ?? '',
    daysLeft,
  };
}

function toWritten(r: ReviewWithArtist, locationDefault: string): WrittenReview {
  const regionParts = [r.artist?.regionSido, r.artist?.regionSigungu].filter(Boolean);
  return {
    id: r.id,
    artist: {
      id: r.artist?.id ?? r.artistPageId,
      nickname: r.artist?.pageName ?? '',
      handle: r.artist?.pageName ? `@${r.artist.pageName}` : '',
      location: regionParts.join(' ') || locationDefault,
      avatarUri: r.artist?.profileImage ?? '',
    },
    writtenDate: new Date(r.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
    photos: [...r.images, ...r.healedImages],
    ratings: {
      pain: r.painScore,
      kindness: r.kindnessScore,
      hygiene: r.hygieneScore,
      satisfaction: r.satisfactionScore,
    },
    text: r.body,
    canAddHealedPhoto: r.healedImages.length === 0,
  };
}

const { width: W } = Dimensions.get('window');
const H_PAD = 16;
const CARD_INNER = 16;
const GALLERY_W = W - H_PAD * 2 - CARD_INNER * 2;
const GALLERY_H = Math.round(GALLERY_W * 0.72);

/* ------------- Rating stars ------------- */
const RatingStars = React.memo(({ value }: { value: number }) => (
  <View style={styles.starsRow}>
    {[1, 2, 3, 4, 5].map((n) => (
      <StarIcon
        key={n}
        size={16}
        color={COLORS.gold}
        filled={n <= value}
      />
    ))}
  </View>
));
RatingStars.displayName = 'RatingStars';

/* ------------- Writable card ------------- */
interface WritableCardProps {
  review: WritableReview;
  onWrite: () => void;
}
const WritableCard = React.memo(({ review, onWrite }: WritableCardProps) => {
  const { t } = useTranslation();
  return (
  <View style={styles.card}>
    <View style={styles.writableHeader}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{t('review.badge')}</Text>
      </View>
      <Text style={styles.dLeft}>D-{review.daysLeft}</Text>
    </View>

    <View style={styles.artistRow}>
      <View style={styles.avatar}>
        {review.artist.avatarUri ? (
          <Image source={{ uri: review.artist.avatarUri }} style={styles.avatarImg} />
        ) : (
          <PersonSilhouette size={54} color="#3a3a3a" />
        )}
      </View>
      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={1}>{review.artist.nickname}</Text>
        <Text style={styles.artistHandle} numberOfLines={1}>{review.artist.handle}</Text>
        <View style={styles.locRow}>
          <LocationPinIcon size={13} color={COLORS.gray} />
          <Text style={styles.locText} numberOfLines={1}>{review.artist.location}</Text>
        </View>
      </View>
    </View>

    <View style={styles.divider} />

    <View style={styles.metaRow}>
      <CalendarIcon size={16} color={COLORS.gold} strokeWidth={1.7} />
      <Text style={styles.metaLabel}>{t('review.procedureDate')}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>
        {review.procedureDate}  {review.procedureTime}
      </Text>
    </View>
    <View style={styles.metaRow}>
      <PaletteIcon size={16} color={COLORS.gold} strokeWidth={1.7} />
      <Text style={styles.metaLabel}>{t('review.bodyPart')}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>
        {review.bodyPart} · {review.style}
      </Text>
    </View>


    <TouchableOpacity
      onPress={onWrite}
      activeOpacity={0.85}
      style={styles.writeBtn}
    >
      <Text style={styles.writeBtnText}>{t('review.writeBtn')}</Text>
    </TouchableOpacity>
  </View>
  );
});
WritableCard.displayName = 'WritableCard';

/* ------------- Written card ------------- */
interface WrittenCardProps {
  review: WrittenReview;
  onAddHealed: () => void;
}
const WrittenCard = React.memo(({ review, onAddHealed }: WrittenCardProps) => {
  const { t } = useTranslation();
  return (
  <View style={styles.card}>
    <View style={styles.writtenHeader}>
      <View style={styles.avatar}>
        {review.artist.avatarUri ? (
          <Image source={{ uri: review.artist.avatarUri }} style={styles.avatarImg} />
        ) : (
          <PersonSilhouette size={54} color="#3a3a3a" />
        )}
      </View>
      <View style={styles.writtenHeaderText}>
        <Text style={styles.artistName}>{review.artist.nickname}</Text>
        <Text style={styles.writtenDate}>{review.writtenDate}</Text>
      </View>
    </View>

    <FlatList
      data={review.photos}
      keyExtractor={(_, i) => `${review.id}-p${i}`}
      renderItem={({ item }) => (
        <View style={styles.galleryItem}>
          {item ? (
            <Image source={{ uri: item }} style={styles.galleryImg} resizeMode="cover" />
          ) : (
            <View style={styles.galleryPlaceholder}>
              <TattooPlaceholderIcon size={72} color="#2e2e2e" />
            </View>
          )}
        </View>
      )}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      snapToInterval={GALLERY_W}
      decelerationRate="fast"
      style={styles.galleryList}
    />

    <View style={styles.ratingsBlock}>
      {RATING_LABELS.map((r, i) => (
        <View
          key={r.key}
          style={[styles.ratingRow, i === RATING_LABELS.length - 1 && styles.ratingRowLast]}
        >
          <Text style={styles.ratingLabel}>{r.label}</Text>
          <RatingStars value={review.ratings[r.key]} />
        </View>
      ))}
    </View>

    <Text style={styles.reviewText}>{review.text}</Text>

    {review.canAddHealedPhoto && (
      <TouchableOpacity
        onPress={onAddHealed}
        activeOpacity={0.85}
        style={styles.healedBtn}
      >
        <CameraSolidIcon size={18} color={COLORS.black} strokeWidth={1.7} />
        <Text style={styles.healedText}>{t('review.healedBtn')}</Text>
      </TouchableOpacity>
    )}
  </View>
  );
});
WrittenCard.displayName = 'WrittenCard';

/* ------------- Screen ------------- */
const TattooReviewScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>('writable');

  const { data: writableRaw, loading: writableLoading } = useApi(() => reservationApi.reviewable(), []);
  const { items: writtenRaw, loading: writtenLoading, loadingMore: writtenMore, loadMore: loadMoreWritten } =
    usePagedApi((cursor) => reviewApi.mine({ cursor }), []);

  const writable = useMemo(() => {
    const locationDefault = t('reservation.locationDefault');
    return (writableRaw ?? []).map((item) => toWritable(item, locationDefault));
  }, [writableRaw, t]);
  const written = useMemo(() => {
    const locationDefault = t('reservation.locationDefault');
    return writtenRaw.map((r) => toWritten(r, locationDefault));
  }, [writtenRaw, t]);

  const handleWrite = useCallback((review: WritableReview) => {
    navigation.navigate('ReviewWrite', { review });
  }, [navigation]);

  const handleAddHealed = useCallback((review: WrittenReview) => {
    toast(
      t('review.healedComingSoon').replace('{{name}}', review.artist.nickname),
      { variant: 'success' },
    );
  }, [toast, t]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />

      <View style={styles.subHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <BackArrowIcon size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('review.title')}</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab('writable')}
          activeOpacity={0.75}
          style={styles.tabBtn}
        >
          <View style={styles.tabLabelWrap}>
            <Text style={[styles.tabText, tab === 'writable' && styles.tabTextActive]}>
              {t('review.tabWritable')}
            </Text>
            {writable.length > 0 && (
              <View style={[styles.countBadge, tab === 'writable' && styles.countBadgeActive]}>
                <Text style={[styles.countBadgeText, tab === 'writable' && styles.countBadgeTextActive]}>
                  {writable.length}
                </Text>
              </View>
            )}
          </View>
          {tab === 'writable' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('written')}
          activeOpacity={0.75}
          style={styles.tabBtn}
        >
          <View style={styles.tabLabelWrap}>
            <Text style={[styles.tabText, tab === 'written' && styles.tabTextActive]}>
              {t('review.tabWritten')}
            </Text>
          </View>
          {tab === 'written' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          if (tab !== 'written') return;
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 200) {
            loadMoreWritten();
          }
        }}
        scrollEventThrottle={400}
      >
        {tab === 'writable' ? (
          <>
            {writableLoading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{t('common.loading')}</Text>
              </View>
            ) : writable.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{t('review.emptyWritable')}</Text>
              </View>
            ) : (
              writable.map((r) => (
                <WritableCard
                  key={r.id}
                  review={r}
                  onWrite={() => handleWrite(r)}
                />
              ))
            )}
          </>
        ) : (
          writtenLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('common.loading')}</Text>
            </View>
          ) : written.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('review.empty')}</Text>
            </View>
          ) : (
            <>
              {written.map((r) => (
                <WrittenCard
                  key={r.id}
                  review={r}
                  onAddHealed={() => handleAddHealed(r)}
                />
              ))}
              {writtenMore && (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>{t('common.loading')}</Text>
                </View>
              )}
            </>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TattooReviewScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.black,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginLeft: 4,
  },

  /* Tabs */
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  tabLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  tabTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: COLORS.gold,
  },
  countBadgeText: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  countBadgeTextActive: {
    color: COLORS.black,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: COLORS.gold,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: H_PAD,
    paddingVertical: 20,
    gap: 14,
  },

  /* Card shell */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: CARD_INNER,
  },

  /* Writable */
  writableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'transparent',
  },
  badgeText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  dLeft: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  artistInfo: { flex: 1, gap: 3 },
  artistName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  artistHandle: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metaLabel: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
    width: 62,
  },
  metaValue: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    flexShrink: 1,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 14,
    marginBottom: 8,
  },
  guideBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 16,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  guideText: {
    flex: 1,
    gap: 2,
  },
  guideLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  guideDesc: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },

  writeBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeBtnText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },

  /* Written */
  writtenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  writtenHeaderText: {
    flex: 1,
    gap: 4,
  },
  writtenDate: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  galleryList: {
    marginHorizontal: -CARD_INNER + H_PAD,
    marginBottom: 14,
  },
  galleryItem: {
    width: GALLERY_W,
    height: GALLERY_H,
    marginRight: 8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
  },
  galleryImg: { width: '100%', height: '100%' },
  galleryPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ratingsBlock: {
    borderRadius: 10,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ratingRowLast: { borderBottomWidth: 0 },
  ratingLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },

  healedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  healedText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    flexShrink: 1,
  },

  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
});
