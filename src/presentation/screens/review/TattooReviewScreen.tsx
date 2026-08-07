import React, { useState, useCallback } from 'react';
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
  LocationPinIcon, CalendarIcon, PaletteIcon, ShieldCheckIcon,
  CameraSolidIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import {
  WritableReview, WrittenReview, RATING_LABELS,
} from '../../../domain/entities/reviewTypes';
import {
  MOCK_WRITABLE_REVIEWS, MOCK_WRITTEN_REVIEWS,
} from '../../../data/mock/reviewMockData';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TabKey = 'writable' | 'written';

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
const WritableCard = React.memo(({ review, onWrite }: WritableCardProps) => (
  <View style={styles.card}>
    <View style={styles.writableHeader}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>리뷰 작성 가능</Text>
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
      <Text style={styles.metaLabel}>시술 날짜</Text>
      <Text style={styles.metaValue} numberOfLines={1}>
        {review.procedureDate}  {review.procedureTime}
      </Text>
    </View>
    <View style={styles.metaRow}>
      <PaletteIcon size={16} color={COLORS.gold} strokeWidth={1.7} />
      <Text style={styles.metaLabel}>시술 부위</Text>
      <Text style={styles.metaValue} numberOfLines={1}>
        {review.bodyPart} · {review.style}
      </Text>
    </View>

    <Text style={styles.sectionTitle}>리뷰 작성 안내</Text>
    <View style={styles.guideBox}>
      <View style={styles.guideRow}>
        <CalendarIcon size={18} color={COLORS.gold} strokeWidth={1.6} />
        <View style={styles.guideText}>
          <Text style={styles.guideLabel}>작성 기간</Text>
          <Text style={styles.guideDesc}>시술 완료 후 14일 이내</Text>
        </View>
      </View>
      <View style={styles.guideRow}>
        <View style={styles.guidePBadge}>
          <Text style={styles.guidePText}>P</Text>
        </View>
        <View style={styles.guideText}>
          <Text style={styles.guideLabel}>리뷰 혜택</Text>
          <Text style={styles.guideDesc}>
            리뷰 작성 시 {review.rewardPoint.toLocaleString()}P 지급
          </Text>
        </View>
      </View>
      <View style={styles.guideRow}>
        <ShieldCheckIcon size={18} color={COLORS.gold} strokeWidth={1.6} />
        <View style={styles.guideText}>
          <Text style={styles.guideLabel}>리뷰 정책</Text>
          <Text style={styles.guideDesc}>솔직한 리뷰는 다른 유저에게 큰 도움이 됩니다.</Text>
        </View>
      </View>
    </View>

    <TouchableOpacity
      onPress={onWrite}
      activeOpacity={0.85}
      style={styles.writeBtn}
    >
      <Text style={styles.writeBtnText}>리뷰 작성하기</Text>
    </TouchableOpacity>
  </View>
));
WritableCard.displayName = 'WritableCard';

/* ------------- Written card ------------- */
interface WrittenCardProps {
  review: WrittenReview;
  onAddHealed: () => void;
}
const WrittenCard = React.memo(({ review, onAddHealed }: WrittenCardProps) => (
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
        <Text style={styles.healedText}>6개월 후 발색(Healed) 사진 추가하기</Text>
      </TouchableOpacity>
    )}
  </View>
));
WrittenCard.displayName = 'WrittenCard';

/* ------------- Screen ------------- */
const TattooReviewScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>('writable');

  const writable = MOCK_WRITABLE_REVIEWS;
  const written = MOCK_WRITTEN_REVIEWS;

  const handleWrite = useCallback((review: WritableReview) => {
    navigation.navigate('ReviewWrite', { review });
  }, [navigation]);

  const handleAddHealed = useCallback((review: WrittenReview) => {
    toast(`${review.artist.nickname} Healed 사진 추가 — 준비 중입니다`, { variant: 'success' });
  }, [toast]);

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
        <Text style={styles.title}>내 타투 리뷰</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab('writable')}
          activeOpacity={0.75}
          style={styles.tabBtn}
        >
          <View style={styles.tabLabelWrap}>
            <Text style={[styles.tabText, tab === 'writable' && styles.tabTextActive]}>
              작성 가능한 리뷰
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
              내가 쓴 리뷰
            </Text>
          </View>
          {tab === 'written' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'writable' ? (
          <>
            <Text style={styles.leadText}>
              시술 후 14일 이내에 리뷰를 작성하면,{'\n'}
              <Text style={styles.leadHighlight}>T:ROOT 포인트 3,000P</Text>를 드려요.
            </Text>
            {writable.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>작성 가능한 리뷰가 없습니다.</Text>
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
          written.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>아직 작성한 리뷰가 없습니다.</Text>
            </View>
          ) : (
            written.map((r) => (
              <WrittenCard
                key={r.id}
                review={r}
                onAddHealed={() => handleAddHealed(r)}
              />
            ))
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

  leadText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  leadHighlight: {
    color: COLORS.white,
    fontWeight: '700',
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
  guidePBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  guidePText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 14,
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
