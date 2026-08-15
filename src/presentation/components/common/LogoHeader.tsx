import React, { memo } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { BellIcon, SearchIcon } from '../icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

const LOGO = require('../../../assets/logo.png');

interface LogoHeaderProps {
  onBellPress?: () => void;
  onSearchPress?: () => void;
  showSearch?: boolean;
}

const LogoHeader = memo(function LogoHeader({ onBellPress, onSearchPress, showSearch = true }: LogoHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleBellPress = onBellPress ?? (() => navigation.navigate('NotificationSettings'));

  return (
    <View style={styles.container}>
      <Image
        source={LOGO}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.actions}>
        {showSearch && (
          <TouchableOpacity
            onPress={onSearchPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.iconBtn}
          >
            <SearchIcon size={22} color={COLORS.white} strokeWidth={1.9} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleBellPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.iconBtn}
        >
          <BellIcon size={22} color={COLORS.white} strokeWidth={1.9} />
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
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: '#000000',
    minHeight: 52,
  },
  logo: {
    height: 34,
    width: 92,
    marginLeft: -8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBtn: {
    padding: 2,
  },
});
