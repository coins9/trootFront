import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
  StatusBar, Dimensions, LayoutAnimation, Platform, UIManager, Linking,
  TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import {
  ArtistSelfProfile, ArtistArtwork, ArtistReviewItem, ArtistReviewReply,
} from '../../../domain/entities/artistMyPageTypes';
import { useApi, usePagedApi } from '../../hooks/useApi';
import {
  artistApi, reviewApi,
  type ArtistPage, type Artwork, type ReviewByArtist,
} from '../../../data/api';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';

/* ---- Mappers ---- */
function toSelfProfile(p: ArtistPage): ArtistSelfProfile {
  const regionParts = [p.regionSido, p.regionSigungu].filter(Boolean);
  return {
    id: p.id,
    nickname: p.pageName,
    handle: `@${p.handle}`,
    location: regionParts.join(' ') || '',
    intro: p.intro ?? p.bio ?? '',
    avatarUri: p.profileImage ?? '',
    coverImage: p.coverImage ?? null,
    rating: parseFloat(p.rating) || 0,
    reviewCount: p.reviewCount,
    likes: p.followerCount,
    bookedCount: 0,
    tags: p.tags ?? [],
    openChatUrl: p.openChatUrl ?? null,
    availableHours: p.availableHours ?? null,
    closedDay: p.closedDay ?? null,
  };
}

function toArtwork(a: Artwork): ArtistArtwork {
  return {
    id: a.id,
    type: 'image',
    thumbnailUri: a.thumbnail ?? (a.images[0] ?? ''),
    imageUris: a.images ?? [],
    title: a.title,
    genre: a.genres[0] ?? '',
    bodyPart: a.bodyPart ?? '',
    subjects: a.genres,
    moods: [],
    priceFrom: a.priceKrw ?? 0,
    duration: '',
    description: a.description ?? '',
    isPromoted: a.isPromoted,
    likes: a.likeCount,
    views: a.viewCount,
  };
}

function toReviewItem(r: ReviewByArtist): ArtistReviewItem {
  const avg = (r.painScore + r.kindnessScore + r.hygieneScore + r.satisfactionScore) / 4;
  return {
    id: r.id,
    customer: r.customerNickname ?? '',
    rating: Math.round(avg),
    artworkId: '',
    artworkTitle: r.bodyPart ?? '',
    content: r.body,
    imageUris: r.images,
    createdAt: new Date(r.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
    reply: r.reply ? { content: r.reply, answeredAt: '' } : undefined,
    isAnswered: r.reply !== null,
  };
}

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
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const refresh = useAuthStore((s) => s.refresh);

  const { data: apiProfile, loading: profileLoading, reload: reloadProfile } = useApi(() => artistApi.me(), []);
  const { items: apiArtworks, setItems: setApiArtworks, reload: reloadArtworks } =
    usePagedApi((cursor) => artistApi.myArtworks({ cursor }), []);

  /* ==== 타투이스트 등록 폼 상태 ==== */
  const [regName, setRegName] = useState('');
  const [regHandle, setRegHandle] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  const canRegister = regName.trim().length >= 1 && regHandle.trim().replace(/^@/, '').length >= 2;

  const handleRegister = useCallback(async () => {
    if (!canRegister) return;
    setRegSubmitting(true);
    try {
      await artistApi.createPage({
        pageName: regName.trim(),
        handle: regHandle.trim().replace(/^@/, ''),
      });
      await refresh();
      reloadProfile();
      reloadArtworks();
    } catch {
      toast(t('common.error'), { variant: 'error' });
    } finally {
      setRegSubmitting(false);
    }
  }, [canRegister, regName, regHandle, refresh, reloadProfile, reloadArtworks, toast, t]);
  const artistPageId = apiProfile?.id ?? '';
  const { items: apiReviews, setItems: setApiReviews } =
    usePagedApi(
      (cursor) => artistPageId
        ? reviewApi.byArtist(artistPageId, { cursor })
        : Promise.resolve({ items: [], nextCursor: null, hasNext: false }),
      [artistPageId],
    );

  const profileBase = useMemo(
    () => apiProfile ? toSelfProfile(apiProfile) : null,
    [apiProfile],
  );
  const [profileOverride, setProfileOverride] = useState<Partial<ArtistSelfProfile>>({});
  const profile: ArtistSelfProfile = profileBase
    ? { ...profileBase, ...profileOverride }
    : { id: '', nickname: '', handle: '', location: '', intro: '', avatarUri: '',
        rating: 0, reviewCount: 0, likes: 0, bookedCount: 0, tags: [] };

  const artworks = useMemo(() => apiArtworks.map(toArtwork), [apiArtworks]);
  const reviews = useMemo(() => apiReviews.map(toReviewItem), [apiReviews]);

  const [tab, setTab] = useState<TabKey>('artworks');
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [artworkDetail, setArtworkDetail] = useState<ArtistArtwork | null>(null);
  const [artworkFormEditing, setArtworkFormEditing] = useState<ArtistArtwork | null>(null);
  const [artworkFormOpen, setArtworkFormOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState<ArtistReviewItem | null>(null);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  const requestReviewSupport = useCallback(() => {
    setConfirm({
      title: t('artistMyPage.reviewSupportTitle'),
      message: t('artistMyPage.reviewSupportMsg'),
      cancelLabel: t('common.cancel'),
      confirmLabel: t('artistMyPage.reviewSupportConfirm'),
      variant: 'danger',
      onConfirm: () => {
        Linking.openURL('https://tally.so/r/troot-review-support').catch(() => {
          toast(t('common.linkError'), { variant: 'error' });
        });
      },
    });
  }, [toast, t]);

  const avgRating = profile.rating;
  const totalLikes = profile.likes;

  const answeredCount = useMemo(
    () => reviews.filter((r) => r.isAnswered).length,
    [reviews],
  );

  /* ==== Profile ==== */
  const handleSaveProfile = useCallback(async (next: Partial<ArtistSelfProfile>) => {
    try {
      await artistApi.updateMe({
        pageName: next.nickname,
        intro: next.intro,
        bio: next.intro,
        coverImage: next.coverImage ?? undefined,
        regionSido: next.regionSido ?? undefined,
        regionSigungu: next.regionSigungu ?? undefined,
        countryCode: next.countryCode ?? undefined,
        countryName: next.countryName ?? undefined,
        regionType: next.countryCode ? 'overseas' : 'domestic',
        lat: next.lat ?? undefined,
        lng: next.lng ?? undefined,
        tags: next.tags,
        openChatUrl: next.openChatUrl ?? undefined,
        availableHours: next.availableHours ?? undefined,
        closedDay: next.closedDay ?? undefined,
      } as any);
      setProfileOverride((prev) => ({ ...prev, ...next }));
      reloadProfile();
      setEditProfileOpen(false);
      toast(t('artistMyPage.saved'), { variant: 'success' });
    } catch {
      setEditProfileOpen(false);
      toast(t('common.error'), { variant: 'error' });
    }
  }, [toast, reloadProfile, t]);

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
  const handleSubmitArtwork = useCallback(async (next: ArtistArtwork) => {
    try {
      const body = {
        title: next.title,
        description: next.description,
        genres: Array.from(new Set([next.genre, ...next.subjects].filter(Boolean))),
        bodyPart: next.bodyPart,
        priceKrw: next.priceFrom || null,
        images: next.imageUris?.length ? next.imageUris : (next.thumbnailUri ? [next.thumbnailUri] : []),
        thumbnail: next.imageUris?.[0] || next.thumbnailUri || null,
      };
      if (artworkFormEditing) {
        await artistApi.updateArtwork(next.id, body);
      } else {
        await artistApi.createArtwork(body);
      }
      easeLayoutAnim();
      reloadArtworks();
      setArtworkFormOpen(false);
      setArtworkFormEditing(null);
      toast(
        artworkFormEditing ? t('artistMyPage.artworkSaved') : t('artistMyPage.artworkAdded'),
        { variant: 'success' },
      );
    } catch {
      toast(t('common.error'), { variant: 'error' });
    }
  }, [artworkFormEditing, toast, reloadArtworks, t]);
  const handleDeleteArtwork = useCallback(async (id: string) => {
    try {
      await artistApi.deleteArtwork(id);
      easeLayoutAnim();
      setApiArtworks((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast(t('common.error'), { variant: 'error' });
      return;
    }
    setArtworkDetail(null);
    toast(t('artistMyPage.artworkDeleted'), { variant: 'success' });
  }, [toast, setApiArtworks, t]);

  /* ==== Review ==== */
  const handleSubmitReply = useCallback(async (id: string, reply: ArtistReviewReply) => {
    try {
      await reviewApi.reply(id, reply.content);
      easeLayoutAnim();
      setApiReviews((prev) => prev.map((r) => (
        r.id === id ? { ...r, reply: reply.content, repliedAt: new Date().toISOString() } : r
      )));
    } catch {
      toast(t('artistMyPage.replyFailed'), { variant: 'error' });
      return;
    }
    setReviewOpen(null);
    toast(t('artistMyPage.replySaved'), { variant: 'success' });
  }, [toast, setApiReviews, t]);

  /* 타투이스트 등록 UI — 프로필이 없고 로딩이 끝난 경우 */
  if (!profileLoading && !apiProfile) {
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
          <Text style={styles.headerTitle}>{t('artistMyPage.registerPageTitle')}</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.regContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.regTitle}>{t('artistMyPage.registerTitle')}</Text>
          <Text style={styles.regSubtitle}>{t('artistMyPage.registerSubtitle')}</Text>

          <Text style={styles.regLabel}>{t('artistMyPage.registerNameLabel')}</Text>
          <TextInput
            style={styles.regInput}
            placeholder={t('artistMyPage.registerNamePlaceholder')}
            placeholderTextColor={COLORS.gray2}
            value={regName}
            onChangeText={setRegName}
            maxLength={100}
            autoCapitalize="none"
          />

          <Text style={styles.regLabel}>{t('artistMyPage.registerHandleLabel')}</Text>
          <TextInput
            style={styles.regInput}
            placeholder={t('artistMyPage.registerHandlePlaceholder')}
            placeholderTextColor={COLORS.gray2}
            value={regHandle}
            onChangeText={(v) => setRegHandle(v.replace(/\s/g, ''))}
            maxLength={50}
            autoCapitalize="none"
          />

          <TouchableOpacity
            onPress={handleRegister}
            disabled={!canRegister || regSubmitting}
            activeOpacity={0.85}
            style={[styles.regBtn, (!canRegister || regSubmitting) && styles.regBtnDisabled]}
          >
            {regSubmitting
              ? <ActivityIndicator color={COLORS.black} />
              : <Text style={[styles.regBtnText, (!canRegister || regSubmitting) && styles.regBtnTextDisabled]}>
                  {t('artistMyPage.registerSubmit')}
                </Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
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
          <Text style={styles.headerTitle}>{t('artistMyPage.title')}</Text>
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
                <Text style={styles.location} numberOfLines={1}>{profile.location || t('artistMyPage.locationDefault')}</Text>
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
              <Text style={styles.statLabel}>{t('artistMyPage.ratingLabel')} · {profile.reviewCount}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statValueRow}>
                <HeartIcon size={14} color={COLORS.gold} filled />
                <Text style={styles.statValue}>{totalLikes.toLocaleString()}</Text>
              </View>
              <Text style={styles.statLabel}>{t('artistMyPage.totalLikes')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.bookedCount}</Text>
              <Text style={styles.statLabel}>{t('artistMyPage.completedBookings')}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setEditProfileOpen(true)}
            activeOpacity={0.85}
            style={styles.editProfileBtn}
          >
            <EditPenIcon size={13} color={COLORS.gold} strokeWidth={1.8} />
            <Text style={styles.editProfileText}>{t('artistMyPage.editProfile')}</Text>
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
              {t('artistMyPage.tabArtworks')} · {artworks.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { easeLayoutAnim(); setTab('reviews'); }}
            activeOpacity={0.85}
            style={[styles.segBtn, tab === 'reviews' && styles.segBtnActive]}
          >
            <Text style={[styles.segText, tab === 'reviews' && styles.segTextActive]}>
              {t('artistMyPage.tabReviews')} · {answeredCount}/{reviews.length}
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'artworks' ? (
          artworks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('artistMyPage.artworkEmpty')}</Text>
              <TouchableOpacity
                onPress={() => handleOpenArtworkForm(null)}
                activeOpacity={0.85}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>{t('artistMyPage.artworkAdd')}</Text>
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
                      <Text style={styles.gridAdText}>{t('artistMyPage.adRunning')}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )
        ) : (
          reviews.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('artistMyPage.reviewEmpty')}</Text>
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
                        <Text style={styles.answeredText}>{t('artistMyPage.answered')}</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>{t('artistMyPage.pendingReply')}</Text>
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
                      <Text style={styles.replyLabel}>{t('artistMyPage.myReply')}</Text>
                      <Text style={styles.replyContent} numberOfLines={2}>
                        {rv.reply.content}
                      </Text>
                    </View>
                  )}
                  <View style={styles.reviewFooter}>
                    <Text style={styles.reviewDate}>{rv.createdAt}</Text>
                    <View style={styles.reviewDetailBtn}>
                      <Text style={styles.reviewDetailText}>
                        {rv.isAnswered ? t('artistMyPage.editReply') : t('artistMyPage.writeReply')}
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
          style={[styles.fab, { bottom: insets.bottom + 16 }]}
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

  /* 타투이스트 등록 폼 */
  regContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 60,
    gap: 0,
  },
  regTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 8,
  },
  regSubtitle: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 28,
  },
  regLabel: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginBottom: 6,
    marginTop: 16,
  },
  regInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.white,
    lineHeight: 20,
  },
  regBtn: {
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  regBtnDisabled: { backgroundColor: COLORS.elevated },
  regBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.black, lineHeight: 20 },
  regBtnTextDisabled: { color: COLORS.gray2 },
});
