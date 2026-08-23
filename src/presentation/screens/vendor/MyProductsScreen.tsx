import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, StatusBar, TouchableOpacity, Image,
  ActivityIndicator, Linking, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, PlusIcon, TattooPlaceholderIcon, EditPenIcon, ChevronRightIcon,
} from '../../components/icons';
import ConfirmModal, { ConfirmConfig } from '../../components/common/ConfirmModal';
import { useToast } from '../../components/common/Toast';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { ApiError } from '../../../data/api/client';
import { supplyVendorApi, type MyProduct, type MyVendor } from '../../../data/api/vendor';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_COLOR: Record<MyVendor['status'], string> = {
  pending: COLORS.gold,
  approved: '#45C173',
  rejected: COLORS.danger,
  suspended: COLORS.danger,
};

const MyProductsScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const settings = usePublicSettings();
  const { t, language } = useTranslation();

  const [vendor, setVendor] = useState<MyVendor | null>(null);
  const [products, setProducts] = useState<MyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatUrlInput, setChatUrlInput] = useState('');

  const getStatusLabel = (status: MyVendor['status']): string => {
    const map: Record<MyVendor['status'], string> = {
      pending: t('vendor.statusPending'),
      approved: t('vendor.statusApprovedLabel'),
      rejected: t('vendor.statusRejected'),
      suspended: t('vendor.statusSuspendedLabel'),
    };
    return map[status];
  };

  const getStatusDesc = (status: MyVendor['status']): string => {
    const map: Record<MyVendor['status'], string> = {
      pending: t('vendor.statusPendingDesc'),
      approved: '',
      rejected: t('vendor.statusRejectedDesc'),
      suspended: t('vendor.statusSuspendedDesc'),
    };
    return map[status];
  };

  const openChatModal = () => {
    setChatUrlInput(vendor?.openChatUrl ?? '');
    setChatModalVisible(true);
  };

  const saveChatUrl = async () => {
    const url = chatUrlInput.trim();
    setChatModalVisible(false);
    try {
      const updated = await supplyVendorApi.updateVendor({ openChatUrl: url });
      setVendor(updated);
      toast(t('vendor.chatUrlSaved'), { variant: 'success' });
    } catch {
      toast(t('vendor.saveFailed'), { variant: 'error' });
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await supplyVendorApi.me();
      setVendor(me);
      // 승인 전에는 상품 조회가 의미 없으므로 건너뛴다
      setProducts(me.status === 'approved' ? await supplyVendorApi.myProducts() : []);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setVendor(null); // 아직 입점 신청 전
      } else {
        setError(e instanceof ApiError ? e.userMessage : t('vendor.loadInfoFailed'));
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  // 등록/수정 화면에서 돌아왔을 때 목록을 갱신한다
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const handleDelete = useCallback((product: MyProduct) => {
    setConfirm({
      title: t('vendor.deleteProductTitle'),
      message: t('vendor.deleteProductMsg', { name: product.name }),
      cancelLabel: t('common.cancel'),
      confirmLabel: t('common.delete'),
      variant: 'danger',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await supplyVendorApi.deleteProduct(product.id);
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
          toast(t('vendor.productDeleted'), { variant: 'success' });
        } catch (e) {
          toast(e instanceof ApiError ? e.userMessage : t('vendor.deleteFailed'), { variant: 'error' });
        }
      },
    });
  }, [toast, t]);

  const formatPrice = useCallback((priceKrw: number): string =>
    language === 'ko'
      ? `${priceKrw.toLocaleString()}원`
      : `₩${priceKrw.toLocaleString()}`,
  [language]);

  const renderItem = useCallback(({ item }: { item: MyProduct }) => (
    <View style={s.card}>
      <View style={s.thumb}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={s.thumbImg} resizeMode="cover" />
        ) : (
          <TattooPlaceholderIcon size={30} color="#3a3a3a" />
        )}
      </View>

      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.cardPrice}>{formatPrice(item.priceKrw)}</Text>
        <View style={s.cardMetaRow}>
          <Text style={s.cardMeta}>{t('vendor.stockFmt', { count: item.stock })}</Text>
          <Text style={s.cardDot}>·</Text>
          <Text style={[s.cardMeta, !item.isActive && s.inactive]}>
            {item.isActive ? t('vendor.onSale') : t('vendor.offSale')}
          </Text>
        </View>
      </View>

      <View style={s.cardActions}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductForm', { productId: item.id })}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <EditPenIcon size={18} color={COLORS.gold} strokeWidth={1.7} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={s.deleteText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [navigation, handleDelete, formatPrice, t]);

  const canRegister = vendor?.status === 'approved';

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
        <Text style={s.headerTitle}>{t('vendor.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={s.state}><ActivityIndicator color={COLORS.gold} /></View>
      ) : error ? (
        <View style={s.state}>
          <Text style={s.stateText}>{error}</Text>
          <TouchableOpacity onPress={load} style={s.retry}>
            <Text style={s.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : !vendor ? (
        /* 입점 신청 전 */
        <View style={s.state}>
          <Text style={s.emptyTitle}>{t('vendor.applyRequired')}</Text>
          <Text style={s.stateText}>{t('vendor.applyRequiredDesc')}</Text>
          <TouchableOpacity
            style={s.primaryBtn}
            activeOpacity={0.85}
            onPress={() => {
              // 관리자에 왈라 입점 링크가 있으면 그리로, 없으면 앱 내부 신청으로 폴백
              if (settings.bannerSupplyUrl) {
                Linking.openURL(settings.bannerSupplyUrl).catch(() => {});
              } else {
                navigation.navigate('VendorApply');
              }
            }}
          >
            <Text style={s.primaryBtnText}>{t('vendor.submitBtn')}</Text>
            <ChevronRightIcon size={16} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={s.statusBox}>
            <View style={s.statusRow}>
              <Text style={s.vendorName}>{vendor.name}</Text>
              <View style={[s.statusBadge, { borderColor: STATUS_COLOR[vendor.status] }]}>
                <Text style={[s.statusText, { color: STATUS_COLOR[vendor.status] }]}>
                  {getStatusLabel(vendor.status)}
                </Text>
              </View>
            </View>
            {!!getStatusDesc(vendor.status) && (
              <Text style={s.statusDesc}>{getStatusDesc(vendor.status)}</Text>
            )}
            {vendor.status === 'approved' && (
              <Text style={s.statusDesc}>
                {t('vendor.approvedSummary', {
                  count: products.length,
                  rate: Number(vendor.commissionRate).toFixed(0),
                })}
              </Text>
            )}
            {vendor.status === 'approved' && (
              <View style={s.chatRow}>
                <TouchableOpacity
                  style={s.chatBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (vendor.openChatUrl) {
                      Linking.openURL(vendor.openChatUrl).catch(() => {});
                    } else {
                      openChatModal();
                    }
                  }}
                >
                  <Text style={s.chatBtnText}>
                    {vendor.openChatUrl ? t('vendor.chatLinkGoto') : t('vendor.chatLinkRegister')}
                  </Text>
                </TouchableOpacity>
                {vendor.openChatUrl && (
                  <TouchableOpacity
                    onPress={openChatModal}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <EditPenIcon size={14} color={COLORS.gray} strokeWidth={1.7} />
                  </TouchableOpacity>
                )}
                {vendor.inquiryCount > 0 && (
                  <Text style={s.inquiryCount}>
                    {t('vendor.inquiryCountFmt', { count: vendor.inquiryCount })}
                  </Text>
                )}
              </View>
            )}

          </View>

          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={[
              s.listContent,
              { paddingBottom: insets.bottom + 90 },
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              canRegister ? (
                <View style={s.state}>
                  <Text style={s.stateText}>{t('vendor.productEmptyHint')}</Text>
                </View>
              ) : null
            }
          />

          {canRegister && (
            <TouchableOpacity
              style={[s.fab, { bottom: insets.bottom + 20 }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ProductForm', {})}
            >
              <PlusIcon size={28} color={COLORS.black} strokeWidth={2.4} />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Chat URL Edit Modal */}
      <Modal visible={chatModalVisible} transparent animationType="fade" onRequestClose={() => setChatModalVisible(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{t('vendor.chatUrlModalTitle')}</Text>
            <TextInput
              style={s.modalInput}
              value={chatUrlInput}
              onChangeText={setChatUrlInput}
              placeholder="open.kakao.com/o/..."
              placeholderTextColor={COLORS.gray3}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              autoFocus
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setChatModalVisible(false)}>
                <Text style={s.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSaveBtn} onPress={saveChatUrl}>
                <Text style={s.modalSaveText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ConfirmModal config={confirm} onDismiss={() => setConfirm(null)} />
    </SafeAreaView>
  );
};

export default MyProductsScreen;

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

  state: { flex: 1, paddingVertical: 60, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', gap: 14 },
  stateText: { color: COLORS.gray, fontSize: 13.5, lineHeight: 21, textAlign: 'center' },
  emptyTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', lineHeight: 22, textAlign: 'center' },
  retry: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.gold,
  },
  retryText: { color: COLORS.gold, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.gold, borderRadius: 10,
    paddingVertical: 14, paddingHorizontal: 22, marginTop: 6,
  },
  primaryBtnText: { color: COLORS.black, fontSize: 14.5, fontWeight: '700', lineHeight: 20 },

  statusBox: {
    margin: 16, marginBottom: 8, padding: 16,
    backgroundColor: COLORS.card, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, gap: 8,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  vendorName: { color: COLORS.white, fontSize: 15, fontWeight: '700', lineHeight: 21, flexShrink: 1 },
  statusBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 3 },
  statusText: { fontSize: 11.5, fontWeight: '700', lineHeight: 16 },
  statusDesc: { color: COLORS.gray, fontSize: 12.5, lineHeight: 18 },
  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  chatBtn: {
    backgroundColor: COLORS.goldDim, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gold,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  chatBtnText: { color: COLORS.gold, fontSize: 12.5, fontWeight: '600', lineHeight: 18 },
  inquiryCount: { color: COLORS.gray, fontSize: 12, lineHeight: 18 },
  adLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  adLinkText: { color: COLORS.gold, fontSize: 13, fontWeight: '600' },

  listContent: { paddingHorizontal: 16, paddingTop: 8, gap: 10, flexGrow: 1 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.card, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 12,
  },
  thumb: {
    width: 62, height: 62, borderRadius: 10,
    backgroundColor: COLORS.elevated,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  cardBody: { flex: 1, gap: 3 },
  cardName: { color: COLORS.white, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  cardPrice: { color: COLORS.gold, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardMeta: { color: COLORS.gray, fontSize: 11.5, lineHeight: 16 },
  cardDot: { color: COLORS.gray3, fontSize: 11.5 },
  inactive: { color: COLORS.danger },
  cardActions: { alignItems: 'center', gap: 12 },
  deleteText: { color: COLORS.gray, fontSize: 11.5, lineHeight: 16 },

  fab: {
    position: 'absolute', right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 6,
  },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalCard: { width: '100%', backgroundColor: COLORS.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 14 },
  modalInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.white, fontSize: 14, backgroundColor: COLORS.elevated,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  modalCancelText: { color: COLORS.gray, fontSize: 14, fontWeight: '600' },
  modalSaveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.gold, alignItems: 'center' },
  modalSaveText: { color: COLORS.black, fontSize: 14, fontWeight: '700' },
});
