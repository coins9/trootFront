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
import { useTranslation } from '../../store/languageStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIZ_RE = /^\d{3}-?\d{2}-?\d{5}$/;

const VendorApplyScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t } = useTranslation();

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

    // iOS: dismiss keyboard before screen transition to prevent crash
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      await supplyVendorApi.apply({
        name: name.trim(),
        businessNo: businessNo.trim(),
        ecommerceRegNo: ecommerceRegNo.trim() || undefined,
        contactEmail: contactEmail.trim(),
      });
      // 🚨 TS2345 방어 (t as any)
      toast(t('vendor.applySuccess' as any), { variant: 'success' });
      setTimeout(() => navigation.goBack(), 150);
    } catch (e) {
      toast(
          e instanceof ApiError ? e.userMessage : t('vendor.applyFailed' as any),
          { variant: 'error' },
      );
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, name, businessNo, ecommerceRegNo, contactEmail, toast, navigation, t]);

  return (
      // 🚨 하단 잘림을 막기 위해 edges=['top'] 으로 수정
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

        <View style={s.header}>
          <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('vendor.applyTitle' as any)}</Text>
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
              <Text style={s.noticeText}>{t('vendor.applyNotice' as any)}</Text>
            </View>

            <Text style={s.label}>{t('vendor.labelName' as any)} <Text style={s.req}>*</Text></Text>
            <TextInput
                style={s.input}
                placeholder={t('vendor.placeholderName' as any)}
                placeholderTextColor={COLORS.gray2}
                value={name}
                onChangeText={setName}
                maxLength={100}
            />

            <Text style={s.label}>{t('vendor.labelBizNo' as any)} <Text style={s.req}>*</Text></Text>
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
                <Text style={s.hintErr}>{t('vendor.bizNoError' as any)}</Text>
            )}

            <Text style={s.label}>{t('vendor.labelEcommerce' as any)}</Text>
            <TextInput
                style={s.input}
                placeholder={t('vendor.placeholderEcommerce' as any)}
                placeholderTextColor={COLORS.gray2}
                value={ecommerceRegNo}
                onChangeText={setEcommerceRegNo}
                maxLength={100}
            />

            <Text style={s.label}>{t('vendor.labelEmail' as any)} <Text style={s.req}>*</Text></Text>
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
                <Text style={s.hintErr}>{t('vendor.emailError' as any)}</Text>
            )}

            <Text style={s.footNote}>{t('vendor.footNote' as any)}</Text>
          </ScrollView>

          {/* 🚨 버튼이 아이폰 하단 홈 인디케이터에 가려지지 않도록 안전한 여백(Math.max) 보장 */}
          <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 24) + 12 }]}>
            <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit || submitting}
                activeOpacity={0.85}
                style={[s.submitBtn, (!canSubmit || submitting) && s.submitBtnDisabled]}
            >
              <Text style={[s.submitText, (!canSubmit || submitting) && s.submitTextDisabled]}>
                {submitting ? t('vendor.submitting' as any) : t('vendor.submitBtn' as any)}
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
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white, letterSpacing: 0.3, lineHeight: 23 },

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