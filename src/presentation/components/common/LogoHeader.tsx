import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BellIcon, SearchIcon } from '../icons';

interface LogoHeaderProps {
  onBellPress?: () => void;
  onSearchPress?: () => void;
}

const LogoHeader = memo(({ onBellPress, onSearchPress }: LogoHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Text style={styles.logoT}>T</Text>
        <Text style={styles.logoRest}>:ROOT</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onBellPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.iconBtn}
        >
          <BellIcon size={24} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSearchPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.iconBtn}
        >
          <SearchIcon size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

LogoHeader.displayName = 'LogoHeader';
export default LogoHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoT: {
    color: COLORS.gold,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 30,
  },
  logoRest: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 30,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 2,
  },
});
