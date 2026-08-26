import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import LogoHeader from '../../components/common/LogoHeader';
import { BackArrowIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useTranslation } from '../../store/languageStore';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { notificationApi } from '../../../data/api';

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
  | 'reservationStatus' | 'reservationConfirm' | 'reservationRemind'
  | 'procedureDone' | 'newReply'
  | 'favoriteArtist' | 'favoriteWorkStock' | 'favoriteSupplyPrice'
  | 'shopApplication' | 'event' | 'notice';

type NotifState = Record<NotifKey, boolean>;

const INITIAL_STATE: NotifState = {
  reservationStatus: true,
  reservationConfirm: true,
  reservationRemind: false,
  procedureDone: true,
  newReply: false,
  favoriteArtist: true,
  favoriteWorkStock: true,
  favoriteSupplyPrice: false,
  shopApplication: true,
  event: true,
  notice: true,
};

const NotificationSettingsScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [state, setState] = useState<NotifState>(INITIAL_STATE);
  const [initialState, setInitialState] = useState<NotifState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    notificationApi.preferences()
      .then((preferences) => {
        if (!alive) return;
        setState(preferences);
        setInitialState(preferences);
      })
      .catch(() => toast(t('common.error'), { variant: 'error' }))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [t, toast]);

  const sections = useMemo(() => [
    {
      title: t('notification.bookingGroup'),
      items: [
        { key: 'reservationStatus' as NotifKey, label: t('notification.reservationStatus') },
        { key: 'reservationConfirm' as NotifKey, label: t('notification.reservationConfirm') },
        { key: 'reservationRemind' as NotifKey, label: t('notification.reservationRemind') },
        { key: 'procedureDone' as NotifKey, label: t('notification.procedureDone') },
        { key: 'newReply' as NotifKey, label: t('notification.newReply') },
      ],
    },
    {
      title: t('notification.activityGroup'),
      items: [
        { key: 'favoriteArtist' as NotifKey, label: t('notification.favoriteArtist') },
        { key: 'favoriteWorkStock' as NotifKey, label: t('notification.favoriteWorkStock') },
        { key: 'favoriteSupplyPrice' as NotifKey, label: t('notification.favoriteSupplyPrice') },
        { key: 'shopApplication' as NotifKey, label: t('notification.shopApplication') },
        { key: 'event' as NotifKey, label: t('notification.event') },
        { key: 'notice' as NotifKey, label: t('notification.notice') },
      ],
    },
  ], [t]);

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

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const saved = await notificationApi.updatePreferences(state);
      setState(saved);
      setInitialState(saved);
      toast(t('notification.savedMsg', { count: String(enabledCount) }), { variant: 'success' });
      navigation.goBack();
    } catch {
      toast(t('common.error'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  }, [saving, state, toast, navigation, enabledCount, t]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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
        <Text style={styles.title}>{t('notification.title')}</Text>
      </View>

      {loading ? <View style={styles.loading}><ActivityIndicator color={COLORS.gold} /></View> : <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>{t('notification.description')}</Text>

        {sections.map((section) => (
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
          <Text style={styles.footText}>{t('notification.footNote')}</Text>
          <Text style={styles.footText}>{t('notification.footPermission')}</Text>
        </View>
      </ScrollView>}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || saving}
          activeOpacity={0.85}
          style={styles.submitBtn}
        >
          <Text style={styles.submitText}>
            {saving ? t('common.loading') : isDirty ? t('notification.saveBtn') : t('notification.saveBtnDone')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
