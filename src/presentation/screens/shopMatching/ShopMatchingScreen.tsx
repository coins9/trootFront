import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import ShopShareCard from '../../components/shopMatching/ShopShareCard';
import BeginnerModelCard from '../../components/shopMatching/BeginnerModelCard';
import MediaExpertCard from '../../components/shopMatching/MediaExpertCard';
import {
  RegionIcon, LightIcon, BedIcon, PeopleIcon, ChevronDownIcon, PenIcon,
  WarningTriangleIcon, CameraSolidIcon, VideoFilmIcon, InfoIcon,
  StarIcon, CalendarIcon, FilterSlidersIcon,
} from '../../components/icons';
import {
  MOCK_TATTOO_SHARE_SHOPS, MOCK_BEGINNER_MODEL_RECRUITS, MOCK_MEDIA_EXPERTS,
} from '../../../data/mock/shopMockData';
import {
  TattooShareShop, ShopMatchingCategory, BeginnerModelRecruit, MediaExpert,
  MediaSpecialty,
} from '../../../domain/entities/shopTypes';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

const CATEGORIES: ShopMatchingCategory[] = [
  '타투 쉐어', '타투 모델 구인 (비기너)', '사진/영상 편집자',
];

const SHARE_FILTERS: { label: string; Icon: React.ComponentType<any> }[] = [
  { label: '지역', Icon: RegionIcon },
  { label: '조명', Icon: LightIcon },
  { label: '베드 수', Icon: BedIcon },
  { label: '인원', Icon: PeopleIcon },
];

const PHOTO_FILTERS: { label: string; Icon: React.ComponentType<any> }[] = [
  { label: '지역', Icon: RegionIcon },
  { label: '경력', Icon: StarIcon },
  { label: '촬영 스타일', Icon: CalendarIcon },
];

const VIDEO_FILTERS: { label: string; Icon: React.ComponentType<any> }[] = [
  { label: '지역', Icon: RegionIcon },
  { label: '경력', Icon: StarIcon },
  { label: '작업 유형', Icon: FilterSlidersIcon },
];

const BEGINNER_FILTERS: { label: string; Icon: React.ComponentType<any> }[] = [
  { label: '지역', Icon: RegionIcon },
  { label: '스타일', Icon: FilterSlidersIcon },
  { label: '가격', Icon: StarIcon },
  { label: '날짜', Icon: CalendarIcon },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_SUBTITLES: Record<ShopMatchingCategory, string> = {
  '타투 쉐어': '타투 공간을 공유하고, 함께 성장하세요.',
  '타투 모델 구인 (비기너)': '비기너 타투이스트의 모델을 지원해보세요.',
  '사진/영상 편집자': '타투샵 콘텐츠를 함께 만들 전문가를 찾아보세요.',
};

const ShopMatchingScreen = () => {
  const navigation = useNavigation<Nav>();
  const [category, setCategory] = useState<ShopMatchingCategory>('타투 쉐어');
  const [expertTab, setExpertTab] = useState<MediaSpecialty>('photo');

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

  const filteredExperts = useMemo(
    () => MOCK_MEDIA_EXPERTS.filter((e) => e.specialty === expertTab),
    [expertTab],
  );

  const activeFilters = isEditorCategory
    ? (expertTab === 'photo' ? PHOTO_FILTERS : VIDEO_FILTERS)
    : isBeginnerCategory
      ? BEGINNER_FILTERS
      : SHARE_FILTERS;

  const sortLabel = isEditorCategory ? '↑↓ 추천순' : '↑↓ 최신순';

  const editorTitle = expertTab === 'photo' ? '사진 작가' : '영상 편집자';
  const editorSubtitle = expertTab === 'photo'
    ? '타투 촬영 전문 작가들의 프로필과 작업 정보를 확인하세요.'
    : '릴스, 쇼츠, 보정 작업 전문 편집자들의 프로필을 확인하세요.';

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
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {c}
              </Text>
              {isActive && <View style={styles.categoryUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>
          {isEditorCategory ? editorTitle : category}
        </Text>
        <Text style={styles.subtitle}>
          {isEditorCategory ? editorSubtitle : CATEGORY_SUBTITLES[category]}
        </Text>
      </View>

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
              사진 작가
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
              영상 편집자
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Warning banner - 비기너 카테고리에만 노출 */}
      {isBeginnerCategory && (
        <View style={styles.warningBanner}>
          <WarningTriangleIcon size={15} color={COLORS.gold} />
          <Text style={styles.warningText}>
            비기너 타투이스트의 작업이므로, 모든 선택과 문제 발생 시 책임은{'\n'}
            손님과 타투이스트 당사자에게 있으며 플랫폼은 책임지지 않습니다.
          </Text>
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
          {activeFilters.map((f) => (
            <TouchableOpacity key={f.label} style={styles.filterBtn} activeOpacity={0.8}>
              <f.Icon size={13} color={COLORS.gray} />
              <Text style={styles.filterText}>{f.label}</Text>
              <ChevronDownIcon size={11} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.sortBtn} activeOpacity={0.8}>
          <Text style={styles.sortText}>{sortLabel}</Text>
          <ChevronDownIcon size={11} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      {/* Editor · video hint */}
      {isEditorCategory && expertTab === 'video' && (
        <View style={styles.hintRow}>
          <InfoIcon size={13} color={COLORS.gray} />
          <Text style={styles.hintText}>
            프로필을 클릭하면 상세 정보를 확인할 수 있습니다.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />
      {isBeginnerCategory ? (
        <FlatList
          data={MOCK_BEGINNER_MODEL_RECRUITS}
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
      ) : (
        <FlatList
          data={MOCK_TATTOO_SHARE_SHOPS}
          keyExtractor={(item) => item.id}
          renderItem={renderShopItem}
          ListHeaderComponent={Header}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB - 글쓰기 */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <PenIcon size={20} color={COLORS.black} />
        <Text style={styles.fabText}>글쓰기</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 2,
    position: 'relative',
  },
  categoryText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  categoryTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  categoryUnderline: {
    position: 'absolute',
    bottom: -1,
    left: '15%',
    right: '15%',
    height: 2.5,
    backgroundColor: COLORS.gold,
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
  },
  filterText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
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
