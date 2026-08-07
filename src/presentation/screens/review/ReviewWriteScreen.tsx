import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Image, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, StarIcon, PersonSilhouette, CameraAddIcon, XIcon,
  CalendarIcon, PaletteIcon, LocationPinIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import {
  ReviewRatings, RATING_LABELS, RATING_GUIDES,
} from '../../../domain/entities/reviewTypes';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteP = RouteProp<RootStackParamList, 'ReviewWrite'>;

const TEXT_MIN = 10;
const TEXT_MAX = 500;
const PHOTO_MAX = 5;

const RATING_VALUE_LABEL = ['', '별로예요', '아쉬워요', '보통이에요', '좋아요', '최고예요'];

/* 터치로 매기는 별점 입력 */
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

const RatingBlock = React.memo(({ label, guide, value, onChange }: {
  label: string;
  guide: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <View style={s.ratingBlock}>
    <View style={s.ratingHead}>
      <Text style={s.ratingLabel}>{label}</Text>
      <Text style={s.ratingValueLabel}>{value > 0 ? RATING_VALUE_LABEL[value] : ''}</Text>
    </View>
    <Text style={s.ratingGuide}>{guide}</Text>
    <StarInput value={value} onChange={onChange} />
  </View>
));
RatingBlock.displayName = 'RatingBlock';

const ReviewWriteScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const { toast } = useToast();
  const { review } = route.params;

  const [ratings, setRatings] = useState<ReviewRatings>({
    pain: 0, kindness: 0, hygiene: 0, satisfaction: 0,
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [text, setText] = useState('');

  const setRating = useCallback((key: keyof ReviewRatings) => (v: number) => {
    setRatings((prev) => ({ ...prev, [key]: v }));
  }, []);

  const addPhoto = useCallback(() => {
    if (photos.length >= PHOTO_MAX) {
      toast(`사진은 최대 ${PHOTO_MAX}장까지 첨부할 수 있어요`, { variant: 'error' });
      return;
    }
    setPhotos((prev) => [...prev, `placeholder_${prev.length}`]);
  }, [photos.length, toast]);

  const removePhoto = useCallback((i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const allRated = useMemo(
    () => RATING_LABELS.every((r) => ratings[r.key] > 0),
    [ratings],
  );
  const textValid = text.trim().length >= TEXT_MIN;
  const canSubmit = allRated && textValid;

  const handleSubmit = useCallback(() => {
    if (!allRated) {
      toast('4가지 항목을 모두 별점으로 평가해주세요', { variant: 'error' });
      return;
    }
    if (!textValid) {
      toast(`리뷰 내용을 ${TEXT_MIN}자 이상 작성해주세요`, { variant: 'error' });
      return;
    }
    toast(`리뷰가 등록되었습니다. ${review.rewardPoint.toLocaleString()}P가 지급되었어요.`, { variant: 'success' });
    navigation.goBack();
  }, [allRated, textValid, review.rewardPoint, toast, navigation]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>리뷰 작성</Text>
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
          {/* 아티스트 · 시술 정보 */}
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

          {/* 4항목 별점 */}
          <Text style={s.sectionTitle}>항목별 평가</Text>
          <Text style={s.sectionSub}>실제 시술 경험을 바탕으로 4가지 항목을 평가해주세요.</Text>
          <View style={s.ratingsCard}>
            {RATING_LABELS.map((r, i) => (
              <View key={r.key}>
                <RatingBlock
                  label={r.label}
                  guide={RATING_GUIDES[r.key]}
                  value={ratings[r.key]}
                  onChange={setRating(r.key)}
                />
                {i < RATING_LABELS.length - 1 && <View style={s.ratingDivider} />}
              </View>
            ))}
          </View>

          {/* 사진 첨부 */}
          <Text style={s.sectionTitle}>사진 첨부</Text>
          <Text style={s.sectionSub}>실제 시술 사진은 다른 유저에게 큰 도움이 됩니다. (최대 {PHOTO_MAX}장)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoScroll}>
            <TouchableOpacity style={s.photoAdd} onPress={addPhoto} activeOpacity={0.75}>
              <CameraAddIcon size={30} color={COLORS.gold} />
              <Text style={s.photoAddCount}>{photos.length}/{PHOTO_MAX}</Text>
            </TouchableOpacity>
            {photos.map((_, i) => (
              <View key={i} style={s.photoThumb}>
                <View style={s.photoPlaceholder} />
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

          {/* 텍스트 */}
          <Text style={s.sectionTitle}>리뷰 내용</Text>
          <TextInput
            style={s.textarea}
            placeholder={`시술 경험을 솔직하게 남겨주세요. (${TEXT_MIN}자 이상)`}
            placeholderTextColor={COLORS.gray2}
            value={text}
            onChangeText={(v) => setText(v.slice(0, TEXT_MAX))}
            multiline
            textAlignVertical="top"
          />
          <Text style={s.counter}>{text.length}/{TEXT_MAX}</Text>

          <View style={s.noticeBox}>
            <Text style={s.noticeText}>
              작성한 리뷰는 실제 시술 인증 정보를 바탕으로 공개되며, 허위 · 비방성 리뷰는
              운영 정책에 따라 제한될 수 있습니다.
            </Text>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
            activeOpacity={0.85}
          >
            <Text style={[s.submitText, !canSubmit && s.submitTextDisabled]}>
              리뷰 등록하고 {review.rewardPoint.toLocaleString()}P 받기
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
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white, letterSpacing: 0.3 },

  /* artist card */
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

  /* ratings */
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

  /* photos */
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

  /* text */
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
    paddingBottom: 20,
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
