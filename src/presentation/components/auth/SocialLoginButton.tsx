import React, { memo } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../theme/colors';
import type { AuthProvider } from '../../../domain/entities/authTypes';

interface BrandStyle {
  bg: string;
  fg: string;
  border?: string;
}

const BRAND: Record<AuthProvider, BrandStyle> = {
  kakao: { bg: '#FEE500', fg: '#191600' },
  google: { bg: '#FFFFFF', fg: '#1F1F1F' },
  apple: { bg: '#FFFFFF', fg: '#000000' },
};

const KakaoIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      d="M12 3C6.99 3 3 6.29 3 10.31c0 2.55 1.7 4.79 4.26 6.07l-1.08 3.97c-.1.35.3.63.6.43l4.73-3.13c.49.05.98.08 1.49.08 5.01 0 9-3.29 9-7.42S17.01 3 12 3z"
      fill={color}
    />
  </Svg>
);

const GoogleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"
      fill="#EA4335"
    />
  </Svg>
);

const AppleIcon = ({ color }: { color: string }) => (
  <Svg width={17} height={17} viewBox="0 0 24 24">
    <Path
      d="M16.36 12.72c.02 2.55 2.24 3.4 2.27 3.41-.02.06-.36 1.23-1.18 2.44-.71 1.05-1.45 2.09-2.62 2.11-1.14.02-1.51-.68-2.82-.68-1.31 0-1.72.66-2.8.7-1.12.04-1.98-1.13-2.7-2.18-1.47-2.14-2.6-6.05-1.08-8.69.75-1.31 2.1-2.14 3.56-2.16 1.1-.02 2.14.74 2.82.74.67 0 1.94-.92 3.27-.78.56.02 2.13.22 3.13 1.7-.08.05-1.87 1.1-1.85 3.28M14.2 4.700c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.55 1.31-.56.65-1.05 1.68-.92 2.68.97.07 1.96-.49 2.57-1.23"
      fill={color}
    />
  </Svg>
);

const ICONS: Record<AuthProvider, (fg: string) => React.ReactElement> = {
  kakao: (fg) => <KakaoIcon color={fg} />,
  google: () => <GoogleIcon />,
  apple: (fg) => <AppleIcon color={fg} />,
};

interface Props {
  provider: AuthProvider;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

const SocialLoginButton = memo(({ provider, label, loading, disabled, onPress }: Props) => {
  const brand = BRAND[provider];
  const inactive = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      style={[
        styles.button,
        { backgroundColor: brand.bg },
        brand.border ? { borderWidth: 1, borderColor: brand.border } : null,
        inactive && styles.disabled,
      ]}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <View style={styles.iconSlot}>
        {loading ? (
          <ActivityIndicator size="small" color={brand.fg} />
        ) : (
          ICONS[provider](brand.fg)
        )}
      </View>
      <Text style={[styles.label, { color: brand.fg }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.iconSlot} />
    </TouchableOpacity>
  );
});

SocialLoginButton.displayName = 'SocialLoginButton';
export default SocialLoginButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  iconSlot: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    flexShrink: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  disabled: {
    opacity: 0.55,
  },
});
