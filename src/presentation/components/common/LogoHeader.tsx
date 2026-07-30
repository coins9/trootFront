import React, { memo } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BellIcon, SearchIcon } from '../icons';

const LOGO = require('../../../assets/logo.png');

interface LogoHeaderProps {
  onBellPress?: () => void;
  onSearchPress?: () => void;
}

const LogoHeader = memo(({ onBellPress, onSearchPress }: LogoHeaderProps) => {
  return (
    <View style={styles.container}>
      <Image
        source={LOGO}
        style={styles.logo}
        resizeMode="contain"
      />
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
    paddingVertical: 10,
    backgroundColor: COLORS.black,
  },
  logo: {
    height: 30,
    width: 110,
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
