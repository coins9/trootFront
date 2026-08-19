import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, StatusBar, TouchableOpacity, Image,
  ActivityIndicator, Linking, Alert, TextInput,
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

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_META: Record<MyVendor['status'], { label: string; color: string; desc: string }> = {
  pending: {
    label: '심사 대기',
    color: COLORS.gold,
    desc: '입점 심사가 진행 중입니다. 승인 후 상품을 등록할 수 있어요.',
  },
  approved: { label: '승인 완료', color: '#45C173', desc: '' },
  rejected: {
    label: '반려',
    color: COLORS.danger,
    desc: '입점이 반려되었습니다. 고객센터로 문의해주세요.',
  },
  suspended: {
    label: '정지',
    color: COLORS.danger,
    desc: '판매가 정지된 상태입니다. 등록 상품이 노출되지 않습니다.',
  },
};

const MyProductsScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const settings = usePublicSettings();

  const [vendor, setVendor] = useState<MyVendor | null>(null);
  const [products, setProducts] = useState<MyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

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
        setError(e instanceof ApiError ? e.userMessage : '정보를 불러오지 못했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 등록/수정 화면에서 돌아왔을 때 목록을 갱신한다
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const handleDelete = useCallback((product: MyProduct) => {
    setConfirm({
      title: '상품 삭제',
      message: `'${product.name}'을(를) 삭제하시겠습니까?\n삭제한 상품은 복구할 수 없습니다.`,
      cancelLabel: '취소',
      confirmLabel: '삭제',
      variant: 'danger',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await supplyVendorApi.deleteProduct(product.id);
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
          toast('상품이 삭제되었습니다', { variant: 'success' });
        } catch (e) {
          toast(e instanceof ApiError ? e.userMessage : '삭제에 실패했습니다', { variant: 'error' });
        }
      },
    });
  }, [toast]);

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
        <Text style={s.cardPrice}>{item.priceKrw.toLocaleString()}원</Text>
        <View style={s.cardMetaRow}>
          <Text style={s.cardMeta}>재고 {item.stock}</Text>
          <Text style={s.cardDot}>·</Text>
          <Text style={[s.cardMeta, !item.isActive && s.inactive]}>
            {item.isActive ? '판매중' : '판매중지'}
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
          <Text style={s.deleteText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [navigation, handleDelete]);

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
        <Text style={s.headerTitle}>타투용품 판매 관리</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={s.state}><ActivityIndicator color={COLORS.gold} /></View>
      ) : error ? (
        <View style={s.state}>
          <Text style={s.stateText}>{error}</Text>
          <TouchableOpacity onPress={load} style={s.retry}>
            <Text style={s.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : !vendor ? (
        /* 입점 신청 전 */
        <View style={s.state}>
          <Text style={s.emptyTitle}>판매자 입점 신청이 필요합니다</Text>
          <Text style={s.stateText}>
            사업자 정보를 등록하고 심사를 받으면{'\n'}타투용품을 판매할 수 있습니다.
          </Text>
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
            <Text style={s.primaryBtnText}>입점 신청하기</Text>
            <ChevronRightIcon size={16} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={s.statusBox}>
            <View style={s.statusRow}>
              <Text style={s.vendorName}>{vendor.name}</Text>
              <View style={[s.statusBadge, { borderColor: STATUS_META[vendor.status].color }]}>
                <Text style={[s.statusText, { color: STATUS_META[vendor.status].color }]}>
                  {STATUS_META[vendor.status].label}
                </Text>
              </View>
            </View>
            {!!STATUS_META[vendor.status].desc && (
              <Text style={s.statusDesc}>{STATUS_META[vendor.status].desc}</Text>
            )}
            {vendor.status === 'approved' && (
              <Text style={s.statusDesc}>
                등록 상품 {products.length}개 · 수수료 {Number(vendor.commissionRate).toFixed(0)}%
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
                      Alert.prompt(
                        '카카오 오픈채팅 URL',
                        '오픈채팅 URL을 입력해주세요 (open.kakao.com/...)',
                        async (url) => {
                          if (!url?.trim()) return;
                          try {
                            const updated = await supplyVendorApi.updateVendor({ openChatUrl: url.trim() });
                            setVendor(updated);
                            toast('오픈채팅 URL이 저장되었습니다', { variant: 'success' });
                          } catch {
                            toast('저장에 실패했습니다', { variant: 'error' });
                          }
                        },
                        'plain-text',
                        vendor.openChatUrl ?? '',
                      );
                    }
                  }}
                >
                  <Text style={s.chatBtnText}>
                    {vendor.openChatUrl ? '💬 오픈채팅 바로가기' : '💬 오픈채팅 URL 등록'}
                  </Text>
                </TouchableOpacity>
                {vendor.openChatUrl && (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.prompt(
                        '카카오 오픈채팅 URL',
                        '오픈채팅 URL을 변경해주세요',
                        async (url) => {
                          if (url === undefined) return;
                          try {
                            const updated = await supplyVendorApi.updateVendor({ openChatUrl: url.trim() || '' });
                            setVendor(updated);
                            toast('오픈채팅 URL이 저장되었습니다', { variant: 'success' });
                          } catch {
                            toast('저장에 실패했습니다', { variant: 'error' });
                          }
                        },
                        'plain-text',
                        vendor.openChatUrl,
                      );
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <EditPenIcon size={14} color={COLORS.gray} strokeWidth={1.7} />
                  </TouchableOpacity>
                )}
                {vendor.inquiryCount > 0 && (
                  <Text style={s.inquiryCount}>문의 {vendor.inquiryCount}회</Text>
                )}
              </View>
            )}
            {vendor.status === 'approved' && (
              <TouchableOpacity
                style={s.adLink}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('AdManage', { placement: 'product' })}
              >
                <Text style={s.adLinkText}>용품샵 광고 · 통계 관리</Text>
                <ChevronRightIcon size={15} color={COLORS.gold} />
              </TouchableOpacity>
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
                  <Text style={s.stateText}>
                    아직 등록한 상품이 없습니다.{'\n'}오른쪽 아래 + 버튼으로 등록해보세요.
                  </Text>
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
});
