import React, { useEffect, useRef, useCallback, memo } from 'react';
import {
  View, Text, TouchableOpacity, Modal, Animated, StyleSheet,
  Dimensions, TouchableWithoutFeedback, KeyboardAvoidingView, Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import { FilterType } from '../../../domain/entities/types';
import { useFilterStore } from '../../store/filterStore';
import { useTranslation } from '../../store/languageStore';
import LocationFilter from './LocationFilter';
import GenreFilter from './GenreFilter';
import BodyPartFilter from './BodyPartFilter';
import SubjectMoodFilter from './SubjectMoodFilter';
import BudgetFilter from './BudgetFilter';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.88;

interface FilterBottomSheetProps {
  visible: boolean;
  filterType: FilterType | null;
  onClose: () => void;
}

const FilterBottomSheet = memo(({ visible, filterType, onClose }: FilterBottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_MAX_HEIGHT)).current;
  const { t } = useTranslation();

  const {
    region, regionMode, overseasCountryCode,
    genres, bodyParts, subjects, moods, budgetMin, budgetMax,
    setRegion, setRegionMode, setOverseas,
    toggleGenre, toggleBodyPart, toggleSubject, toggleMood, setBudget,
    resetRegion, resetGenres, resetBodyParts, resetSubjectsMoods, resetBudget,
  } = useFilterStore();

  const getTitle = (type: FilterType): string => {
    switch (type) {
      case 'region': return t('filter.regionTitle');
      case 'genre': return t('filter.genreTitle');
      case 'bodyPart': return t('filter.bodyPartTitle');
      case 'subject': return t('filter.subjectTitle');
      case 'budget': return t('filter.budgetTitle');
      case 'full': return t('filter.fullTitle');
    }
  };

  const getSubtitle = (type: FilterType): string | undefined => {
    if (type === 'budget') return t('filter.budgetHint');
    return undefined;
  };

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_MAX_HEIGHT,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const handleReset = useCallback(() => {
    if (!filterType) return;
    switch (filterType) {
      case 'region': resetRegion(); break;
      case 'genre': resetGenres(); break;
      case 'bodyPart': resetBodyParts(); break;
      case 'subject': resetSubjectsMoods(); break;
      case 'budget': resetBudget(); break;
    }
  }, [filterType, resetRegion, resetGenres, resetBodyParts, resetSubjectsMoods, resetBudget]);

  const getApplyLabel = () => t('filter.apply');

  const renderContent = () => {
    switch (filterType) {
      case 'region':
        return (
          <LocationFilter
            regionMode={regionMode}
            selectedCity={region.city}
            selectedDistrict={region.district}
            selectedCountryCode={overseasCountryCode}
            onModeChange={setRegionMode}
            onSelect={setRegion}
            onSelectOverseas={setOverseas}
          />
        );
      case 'genre':
        return (
          <GenreFilter
            selected={genres}
            onToggle={toggleGenre}
          />
        );
      case 'bodyPart':
        return (
          <BodyPartFilter
            selected={bodyParts}
            onToggle={toggleBodyPart}
          />
        );
      case 'subject':
        return (
          <SubjectMoodFilter
            selectedSubjects={subjects}
            selectedMoods={moods}
            onToggleSubject={toggleSubject}
            onToggleMood={toggleMood}
          />
        );
      case 'budget':
        return (
          <BudgetFilter
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            onChangeBudget={setBudget}
          />
        );
      default:
        return null;
    }
  };

  if (!filterType) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY }], paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={[styles.title, filterType === 'region' && styles.titleLeft]}>
              {getTitle(filterType)}
            </Text>
          </View>

          {getSubtitle(filterType) && (
            <Text style={styles.subtitle}>{getSubtitle(filterType)}</Text>
          )}

          <ScrollView
            style={styles.contentScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderContent()}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleReset}
              style={styles.resetBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.resetText}>{t('filter.reset')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={styles.applyBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.applyText}>{getApplyLabel()}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

FilterBottomSheet.displayName = 'FilterBottomSheet';
export default FilterBottomSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SHEET_MAX_HEIGHT,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray3,
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  title: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 26,
    textAlign: 'center',
  },
  titleLeft: {
    alignSelf: 'flex-start',
    textAlign: 'left',
    fontSize: 18,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
    textAlign: 'center',
  },
  contentScroll: {
    marginTop: 8,
    marginBottom: 16,
    maxHeight: SCREEN_HEIGHT * 0.55,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    alignItems: 'center',
  },
  resetText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  applyText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
});
