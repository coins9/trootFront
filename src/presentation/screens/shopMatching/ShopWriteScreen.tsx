import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, CameraAddIcon, XIcon, WarningTriangleIcon, ChevronRightIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import {
  ShopMatchingCategory,
  ShareRegion, ShareLighting, ShareBedCount,
  SHARE_REGION_OPTIONS,
} from '../../../domain/entities/shopTypes';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteP = RouteProp<RootStackParamList, 'ShopWrite'>;

/* ── 카테고리 탭 ── */
const CATEGORIES: ShopMatchingCategory[] = [
  '부스 쉐어',
  '타투 모델 구인 (비기너)',
  '사진/영상 편집자',
];

/* ── 공통 옵션 ── */
const REGION_OPTS = SHARE_REGION_OPTIONS.filter(r => r !== '전체');
const STYLE_OPTS = ['블랙워크', '라인워크', '올드스쿨', '뉴스쿨', '이레즈미', '수채화', '미니타투', '커버업'];

/* ── 칩 선택 컴포넌트 ── */
const ChipSelect = React.memo(({
  options, selected, onToggle, multi = false,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  multi?: boolean;
}) => (
  <View style={s.chipRow}>
    {options.map(opt => {
      const active = selected.includes(opt);
      return (
        <TouchableOpacity
          key={opt}
          onPress={() => onToggle(opt)}
          activeOpacity={0.75}
          style={[s.chip, active && s.chipActive]}
        >
          <Text style={[s.chipText, active && s.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
));

/* ── 섹션 레이블 ── */
const SectionLabel = ({ label, required }: { label: string; required?: boolean }) => (
  <View style={s.sectionLabelRow}>
    <Text style={s.sectionLabel}>{label}</Text>
    {required && <Text style={s.required}>*</Text>}
  </View>
);

/* ─────────────────────────────────────────────────────
 * 부스 쉐어 폼
 * ───────────────────────────────────────────────────── */
interface BoothForm {
  title: string;
  region: ShareRegion | '';
  pricePerDay: string;
  bedCount: ShareBedCount | '';
  lighting: ShareLighting | '';
  maxOccupancy: string;
  description: string;
  contact: string;
}

const EMPTY_BOOTH: BoothForm = {
  title: '', region: '', pricePerDay: '', bedCount: '',
  lighting: '', maxOccupancy: '', description: '', contact: '',
};

const BoothShareForm = ({ form, setForm }: {
  form: BoothForm;
  setForm: React.Dispatch<React.SetStateAction<BoothForm>>;
}) => {
  const toggle = useCallback((field: keyof BoothForm) => (v: string) => {
    setForm(p => ({ ...p, [field]: p[field] === v ? '' : v }));
  }, [setForm]);

  return (
    <>
      <SectionLabel label="제목" required />
      <TextInput
        style={s.input}
        placeholder="공간 이름 또는 제목을 입력해주세요"
        placeholderTextColor={COLORS.gray2}
        value={form.title}
        onChangeText={v => setForm(p => ({ ...p, title: v }))}
        maxLength={40}
      />

      <SectionLabel label="지역" required />
      <ChipSelect
        options={REGION_OPTS}
        selected={form.region ? [form.region] : []}
        onToggle={toggle('region')}
      />

      <SectionLabel label="1일 가격 (원)" required />
      <TextInput
        style={s.input}
        placeholder="예: 80000"
        placeholderTextColor={COLORS.gray2}
        value={form.pricePerDay}
        onChangeText={v => setForm(p => ({ ...p, pricePerDay: v.replace(/[^0-9]/g, '') }))}
        keyboardType="numeric"
      />

      <SectionLabel label="베드 수" required />
      <ChipSelect
        options={['1대', '2대', '3대', '4대 이상']}
        selected={form.bedCount ? [form.bedCount] : []}
        onToggle={toggle('bedCount')}
      />

      <SectionLabel label="조명 환경" />
      <ChipSelect
        options={['LED (백색광)', '자연광', '조도 조절 (디밍)', '촬영용 조명 구비']}
        selected={form.lighting ? [form.lighting] : []}
        onToggle={toggle('lighting')}
      />

      <SectionLabel label="최대 인원" />
      <TextInput
        style={s.input}
        placeholder="예: 3"
        placeholderTextColor={COLORS.gray2}
        value={form.maxOccupancy}
        onChangeText={v => setForm(p => ({ ...p, maxOccupancy: v.replace(/[^0-9]/g, '') }))}
        keyboardType="numeric"
      />

      <SectionLabel label="공간 소개" required />
      <TextInput
        style={[s.input, s.textarea]}
        placeholder="공간 특징, 편의시설, 규칙 등을 자세히 적어주세요"
        placeholderTextColor={COLORS.gray2}
        value={form.description}
        onChangeText={v => setForm(p => ({ ...p, description: v }))}
        multiline
        maxLength={500}
      />

      <SectionLabel label="연락처 (카카오 오픈채팅 또는 전화)" required />
      <TextInput
        style={s.input}
        placeholder="예: open.kakao.com/... 또는 010-XXXX-XXXX"
        placeholderTextColor={COLORS.gray2}
        value={form.contact}
        onChangeText={v => setForm(p => ({ ...p, contact: v }))}
      />
    </>
  );
};

/* ─────────────────────────────────────────────────────
 * 타투 모델 구인 폼
 * ───────────────────────────────────────────────────── */
interface ModelForm {
  title: string;
  region: string;
  styles: string[];
  materialFee: string;
  workPeriod: string;
  description: string;
  contact: string;
}

const EMPTY_MODEL: ModelForm = {
  title: '', region: '', styles: [], materialFee: '', workPeriod: '', description: '', contact: '',
};

const ModelRecruitForm = ({ form, setForm }: {
  form: ModelForm;
  setForm: React.Dispatch<React.SetStateAction<ModelForm>>;
}) => {
  const toggleRegion = useCallback((v: string) => {
    setForm(p => ({ ...p, region: p.region === v ? '' : v }));
  }, [setForm]);

  const toggleStyle = useCallback((v: string) => {
    setForm(p => ({
      ...p,
      styles: p.styles.includes(v) ? p.styles.filter(s => s !== v) : [...p.styles, v],
    }));
  }, [setForm]);

  return (
    <>
      <SectionLabel label="공고 제목" required />
      <TextInput
        style={s.input}
        placeholder="예: 미니타투 무료 모델 구합니다"
        placeholderTextColor={COLORS.gray2}
        value={form.title}
        onChangeText={v => setForm(p => ({ ...p, title: v }))}
        maxLength={40}
      />

      <SectionLabel label="지역" required />
      <ChipSelect
        options={REGION_OPTS}
        selected={form.region ? [form.region] : []}
        onToggle={toggleRegion}
      />

      <SectionLabel label="작업 스타일" required />
      <ChipSelect
        options={STYLE_OPTS}
        selected={form.styles}
        onToggle={toggleStyle}
        multi
      />

      <SectionLabel label="재료비 (원)" />
      <TextInput
        style={s.input}
        placeholder="무료면 0 입력"
        placeholderTextColor={COLORS.gray2}
        value={form.materialFee}
        onChangeText={v => setForm(p => ({ ...p, materialFee: v.replace(/[^0-9]/g, '') }))}
        keyboardType="numeric"
      />

      <SectionLabel label="작업 가능 기간" required />
      <TextInput
        style={s.input}
        placeholder="예: 2026년 8월 중, 주말 가능"
        placeholderTextColor={COLORS.gray2}
        value={form.workPeriod}
        onChangeText={v => setForm(p => ({ ...p, workPeriod: v }))}
        maxLength={50}
      />

      <SectionLabel label="상세 내용" required />
      <TextInput
        style={[s.input, s.textarea]}
        placeholder="작업 부위, 크기, 주의사항 등을 상세히 적어주세요"
        placeholderTextColor={COLORS.gray2}
        value={form.description}
        onChangeText={v => setForm(p => ({ ...p, description: v }))}
        multiline
        maxLength={500}
      />

      <SectionLabel label="연락처" required />
      <TextInput
        style={s.input}
        placeholder="카카오 오픈채팅 또는 전화번호"
        placeholderTextColor={COLORS.gray2}
        value={form.contact}
        onChangeText={v => setForm(p => ({ ...p, contact: v }))}
      />
    </>
  );
};

/* ─────────────────────────────────────────────────────
 * 사진/영상 편집자 폼
 * ───────────────────────────────────────────────────── */
interface MediaForm {
  specialty: '사진' | '영상' | '';
  nickname: string;
  region: string;
  experience: string;
  workKinds: string[];
  priceMin: string;
  priceMax: string;
  description: string;
  instagramUrl: string;
  contact: string;
}

const EMPTY_MEDIA: MediaForm = {
  specialty: '', nickname: '', region: '', experience: '',
  workKinds: [], priceMin: '', priceMax: '', description: '',
  instagramUrl: '', contact: '',
};

const EXPERIENCE_OPTS = ['1년 미만', '1~3년', '3~5년', '5년 이상'];

const MediaExpertForm = ({ form, setForm }: {
  form: MediaForm;
  setForm: React.Dispatch<React.SetStateAction<MediaForm>>;
}) => {
  const toggleRegion = useCallback((v: string) => {
    setForm(p => ({ ...p, region: p.region === v ? '' : v }));
  }, [setForm]);

  const toggleExp = useCallback((v: string) => {
    setForm(p => ({ ...p, experience: p.experience === v ? '' : v }));
  }, [setForm]);

  const toggleWork = useCallback((v: string) => {
    setForm(p => ({
      ...p,
      workKinds: p.workKinds.includes(v) ? p.workKinds.filter(w => w !== v) : [...p.workKinds, v],
    }));
  }, [setForm]);

  return (
    <>
      <SectionLabel label="전문 분야" required />
      <ChipSelect
        options={['사진', '영상']}
        selected={form.specialty ? [form.specialty] : []}
        onToggle={v => setForm(p => ({ ...p, specialty: p.specialty === v ? '' : v as any }))}
      />

      <SectionLabel label="닉네임 / 활동명" required />
      <TextInput
        style={s.input}
        placeholder="예: 사진작가 김민준"
        placeholderTextColor={COLORS.gray2}
        value={form.nickname}
        onChangeText={v => setForm(p => ({ ...p, nickname: v }))}
        maxLength={30}
      />

      <SectionLabel label="활동 지역" required />
      <ChipSelect
        options={REGION_OPTS}
        selected={form.region ? [form.region] : []}
        onToggle={toggleRegion}
      />

      <SectionLabel label="경력" required />
      <ChipSelect
        options={EXPERIENCE_OPTS}
        selected={form.experience ? [form.experience] : []}
        onToggle={toggleExp}
      />

      <SectionLabel label="작업 종류 (복수 선택)" required />
      <ChipSelect
        options={['사진 촬영', '사진 보정', '영상 촬영', '영상 편집']}
        selected={form.workKinds}
        onToggle={toggleWork}
        multi
      />

      <SectionLabel label="견적 범위 (원)" />
      <View style={s.row}>
        <TextInput
          style={[s.input, s.flex1]}
          placeholder="최소"
          placeholderTextColor={COLORS.gray2}
          value={form.priceMin}
          onChangeText={v => setForm(p => ({ ...p, priceMin: v.replace(/[^0-9]/g, '') }))}
          keyboardType="numeric"
        />
        <Text style={s.rangeSep}>~</Text>
        <TextInput
          style={[s.input, s.flex1]}
          placeholder="최대"
          placeholderTextColor={COLORS.gray2}
          value={form.priceMax}
          onChangeText={v => setForm(p => ({ ...p, priceMax: v.replace(/[^0-9]/g, '') }))}
          keyboardType="numeric"
        />
      </View>

      <SectionLabel label="소개 및 작업 스타일" required />
      <TextInput
        style={[s.input, s.textarea]}
        placeholder="작업 방식, 장비, 포트폴리오 링크 등을 자유롭게 적어주세요"
        placeholderTextColor={COLORS.gray2}
        value={form.description}
        onChangeText={v => setForm(p => ({ ...p, description: v }))}
        multiline
        maxLength={500}
      />

      <SectionLabel label="인스타그램" />
      <TextInput
        style={s.input}
        placeholder="@username"
        placeholderTextColor={COLORS.gray2}
        value={form.instagramUrl}
        onChangeText={v => setForm(p => ({ ...p, instagramUrl: v }))}
        autoCapitalize="none"
      />

      <SectionLabel label="연락처" required />
      <TextInput
        style={s.input}
        placeholder="카카오 오픈채팅 또는 전화번호"
        placeholderTextColor={COLORS.gray2}
        value={form.contact}
        onChangeText={v => setForm(p => ({ ...p, contact: v }))}
      />
    </>
  );
};

/* ─────────────────────────────────────────────────────
 * 이미지 추가 섹션
 * ───────────────────────────────────────────────────── */
const ImageSection = ({ images, onAdd, onRemove }: {
  images: string[];
  onAdd: () => void;
  onRemove: (i: number) => void;
}) => (
  <View>
    <SectionLabel label="사진 첨부" />
    <Text style={s.imageHint}>최대 10장 · 첫 번째 사진이 대표 이미지로 사용됩니다</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.imageScroll}>
      <TouchableOpacity style={s.imageAdd} onPress={onAdd} activeOpacity={0.75}>
        <CameraAddIcon size={32} color={COLORS.gold} />
        <Text style={s.imageAddCount}>{images.length}/10</Text>
      </TouchableOpacity>
      {images.map((_, i) => (
        <View key={i} style={s.imageThumb}>
          <View style={s.imagePlaceholder} />
          <TouchableOpacity
            style={s.imageRemoveBtn}
            onPress={() => onRemove(i)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <XIcon size={10} color={COLORS.white} strokeWidth={2.5} />
          </TouchableOpacity>
          {i === 0 && (
            <View style={s.imageBadge}>
              <Text style={s.imageBadgeText}>대표</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  </View>
);

/* ─────────────────────────────────────────────────────
 * 메인 화면
 * ───────────────────────────────────────────────────── */
const ShopWriteScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();

  const [category, setCategory] = useState<ShopMatchingCategory>(
    route.params?.initialCategory ?? '부스 쉐어',
  );
  const [images, setImages] = useState<string[]>([]);
  const [boothForm, setBoothForm] = useState<BoothForm>(EMPTY_BOOTH);
  const [modelForm, setModelForm] = useState<ModelForm>(EMPTY_MODEL);
  const [mediaForm, setMediaForm] = useState<MediaForm>(EMPTY_MEDIA);

  const handleAddImage = useCallback(() => {
    if (images.length >= 10) {
      toast('사진은 최대 10장까지 첨부 가능합니다', { variant: 'error' });
      return;
    }
    setImages(p => [...p, `placeholder_${p.length}`]);
  }, [images.length, toast]);

  const handleRemoveImage = useCallback((i: number) => {
    setImages(p => p.filter((_, idx) => idx !== i));
  }, []);

  const isValid = useCallback((): boolean => {
    if (category === '부스 쉐어') {
      return !!(boothForm.title.trim() && boothForm.region && boothForm.pricePerDay && boothForm.bedCount && boothForm.description.trim() && boothForm.contact.trim());
    }
    if (category === '타투 모델 구인 (비기너)') {
      return !!(modelForm.title.trim() && modelForm.region && modelForm.styles.length > 0 && modelForm.workPeriod.trim() && modelForm.description.trim() && modelForm.contact.trim());
    }
    return !!(mediaForm.specialty && mediaForm.nickname.trim() && mediaForm.region && mediaForm.experience && mediaForm.workKinds.length > 0 && mediaForm.description.trim() && mediaForm.contact.trim());
  }, [category, boothForm, modelForm, mediaForm]);

  const handleSubmit = useCallback(() => {
    if (!isValid()) {
      toast('필수 항목을 모두 입력해주세요', { variant: 'error' });
      return;
    }
    toast('글이 등록되었습니다', { variant: 'success' });
    navigation.goBack();
  }, [isValid, toast, navigation]);

  const handleCategoryChange = useCallback((cat: ShopMatchingCategory) => {
    setCategory(cat);
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>글쓰기</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[s.submitBtn, isValid() && s.submitBtnActive]}
          activeOpacity={0.8}
        >
          <Text style={[s.submitText, isValid() && s.submitTextActive]}>등록</Text>
        </TouchableOpacity>
      </View>

      {/* 카테고리 탭 */}
      <View style={s.tabBar}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => handleCategoryChange(cat)}
            style={[s.tab, category === cat && s.tabActive]}
            activeOpacity={0.75}
          >
            <Text style={[s.tabText, category === cat && s.tabTextActive]} numberOfLines={1}>
              {cat === '부스 쉐어' ? '부스 쉐어' :
               cat === '타투 모델 구인 (비기너)' ? '타투 모델' : '사진/영상'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView
        style={s.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={s.scroll}
          contentContainerStyle={[s.scrollContent, { paddingBottom: 40 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 이미지 섹션 */}
          <ImageSection images={images} onAdd={handleAddImage} onRemove={handleRemoveImage} />

          <View style={s.divider} />

          {/* 카테고리별 폼 */}
          {category === '부스 쉐어' && (
            <BoothShareForm form={boothForm} setForm={setBoothForm} />
          )}
          {category === '타투 모델 구인 (비기너)' && (
            <ModelRecruitForm form={modelForm} setForm={setModelForm} />
          )}
          {category === '사진/영상 편집자' && (
            <MediaExpertForm form={mediaForm} setForm={setMediaForm} />
          )}

          {/* 운영 정책 안내 */}
          <TouchableOpacity
            style={s.policyBanner}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SafetyPolicy')}
          >
            <WarningTriangleIcon size={16} color={COLORS.gold} />
            <View style={s.policyTextWrap}>
              <Text style={s.policyTitle}>게시 전 꼭 확인해주세요</Text>
              <Text style={s.policyDesc}>
                표기 가격과 현장 가격이 크게 다른 기망행위, 도안 · 포트폴리오 도용,
                등록 정보와 다른 시술자(대리 · 수강생) 작업은 제재 대상입니다.
              </Text>
              <View style={s.policyLinkRow}>
                <Text style={s.policyLink}>이용 안전 정책 자세히 보기</Text>
                <ChevronRightIcon size={13} color={COLORS.gold} />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ShopWriteScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  flex1: { flex: 1 },
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 20 },

  /* 정책 배너 */
  policyBanner: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.28)',
  },
  policyTextWrap: { flex: 1, gap: 5 },
  policyTitle: { fontSize: 13, fontWeight: '700', color: COLORS.gold, lineHeight: 18 },
  policyDesc: { fontSize: 12, color: COLORS.gray, lineHeight: 18 },
  policyLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  policyLink: { fontSize: 12, fontWeight: '600', color: COLORS.gold, lineHeight: 16 },

  /* 헤더 */
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
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.elevated,
  },
  submitBtnActive: { backgroundColor: COLORS.gold },
  submitText: { fontSize: 14, fontWeight: '600', color: COLORS.gray },
  submitTextActive: { color: COLORS.black },

  /* 카테고리 탭 */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.gold },
  tabText: { fontSize: 13, color: COLORS.gray, fontWeight: '500' },
  tabTextActive: { color: COLORS.gold, fontWeight: '700' },

  /* 섹션 레이블 */
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 8 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  required: { fontSize: 14, color: COLORS.gold, marginLeft: 3 },

  /* 입력 필드 */
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    lineHeight: 20,
  },
  textarea: { minHeight: 110, textAlignVertical: 'top', lineHeight: 22 },

  /* 칩 */
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.card,
  },
  chipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  chipText: { fontSize: 13, color: COLORS.gray, lineHeight: 18 },
  chipTextActive: { color: COLORS.gold, fontWeight: '600' },

  /* 이미지 */
  imageHint: { fontSize: 12, color: COLORS.gray2, marginBottom: 10, lineHeight: 16 },
  imageScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  imageAdd: {
    width: 86,
    height: 86,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.gold,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    gap: 4,
  },
  imageAddCount: { fontSize: 11, color: COLORS.gray, lineHeight: 14 },
  imageThumb: { width: 86, height: 86, borderRadius: 10, marginRight: 8, position: 'relative' },
  imagePlaceholder: { width: 86, height: 86, borderRadius: 10, backgroundColor: COLORS.elevated },
  imageRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  imageBadgeText: { fontSize: 10, color: COLORS.black, fontWeight: '700', lineHeight: 13 },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },

  /* 레이아웃 헬퍼 */
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rangeSep: { fontSize: 16, color: COLORS.gray, fontWeight: '500' },
});
