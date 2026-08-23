import React, { useRef, useEffect, memo } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, Animated,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { SearchIcon, XIcon } from '../icons';
import { useTranslation } from '../../store/languageStore';

interface SearchBarProps {
  value: string;
  onChangeText: (v: string) => void;
  onCancel: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const SearchBar = memo(({
  value,
  onChangeText,
  onCancel,
  placeholder,
  autoFocus = true,
}: SearchBarProps) => {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(-8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={styles.inputWrap}>
        <SearchIcon size={16} color={COLORS.gray} strokeWidth={1.9} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? t('common.search')}
          placeholderTextColor={COLORS.gray2}
          autoFocus={autoFocus}
          returnKeyType="search"
          clearButtonMode="never"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.clearBtn}>
              <XIcon size={9} color={COLORS.black} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity onPress={onCancel} activeOpacity={0.75} style={styles.cancelBtn}>
        <Text style={styles.cancelText}>{t('common.cancel')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

SearchBar.displayName = 'SearchBar';
export default SearchBar;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.black,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 9 : 5,
    gap: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    padding: 0,
  },
  clearBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.gray3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    paddingVertical: 4,
  },
  cancelText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
});
