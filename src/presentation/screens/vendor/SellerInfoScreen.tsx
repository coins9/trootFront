import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { BackArrowIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { ApiError } from '../../../data/api/client';
import { supplyVendorApi, type MyVendor, type VendorStatus } from '../../../data/api/vendor';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIZ_RE = /^\d{3}-?\d{2}-?\d{5}$/;

const SellerInfoScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendor, setVendor] = useState<MyVendor | null>(null);

  const [name, setName] = useState('');
  const [businessNo, setBusinessNo] = useState('');
  const [ecommerceRegNo, setEcommerceRegNo] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [openChatUrl, setOpenChatUrl] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const v = await supplyVendorApi.me();
        if (!alive) return;
        setVendor(v);
        setName(v.name);
        setBusinessNo(v.businessNo);
        setEcommerceRegNo(v.ecommerceRegNo ?? '');
        setContactEmail(v.contactEmail);
        setOpenChatUrl(v.openChatUrl ?? '');
      } catch (e) {
        if (alive) {
          toast(e instanceof ApiError ? e.userMessage : t('vendor.loadFailed'), { variant: 'error' });
          navigation.goBack();
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [navigation, toast, t]);

  const canSubmit =
    name.trim().length >= 2 &&
    BIZ_RE.test(businessNo.trim()) &&
    EMAIL_RE.test(contactEmail.trim());

  const statusLabel = (status: VendorStatus) => {
    switch (status) {
      case 'pending': return t('vendor.statusPending');
      case 'approved': return t('vendor.statusApproved');
      case 'rejected': return t('vendor.statusRejected');
      case 'suspended': return t('vendor.statusSuspended');
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || saving) return;
    Keyboard.dismiss();
    setSaving(true);
    try {
      const updated = await supplyVendorApi.updateVendor({
        name: name.trim(),
        businessNo: businessNo.trim(),
        ecommerceRegNo: ecommerceRegNo.trim(),
        contactEmail: contactEmail.trim(),
        openChatUrl: openChatUrl.trim(),
      });
      setVendor(updated);
      toast(t('vendor.saveSuccess'), { variant: 'success' });
    } catch (e) {
      toast(e instanceof ApiError ? e.userMessage : t('vendor.saveFailed'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  }, [canSubmit, saving, name, businessNo, ecommerceRegNo, contactEmail, openChatUrl, toast, t]);

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
        <Text style={s.headerTitle}>{t('vendor.sellerInfoTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={s.loading}><ActivityIndicator color={COLORS.gold} /></View>
      ) : (
        <KeyboardAvoidingView
          style={s.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={s.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {vendor && (
              <>
                <Text style={s.sectionTitle}>{t('vendor.settlementSection')}</Text>
                <View style={s.settlementCard}>
                  <View style={s.settlementRow}>
                    <Text style={s.settlementLabel}>{t('vendor.statusLabel')}</Text>
                    <Text style={s.settlementValue}>{statusLabel(vendor.status)}</Text>
                  </View>
                  <View style={s.settlementRow}>
                    <Text style={s.settlementLabel}>{t('vendor.entryPhaseLabel')}</Text>
                    <Text style={s.settlementValue}>
                      {vendor.entryPhase === 'PAID' ? t('vendor.entryPhasePaid') : t('vendor.entryPhaseFree')}
                    </Text>
                  </View>
                  <View style={s.settlementRow}>
                    <Text style={s.settlementLabel}>{t('vendor.commissionRateLabel')}</Text>
                    <Text style={s.settlementValue}>{vendor.commissionRate}%</Text>
                  </View>
                  <View style={s.settlementRow}>
                    <Text style={s.settlementLabel}>{t('vendor.productCountLabel')}</Text>
                    <Text style={s.settlementValue}>{vendor.productCount}</Text>
                  </View>
                  <View style={[s.settlementRow, s.settlementRowLast]}>
                    <Text style={s.settlementLabel}>{t('vendor.inquiryCountLabel')}</Text>
                    <Text style={s.settlementValue}>{vendor.inquiryCount}</Text>
                  </View>
                </View>
              </>
            )}

            <Text style={s.sectionTitle}>{t('vendor.sellerInfoSection')}</Text>

            <Text style={s.label}>{t('vendor.labelName')} <Text style={s.req}>*</Text></Text>
            <TextInput
              style={s.input}
              placeholder={t('vendor.placeholderName')}
              placeholderTextColor={COLORS.gray2}
              value={name}
              onChangeText={setName}
              maxLength={100}
            />

            <Text style={s.label}>{t('vendor.labelBizNo')} <Text style={s.req}>*</Text></Text>
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
              <Text style={s.hintErr}>{t('vendor.bizNoError')}</Text>
            )}

            <Text style={s.label}>{t('vendor.labelEcommerce')}</Text>
            <TextInput
              style={s.input}
              placeholder={t('vendor.placeholderEcommerce')}
              placeholderTextColor={COLORS.gray2}
              value={ecommerceRegNo}
              onChangeText={setEcommerceRegNo}
              maxLength={100}
            />

            <Text style={s.label}>{t('vendor.labelEmail')} <Text style={s.req}>*</Text></Text>
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
              <Text style={s.hintErr}>{t('vendor.emailError')}</Text>
            )}

            <Text style={s.label}>{t('vendor.labelOpenChat')}</Text>
            <TextInput
              style={s.input}
              placeholder={t('vendor.placeholderOpenChat')}
              placeholderTextColor={COLORS.gray2}
              value={openChatUrl}
              onChangeText={setOpenChatUrl}
              autoCapitalize="none"
              maxLength={500}
            />
          </ScrollView>

          <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit || saving}
              activeOpacity={0.85}
              style={[s.submitBtn, (!canSubmit || saving) && s.submitBtnDisabled]}
            >
              <Text style={[s.submitText, (!canSubmit || saving) && s.submitTextDisabled]}>
                {saving ? t('vendor.saving') : t('vendor.saveBtn')}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

export default SellerInfoScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex1: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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

  sectionTitle: {
    color: COLORS.gold, fontSize: 13, fontWeight: '700',
    lineHeight: 18, marginTop: 8, marginBottom: 12, letterSpacing: 0.3,
  },

  settlementCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  settlementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settlementRowLast: { borderBottomWidth: 0 },
  settlementLabel: { color: COLORS.gray, fontSize: 13, lineHeight: 18 },
  settlementValue: { color: COLORS.white, fontSize: 13, fontWeight: '600', lineHeight: 18 },

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
