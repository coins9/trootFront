import React, { memo, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import {
  XIcon, ChevronDownIcon, ChevronUpIcon,
  RegionIcon, GenreIcon, BodyPartIconSvg, SubjectIcon, WonIcon,
} from '../icons';
import { useFilterStore } from '../../store/filterStore';
import { useTranslation } from '../../store/languageStore';
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

const FullFilterModal = memo(({ visible, onClose }: FullFilterModalProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState<SectionKey[]>([
    'region', 'genre', 'bodyPart', 'subject', 'budget',
  ]);

  const {
    region, regionMode, overseasCountryCode,
    genres, bodyParts, subjects, moods, budgetMin, budgetMax,
    setRegion, setRegionMode, setOverseas,
    toggleGenre, toggleBodyPart, toggleSubject, toggleMood, setBudget,
    resetAll,
  } = useFilterStore();

  const sections: {
    key: SectionKey;
    title: string;
    hint?: string;
    Icon: React.FC<{ size?: number; color?: string }>;
  }[] = [
    { key: 'region', title: t('filter.region'), Icon: RegionIcon },
    { key: 'genre', title: (t as any)('filter.genre.label'), hint: t('filter.multiSelect'), Icon: GenreIcon },
    { key: 'bodyPart', title: (t as any)('filter.bodyPart.label'), hint: t('filter.multiSelect'), Icon: BodyPartIconSvg },
    { key: 'subject', title: (t as any)('filter.subject.label'), hint: t('filter.multiSelect'), Icon: SubjectIcon },
    { key: 'budget', title: t('filter.budget'), Icon: WonIcon },
  ];

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
        return <GenreFilter selected={genres} onToggle={toggleGenre} variant="compact" />;
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
          <Text style={styles.title}>{t('filter.fullTitle')}</Text>
          <TouchableOpacity
            onPress={resetAll}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.resetAll}>{t('filter.resetAll')}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {sections.map((section) => {
              const isOpen = openSections.includes(section.key);
              const { Icon } = section;
              return (
                <View key={section.key} style={styles.card}>
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => toggleSection(section.key)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardHeaderLeft}>
                      <Icon size={18} color={COLORS.gold} />
                      <Text style={styles.cardTitle}>{section.title}</Text>
                      {section.hint && (
                        <Text style={styles.cardHint}>({section.hint})</Text>
                      )}
                    </View>
                    {isOpen
                      ? <ChevronUpIcon size={18} color={COLORS.gray} />
                      : <ChevronDownIcon size={18} color={COLORS.gray} />
                    }
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.cardContent}>
                      {renderSectionContent(section.key)}
                    </View>
                  )}
                </View>
              );
            })}
            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.applyBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.applyText}>{t('filter.searchDesigns')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  flex1: { flex: 1 },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  cardHint: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  applyBtn: {
    paddingVertical: 17,
    borderRadius: 14,
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
