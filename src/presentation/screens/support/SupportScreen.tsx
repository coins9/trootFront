import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, ChatBubbleIcon, MailIcon, ChevronRightIcon,
  ShieldCheckIcon, ClockIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useTranslation } from '../../store/languageStore';
import {
  DEFAULT_SETTINGS, fetchPublicSettings, type PublicSettings,
} from '../../../data/content/settingsApi';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SupportScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<PublicSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let alive = true;
    fetchPublicSettings().then((s) => {
      if (alive) setSettings(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  const openKakao = useCallback(async () => {
    const { kakaoChannelId, kakaoChannelUrl } = settings;
    // 카카오톡 앱이 있으면 1:1 채팅으로 바로 진입, 없으면 웹 채널홈으로
    const appScheme = kakaoChannelId ? `kakaoplus://plusfriend/chat/${kakaoChannelId}` : '';
    const webUrl = kakaoChannelUrl || (kakaoChannelId ? `http://pf.kakao.com/${kakaoChannelId}` : '');

    try {
      if (appScheme && (await Linking.canOpenURL(appScheme))) {
        await Linking.openURL(appScheme);
        return;
      }
      if (webUrl) {
        await Linking.openURL(webUrl);
        return;
      }
      toast('카카오톡 문의가 아직 준비되지 않았습니다.', { variant: 'error' });
    } catch {
      toast('카카오톡을 열 수 없습니다.', { variant: 'error' });
    }
  }, [settings, toast]);

  const openEmail = useCallback(async () => {
    const url = `mailto:${settings.supportEmail}?subject=${encodeURIComponent('[T:ROOT] 문의')}`;
    try {
      await Linking.openURL(url);
    } catch {
      toast('메일 앱을 열 수 없습니다.', { variant: 'error' });
    }
  }, [settings.supportEmail, toast]);

  const kakaoAvailable = !!(settings.kakaoChannelUrl || settings.kakaoChannelId);

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
        <Text style={s.headerTitle}>문의하기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.lead}>
          궁금한 점이나 불편한 점이 있으신가요?{'\n'}
          아래 방법으로 문의해주시면 확인 후 답변드리겠습니다.
        </Text>

        {kakaoAvailable && (
          <TouchableOpacity style={s.primaryCard} activeOpacity={0.85} onPress={openKakao}>
            <View style={s.kakaoIcon}>
              <ChatBubbleIcon size={22} color="#191600" strokeWidth={1.8} />
            </View>
            <View style={s.cardText}>
              <Text style={s.primaryTitle}>카카오톡으로 문의</Text>
              <Text style={s.primaryDesc}>가장 빠르게 답변받을 수 있어요</Text>
            </View>
            <ChevronRightIcon size={18} color="rgba(25,22,0,0.5)" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={openEmail}>
          <View style={s.iconWrap}>
            <MailIcon size={20} color={COLORS.gold} strokeWidth={1.7} />
          </View>
          <View style={s.cardText}>
            <Text style={s.cardTitle}>이메일 문의</Text>
            <Text style={s.cardDesc}>{settings.supportEmail}</Text>
          </View>
          <ChevronRightIcon size={18} color={COLORS.gray} />
        </TouchableOpacity>

        <View style={s.infoBox}>
          <View style={s.infoRow}>
            <ClockIcon size={16} color={COLORS.gold} strokeWidth={1.7} />
            <View style={s.infoText}>
              <Text style={s.infoLabel}>운영시간</Text>
              <Text style={s.infoDesc}>{settings.supportHours}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <ShieldCheckIcon size={16} color={COLORS.gold} strokeWidth={1.7} />
            <View style={s.infoText}>
              <Text style={s.infoLabel}>신고는 어떻게 하나요?</Text>
              <Text style={s.infoDesc}>
                타투이스트 프로필 우측 상단 더보기(⋯)에서 신고할 수 있습니다.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={s.policyLink}
          activeOpacity={0.75}
          onPress={() => navigation.navigate('SafetyPolicy')}
        >
          <Text style={s.policyLinkText}>이용 안전 정책 보기</Text>
          <ChevronRightIcon size={15} color={COLORS.gold} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupportScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

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

  content: { padding: 20 },
  lead: { fontSize: 14, color: COLORS.gray, lineHeight: 21, marginBottom: 22 },

  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FEE500',
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
  },
  kakaoIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(25,22,0,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  primaryTitle: { fontSize: 15.5, fontWeight: '700', color: '#191600', lineHeight: 21 },
  primaryDesc: { fontSize: 12.5, color: 'rgba(25,22,0,0.65)', lineHeight: 17, marginTop: 2 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },
  iconWrap: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: COLORS.elevated,
    alignItems: 'center', justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.white, lineHeight: 21 },
  cardDesc: { fontSize: 12.5, color: COLORS.gray, lineHeight: 17, marginTop: 2 },

  infoBox: {
    marginTop: 24,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  infoRow: { flexDirection: 'row', gap: 12, paddingVertical: 16, alignItems: 'flex-start' },
  infoText: { flex: 1, gap: 3 },
  infoLabel: { fontSize: 13.5, fontWeight: '600', color: COLORS.white, lineHeight: 19 },
  infoDesc: { fontSize: 12.5, color: COLORS.gray, lineHeight: 18, flexShrink: 1 },
  divider: { height: 1, backgroundColor: COLORS.border },

  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 18,
    marginTop: 8,
  },
  policyLinkText: { fontSize: 13.5, color: COLORS.gold, fontWeight: '600', lineHeight: 19 },
});
