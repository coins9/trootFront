import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, WonIcon, PaletteIcon, ShieldCheckIcon,
  WarningTriangleIcon, InfoIcon,
} from '../../components/icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Severity = 'report' | 'instant';

interface Policy {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  severity: Severity;
  title: string;
  body: string;
  points: string[];
}

const SeverityBadge = ({ severity, label }: { severity: Severity; label: string }) => {
  const isInstant = severity === 'instant';
  return (
    <View style={[s.badge, isInstant ? s.badgeInstant : s.badgeReport]}>
      <Text style={[s.badgeText, isInstant ? s.badgeTextInstant : s.badgeTextReport]}>
        {label}
      </Text>
    </View>
  );
};

const PolicyCard = ({ policy, index, badgeLabel }: { policy: Policy; index: number; badgeLabel: string }) => (
  <View style={s.card}>
    <View style={s.cardHead}>
      <View style={s.iconWrap}>
        <policy.Icon size={20} color={COLORS.gold} strokeWidth={1.7} />
      </View>
      <View style={s.cardHeadText}>
        <View style={s.titleRow}>
          <Text style={s.cardIndex}>{String(index + 1).padStart(2, '0')}</Text>
          <Text style={s.cardTitle}>{policy.title}</Text>
        </View>
        <SeverityBadge severity={policy.severity} label={badgeLabel} />
      </View>
    </View>

    <Text style={s.cardBody}>{policy.body}</Text>

    <View style={s.pointList}>
      {policy.points.map((pt, i) => (
        <View key={i} style={s.pointRow}>
          <View style={s.pointDot} />
          <Text style={s.pointText}>{pt}</Text>
        </View>
      ))}
    </View>
  </View>
);

const SafetyPolicyScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const policies: Policy[] = [
    {
      Icon: WonIcon,
      severity: 'report',
      title: t('safetyPolicy.pricePolicyTitle'),
      body: t('safetyPolicy.pricePolicyBody'),
      points: [
        t('safetyPolicy.pricePolicyPoint1'),
        t('safetyPolicy.pricePolicyPoint2'),
        t('safetyPolicy.pricePolicyPoint3'),
      ],
    },
    {
      Icon: PaletteIcon,
      severity: 'instant',
      title: t('safetyPolicy.copyrightTitle'),
      body: t('safetyPolicy.copyrightBody'),
      points: [
        t('safetyPolicy.copyrightPoint1'),
        t('safetyPolicy.copyrightPoint2'),
        t('safetyPolicy.copyrightPoint3'),
      ],
    },
    {
      Icon: ShieldCheckIcon,
      severity: 'instant',
      title: t('safetyPolicy.identityTitle'),
      body: t('safetyPolicy.identityBody'),
      points: [
        t('safetyPolicy.identityPoint1'),
        t('safetyPolicy.identityPoint2'),
        t('safetyPolicy.identityPoint3'),
      ],
    },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('safetyPolicy.headerTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: 20 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.intro}>
          <View style={s.introIconWrap}>
            <WarningTriangleIcon size={22} color={COLORS.gold} strokeWidth={1.8} />
          </View>
          <Text style={s.introTitle}>{t('safetyPolicy.introTitle')}</Text>
          <Text style={s.introDesc}>{t('safetyPolicy.introDesc')}</Text>
        </View>

        {policies.map((p, i) => (
          <PolicyCard
            key={i}
            policy={p}
            index={i}
            badgeLabel={p.severity === 'instant' ? t('safetyPolicy.badgeInstant') : t('safetyPolicy.badgeReport')}
          />
        ))}

        <View style={s.reportGuide}>
          <View style={s.reportGuideHead}>
            <InfoIcon size={15} color={COLORS.gold} />
            <Text style={s.reportGuideTitle}>{t('safetyPolicy.reportGuideTitle')}</Text>
          </View>
          <Text style={s.reportGuideText}>{t('safetyPolicy.reportGuideText')}</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SafetyPolicyScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.black,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white, letterSpacing: 0.3 },

  scroll: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 20 },

  /* intro */
  intro: { alignItems: 'center', paddingVertical: 12, marginBottom: 20 },
  introIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.goldDim,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  introTitle: {
    fontSize: 17, fontWeight: '700', color: COLORS.white,
    lineHeight: 24, marginBottom: 8, textAlign: 'center',
  },
  introDesc: {
    fontSize: 13, color: COLORS.gray, lineHeight: 20, textAlign: 'center',
  },

  /* card */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHead: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.elevated,
    alignItems: 'center', justifyContent: 'center',
  },
  cardHeadText: { flex: 1, gap: 6, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardIndex: { fontSize: 13, fontWeight: '800', color: COLORS.gold, letterSpacing: 0.5 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, lineHeight: 22, flexShrink: 1 },

  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeReport: { backgroundColor: COLORS.goldDim, borderColor: 'rgba(212,168,67,0.3)' },
  badgeInstant: { backgroundColor: 'rgba(232,85,85,0.12)', borderColor: 'rgba(232,85,85,0.3)' },
  badgeText: { fontSize: 11, fontWeight: '700', lineHeight: 15 },
  badgeTextReport: { color: COLORS.gold },
  badgeTextInstant: { color: COLORS.danger },

  cardBody: { fontSize: 13, color: COLORS.gray, lineHeight: 20, marginBottom: 14 },

  pointList: {
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  pointRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  pointDot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: COLORS.gold,
    marginTop: 7,
  },
  pointText: { flex: 1, fontSize: 13, color: COLORS.white, lineHeight: 20, flexShrink: 1 },

  /* report guide */
  reportGuide: {
    marginTop: 8,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportGuideHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  reportGuideTitle: { fontSize: 14, fontWeight: '700', color: COLORS.white, lineHeight: 20 },
  reportGuideText: { fontSize: 13, color: COLORS.gray, lineHeight: 20 },
});
