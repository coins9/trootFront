import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Image, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, StarIcon, PersonSilhouette, CameraAddIcon, XIcon,
  CalendarIcon, PaletteIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useImageUpload } from '../../hooks/useImageUpload';
import { deleteUpload } from '../../../data/api/upload';
import {
  ReviewRatings, RATING_LABELS, RATING_GUIDES,
} from '../../../domain/entities/reviewTypes';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteP = RouteProp<RootStackParamList, 'ReviewWrite'>;

const TEXT_MIN = 10;
const TEXT_MAX = 500;
const PHOTO_MAX = 5;

const getRatingScoreLabel = (t: (key: any) => string, value: number): string => {
  if (value <= 0) return '';
  const keys = ['', 'review.ratingScore1', 'review.ratingScore2', 'review.ratingScore3', 'review.ratingScore4', 'review.ratingScore5'] as const;
  return t(keys[value] as any);
};

const StarInput = React.memo(({ value, onChange }: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <View style={s.starInputRow}>
    {[1, 2, 3, 4, 5].map((n) => (
      <TouchableOpacity
        key={n}
        onPress={() => onChange(n)}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 3, right: 3 }}
        style={s.starTouch}
      >
        <StarIcon size={30} color={n <= value ? COLORS.gold : COLORS.gray3} filled={n <= value} />
      </TouchableOpacity>
    ))}
  </View>
));
StarInput.displayName = 'StarInput';

const RatingBlock = React.memo(({ label, guide, value, scoreLabel, onChange }: {
  label: string;
  guide: string;
  scoreLabel: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <View style={s.ratingBlock}>
    <View style={s.ratingHead}>
      <Text style={s.ratingLabel}>{label}</Text>
      <Text style={s.ratingValueLabel}>{scoreLabel}</Text>
    </View>
    <Text style={s.ratingGuide}>{guide}</Text>
    <StarInput value={value} onChange={onChange} />
  </View>
));
RatingBlock.displayName = 'RatingBlock';

const ReviewWriteScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { review } = route.params;

  const [ratings, setRatings] = useState<ReviewRatings>({
    pain: 0, kindness: 0, hygiene: 0, satisfaction: 0,
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [text, setText] = useState('');

  const setRating = useCallback((key: keyof ReviewRatings) => (v: number) => {
    setRatings((prev) => ({ ...prev, [key]: v }));
  }, []);

  const { pickWithChoice, uploading } = useImageUpload({
    scope: 'review',
    max: PHOTO_MAX,
    current: photos.length,
    onError: (m) => toast(m, { variant: 'error' }),
  });

  const addPhoto = useCallback(async () => {
    const urls = await pickWithChoice();
    if (urls.length) setPhotos((prev) => [...prev, ...urls]);
  }, [pickWithChoice]);

  const removePhoto = useCallback((i: number) => {
    setPhotos((prev) => {
      const url = prev[i];
      if (url) deleteUpload(url);
      return prev.filter((_, idx) => idx !== i);
    });
  }, []);

  const allRated = useMemo(
    () => RATING_LABELS.every((r) => ratings[r.key] > 0),
    [ratings],
  );
  const textValid = text.trim().length >= TEXT_MIN;
  const canSubmit = allRated && textValid;

  const handleSubmit = useCallback(() => {
    if (!allRated) {
      toast(t('review.noRatingError'), { variant: 'error' });
      return;
    }
    if (!textValid) {
      toast(t('review.textTooShortError').replace('{{min}}', String(TEXT_MIN)), { variant: 'error' });
      return;
    }
    toast(t('review.submitted'), { variant: 'success' });
    navigation.goBack();
  }, [allRated, textValid, toast, navigation, t]);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('review.writeTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={s.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Artist / procedure info */}
          <View style={s.artistCard}>
            <View style={s.avatar}>
              {review.artist.avatarUri ? (
                <Image source={{ uri: review.artist.avatarUri }} style={s.avatarImg} />
              ) : (
                <PersonSilhouette size={48} color="#3a3a3a" />
              )}
            </View>
            <View style={s.artistInfo}>
              <Text style={s.artistName} numberOfLines={1}>{review.artist.nickname}</Text>
              <View style={s.metaRow}>
                <CalendarIcon size={13} color={COLORS.gold} strokeWidth={1.6} />
                <Text style={s.metaText} numberOfLines={1}>
                  {review.procedureDate} {review.procedureTime}
                </Text>
              </View>
              <View style={s.metaRow}>
                <PaletteIcon size={13} color={COLORS.gold} strokeWidth={1.6} />
                <Text style={s.metaText} numberOfLines={1}>
                  {review.bodyPart} · {review.style}
                </Text>
              </View>
            </View>
          </View>

          {/* Ratings */}
          <Text style={s.sectionTitle}>{t('review.sectionRating')}</Text>
          <Text style={s.sectionSub}>{t('review.sectionRatingSub')}</Text>
          <View style={s.ratingsCard}>
            {RATING_LABELS.map((r, i) => (
              <View key={r.key}>
                <RatingBlock
                  label={r.label}
                  guide={RATING_GUIDES[r.key]}
                  value={ratings[r.key]}
                  scoreLabel={getRatingScoreLabel(t, ratings[r.key])}
                  onChange={setRating(r.key)}
                />
                {i < RATING_LABELS.length - 1 && <View style={s.ratingDivider} />}
              </View>
            ))}
          </View>

          {/* Photos */}
          <Text style={s.sectionTitle}>{t('review.sectionPhoto')}</Text>
          <Text style={s.sectionSub}>
            {t('review.sectionPhotoSub').replace('{{max}}', String(PHOTO_MAX))}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoScroll}>
            <TouchableOpacity
              style={s.photoAdd}
              onPress={addPhoto}
              activeOpacity={0.75}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={COLORS.gold} />
              ) : (
                <>
                  <CameraAddIcon size={30} color={COLORS.gold} />
                  <Text style={s.photoAddCount}>{photos.length}/{PHOTO_MAX}</Text>
                </>
              )}
            </TouchableOpacity>
            {photos.map((uri, i) => (
              <View key={uri} style={s.photoThumb}>
                <Image source={{ uri }} style={s.photoPlaceholder} resizeMode="cover" />
                <TouchableOpacity
                  style={s.photoRemove}
                  onPress={() => removePhoto(i)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <XIcon size={10} color={COLORS.white} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Text */}
          <Text style={s.sectionTitle}>{t('review.sectionText')}</Text>
          <TextInput
            style={s.textarea}
            placeholder={t('review.placeholder').replace('{{min}}', String(TEXT_MIN))}
            placeholderTextColor={COLORS.gray2}
            value={text}
            onChangeText={(v) => setText(v.slice(0, TEXT_MAX))}
            multiline
            textAlignVertical="top"
          />
          <Text style={s.counter}>{text.length}/{TEXT_MAX}</Text>

          <View style={s.noticeBox}>
            <Text style={s.noticeText}>{t('review.noticeText')}</Text>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
            activeOpacity={0.85}
          >
            <Text style={[s.submitText, !canSubmit && s.submitTextDisabled]}>
              {t('review.submitBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ReviewWriteScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  flex1: { flex: 1 },
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.black,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white, letterSpacing: 0.3, lineHeight: 23 },

  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.elevated,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  avatarImg: { width: '100%', height: '100%' },
  artistInfo: { flex: 1, gap: 4 },
  artistName: { fontSize: 16, fontWeight: '700', color: COLORS.white, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: COLORS.gray, lineHeight: 17, flexShrink: 1 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.white, lineHeight: 21, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: COLORS.gray, lineHeight: 17, marginBottom: 12 },

  ratingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
  },
  ratingBlock: { paddingVertical: 16 },
  ratingHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingLabel: { fontSize: 15, fontWeight: '600', color: COLORS.white, lineHeight: 21 },
  ratingValueLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gold, lineHeight: 18 },
  ratingGuide: { fontSize: 12, color: COLORS.gray, lineHeight: 17, marginTop: 4, marginBottom: 12 },
  starInputRow: { flexDirection: 'row', gap: 6 },
  starTouch: { padding: 2 },
  ratingDivider: { height: 1, backgroundColor: COLORS.border },

  photoScroll: { marginBottom: 24 },
  photoAdd: {
    width: 82, height: 82, borderRadius: 10,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.gold,
    backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8, gap: 4,
  },
  photoAddCount: { fontSize: 11, color: COLORS.gray, lineHeight: 14 },
  photoThumb: { width: 82, height: 82, borderRadius: 10, marginRight: 8, position: 'relative' },
  photoPlaceholder: { width: 82, height: 82, borderRadius: 10, backgroundColor: COLORS.elevated },
  photoRemove: {
    position: 'absolute', top: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },

  textarea: {
    minHeight: 120,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 21,
  },
  counter: { fontSize: 11, color: COLORS.gray2, lineHeight: 15, textAlign: 'right', marginTop: 6 },

  noticeBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noticeText: { fontSize: 12, color: COLORS.gray, lineHeight: 18 },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.black,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: COLORS.elevated },
  submitText: { fontSize: 15, fontWeight: '700', color: COLORS.black, lineHeight: 20 },
  submitTextDisabled: { color: COLORS.gray2 },
});
