import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import { BackArrowIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ------------- Switch (custom, no external lib) ------------- */
interface NotifSwitchProps {
  value: boolean;
  onChange: () => void;
}
const NotifSwitch = React.memo(({ value, onChange }: NotifSwitchProps) => {
  const anim = useMemo(() => new Animated.Value(value ? 1 : 0), []);

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#3a3a3a', COLORS.gold],
  });
  const thumbTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });

  return (
    <TouchableOpacity
      onPress={onChange}
      activeOpacity={0.8}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View style={[styles.switchTrack, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[styles.switchThumb, { transform: [{ translateX: thumbTranslate }] }]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
});
NotifSwitch.displayName = 'NotifSwitch';

/* ------------- Row ------------- */
interface NotifRowProps {
  label: string;
  value: boolean;
  onToggle: () => void;
  isLast: boolean;
}
const NotifRow = React.memo(({ label, value, onToggle, isLast }: NotifRowProps) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <Text style={styles.rowLabel} numberOfLines={1}>{label}</Text>
    <NotifSwitch value={value} onChange={onToggle} />
  </View>
));
NotifRow.displayName = 'NotifRow';

/* ------------- Screen ------------- */
type NotifKey =
  | 'chat' | 'reservationStatus' | 'reservationConfirm' | 'reservationRemind'
  | 'procedureDone' | 'newReply'
  | 'favoriteArtist' | 'favoriteWorkStock' | 'favoriteSupplyPrice'
  | 'event' | 'point' | 'notice';

type NotifState = Record<NotifKey, boolean>;

const INITIAL_STATE: NotifState = {
  chat: true,
  reservationStatus: true,
  reservationConfirm: true,
  reservationRemind: false,
  procedureDone: true,
  newReply: false,
  favoriteArtist: true,
  favoriteWorkStock: true,
  favoriteSupplyPrice: false,
  event: true,
  point: false,
  notice: true,
};

interface SectionSpec {
  title: string;
  items: { key: NotifKey; label: string }[];
}

const SECTIONS: SectionSpec[] = [
  {
    title: '예약 및 메시지 알림',
    items: [
      { key: 'chat', label: '1:1 채팅 메시지' },
      { key: 'reservationStatus', label: '예약 상태 변경' },
      { key: 'reservationConfirm', label: '예약 확정 알림' },
      { key: 'reservationRemind', label: '예약 리마인드' },
      { key: 'procedureDone', label: '시술 완료 알림' },
      { key: 'newReply', label: '새로운 답변 알림' },
    ],
  },
  {
    title: '활동 및 혜택 알림',
    items: [
      { key: 'favoriteArtist', label: '찜한 타투이스트 새 소식' },
      { key: 'favoriteWorkStock', label: '찜한 도안 소진 알림' },
      { key: 'favoriteSupplyPrice', label: '찜한 용품 가격 변동 알림' },
      { key: 'event', label: '이벤트 및 혜택' },
      { key: 'point', label: '포인트 적립 및 사용 내역' },
      { key: 'notice', label: 'T:ROOT 공지사항' },
    ],
  },
];

const NotificationSettingsScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const [state, setState] = useState<NotifState>(INITIAL_STATE);
  const [initialState] = useState<NotifState>(INITIAL_STATE);

  const handleToggle = useCallback((key: NotifKey) => {
    setState((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isDirty = useMemo(
    () => (Object.keys(state) as NotifKey[]).some(
      (k) => state[k] !== initialState[k],
    ),
    [state, initialState],
  );

  const enabledCount = useMemo(
    () => Object.values(state).filter(Boolean).length,
    [state],
  );

  const handleSave = useCallback(() => {
    toast(`알림 설정이 저장되었습니다. (${enabledCount}개 활성)`, { variant: 'success' });
    navigation.goBack();
  }, [toast, navigation, enabledCount]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LogoHeader />

      <View style={styles.subHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <BackArrowIcon size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>알림 설정</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          원하는 알림을 선택하여{'\n'}
          T:ROOT 서비스를 더 편리하게 이용하세요.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) => (
                <NotifRow
                  key={item.key}
                  label={item.label}
                  value={state[item.key]}
                  onToggle={() => handleToggle(item.key)}
                  isLast={idx === section.items.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footNote}>
          <Text style={styles.footText}>알림은 푸시 알림으로 제공됩니다.</Text>
          <Text style={styles.footText}>
            기기의 알림 권한 설정도 함께 확인해주세요.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.85}
          style={styles.submitBtn}
        >
          <Text style={styles.submitText}>
            {isDirty ? '설정 완료' : '완료'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.black,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginLeft: 4,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },

  description: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 28,
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    flexShrink: 1,
  },

  /* Switch */
  switchTrack: {
    width: 48,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.white,
  },

  /* Foot */
  footNote: {
    alignItems: 'center',
    paddingTop: 8,
    gap: 4,
  },
  footText: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },

  /* Footer CTA */
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
});
