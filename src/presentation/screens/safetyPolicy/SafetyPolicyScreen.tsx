import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, WonIcon, PaletteIcon, ShieldCheckIcon,
  WarningTriangleIcon, InfoIcon,
} from '../../components/icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Severity = 'report' | 'instant';

interface Policy {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  severity: Severity;
  title: string;
  body: string;
  points: string[];
}

const POLICIES: Policy[] = [
  {
    Icon: WonIcon,
    severity: 'report',
    title: '투명한 가격 정책',
    body:
      '몸무게 · 흉터 유무 등 시술 조건에 따라 가격이 일정 부분 변동될 수 있습니다. ' +
      '다만 앱에 표기된 가격과 현장 가격이 상당 부분 다른 기망 행위가 확인되면 신고할 수 있습니다.',
    points: [
      '조건에 따른 합리적 가격 변동은 정상적인 안내입니다.',
      '표기가와 현장가가 크게 다른 경우 신고하기 버튼으로 접수하세요.',
      '누적 3회 이상 신고 시 해당 계정은 제재됩니다.',
    ],
  },
  {
    Icon: PaletteIcon,
    severity: 'instant',
    title: '창작물 저작권 보호',
    body:
      '타투 도안과 포트폴리오는 창작자의 자산입니다. 타인의 도안 · 포트폴리오를 도용하는 경우 즉각 제재됩니다.',
    points: [
      '타인의 도안을 무단 복제 · 게시할 수 없습니다.',
      '타인의 작업물을 본인 포트폴리오로 도용할 수 없습니다.',
      '적발 시 경고 없이 즉시 제재됩니다.',
    ],
  },
  {
    Icon: ShieldCheckIcon,
    severity: 'instant',
    title: '시술자 본인 확인',
    body:
      '예약한 고객은 앱에 등록된 타투이스트 본인에게 시술받을 권리가 있습니다. ' +
      '등록 정보와 다른 사람(예: 수강생)이 대신 작업하는 경우 즉각 제재됩니다.',
    points: [
      '앱에 등록된 타투이스트 본인이 시술해야 합니다.',
      '수강생 · 대리 시술 등 명의와 다른 작업은 금지됩니다.',
      '적발 시 경고 없이 즉시 제재됩니다.',
    ],
  },
];

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const isInstant = severity === 'instant';
  return (
    <View style={[s.badge, isInstant ? s.badgeInstant : s.badgeReport]}>
      <Text style={[s.badgeText, isInstant ? s.badgeTextInstant : s.badgeTextReport]}>
        {isInstant ? '즉시 제재' : '신고 · 누적 제재'}
      </Text>
    </View>
  );
};

const PolicyCard = ({ policy, index }: { policy: Policy; index: number }) => (
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
        <SeverityBadge severity={policy.severity} />
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

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>이용 안전 정책</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.intro}>
          <View style={s.introIconWrap}>
            <WarningTriangleIcon size={22} color={COLORS.gold} strokeWidth={1.8} />
          </View>
          <Text style={s.introTitle}>안전하고 공정한 거래를 위한 약속</Text>
          <Text style={s.introDesc}>
            T:ROOT는 고객과 타투이스트 모두가 신뢰할 수 있는 환경을 위해{'\n'}
            아래 정책을 운영합니다. 위반 시 계정이 제재될 수 있습니다.
          </Text>
        </View>

        {POLICIES.map((p, i) => (
          <PolicyCard key={p.title} policy={p} index={i} />
        ))}

        <View style={s.reportGuide}>
          <View style={s.reportGuideHead}>
            <InfoIcon size={15} color={COLORS.gold} />
            <Text style={s.reportGuideTitle}>신고는 어디서 하나요?</Text>
          </View>
          <Text style={s.reportGuideText}>
            타투이스트 프로필 우측 상단의 더보기(⋯) 버튼에서 신고하기를 선택할 수 있습니다.
            접수된 신고는 운영팀이 검토 후 조치하며, 허위 신고는 신고자도 제재 대상이 됩니다.
          </Text>
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
