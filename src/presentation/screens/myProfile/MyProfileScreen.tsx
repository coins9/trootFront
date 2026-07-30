import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';

const MyProfileScreen = () => (
  <SafeAreaView style={styles.safe} edges={['top']}>
    <LogoHeader />
    <View style={styles.center}>
      <Text style={styles.text}>프로필</Text>
      <Text style={styles.sub}>준비 중입니다</Text>
    </View>
  </SafeAreaView>
);

export default MyProfileScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  text: { color: COLORS.white, fontSize: 20, fontWeight: '700', lineHeight: 27 },
  sub: { color: COLORS.gray, fontSize: 14, lineHeight: 20 },
});
