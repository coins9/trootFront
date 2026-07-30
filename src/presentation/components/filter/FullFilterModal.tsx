import React, { memo, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import { XIcon, ChevronDownIcon, ChevronUpIcon } from '../icons';
import { useFilterStore } from '../../store/filterStore';
import LocationFilter from './LocationFilter';
import GenreFilter from './GenreFilter';
import BodyPartFilter from './BodyPartFilter';
import SubjectMoodFilter from './SubjectMoodFilter';
import BudgetFilter from './BudgetFilter';

interface FullFilterModalProps {
  visible: boolean;
  onClose: () => void;
}

type SectionKey = 'region' | 'genre' | 'bodyPart' | 'subject' | 'budget';

const SECTIONS: { key: SectionKey; title: string }[] = [
  { key: 'region', title: '지역' },
  { key: 'genre', title: '장르 (다중 선택 가능)' },
  { key: 'bodyPart', title: '부위 (다중 선택 가능)' },
  { key: 'subject', title: '주제 / 감성 (다중 선택 가능)' },
  { key: 'budget', title: '예산' },
];

const FullFilterModal = memo(({ visible, onClose }: FullFilterModalProps) => {
  const insets = useSafeAreaInsets();
  const [openSections, setOpenSections] = useState<SectionKey[]>(['region', 'genre']);

  const {
    region, genres, bodyParts, subjects, moods, budgetMin, budgetMax, totalCount,
    setRegion, toggleGenre, toggleBodyPart, toggleSubject, toggleMood, setBudget,
    resetAll,
  } = useFilterStore();

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const renderSectionContent = (key: SectionKey) => {
    switch (key) {
      case 'region':
        return (
          <LocationFilter
            selectedCity={region.city}
            selectedDistrict={region.district}
            onSelect={setRegion}
          />
        );
      case 'genre':
        return <GenreFilter selected={genres} onToggle={toggleGenre} />;
      case 'bodyPart':
        return <BodyPartFilter selected={bodyParts} onToggle={toggleBodyPart} />;
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
    }
  };

  const getSectionIcon = (key: SectionKey) => {
    const icons: Record<SectionKey, string> = {
      region: '',
      genre: '',
      bodyPart: '',
      subject: '',
      budget: '',
    };
    return icons[key];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <XIcon size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.title}>상세 필터</Text>
          <TouchableOpacity
            onPress={resetAll}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.resetAll}>전체 초기화</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {SECTIONS.map((section) => {
            const isOpen = openSections.includes(section.key);
            return (
              <View key={section.key} style={styles.section}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(section.key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {isOpen
                    ? <ChevronUpIcon size={18} color={COLORS.gray} />
                    : <ChevronDownIcon size={18} color={COLORS.gray} />
                  }
                </TouchableOpacity>
                {isOpen && (
                  <View style={styles.sectionContent}>
                    {renderSectionContent(section.key)}
                  </View>
                )}
              </View>
            );
          })}
          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.applyBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.applyText}>
              선택한 조건으로 {totalCount}개 도안 보기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

FullFilterModal.displayName = 'FullFilterModal';
export default FullFilterModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  resetAll: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  applyBtn: {
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
