import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Config from 'react-native-config';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, CameraAddIcon, XIcon, WarningTriangleIcon, ChevronRightIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useImageUpload } from '../../hooks/useImageUpload';
import { deleteUpload } from '../../../data/api/upload';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import {
  ShopMatchingCategory,
  ShareRegion, ShareLighting, ShareBedCount,
  SHARE_REGION_OPTIONS,
} from '../../../domain/entities/shopTypes';
import { shopApi, ShopCategory } from '../../../data/api';
import BilingualSection from '../../components/common/BilingualSection';
import { useTranslation } from '../../store/languageStore';

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

/* ── 해외 부스쉐어 옵션 ── */
const OVERSEAS_COUNTRY_OPTS = ['일본', '미국', '프랑스', '독일', '영국', '태국', '싱가포르', '홍콩', '대만', '호주', '캐나다', '이탈리아', '기타'];
const OVERSEAS_CURRENCY_OPTS = ['USD', 'JPY', 'EUR', 'GBP', 'THB', 'SGD', 'HKD', 'TWD', 'AUD', 'KRW'];

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
  titleEn: string;
  region: ShareRegion | '';
  pricePerDay: string;
  bedCount: ShareBedCount | '';
  lighting: ShareLighting | '';
  maxOccupancy: string;
  description: string;
  descriptionEn: string;
  contact: string;
}

const EMPTY_BOOTH: BoothForm = {
  title: '', titleEn: '', region: '', pricePerDay: '', bedCount: '',
  lighting: '', maxOccupancy: '', description: '', descriptionEn: '', contact: '',
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

      <BilingualSection
        titleEn={form.titleEn}
        onChangeTitleEn={v => setForm(p => ({ ...p, titleEn: v }))}
        titlePlaceholder="e.g. Gangnam Tattoo Studio – Booth Share"
        titleMaxLength={40}
        descEn={form.descriptionEn}
        onChangeDescEn={v => setForm(p => ({ ...p, descriptionEn: v }))}
        descPlaceholder="Space features, amenities, rules, etc."
        descMaxLength={500}
      />
    </>
  );
};

/* ─────────────────────────────────────────────────────
 * 해외 부스 쉐어 폼
 * ───────────────────────────────────────────────────── */
interface OverseasBoothForm {
  title: string;
  country: string;
  city: string;
  pricePerDay: string;
  currency: string;
  bedCount: ShareBedCount | '';
  lighting: ShareLighting | '';
  description: string;
  contact: string;
}

const EMPTY_OVERSEAS_BOOTH: OverseasBoothForm = {
  title: '', country: '', city: '', pricePerDay: '', currency: 'USD',
  bedCount: '', lighting: '', description: '', contact: '',
};

const OverseasBoothShareForm = ({ form, setForm }: {
  form: OverseasBoothForm;
  setForm: React.Dispatch<React.SetStateAction<OverseasBoothForm>>;
}) => {
  const cityRef = useRef<GooglePlacesAutocompleteRef>(null);
  const toggle = useCallback((field: keyof OverseasBoothForm) => (v: string) => {
    setForm(p => ({ ...p, [field]: p[field] === v ? '' : v }));
  }, [setForm]);

  return (
    <>
      <SectionLabel label="제목 (Title)" required />
      <TextInput
        style={s.input}
        placeholder="e.g. Tokyo Shinjuku Booth Share – 1 Bed Available"
        placeholderTextColor={COLORS.gray2}
        value={form.title}
        onChangeText={v => setForm(p => ({ ...p, title: v }))}
        maxLength={60}
      />

      <SectionLabel label="국가 (Country)" required />
      <ChipSelect
        options={OVERSEAS_COUNTRY_OPTS}
        selected={form.country ? [form.country] : []}
        onToggle={toggle('country')}
      />

      <SectionLabel label="도시 / 위치 (City)" required />
      <View style={s.placesWrap}>
        <GooglePlacesAutocomplete
          ref={cityRef}
          placeholder="도시 검색 (예: Tokyo, Paris, New York)"
          query={{
            key: Config.GOOGLE_PLACES_API_KEY ?? '',
            language: 'en',
            types: '(cities)',
          }}
          fetchDetails={false}
          onPress={(data) => {
            setForm(p => ({ ...p, city: data.description }));
          }}
          textInputProps={{
            placeholderTextColor: COLORS.gray2,
            onChangeText: v => setForm(p => ({ ...p, city: v })),
          }}
          enablePoweredByContainer={false}
          styles={{
            container: { flex: 1 },
            textInputContainer: { backgroundColor: 'transparent' },
            textInput: s.placesInput,
            listView: s.placesList,
            row: s.placesRow,
            description: s.placesDescription,
            separator: { height: 1, backgroundColor: COLORS.border },
          }}
        />
      </View>

      <SectionLabel label="1일 가격" required />
      <View style={s.row}>
        <TextInput
          style={[s.input, s.flex1]}
          placeholder="예: 80"
          placeholderTextColor={COLORS.gray2}
          value={form.pricePerDay}
          onChangeText={v => setForm(p => ({ ...p, pricePerDay: v.replace(/[^0-9]/g, '') }))}
          keyboardType="numeric"
        />
        <View style={s.currencyWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <ChipSelect
              options={OVERSEAS_CURRENCY_OPTS}
              selected={[form.currency]}
              onToggle={v => setForm(p => ({ ...p, currency: v }))}
            />
          </ScrollView>
        </View>
      </View>

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

      <SectionLabel label="공간 소개 (Description)" required />
      <TextInput
        style={[s.input, s.textarea]}
        placeholder="Space features, amenities, rules, etc."
        placeholderTextColor={COLORS.gray2}
        value={form.description}
        onChangeText={v => setForm(p => ({ ...p, description: v }))}
        multiline
        maxLength={600}
      />

      <SectionLabel label="연락처 (Contact)" required />
      <TextInput
        style={s.input}
        placeholder="Instagram @username / Email / WhatsApp"
        placeholderTextColor={COLORS.gray2}
        value={form.contact}
        onChangeText={v => setForm(p => ({ ...p, contact: v }))}
        autoCapitalize="none"
      />
    </>
  );
};

/* ─────────────────────────────────────────────────────
 * 타투 모델 구인 폼
 * ───────────────────────────────────────────────────── */
interface ModelForm {
  title: string;
  titleEn: string;
  region: string;
  styles: string[];
  materialFee: string;
  workPeriod: string;
  description: string;
  descriptionEn: string;
  contact: string;
}

const EMPTY_MODEL: ModelForm = {
  title: '', titleEn: '', region: '', styles: [], materialFee: '', workPeriod: '',
  description: '', descriptionEn: '', contact: '',
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

      <BilingualSection
        titleEn={form.titleEn}
        onChangeTitleEn={v => setForm(p => ({ ...p, titleEn: v }))}
        titlePlaceholder="e.g. Looking for a mini tattoo model"
        titleMaxLength={40}
        descEn={form.descriptionEn}
        onChangeDescEn={v => setForm(p => ({ ...p, descriptionEn: v }))}
        descPlaceholder="Body part, size, requirements, etc."
        descMaxLength={500}
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
  descriptionEn: string;
  instagramUrl: string;
  contact: string;
}

const EMPTY_MEDIA: MediaForm = {
  specialty: '', nickname: '', region: '', experience: '',
  workKinds: [], priceMin: '', priceMax: '', description: '', descriptionEn: '',
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

      <BilingualSection
        descEn={form.descriptionEn}
        onChangeDescEn={v => setForm(p => ({ ...p, descriptionEn: v }))}
        descPlaceholder="Introduce your work style, equipment, and portfolio in English."
        descMaxLength={500}
      />
    </>
  );
};

/* ─────────────────────────────────────────────────────
 * 이미지 추가 섹션
 * ───────────────────────────────────────────────────── */
const ImageSection = ({ images, onAdd, onRemove, uploading }: {
  images: string[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  uploading: boolean;
}) => (
  <View>
    <SectionLabel label="사진 첨부" />
    <Text style={s.imageHint}>최대 10장 · 첫 번째 사진이 대표 이미지로 사용됩니다</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.imageScroll}>
      <TouchableOpacity style={s.imageAdd} onPress={onAdd} activeOpacity={0.75} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color={COLORS.gold} />
        ) : (
          <>
            <CameraAddIcon size={32} color={COLORS.gold} />
            <Text style={s.imageAddCount}>{images.length}/10</Text>
          </>
        )}
      </TouchableOpacity>
      {images.map((uri, i) => (
        <View key={uri} style={s.imageThumb}>
          <Image source={{ uri }} style={s.imagePlaceholder} resizeMode="cover" />
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
  const { t } = useTranslation();

  const [category, setCategory] = useState<ShopMatchingCategory>(
    route.params?.initialCategory ?? '부스 쉐어',
  );
  const [boothKind, setBoothKind] = useState<'domestic' | 'overseas'>(
    route.params?.boothKind ?? 'domestic',
  );
  const [images, setImages] = useState<string[]>([]);
  const [boothForm, setBoothForm] = useState<BoothForm>(EMPTY_BOOTH);
  const [overseasBoothForm, setOverseasBoothForm] = useState<OverseasBoothForm>(EMPTY_OVERSEAS_BOOTH);
  const [modelForm, setModelForm] = useState<ModelForm>(EMPTY_MODEL);
  const [mediaForm, setMediaForm] = useState<MediaForm>(EMPTY_MEDIA);
  const [submitting, setSubmitting] = useState(false);

  const { pickAndUpload, uploading } = useImageUpload({
    scope: 'shop',
    max: 10,
    current: images.length,
    onError: (m) => toast(m, { variant: 'error' }),
  });

  const handleAddImage = useCallback(async () => {
    const urls = await pickAndUpload();
    if (urls.length) setImages(p => [...p, ...urls]);
  }, [pickAndUpload]);

  const handleRemoveImage = useCallback((i: number) => {
    setImages(p => {
      deleteUpload(p[i]);
      return p.filter((_, idx) => idx !== i);
    });
  }, []);

  const isValid = useCallback((): boolean => {
    if (category === '부스 쉐어') {
      if (boothKind === 'overseas') {
        return !!(overseasBoothForm.title.trim() && overseasBoothForm.country && overseasBoothForm.city.trim() && overseasBoothForm.pricePerDay && overseasBoothForm.currency && overseasBoothForm.bedCount && overseasBoothForm.description.trim() && overseasBoothForm.contact.trim());
      }
      return !!(boothForm.title.trim() && boothForm.region && boothForm.pricePerDay && boothForm.bedCount && boothForm.description.trim() && boothForm.contact.trim());
    }
    if (category === '타투 모델 구인 (비기너)') {
      return !!(modelForm.title.trim() && modelForm.region && modelForm.styles.length > 0 && modelForm.workPeriod.trim() && modelForm.description.trim() && modelForm.contact.trim());
    }
    return !!(mediaForm.specialty && mediaForm.nickname.trim() && mediaForm.region && mediaForm.experience && mediaForm.workKinds.length > 0 && mediaForm.description.trim() && mediaForm.contact.trim());
  }, [category, boothKind, boothForm, overseasBoothForm, modelForm, mediaForm]);

  const categoryToApi: Record<ShopMatchingCategory, ShopCategory> = {
    '부스 쉐어': 'booth_share',
    '타투 모델 구인 (비기너)': 'model_recruit',
    '사진/영상 편집자': 'media_expert',
  };

  const buildBody = useCallback(() => {
    if (category === '부스 쉐어') {
      if (boothKind === 'overseas') {
        const f = overseasBoothForm;
        return {
          category: 'booth_share_overseas' as ShopCategory,
          title: f.title.trim(),
          titleEn: f.title.trim(),
          description: f.description.trim(),
          descriptionEn: f.description.trim(),
          region: `${f.city.trim()}, ${f.country}`,
          images,
          contact: f.contact.trim() || null,
          priceKrw: null,
          attributes: {
            country: f.country,
            city: f.city.trim(),
            pricePerDay: f.pricePerDay ? Number(f.pricePerDay) : null,
            currency: f.currency,
            bedCount: f.bedCount,
            lighting: f.lighting || null,
          },
        };
      }
      return {
        category: 'booth_share' as ShopCategory,
        title: boothForm.title.trim(),
        titleEn: boothForm.titleEn.trim() || null,
        description: boothForm.description.trim(),
        descriptionEn: boothForm.descriptionEn.trim() || null,
        region: boothForm.region || null,
        images,
        contact: boothForm.contact.trim() || null,
        priceKrw: boothForm.pricePerDay ? Number(boothForm.pricePerDay) : null,
        attributes: {
          bedCount: boothForm.bedCount,
          lighting: boothForm.lighting || null,
          maxOccupancy: boothForm.maxOccupancy ? Number(boothForm.maxOccupancy) : null,
        },
      };
    }
    if (category === '타투 모델 구인 (비기너)') {
      return {
        category: 'model_recruit' as ShopCategory,
        title: modelForm.title.trim(),
        titleEn: modelForm.titleEn.trim() || null,
        description: modelForm.description.trim(),
        descriptionEn: modelForm.descriptionEn.trim() || null,
        region: modelForm.region || null,
        images,
        contact: modelForm.contact.trim() || null,
        priceKrw: modelForm.materialFee ? Number(modelForm.materialFee) : null,
        attributes: {
          styles: modelForm.styles,
          workPeriod: modelForm.workPeriod.trim(),
        },
      };
    }
    return {
      category: 'media_expert' as ShopCategory,
      title: `[${mediaForm.specialty}] ${mediaForm.nickname.trim()}`,
      description: mediaForm.description.trim(),
      descriptionEn: mediaForm.descriptionEn.trim() || null,
      region: mediaForm.region || null,
      images,
      contact: mediaForm.contact.trim() || null,
      priceKrw: mediaForm.priceMin ? Number(mediaForm.priceMin) : null,
      attributes: {
        specialty: mediaForm.specialty,
        nickname: mediaForm.nickname.trim(),
        experience: mediaForm.experience,
        workKinds: mediaForm.workKinds,
        priceMin: mediaForm.priceMin ? Number(mediaForm.priceMin) : null,
        priceMax: mediaForm.priceMax ? Number(mediaForm.priceMax) : null,
        instagramUrl: mediaForm.instagramUrl.trim() || null,
      },
    };
  }, [category, boothKind, boothForm, overseasBoothForm, modelForm, mediaForm, images]);

  const handleSubmit = useCallback(async () => {
    if (!isValid()) {
      toast(t('shop.writeRequired'), { variant: 'error' });
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await shopApi.create(buildBody());
      toast(t('shop.writeSuccess'), { variant: 'success' });
      navigation.goBack();
    } catch {
      toast(t('shop.writeFailed'), { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [isValid, submitting, buildBody, toast, navigation, t]);

  const handleCategoryChange = useCallback((cat: ShopMatchingCategory) => {
    setCategory(cat);
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('shop.writeHeader')}</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[s.submitBtn, isValid() && s.submitBtnActive]}
          activeOpacity={0.8}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.black} />
          ) : (
            <Text style={[s.submitText, isValid() && s.submitTextActive]}>{t('shop.writeSubmit')}</Text>
          )}
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
              {cat === '부스 쉐어' ? t('shop.tab.booth') :
               cat === '타투 모델 구인 (비기너)' ? t('shop.tab.model') : t('shop.tab.media')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 부스 쉐어 국내/해외 서브탭 */}
      {category === '부스 쉐어' && (
        <View style={s.boothKindBar}>
          <TouchableOpacity
            onPress={() => setBoothKind('domestic')}
            style={[s.boothKindTab, boothKind === 'domestic' && s.boothKindTabActive]}
            activeOpacity={0.75}
          >
            <Text style={[s.boothKindText, boothKind === 'domestic' && s.boothKindTextActive]}>
              국내 부스쉐어
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setBoothKind('overseas')}
            style={[s.boothKindTab, boothKind === 'overseas' && s.boothKindTabActive]}
            activeOpacity={0.75}
          >
            <Text style={[s.boothKindText, boothKind === 'overseas' && s.boothKindTextActive]}>
              해외 부스쉐어
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
          <ImageSection images={images} onAdd={handleAddImage} onRemove={handleRemoveImage} uploading={uploading} />

          <View style={s.divider} />

          {/* 카테고리별 폼 */}
          {category === '부스 쉐어' && boothKind === 'overseas' && (
            <OverseasBoothShareForm form={overseasBoothForm} setForm={setOverseasBoothForm} />
          )}
          {category === '부스 쉐어' && boothKind === 'domestic' && (
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
              <Text style={s.policyTitle}>{t('shop.writePolicyTitle')}</Text>
              <Text style={s.policyDesc}>{t('shop.writePolicyDesc')}</Text>
              <View style={s.policyLinkRow}>
                <Text style={s.policyLink}>{t('shop.writePolicyLink')}</Text>
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

  /* 국내/해외 서브탭 */
  boothKindBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  boothKindTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  boothKindTabActive: { borderBottomColor: COLORS.gold },
  boothKindText: { fontSize: 13, color: COLORS.gray, fontWeight: '500', lineHeight: 18 },
  boothKindTextActive: { color: COLORS.gold, fontWeight: '700' },

  /* 통화 선택 */
  currencyWrap: { flex: 1 },

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

  /* Places Autocomplete */
  placesWrap: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 50,
  },
  placesInput: {
    backgroundColor: 'transparent',
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
    height: 44,
    margin: 0,
    paddingHorizontal: 14,
  },
  placesList: {
    position: 'absolute' as any,
    top: 46,
    left: 0,
    right: 0,
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    zIndex: 200,
    elevation: 10,
  },
  placesRow: {
    backgroundColor: COLORS.elevated,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  placesDescription: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
  },
});
