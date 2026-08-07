import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
  StatusBar, Dimensions, LayoutAnimation, Platform, UIManager, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import {
  BackArrowIcon, EditPenIcon, HeartIcon, StarIcon, LocationPinIcon,
  PersonSilhouette, TattooPlaceholderIcon, PlusIcon,
  ChevronRightIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import EditProfileSheet from '../../components/artistMyPage/EditProfileSheet';
import ArtworkFormSheet from '../../components/artistMyPage/ArtworkFormSheet';
import ArtworkDetailModal from '../../components/artistMyPage/ArtworkDetailModal';
import ReviewManageModal from '../../components/artistMyPage/ReviewManageModal';
import ConfirmModal, { ConfirmConfig } from '../../components/common/ConfirmModal';
import AppBottomTabBar, { useBottomTabHeight } from '../../components/common/AppBottomTabBar';
import {
  MOCK_ARTIST_SELF, MOCK_ARTIST_ARTWORKS, MOCK_ARTIST_REVIEWS,
} from '../../../data/mock/artistMyPageMockData';
import {
  ArtistSelfProfile, ArtistArtwork, ArtistReviewItem, ArtistReviewReply,
} from '../../../domain/entities/artistMyPageTypes';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const easeLayoutAnim = () => {
  LayoutAnimation.configureNext({
    duration: 220,
    create: { type: 'easeInEaseOut', property: 'opacity' },
    update: { type: 'easeInEaseOut' },
    delete: { type: 'easeInEaseOut', property: 'opacity' },
  });
};

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TabKey = 'artworks' | 'reviews';

const { width: W } = Dimensions.get('window');
const H_PAD = 16;
const GRID_GAP = 2;
const GRID_COL = 3;
const GRID_ITEM = (W - GRID_GAP * (GRID_COL - 1)) / GRID_COL;

const ArtistMyPageScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ArtistSelfProfile>(MOCK_ARTIST_SELF);
  const [artworks, setArtworks] = useState<ArtistArtwork[]>(MOCK_ARTIST_ARTWORKS);
  const [reviews, setReviews] = useState<ArtistReviewItem[]>(MOCK_ARTIST_REVIEWS);

  const [tab, setTab] = useState<TabKey>('artworks');
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [artworkDetail, setArtworkDetail] = useState<ArtistArtwork | null>(null);
  const [artworkFormEditing, setArtworkFormEditing] = useState<ArtistArtwork | null>(null);
  const [artworkFormOpen, setArtworkFormOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState<ArtistReviewItem | null>(null);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const bottomTabHeight = useBottomTabHeight();

  const requestReviewSupport = useCallback(() => {
    setConfirm({
      title: '리뷰 삭제/숨김 문의',
      message:
        '타투이스트는 리뷰를 임의로 삭제/숨길 수 없습니다.\n허위 · 명예훼손 · 비방 등에 해당하면 고객센터로 접수해주세요. 검토 후 조치됩니다.',
      cancelLabel: '취소',
      confirmLabel: '문의 접수',
      variant: 'danger',
      onConfirm: () => {
        Linking.openURL('https://tally.so/r/troot-review-support').catch(() => {
          toast('링크를 열 수 없습니다.', { variant: 'error' });
        });
      },
    });
  }, [toast]);

  const avgRating = profile.rating;
  const totalLikes = profile.likes;

  const answeredCount = useMemo(
    () => reviews.filter((r) => r.isAnswered).length,
    [reviews],
  );

  /* ==== Profile ==== */
  const handleSaveProfile = useCallback((next: Partial<ArtistSelfProfile>) => {
    setProfile((prev) => ({ ...prev, ...next }));
    setEditProfileOpen(false);
    toast('프로필이 저장되었습니다.', { variant: 'success' });
  }, [toast]);

  /* ==== Artwork ==== */
  const handleOpenArtworkForm = useCallback((aw: ArtistArtwork | null) => {
    setArtworkDetail(null);
    setArtworkFormEditing(aw);
    setArtworkFormOpen(true);
  }, []);
  const closeArtworkForm = useCallback(() => {
    setArtworkFormOpen(false);
    setArtworkFormEditing(null);
  }, []);
  const handleSubmitArtwork = useCallback((next: ArtistArtwork) => {
    easeLayoutAnim();
    setArtworks((prev) => {
      const exists = prev.some((a) => a.id === next.id);
      return exists
        ? prev.map((a) => (a.id === next.id ? next : a))
        : [next, ...prev];
    });
    setArtworkFormOpen(false);
    setArtworkFormEditing(null);
    toast(
      artworkFormEditing ? '작품이 수정되었습니다.' : '새 작품이 등록되었습니다.',
      { variant: 'success' },
    );
  }, [artworkFormEditing, toast]);
  const handleDeleteArtwork = useCallback((id: string) => {
    easeLayoutAnim();
    setArtworks((prev) => prev.filter((a) => a.id !== id));
    setArtworkDetail(null);
    toast('작품이 삭제되었습니다.', { variant: 'error' });
  }, [toast]);

  /* ==== Review ==== */
  const handleSubmitReply = useCallback((id: string, reply: ArtistReviewReply) => {
    easeLayoutAnim();
    setReviews((prev) => prev.map((r) => (
      r.id === id ? { ...r, isAnswered: true, reply } : r
    )));
    setReviewOpen(null);
    toast('답글이 등록되었습니다.', { variant: 'success' });
  }, [toast]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomTabHeight + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sub header */}
        <View style={styles.subHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <BackArrowIcon size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>포트폴리오 · 리뷰 관리</Text>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.avatarImg} />
              ) : (
                <PersonSilhouette size={64} color="#3a3a3a" />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.nickname}</Text>
              <Text style={styles.handle}>{profile.handle}</Text>
              <View style={styles.locationRow}>
                <LocationPinIcon size={12} color={COLORS.gray} />
                <Text style={styles.location} numberOfLines={1}>{profile.location}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.intro} numberOfLines={2}>{profile.intro}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.starWrap}>
                <StarIcon size={16} color={COLORS.gold} filled />
                <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
              </View>
              <Text style={styles.statLabel}>평점 · {profile.reviewCount}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statValueRow}>
                <HeartIcon size={14} color={COLORS.gold} filled />
                <Text style={styles.statValue}>{totalLikes.toLocaleString()}</Text>
              </View>
              <Text style={styles.statLabel}>누적 찜</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.bookedCount}</Text>
              <Text style={styles.statLabel}>완료 예약</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setEditProfileOpen(true)}
            activeOpacity={0.85}
            style={styles.editProfileBtn}
          >
            <EditPenIcon size={13} color={COLORS.gold} strokeWidth={1.8} />
            <Text style={styles.editProfileText}>프로필 수정</Text>
          </TouchableOpacity>
        </View>

        {/* Segmented tabs */}
        <View style={styles.segRow}>
          <TouchableOpacity
            onPress={() => { easeLayoutAnim(); setTab('artworks'); }}
            activeOpacity={0.85}
            style={[styles.segBtn, tab === 'artworks' && styles.segBtnActive]}
          >
            <Text style={[styles.segText, tab === 'artworks' && styles.segTextActive]}>
              작품 관리 · {artworks.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { easeLayoutAnim(); setTab('reviews'); }}
            activeOpacity={0.85}
            style={[styles.segBtn, tab === 'reviews' && styles.segBtnActive]}
          >
            <Text style={[styles.segText, tab === 'reviews' && styles.segTextActive]}>
              리뷰 관리 · {answeredCount}/{reviews.length}
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'artworks' ? (
          artworks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>등록된 작품이 없습니다.</Text>
              <TouchableOpacity
                onPress={() => handleOpenArtworkForm(null)}
                activeOpacity={0.85}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>새 작품 등록</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
              {artworks.map((aw, i) => (
                <TouchableOpacity
                  key={aw.id}
                  onPress={() => setArtworkDetail(aw)}
                  activeOpacity={0.88}
                  style={[
                    styles.gridItem,
                    (i % GRID_COL !== GRID_COL - 1) && { marginRight: GRID_GAP },
                  ]}
                >
                  {aw.thumbnailUri ? (
                    <Image source={{ uri: aw.thumbnailUri }} style={styles.gridImg} />
                  ) : (
                    <View style={styles.gridPlaceholder}>
                      <TattooPlaceholderIcon size={30} color="#3a3a3a" />
                    </View>
                  )}
                  {aw.isPromoted && (
                    <View style={styles.gridAdBadge}>
                      <Text style={styles.gridAdText}>광고중</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )
        ) : (
          reviews.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>아직 작성된 리뷰가 없습니다.</Text>
            </View>
          ) : (
            <View style={styles.reviewList}>
              {reviews.map((rv) => (
                <TouchableOpacity
                  key={rv.id}
                  onPress={() => setReviewOpen(rv)}
                  activeOpacity={0.9}
                  style={styles.reviewCard}
                >
                  <View style={styles.reviewHeaderRow}>
                    <Text style={styles.reviewCustomer}>{rv.customer}</Text>
                    <View style={styles.reviewStars}>
                      {[1,2,3,4,5].map((n) => (
                        <StarIcon key={n} size={11} color={COLORS.gold} filled={n <= rv.rating} />
                      ))}
                    </View>
                    {rv.isAnswered ? (
                      <View style={styles.answeredBadge}>
                        <Text style={styles.answeredText}>답글완료</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>답글대기</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.reviewArtwork}>{rv.artworkTitle}</Text>
                  <Text style={styles.reviewContent} numberOfLines={2}>
                    {rv.content}
                  </Text>
                  {rv.imageUris.length > 0 && (
                    <View style={styles.reviewImages}>
                      {rv.imageUris.slice(0, 3).map((_, i) => (
                        <View key={i} style={styles.reviewImageThumb}>
                          <TattooPlaceholderIcon size={20} color="#3a3a3a" />
                        </View>
                      ))}
                    </View>
                  )}
                  {rv.reply && (
                    <View style={styles.replyBox}>
                      <Text style={styles.replyLabel}>내 답글</Text>
                      <Text style={styles.replyContent} numberOfLines={2}>
                        {rv.reply.content}
                      </Text>
                    </View>
                  )}
                  <View style={styles.reviewFooter}>
                    <Text style={styles.reviewDate}>{rv.createdAt}</Text>
                    <View style={styles.reviewDetailBtn}>
                      <Text style={styles.reviewDetailText}>
                        {rv.isAnswered ? '답글 수정 · 상세 보기' : '답글 작성 · 상세 보기'}
                      </Text>
                      <ChevronRightIcon size={12} color={COLORS.gold} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )
        )}
      </ScrollView>

      {/* FAB (작품 탭에서만) — 바텀탭 위 */}
      {tab === 'artworks' && (
        <TouchableOpacity
          onPress={() => handleOpenArtworkForm(null)}
          activeOpacity={0.85}
          style={[styles.fab, { bottom: bottomTabHeight + 12 }]}
        >
          <PlusIcon size={28} color={COLORS.black} strokeWidth={2.4} />
        </TouchableOpacity>
      )}

      {/* Sheets & Modals */}
      <EditProfileSheet
        visible={editProfileOpen}
        profile={profile}
        onClose={() => setEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />
      <ArtworkDetailModal
        artwork={artworkDetail}
        onClose={() => setArtworkDetail(null)}
        onEdit={(aw) => handleOpenArtworkForm(aw)}
        onDelete={handleDeleteArtwork}
      />
      <ArtworkFormSheet
        visible={artworkFormOpen}
        editing={artworkFormEditing}
        onClose={closeArtworkForm}
        onSubmit={handleSubmitArtwork}
      />
      <ReviewManageModal
        review={reviewOpen}
        onClose={() => setReviewOpen(null)}
        onSubmitReply={handleSubmitReply}
        onRequestSupport={requestReviewSupport}
      />
      <ConfirmModal config={confirm} onDismiss={() => setConfirm(null)} />

      <AppBottomTabBar activeTab="ProfileTab" />
    </SafeAreaView>
  );
};

export default ArtistMyPageScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: {},

  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: COLORS.black,
  },
  backBtn: {
    width: 36, height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginLeft: 4,
  },

  /* Profile card */
  profileCard: {
    marginHorizontal: H_PAD,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 16,
    gap: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 68, height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  profileInfo: { flex: 1, gap: 3 },
  name: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  handle: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  location: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 16,
    flexShrink: 1,
  },
  intro: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  starWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  statLabel: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: COLORS.border,
  },

  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingVertical: 10,
  },
  editProfileText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },

  /* Segmented tabs */
  segRow: {
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: H_PAD,
    marginTop: 18,
    marginBottom: 12,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  segBtnActive: {
    backgroundColor: COLORS.gold,
  },
  segText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  segTextActive: {
    color: COLORS.black,
    fontWeight: '800',
  },

  /* Artwork grid — edge-to-edge (Instagram 스타일) */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: GRID_ITEM,
    height: GRID_ITEM,
    marginBottom: GRID_GAP,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
    position: 'relative',
  },
  gridImg: { width: '100%', height: '100%' },
  gridPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridAdBadge: {
    position: 'absolute',
    bottom: 6, left: 6,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  gridAdText: {
    color: COLORS.black,
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },

  /* Review list */
  reviewList: {
    paddingHorizontal: H_PAD,
    gap: 10,
  },
  reviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 14,
    gap: 6,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewCustomer: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 1,
    flex: 1,
  },
  answeredBadge: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  answeredText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
  pendingBadge: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(232,85,85,0.1)',
  },
  pendingText: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
  reviewArtwork: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  reviewContent: {
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 18,
  },
  reviewImages: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 4,
  },
  reviewImageThumb: {
    width: 44, height: 44,
    borderRadius: 6,
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyBox: {
    marginTop: 6,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gold,
    paddingLeft: 8,
    paddingVertical: 2,
    gap: 2,
  },
  replyLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
  replyContent: {
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 17,
  },
  reviewDate: {
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 14,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reviewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(212,168,67,0.08)',
  },
  reviewDetailText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },

  empty: {
    marginHorizontal: H_PAD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyBtn: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyBtnText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },

  /* FAB */
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
