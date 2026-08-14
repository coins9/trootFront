import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  LayoutAnimation, UIManager, Platform,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { ChevronDownIcon, ChevronUpIcon } from '../icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface BilingualSectionProps {
  titleEn?: string;
  onChangeTitleEn?: (v: string) => void;
  titlePlaceholder?: string;
  titleMaxLength?: number;

  descEn?: string;
  onChangeDescEn?: (v: string) => void;
  descPlaceholder?: string;
  descMaxLength?: number;
}

const BilingualSection = ({
  titleEn = '',
  onChangeTitleEn,
  titlePlaceholder = 'Enter title in English',
  titleMaxLength = 60,
  descEn = '',
  onChangeDescEn,
  descPlaceholder = 'Enter description in English',
  descMaxLength = 500,
}: BilingualSectionProps) => {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 220,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    setOpen(prev => !prev);
  }, []);

  const hasTitle = onChangeTitleEn !== undefined;
  const hasDesc = onChangeDescEn !== undefined;

  return (
    <View style={s.wrap}>
      <TouchableOpacity onPress={toggle} style={s.toggleBtn} activeOpacity={0.75}>
        <Text style={s.toggleLabel}>
          {open ? 'English — 접기' : '영어 추가하기  Add English'}
        </Text>
        {open
          ? <ChevronUpIcon size={14} color={COLORS.gold} strokeWidth={2.5} />
          : <ChevronDownIcon size={14} color={COLORS.gold} strokeWidth={2.5} />
        }
      </TouchableOpacity>

      {open && (
        <View style={s.fields}>
          {hasTitle && (
            <>
              <Text style={s.fieldLabel}>Title (English)</Text>
              <TextInput
                style={s.input}
                placeholder={titlePlaceholder}
                placeholderTextColor={COLORS.gray2}
                value={titleEn}
                onChangeText={onChangeTitleEn}
                maxLength={titleMaxLength}
                autoCorrect={false}
              />
            </>
          )}
          {hasDesc && (
            <>
              <Text style={s.fieldLabel}>Description (English)</Text>
              <TextInput
                style={[s.input, s.textarea]}
                placeholder={descPlaceholder}
                placeholderTextColor={COLORS.gray2}
                value={descEn}
                onChangeText={onChangeDescEn}
                multiline
                maxLength={descMaxLength}
                textAlignVertical="top"
                autoCorrect={false}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default BilingualSection;

const s = StyleSheet.create({
  wrap: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.28)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(212,168,67,0.06)',
  },
  toggleLabel: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  fields: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    backgroundColor: COLORS.elevated,
  },
  fieldLabel: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
    backgroundColor: COLORS.card,
  },
  textarea: {
    minHeight: 90,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
});
