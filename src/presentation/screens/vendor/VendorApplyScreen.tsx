import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { BackArrowIcon, InfoIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { ApiError } from '../../../data/api/client';
import { supplyVendorApi } from '../../../data/api/vendor';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 사업자등록번호 10자리
const BIZ_RE = /^\d{3}-?\d{2}-?\d{5}$/;

const VendorApplyScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [businessNo, setBusinessNo] = useState('');
  const [ecommerceRegNo, setEcommerceRegNo] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    name.trim().length >= 2 &&
    BIZ_RE.test(businessNo.trim()) &&
    EMAIL_RE.test(contactEmail.trim());

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submitting) return;

    // iOS: 키보드가 열린 채 화면 전환 시 크래시 위험 → 먼저 닫는다
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      await supplyVendorApi.apply({
        name: name.trim(),
        businessNo: businessNo.trim(),
        ecommerceRegNo: ecommerceRegNo.trim() || undefined,
        contactEmail: contactEmail.trim(),
      });
      toast('입점 신청이 접수되었습니다. 심사 후 알려드릴게요.', { variant: 'success' });
      setTimeout(() => navigation.goBack(), 150);
    } catch (e) {
      toast(
        e instanceof ApiError ? e.userMessage : '신청에 실패했습니다.',
        { variant: 'error' },
      );
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, name, businessNo, ecommerceRegNo, contactEmail, toast, navigation]);

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
        <Text style={s.headerTitle}>판매자 입점 신청</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={s.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.notice}>
            <InfoIcon size={15} color={COLORS.gold} />
            <Text style={s.noticeText}>
              타투용품은 사업자만 판매할 수 있습니다. 제출한 정보는 심사 용도로만 사용되며,
              승인 후 상품을 등록할 수 있습니다.
            </Text>
          </View>

          <Text style={s.label}>상호 <Text style={s.req}>*</Text></Text>
          <TextInput
            style={s.input}
            placeholder="사업자등록증 상의 상호"
            placeholderTextColor={COLORS.gray2}
            value={name}
            onChangeText={setName}
            maxLength={100}
          />

          <Text style={s.label}>사업자등록번호 <Text style={s.req}>*</Text></Text>
          <TextInput
            style={s.input}
            placeholder="000-00-00000"
            placeholderTextColor={COLORS.gray2}
            value={businessNo}
            onChangeText={setBusinessNo}
            keyboardType="numbers-and-punctuation"
            maxLength={12}
          />
          {businessNo.length > 0 && !BIZ_RE.test(businessNo.trim()) && (
            <Text style={s.hintErr}>10자리 숫자로 입력해주세요.</Text>
          )}

          <Text style={s.label}>통신판매업 신고번호</Text>
          <TextInput
            style={s.input}
            placeholder="제0000-지역-0000호 (선택)"
            placeholderTextColor={COLORS.gray2}
            value={ecommerceRegNo}
            onChangeText={setEcommerceRegNo}
            maxLength={100}
          />

          <Text style={s.label}>담당자 이메일 <Text style={s.req}>*</Text></Text>
          <TextInput
            style={s.input}
            placeholder="orders@example.com"
            placeholderTextColor={COLORS.gray2}
            value={contactEmail}
            onChangeText={setContactEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={191}
          />
          {contactEmail.length > 0 && !EMAIL_RE.test(contactEmail.trim()) && (
            <Text style={s.hintErr}>올바른 이메일 형식이 아닙니다.</Text>
          )}

          <Text style={s.footNote}>
            심사는 영업일 기준 3~5일 소요됩니다.{'\n'}
            배송과 상품 정보에 대한 책임은 판매자에게 있습니다.
          </Text>
        </ScrollView>

        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            activeOpacity={0.85}
            style={[s.submitBtn, (!canSubmit || submitting) && s.submitBtnDisabled]}
          >
            <Text style={[s.submitText, (!canSubmit || submitting) && s.submitTextDisabled]}>
              {submitting ? '신청 중...' : '입점 신청하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VendorApplyScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex1: { flex: 1 },

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

  content: { padding: 20, paddingBottom: 40 },

  notice: {
    flexDirection: 'row', gap: 9, padding: 14, borderRadius: 10,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1, borderColor: 'rgba(212,168,67,0.25)',
    marginBottom: 24,
  },
  noticeText: { flex: 1, color: COLORS.gold, fontSize: 12, lineHeight: 18, flexShrink: 1 },

  label: {
    color: COLORS.white, fontSize: 14, fontWeight: '600',
    lineHeight: 20, marginBottom: 8, marginTop: 16,
  },
  req: { color: COLORS.gold },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 20,
  },
  hintErr: { color: COLORS.danger, fontSize: 11.5, lineHeight: 16, marginTop: 6 },

  footNote: { color: COLORS.gray2, fontSize: 12, lineHeight: 18, marginTop: 28 },

  footer: {
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.black,
  },
  submitBtn: {
    paddingVertical: 16, borderRadius: 12,
    backgroundColor: COLORS.gold, alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: COLORS.elevated },
  submitText: { fontSize: 15, fontWeight: '700', color: COLORS.black, lineHeight: 20 },
  submitTextDisabled: { color: COLORS.gray2 },
});
