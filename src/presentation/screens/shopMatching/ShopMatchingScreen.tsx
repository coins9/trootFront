import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import ShopShareCard from '../../components/shopMatching/ShopShareCard';
import BeginnerModelCard from '../../components/shopMatching/BeginnerModelCard';
import MediaExpertCard from '../../components/shopMatching/MediaExpertCard';
import ShareFilterBottomSheet from '../../components/shopMatching/ShareFilterBottomSheet';
import {
  RegionIcon, LightIcon, BedIcon, PeopleIcon, ChevronDownIcon, PenIcon,
  WarningTriangleIcon, CameraSolidIcon, VideoFilmIcon, InfoIcon,
  StarIcon, CalendarIcon, FilterSlidersIcon,
} from '../../components/icons';
import {
  TattooShareShop, ShopMatchingCategory, BeginnerModelRecruit, MediaExpert,
  MediaSpecialty,
  ShareFilterState, INITIAL_SHARE_FILTER,
  SHARE_REGION_OPTIONS, SHARE_LIGHTING_OPTIONS, SHARE_BED_OPTIONS,
  SHARE_OCCUPANCY_OPTIONS, SHARE_SORT_OPTIONS,
  ShareRegion, ShareLighting, ShareBedCount, ShareOccupancy, ShareSort,
  matchLighting, matchBedCount, matchOccupancy, applyShareSort,
  BeginnerFilterState, INITIAL_BEGINNER_FILTER,
  BEGINNER_STYLE_OPTIONS, BEGINNER_PRICE_OPTIONS, BEGINNER_SORT_OPTIONS,
  BeginnerStyle, BeginnerPriceRange, BeginnerSort,
  matchBeginnerStyle, matchBeginnerPrice, applyBeginnerSort,

  ExpertFilterState, INITIAL_EXPERT_FILTER,
  EXPERT_CAREER_OPTIONS, EXPERT_WORK_KIND_OPTIONS, EXPERT_SORT_OPTIONS,
  ExpertCareer, ExpertWorkKind, ExpertSort,
  matchExpertCareer, matchExpertWorkKind, applyExpertSort,

} from '../../../domain/entities/shopTypes';
import { usePagedApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { shopApi, ShopPost } from '../../../data/api';
import SearchBar from '../../components/common/SearchBar';
import ScreenBanner from '../../components/common/ScreenBanner';
import BannerCarousel from '../../components/common/BannerCarousel';
import { useTranslation } from '../../store/languageStore';
import {
  regionLabel, lightingLabel, bedLabel, occupancyLabel,
  shareSortLabel, beginnerStyleLabel, beginnerPriceLabel, beginnerSortLabel,
  expertCareerLabel, expertWorkKindLabel, expertSortLabel,
  overseasCountryLabel,
} from '../../utils/shopDisplayMap';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type ShareFilterKind = 'region' | 'lighting' | 'bed' | 'occupancy' | 'sort';
type OverseasFilterKind = 'overseasCountry' | 'oLighting' | 'oBed' | 'oOccupancy' | 'oSort';
type BeginnerFilterKind = 'bRegion' | 'bStyle' | 'bPrice' | 'bSort';
type ExpertFilterKind = 'eRegion' | 'eCareer' | 'eWorkKind' | 'eSort';
type AnyFilterKind = ShareFilterKind | OverseasFilterKind | BeginnerFilterKind | ExpertFilterKind;

interface OverseasFilterState {
  lighting: ShareLighting;
  bedCount: ShareBedCount;
  occupancy: ShareOccupancy;
  sort: ShareSort;
}

const INITIAL_OVERSEAS_FILTER: OverseasFilterState = {
  lighting: '전체', bedCount: '전체', occupancy: '전체', sort: '최신순',
};

const OVERSEAS_COUNTRY_OPTIONS = ['전체', '일본', '미국', '프랑스', '독일', '영국', '태국', '싱가포르', '홍콩', '대만', '호주', '캐나다', '이탈리아', '기타'];

/* ── ShopPost → 도메인 타입 매퍼 ── */
const parseBedCount = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (v === '1대') return 1;
  if (v === '2대') return 2;
  if (v === '3대') return 3;
  if (v === '4대 이상') return 4;
  return parseInt(String(v ?? '1'), 10) || 1;
};

const toShareShop = (p: ShopPost): TattooShareShop => {
  const a = p.attributes as Record<string, unknown>;
  return {
    id: p.id,
    isNew: false,
    title: p.title,
    titleEn: p.titleEn,
    pricePerDay: p.priceKrw ?? 0,
    address: p.region ?? '',
    district: typeof p.region === 'string' ? (p.region.split(' · ')[1] ?? p.region) : '',
    areaPyeong: 0,
    bedCount: parseBedCount(a.bedCount),
    lighting: typeof a.lighting === 'string' ? a.lighting : '',
    hasPrivateRoom: false,
    maxOccupancy: typeof a.maxOccupancy === 'number' ? a.maxOccupancy : 4,
    currentOccupancy: 0,
    requiredOccupancy: 0,
    images: p.images,
    description: p.description,
    descriptionEn: p.descriptionEn,
    rules: [],
    host: {
      id: p.authorId,
      nickname: p.author?.nickname ?? null,
      role: '호스트',
      profileImage: p.author?.profileImage ?? null,
      kakaoLink: p.contact?.startsWith('http') ? p.contact : undefined,
      smsPhone: p.contact && !p.contact.startsWith('http') ? p.contact : undefined,
    },
    likeCount: p.likeCount,
    commentCount: p.applicationCount,
    isBookmarked: false,
  };
};

const toModelRecruit = (p: ShopPost): BeginnerModelRecruit => {
  const a = p.attributes as Record<string, unknown>;
  return {
    id: p.id,
    isNew: false,
    title: p.title,
    titleEn: p.titleEn,
    materialFee: p.priceKrw ?? 0,
    location: p.region ?? '',
    workPeriod: typeof a.workPeriod === 'string' ? a.workPeriod : '',
    tags: Array.isArray(a.styles) ? (a.styles as string[]) : [],
    images: p.images,
    description: p.description,
    descriptionEn: p.descriptionEn,
    cautions: [],
    artist: {
      id: p.authorId,
      nickname: p.author?.nickname ?? null,
      experience: '비기너',
      profileImage: p.author?.profileImage ?? null,
      kakaoLink: p.contact?.startsWith('http') ? p.contact : undefined,
      smsPhone: p.contact && !p.contact.startsWith('http') ? p.contact : undefined,
    },
    likeCount: p.likeCount,
    commentCount: p.applicationCount,
    isBookmarked: false,
  };
};

const toMediaExpert = (p: ShopPost): MediaExpert => {
  const a = p.attributes as Record<string, unknown>;
  const specialty = a.specialty === '영상' ? 'video' : 'photo';
  const workKinds = Array.isArray(a.workKinds) ? (a.workKinds as string[]) : [];
  return {
    id: p.id,
    specialty,
    nickname: typeof a.nickname === 'string' ? a.nickname : p.title,
    titleEn: p.titleEn,
    isVerified: false,
    experience: typeof a.experience === 'string' ? a.experience : '',
    experienceYears: 0,
    location: p.region ?? '',
    profileImage: p.author?.profileImage ?? null,
    tags: workKinds,
    priceMin: typeof a.priceMin === 'number' ? a.priceMin : (p.priceKrw ?? 0),
    priceMax: typeof a.priceMax === 'number' ? a.priceMax : (p.priceKrw ?? 0),
    priceItems: [],
    description: p.description,
    descriptionEn: p.descriptionEn,
    descriptionBullets: [],
    portfolio: p.images.map(uri => ({ uri, isVideo: false })),
    instagramUrl: typeof a.instagramUrl === 'string' && a.instagramUrl ? a.instagramUrl : undefined,
    satisfactionRating: 0,
    reviewCount: 0,
    totalWorks: 0,
    avgResponseTime: '-',
    primaryKind: '사진 촬영',
    kakaoLink: p.contact?.startsWith('http') ? p.contact : undefined,
    smsPhone: p.contact && !p.contact.startsWith('http') ? p.contact : undefined,
    isBookmarked: false,
  };
};

const CATEGORIES: ShopMatchingCategory[] = [
  '부스 쉐어', '타투 모델 구인 (비기너)', '사진/영상 편집자',
];


type Nav = NativeStackNavigationProp<RootStackParamList>;

// 표시용 번역은 컴포넌트 내부에서 t()로 처리, 여기는 비교용 값만 유지
const CATEGORY_SUBTITLES: Record<ShopMatchingCategory, 'booth' | 'model' | 'media'> = {
  '부스 쉐어': 'booth',
  '타투 모델 구인 (비기너)': 'model',
  '사진/영상 편집자': 'media',
};


const ShopMatchingScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const settings = usePublicSettings();
  const [category, setCategory] = useState<ShopMatchingCategory>('부스 쉐어');
  const [boothTab, setBoothTab] = useState<'domestic' | 'overseas'>('domestic');
  const [overseasCountry, setOverseasCountry] = useState<string>('전체');
  const [expertTab, setExpertTab] = useState<MediaSpecialty>('photo');
  const [searchVisible, setSearchVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 400);

  const handleSearchPress = useCallback(() => setSearchVisible(true), []);
  const handleSearchCancel = useCallback(() => {
    setSearchVisible(false);
    setKeyword('');
  }, []);

  /* ── Filter states ── */
  const [shareFilter, setShareFilter] = useState<ShareFilterState>(INITIAL_SHARE_FILTER);
  const [overseasFilter, setOverseasFilter] = useState<OverseasFilterState>(INITIAL_OVERSEAS_FILTER);
  const [beginnerFilter, setBeginnerFilter] = useState<BeginnerFilterState>(INITIAL_BEGINNER_FILTER);
  const [expertFilter, setExpertFilter] = useState<ExpertFilterState>(INITIAL_EXPERT_FILTER);
  const [activeFilterSheet, setActiveFilterSheet] = useState<AnyFilterKind | null>(null);

  /* ── API 데이터 ── */
  const boothRegion = shareFilter.region !== '전체' ? shareFilter.region : undefined;
  const modelRegion = beginnerFilter.region !== '전체' ? beginnerFilter.region : undefined;
  const expertRegion = expertFilter.region !== '전체' ? expertFilter.region : undefined;

  const { items: rawBooth } = usePagedApi(
    (cursor) => shopApi.list({ category: 'booth_share', keyword: debouncedKeyword || undefined, region: boothRegion, cursor }),
    [debouncedKeyword, boothRegion],
  );
  const { items: rawOverseasBooth } = usePagedApi(
    (cursor) => shopApi.list({ category: 'booth_share_overseas', keyword: debouncedKeyword || undefined, cursor }),
    [debouncedKeyword],
  );
  const { items: rawModel } = usePagedApi(
    (cursor) => shopApi.list({ category: 'model_recruit', keyword: debouncedKeyword || undefined, region: modelRegion, cursor }),
    [debouncedKeyword, modelRegion],
  );
  const { items: rawMedia } = usePagedApi(
    (cursor) => shopApi.list({ category: 'media_expert', keyword: debouncedKeyword || undefined, region: expertRegion, cursor }),
    [debouncedKeyword, expertRegion],
  );

  const boothPosts = useMemo(() => rawBooth.map(toShareShop), [rawBooth]);
  const overseasBoothPosts = useMemo(() => {
    const all = rawOverseasBooth.map(toShareShop);
    const byCountry = overseasCountry === '전체' ? all : all.filter((s) => s.address.includes(overseasCountry));
    const filtered = byCountry.filter((s) =>
      matchLighting(s.lighting, overseasFilter.lighting)
      && matchBedCount(s.bedCount, overseasFilter.bedCount)
      && matchOccupancy(s.maxOccupancy, overseasFilter.occupancy),
    );
    return applyShareSort(filtered, overseasFilter.sort);
  }, [rawOverseasBooth, overseasCountry, overseasFilter]);
  const modelPosts = useMemo(() => rawModel.map(toModelRecruit), [rawModel]);
  const mediaPosts = useMemo(() => rawMedia.map(toMediaExpert), [rawMedia]);

  const handleShopPress = useCallback((shop: TattooShareShop) => {
    navigation.navigate('TattooShareDetail', { shop });
  }, [navigation]);

  const handleBeginnerPress = useCallback((post: BeginnerModelRecruit) => {
    navigation.navigate('BeginnerModelDetail', { post });
  }, [navigation]);

  const handleExpertPress = useCallback((expert: MediaExpert) => {
    navigation.navigate('MediaExpertDetail', { expert });
  }, [navigation]);

  const renderShopItem = useCallback(({ item }: { item: TattooShareShop }) => (
    <ShopShareCard
      shop={item}
      onPress={() => handleShopPress(item)}
      onBookmark={() => {}}
    />
  ), [handleShopPress]);

  const renderBeginnerItem = useCallback(({ item }: { item: BeginnerModelRecruit }) => (
    <BeginnerModelCard
      post={item}
      onPress={() => handleBeginnerPress(item)}
      onBookmark={() => {}}
    />
  ), [handleBeginnerPress]);

  const renderExpertItem = useCallback(({ item }: { item: MediaExpert }) => (
    <MediaExpertCard
      expert={item}
      onPress={() => handleExpertPress(item)}
      onBookmark={() => {}}
    />
  ), [handleExpertPress]);

  const isBeginnerCategory = category === '타투 모델 구인 (비기너)';
  const isEditorCategory = category === '사진/영상 편집자';

  const filteredModels = useMemo(() => {
    const filtered = modelPosts.filter((p) =>
      matchBeginnerStyle(p.tags, beginnerFilter.style)
      && matchBeginnerPrice(p.materialFee, beginnerFilter.price),
    );
    return applyBeginnerSort(filtered, beginnerFilter.sort);
  }, [modelPosts, beginnerFilter]);

  const filteredExperts = useMemo(() => {
    const byTab = mediaPosts.filter((e) => e.specialty === expertTab);
    const filtered = byTab.filter((e) =>
      matchExpertCareer(e.experience, expertFilter.career)
      && matchExpertWorkKind(e.tags, expertFilter.workKind),
    );
    return applyExpertSort(filtered, expertFilter.sort);
  }, [mediaPosts, expertTab, expertFilter]);

  /* ── 부스 쉐어 필터·정렬 적용 (지역은 서버사이드, 나머지는 클라이언트) ── */
  const filteredShops = useMemo(() => {
    const list = boothPosts.filter((s) =>
      matchLighting(s.lighting, shareFilter.lighting)
      && matchBedCount(s.bedCount, shareFilter.bedCount)
      && matchOccupancy(s.maxOccupancy, shareFilter.occupancy),
    );
    return applyShareSort(list, shareFilter.sort);
  }, [boothPosts, shareFilter]);

  const shareFilterButtons = useMemo(() => [
    {
      label: shareFilter.region !== '전체' ? regionLabel(t, shareFilter.region) : t('shop.filter.region'),
      Icon: RegionIcon,
      kind: 'region' as const,
      active: shareFilter.region !== '전체',
    },
    {
      label: shareFilter.lighting !== '전체' ? lightingLabel(t, shareFilter.lighting) : t('shop.filter.lighting'),
      Icon: LightIcon,
      kind: 'lighting' as const,
      active: shareFilter.lighting !== '전체',
    },
    {
      label: shareFilter.bedCount !== '전체' ? bedLabel(t, shareFilter.bedCount) : t('shop.filter.bed'),
      Icon: BedIcon,
      kind: 'bed' as const,
      active: shareFilter.bedCount !== '전체',
    },
    {
      label: shareFilter.occupancy !== '전체' ? occupancyLabel(t, shareFilter.occupancy) : t('shop.filter.occupancy'),
      Icon: PeopleIcon,
      kind: 'occupancy' as const,
      active: shareFilter.occupancy !== '전체',
    },
  ], [shareFilter, t]);

  const overseasFilterButtons = useMemo(() => [
    {
      label: overseasCountry !== '전체' ? overseasCountryLabel(t, overseasCountry) : t('shop.filter.country'),
      Icon: RegionIcon,
      kind: 'overseasCountry' as const,
      active: overseasCountry !== '전체',
    },
    {
      label: overseasFilter.lighting !== '전체' ? lightingLabel(t, overseasFilter.lighting) : t('shop.filter.lighting'),
      Icon: LightIcon,
      kind: 'oLighting' as const,
      active: overseasFilter.lighting !== '전체',
    },
    {
      label: overseasFilter.bedCount !== '전체' ? bedLabel(t, overseasFilter.bedCount) : t('shop.filter.bed'),
      Icon: BedIcon,
      kind: 'oBed' as const,
      active: overseasFilter.bedCount !== '전체',
    },
    {
      label: overseasFilter.occupancy !== '전체' ? occupancyLabel(t, overseasFilter.occupancy) : t('shop.filter.occupancy'),
      Icon: PeopleIcon,
      kind: 'oOccupancy' as const,
      active: overseasFilter.occupancy !== '전체',
    },
  ], [overseasCountry, overseasFilter, t]);

  const isShareCategory = !isBeginnerCategory && !isEditorCategory;

  const nonShareFilters = useMemo(() => {
    const photoFilters: { label: string; Icon: React.ComponentType<any>; kind: AnyFilterKind; active: boolean }[] = [
      { label: expertFilter.region !== '전체' ? regionLabel(t, expertFilter.region) : t('shop.filter.region'), Icon: RegionIcon, kind: 'eRegion', active: expertFilter.region !== '전체' },
      { label: expertFilter.career !== '전체' ? expertCareerLabel(t, expertFilter.career) : t('shop.filter.career'), Icon: StarIcon, kind: 'eCareer', active: expertFilter.career !== '전체' },
      { label: expertFilter.workKind !== '전체' ? expertWorkKindLabel(t, expertFilter.workKind) : t('shop.filter.shootingStyle'), Icon: CalendarIcon, kind: 'eWorkKind', active: expertFilter.workKind !== '전체' },
    ];
    const videoFilters: { label: string; Icon: React.ComponentType<any>; kind: AnyFilterKind; active: boolean }[] = [
      { label: expertFilter.region !== '전체' ? regionLabel(t, expertFilter.region) : t('shop.filter.region'), Icon: RegionIcon, kind: 'eRegion', active: expertFilter.region !== '전체' },
      { label: expertFilter.career !== '전체' ? expertCareerLabel(t, expertFilter.career) : t('shop.filter.career'), Icon: StarIcon, kind: 'eCareer', active: expertFilter.career !== '전체' },
      { label: expertFilter.workKind !== '전체' ? expertWorkKindLabel(t, expertFilter.workKind) : t('shop.filter.workType'), Icon: FilterSlidersIcon, kind: 'eWorkKind', active: expertFilter.workKind !== '전체' },
    ];
    const beginnerFilters: { label: string; Icon: React.ComponentType<any>; kind: AnyFilterKind; active: boolean }[] = [
      { label: beginnerFilter.region !== '전체' ? regionLabel(t, beginnerFilter.region) : t('shop.filter.region'), Icon: RegionIcon, kind: 'bRegion', active: beginnerFilter.region !== '전체' },
      { label: beginnerFilter.style !== '전체' ? beginnerStyleLabel(t, beginnerFilter.style) : t('shop.filter.style'), Icon: FilterSlidersIcon, kind: 'bStyle', active: beginnerFilter.style !== '전체' },
      { label: beginnerFilter.price !== '전체' ? beginnerPriceLabel(t, beginnerFilter.price) : t('shop.filter.price'), Icon: StarIcon, kind: 'bPrice', active: beginnerFilter.price !== '전체' },
    ];
    if (isEditorCategory) return expertTab === 'photo' ? photoFilters : videoFilters;
    if (isBeginnerCategory) return beginnerFilters;
    return photoFilters;
  }, [isEditorCategory, isBeginnerCategory, expertTab, t, beginnerFilter, expertFilter]);

  const sortLabel = isShareCategory
    ? boothTab === 'domestic'
      ? `↑↓ ${shareSortLabel(t, shareFilter.sort)}`
      : `↑↓ ${shareSortLabel(t, overseasFilter.sort)}`
    : isBeginnerCategory
      ? `↑↓ ${beginnerSortLabel(t, beginnerFilter.sort)}`
      : isEditorCategory
        ? `↑↓ ${expertSortLabel(t, expertFilter.sort)}`
        : t('shop.sortLatest');

  const editorTitle = expertTab === 'photo' ? t('shop.photoExpert') : t('shop.videoExpert');
  const editorSubtitle = expertTab === 'photo' ? t('shop.photoSubtitle') : t('shop.videoSubtitle');

  const Header = (
    <View>
      {/* Category tabs */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map((c) => {
          const isActive = c === category;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => setCategory(c)}
              style={styles.categoryItem}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.categoryText, isActive && styles.categoryTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {t(`shop.tab.${CATEGORY_SUBTITLES[c]}` as any)}
              </Text>
              {isActive && <View style={styles.categoryUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>
          {isEditorCategory ? editorTitle : t(`shop.tab.${CATEGORY_SUBTITLES[category]}` as any)}
        </Text>
        <Text style={styles.subtitle}>
          {isEditorCategory ? editorSubtitle : t(`shop.subtitle.${CATEGORY_SUBTITLES[category]}` as any)}
        </Text>
      </View>

      {/* 부스 쉐어 국내/해외 토글 */}
      {isShareCategory && (
        <View style={styles.boothToggleWrap}>
          <View style={styles.boothToggle}>
            <View
              style={[
                styles.boothToggleThumb,
                boothTab === 'overseas' && styles.boothToggleThumbRight,
              ]}
            />
            <TouchableOpacity
              onPress={() => setBoothTab('domestic')}
              activeOpacity={0.8}
              style={styles.boothToggleSegment}
            >
              <Text style={[styles.boothToggleText, boothTab === 'domestic' && styles.boothToggleTextActive]}>
                {t('shop.boothDomestic')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setBoothTab('overseas')}
              activeOpacity={0.8}
              style={styles.boothToggleSegment}
            >
              <Text style={[styles.boothToggleText, boothTab === 'overseas' && styles.boothToggleTextActive]}>
                {t('shop.boothOverseas')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 탭별 메인 배너 — 다중 이미지 우선, 없으면 단일 이미지 폴백 */}
      {isShareCategory && (
        settings.bannerBoothImages.length > 0
          ? <BannerCarousel items={settings.bannerBoothImages} />
          : (settings.shopBoothBannerImage || settings.shopBoothBannerUrl)
            ? <ScreenBanner imageUrl={settings.shopBoothBannerImage || undefined} linkUrl={settings.shopBoothBannerUrl || undefined} />
            : null
      )}
      {isBeginnerCategory && (
        settings.bannerBeginnerImages.length > 0
          ? <BannerCarousel items={settings.bannerBeginnerImages} />
          : (settings.shopModelBannerImage || settings.shopModelBannerUrl)
            ? <ScreenBanner imageUrl={settings.shopModelBannerImage || undefined} linkUrl={settings.shopModelBannerUrl || undefined} />
            : null
      )}
      {isEditorCategory && (
        settings.bannerMediaImages.length > 0
          ? <BannerCarousel items={settings.bannerMediaImages} />
          : (settings.shopMediaBannerImage || settings.shopMediaBannerUrl)
            ? <ScreenBanner imageUrl={settings.shopMediaBannerImage || undefined} linkUrl={settings.shopMediaBannerUrl || undefined} />
            : null
      )}

      {/* Editor sub-tabs (photo / video) */}
      {isEditorCategory && (
        <View style={styles.subTabRow}>
          <TouchableOpacity
            onPress={() => setExpertTab('photo')}
            activeOpacity={0.8}
            style={[styles.subTabBtn, expertTab === 'photo' && styles.subTabBtnActive]}
          >
            <CameraSolidIcon
              size={16}
              color={expertTab === 'photo' ? COLORS.gold : COLORS.gray}
            />
            <Text
              style={[styles.subTabText, expertTab === 'photo' && styles.subTabTextActive]}
            >
              {t('shop.photoExpert')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setExpertTab('video')}
            activeOpacity={0.8}
            style={[styles.subTabBtn, expertTab === 'video' && styles.subTabBtnActive]}
          >
            <VideoFilmIcon
              size={16}
              color={expertTab === 'video' ? COLORS.gold : COLORS.gray}
            />
            <Text
              style={[styles.subTabText, expertTab === 'video' && styles.subTabTextActive]}
            >
              {t('shop.videoExpert')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Warning banner - 비기너 카테고리에만 노출 */}
      {isBeginnerCategory && (
        <View style={styles.warningBanner}>
          <WarningTriangleIcon size={15} color={COLORS.gold} />
          <Text style={styles.warningText}>{t('shop.beginnerDisclaimer')}</Text>
        </View>
      )}

      {/* Filter row */}
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={{ flex: 1 }}
        >
          {isShareCategory && boothTab === 'domestic'
            ? shareFilterButtons.map((f) => (
                <TouchableOpacity
                  key={f.kind}
                  onPress={() => setActiveFilterSheet(f.kind)}
                  activeOpacity={0.75}
                  style={[styles.filterBtn, f.active && styles.filterBtnActive]}
                >
                  <f.Icon size={13} color={f.active ? COLORS.gold : COLORS.gray} />
                  <Text
                    style={[styles.filterText, f.active && styles.filterTextActive]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {f.label}
                  </Text>
                  <ChevronDownIcon size={11} color={f.active ? COLORS.gold : COLORS.gray} />
                </TouchableOpacity>
              ))
            : isShareCategory && boothTab === 'overseas'
              ? overseasFilterButtons.map((f) => (
                  <TouchableOpacity
                    key={f.kind}
                    onPress={() => setActiveFilterSheet(f.kind)}
                    activeOpacity={0.75}
                    style={[styles.filterBtn, f.active && styles.filterBtnActive]}
                  >
                    <f.Icon size={13} color={f.active ? COLORS.gold : COLORS.gray} />
                    <Text
                      style={[styles.filterText, f.active && styles.filterTextActive]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {f.label}
                    </Text>
                    <ChevronDownIcon size={11} color={f.active ? COLORS.gold : COLORS.gray} />
                  </TouchableOpacity>
                ))
              : nonShareFilters.map((f) => (
                  <TouchableOpacity
                    key={f.kind}
                    style={[styles.filterBtn, f.active && styles.filterBtnActive]}
                    activeOpacity={0.8}
                    onPress={() => setActiveFilterSheet(f.kind)}
                  >
                    <f.Icon size={13} color={f.active ? COLORS.gold : COLORS.gray} />
                    <Text style={[styles.filterText, f.active && styles.filterTextActive]}>{f.label}</Text>
                    <ChevronDownIcon size={11} color={f.active ? COLORS.gold : COLORS.gray} />
                  </TouchableOpacity>
                ))
          }
        </ScrollView>
        <TouchableOpacity
          style={styles.sortBtn}
          activeOpacity={0.8}
          onPress={
            isShareCategory && boothTab === 'domestic'
              ? () => setActiveFilterSheet('sort')
              : isShareCategory && boothTab === 'overseas'
                ? () => setActiveFilterSheet('oSort')
                : isBeginnerCategory
                  ? () => setActiveFilterSheet('bSort')
                  : isEditorCategory
                    ? () => setActiveFilterSheet('eSort')
                    : undefined
          }
        >
          <Text style={styles.sortText}>{sortLabel}</Text>
          <ChevronDownIcon size={11} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      {/* Editor · video hint */}
      {isEditorCategory && expertTab === 'video' && (
        <View style={styles.hintRow}>
          <InfoIcon size={13} color={COLORS.gray} />
          <Text style={styles.hintText}>{t('shop.profileClickHint')}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader showSearch onSearchPress={handleSearchPress} />
      {searchVisible && (
        <SearchBar
          value={keyword}
          onChangeText={setKeyword}
          onCancel={handleSearchCancel}
          placeholder={t('shop.searchPlaceholder')}
        />
      )}
      {isBeginnerCategory ? (
        <FlatList
          data={filteredModels}
          keyExtractor={(item) => item.id}
          renderItem={renderBeginnerItem}
          ListHeaderComponent={Header}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : isEditorCategory ? (
        <FlatList
          data={filteredExperts}
          keyExtractor={(item) => item.id}
          renderItem={renderExpertItem}
          ListHeaderComponent={Header}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : boothTab === 'overseas' ? (
        <FlatList
          data={overseasBoothPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderShopItem}
          ListHeaderComponent={Header}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('shop.emptyOverseas')}</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredShops}
          keyExtractor={(item) => item.id}
          renderItem={renderShopItem}
          ListHeaderComponent={Header}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('shop.emptyDomestic')}</Text>
            </View>
          }
        />
      )}

      {/* FAB - 글쓰기 */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          navigation.navigate('ShopWrite', {
            initialCategory: category,
            boothKind: isShareCategory ? boothTab : undefined,
          });
        }}
      >
        <PenIcon size={20} color={COLORS.black} />
        <Text style={styles.fabText}>{t('shop.write')}</Text>
      </TouchableOpacity>

      {/* Share filter bottom sheets */}
      <ShareFilterBottomSheet<ShareRegion>
        visible={activeFilterSheet === 'region'}
        title={t('shop.filter.selectRegion')}
        options={SHARE_REGION_OPTIONS}
        selected={shareFilter.region}
        onSelect={(v) => setShareFilter((prev) => ({ ...prev, region: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => regionLabel(t, opt)}
      />
      <ShareFilterBottomSheet<ShareLighting>
        visible={activeFilterSheet === 'lighting'}
        title={t('shop.filter.selectLighting')}
        options={SHARE_LIGHTING_OPTIONS}
        selected={shareFilter.lighting}
        onSelect={(v) => setShareFilter((prev) => ({ ...prev, lighting: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => lightingLabel(t, opt)}
      />
      <ShareFilterBottomSheet<ShareBedCount>
        visible={activeFilterSheet === 'bed'}
        title={t('shop.filter.selectBed')}
        options={SHARE_BED_OPTIONS}
        selected={shareFilter.bedCount}
        onSelect={(v) => setShareFilter((prev) => ({ ...prev, bedCount: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => bedLabel(t, opt)}
      />
      <ShareFilterBottomSheet<ShareOccupancy>
        visible={activeFilterSheet === 'occupancy'}
        title={t('shop.filter.selectOccupancy')}
        options={SHARE_OCCUPANCY_OPTIONS}
        selected={shareFilter.occupancy}
        onSelect={(v) => setShareFilter((prev) => ({ ...prev, occupancy: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => occupancyLabel(t, opt)}
      />
      <ShareFilterBottomSheet<ShareSort>
        visible={activeFilterSheet === 'sort'}
        title={t('shop.filter.sort')}
        options={SHARE_SORT_OPTIONS}
        selected={shareFilter.sort}
        onSelect={(v) => setShareFilter((prev) => ({ ...prev, sort: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => shareSortLabel(t, opt)}
      />

      {/* Overseas booth share filter bottom sheets */}
      <ShareFilterBottomSheet<ShareLighting>
        visible={activeFilterSheet === 'oLighting'}
        title={t('shop.filter.selectLighting')}
        options={SHARE_LIGHTING_OPTIONS}
        selected={overseasFilter.lighting}
        onSelect={(v) => setOverseasFilter((prev) => ({ ...prev, lighting: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => lightingLabel(t, opt)}
      />
      <ShareFilterBottomSheet<ShareBedCount>
        visible={activeFilterSheet === 'oBed'}
        title={t('shop.filter.selectBed')}
        options={SHARE_BED_OPTIONS}
        selected={overseasFilter.bedCount}
        onSelect={(v) => setOverseasFilter((prev) => ({ ...prev, bedCount: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => bedLabel(t, opt)}
      />
      <ShareFilterBottomSheet<ShareOccupancy>
        visible={activeFilterSheet === 'oOccupancy'}
        title={t('shop.filter.selectOccupancy')}
        options={SHARE_OCCUPANCY_OPTIONS}
        selected={overseasFilter.occupancy}
        onSelect={(v) => setOverseasFilter((prev) => ({ ...prev, occupancy: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => occupancyLabel(t, opt)}
      />
      <ShareFilterBottomSheet<ShareSort>
        visible={activeFilterSheet === 'oSort'}
        title={t('shop.filter.sort')}
        options={SHARE_SORT_OPTIONS}
        selected={overseasFilter.sort}
        onSelect={(v) => setOverseasFilter((prev) => ({ ...prev, sort: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => shareSortLabel(t, opt)}
      />

      {/* Beginner filter bottom sheets */}
      <ShareFilterBottomSheet<ShareRegion>
        visible={activeFilterSheet === 'bRegion'}
        title={t('shop.filter.selectRegion')}
        options={SHARE_REGION_OPTIONS}
        selected={beginnerFilter.region}
        onSelect={(v) => setBeginnerFilter((prev) => ({ ...prev, region: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => regionLabel(t, opt)}
      />
      <ShareFilterBottomSheet<BeginnerStyle>
        visible={activeFilterSheet === 'bStyle'}
        title={t('shop.filter.style')}
        options={BEGINNER_STYLE_OPTIONS}
        selected={beginnerFilter.style}
        onSelect={(v) => setBeginnerFilter((prev) => ({ ...prev, style: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => beginnerStyleLabel(t, opt)}
      />
      <ShareFilterBottomSheet<BeginnerPriceRange>
        visible={activeFilterSheet === 'bPrice'}
        title={t('shop.filter.price')}
        options={BEGINNER_PRICE_OPTIONS}
        selected={beginnerFilter.price}
        onSelect={(v) => setBeginnerFilter((prev) => ({ ...prev, price: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => beginnerPriceLabel(t, opt)}
      />
      <ShareFilterBottomSheet<BeginnerSort>
        visible={activeFilterSheet === 'bSort'}
        title={t('shop.filter.sort')}
        options={BEGINNER_SORT_OPTIONS}
        selected={beginnerFilter.sort}
        onSelect={(v) => setBeginnerFilter((prev) => ({ ...prev, sort: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => beginnerSortLabel(t, opt)}
      />

      {/* Overseas country filter */}
      <ShareFilterBottomSheet<string>
        visible={activeFilterSheet === 'overseasCountry'}
        title={t('shop.filter.selectCountry')}
        options={OVERSEAS_COUNTRY_OPTIONS}
        selected={overseasCountry}
        onSelect={(v) => setOverseasCountry(v)}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => overseasCountryLabel(t, opt)}
      />

      {/* Expert filter bottom sheets */}
      <ShareFilterBottomSheet<ShareRegion>
        visible={activeFilterSheet === 'eRegion'}
        title={t('shop.filter.selectRegion')}
        options={SHARE_REGION_OPTIONS}
        selected={expertFilter.region}
        onSelect={(v) => setExpertFilter((prev) => ({ ...prev, region: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => regionLabel(t, opt)}
      />
      <ShareFilterBottomSheet<ExpertCareer>
        visible={activeFilterSheet === 'eCareer'}
        title={t('shop.filter.career')}
        options={EXPERT_CAREER_OPTIONS}
        selected={expertFilter.career}
        onSelect={(v) => setExpertFilter((prev) => ({ ...prev, career: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => expertCareerLabel(t, opt)}
      />
      <ShareFilterBottomSheet<ExpertWorkKind>
        visible={activeFilterSheet === 'eWorkKind'}
        title={t('shop.filter.workType')}
        options={EXPERT_WORK_KIND_OPTIONS}
        selected={expertFilter.workKind}
        onSelect={(v) => setExpertFilter((prev) => ({ ...prev, workKind: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => expertWorkKindLabel(t, opt)}
      />
      <ShareFilterBottomSheet<ExpertSort>
        visible={activeFilterSheet === 'eSort'}
        title={t('shop.filter.sort')}
        options={EXPERT_SORT_OPTIONS}
        selected={expertFilter.sort}
        onSelect={(v) => setExpertFilter((prev) => ({ ...prev, sort: v }))}
        onClose={() => setActiveFilterSheet(null)}
        renderLabel={(opt) => expertSortLabel(t, opt)}
      />
    </SafeAreaView>
  );
};

export default ShopMatchingScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  categoryRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginHorizontal: -16,
    paddingHorizontal: 0,
    paddingTop: 0,
    backgroundColor: '#000000',
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    minHeight: 48,
    position: 'relative',
  },
  categoryText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  categoryTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  categoryUnderline: {
    position: 'absolute',
    bottom: -1,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 1,
  },
  titleBlock: {
    paddingTop: 20,
    paddingBottom: 16,
    gap: 6,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },

  /* editor sub-tab */
  boothToggleWrap: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  boothToggle: {
    flexDirection: 'row',
    height: 44,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    position: 'relative',
  },
  boothToggleThumb: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    width: '50%',
    borderRadius: 18,
    backgroundColor: COLORS.gold,
  },
  boothToggleThumbRight: {
    left: '50%',
    transform: [{ translateX: -4 }],
  },
  boothToggleSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boothToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray2,
    lineHeight: 18,
  },
  boothToggleTextActive: {
    color: COLORS.black,
    fontWeight: '700',
  },

  subTabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
  },
  subTabBtnActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  subTabText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  subTabTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: 'rgba(212,168,67,0.06)',
  },
  warningText: {
    color: COLORS.white,
    fontSize: 11,
    lineHeight: 17,
    flexShrink: 1,
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
    marginHorizontal: -16,
    paddingLeft: 16,
  },
  filterScroll: {
    gap: 6,
    alignItems: 'center',
    paddingRight: 4,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: 140,
  },
  filterBtnActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  filterText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
    flexShrink: 1,
  },
  filterTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  sortText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  hintText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    backgroundColor: COLORS.gold,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  fabText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
