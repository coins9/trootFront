import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { BackArrowIcon, CameraAddIcon, XIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { ApiError } from '../../../data/api/client';
import { supplyVendorApi, type ProductPayload } from '../../../data/api/vendor';
// 🚨 기존 PRODUCT_CATEGORIES 대신 supplyTypes의 한글 카테고리를 사용하도록 변경
import { SUPPLY_CATEGORIES, type SupplyCategory } from '../../../domain/entities/supplyTypes';
import { useImageUpload } from '../../hooks/useImageUpload';
import { deleteUpload } from '../../../data/api/upload';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { useTranslation } from '../../store/languageStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteP = RouteProp<RootStackParamList, 'ProductForm'>;

const ProductFormScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t } = useTranslation();

  const productId = route.params?.productId;
  const isEdit = !!productId;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState(''); // 🚨 새로 추가된 부제목 상태
  const [category, setCategory] = useState<SupplyCategory | ''>(''); // 🚨 타입 변경
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [openChatUrl, setOpenChatUrl] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!productId) return;
    let alive = true;

    (async () => {
      try {
        const list = await supplyVendorApi.myProducts();
        const found = list.find((p) => p.id === productId);
        if (!alive) return;

        if (!found) {
          toast(t('vendor.productNotFound'), { variant: 'error' });
          navigation.goBack();
          return;
        }
        setName(found.name);
        // 타입 에러 방지를 위해 any 캐스팅 처리
        setSubtitle((found as any).subtitle ?? '');
        setCategory(found.category as SupplyCategory);
        setBrand(found.brand ?? '');

        // 🚨 TS2339 에러 수정 부분: priceKrw와 thumbnail로 정확히 매핑
        setPrice(String(found.priceKrw ?? ''));
        setStock(String(found.stock ?? 0));
        setDescription(found.description ?? '');
        setNameEn((found as any).nameEn ?? '');
        setDescriptionEn((found as any).descriptionEn ?? '');
        setOpenChatUrl((found as any).openChatUrl ?? '');
        setStoreUrl((found as any).storeUrl ?? (found.externalUrl ?? ''));
        setImages(found.images ?? (found.thumbnail ? [found.thumbnail] : []));
      } catch (e) {
        if (alive) {
          toast(e instanceof ApiError ? e.userMessage : t('vendor.productLoadFailed'), { variant: 'error' });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [productId, navigation, toast, t]);

  const priceNum = Number(price);
  const canSubmit =
      name.trim().length >= 2 && subtitle.trim().length >= 2 && !!category && Number.isFinite(priceNum) && priceNum >= 0;

  const { pickAndUpload, uploading } = useImageUpload({
    scope: 'product',
    max: 10,
    current: images.length,
    onError: (m) => toast(m, { variant: 'error' }),
  });

  const addImage = useCallback(async () => {
    const urls = await pickAndUpload();
    if (urls.length) setImages((prev) => [...prev, ...urls]);
  }, [pickAndUpload]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submitting) return;
    Keyboard.dismiss();
    setSubmitting(true);

    const payload: ProductPayload & { subtitle?: string; nameEn?: string; descriptionEn?: string; openChatUrl?: string; storeUrl?: string } = {
      name: name.trim(),
      subtitle: subtitle.trim(),
      nameEn: nameEn.trim() || undefined,
      descriptionEn: descriptionEn.trim() || undefined,
      category: category as any,
      priceKrw: priceNum,
      stock: stock ? Number(stock) : 0,
      brand: brand.trim() || undefined,
      description: description.trim() || undefined,
      openChatUrl: openChatUrl.trim() || undefined,
      storeUrl: storeUrl.trim() || undefined,
      images,
      thumbnail: images[0],
    };

    try {
      if (isEdit) await supplyVendorApi.updateProduct(productId!, payload);
      else await supplyVendorApi.createProduct(payload);

      toast(isEdit ? t('vendor.productUpdated') : t('vendor.productCreated'), { variant: 'success' });
      setTimeout(() => navigation.goBack(), 150);
    } catch (e) {
      toast(e instanceof ApiError ? e.userMessage : t('vendor.saveFailed'), { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit, submitting, name, subtitle, nameEn, descriptionEn, category,
    priceNum, stock, brand, description, openChatUrl, storeUrl,
    images, isEdit, productId, toast, navigation, t,
  ]);

  return (
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{isEdit ? t('vendor.productEdit') : t('vendor.productAdd')}</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
            <View style={s.loading}><ActivityIndicator color={COLORS.gold} /></View>
        ) : (
            <KeyboardAvoidingView style={s.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {/* 사진 등록 영역 유지 */}
                <Text style={s.label}>{t('vendor.fieldPhoto')}</Text>
                <Text style={s.sub}>{t('vendor.photoHint')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.imageRow}>
                  <TouchableOpacity style={s.imageAdd} onPress={addImage} activeOpacity={0.75} disabled={uploading}>
                    {uploading ? (
                        <ActivityIndicator color={COLORS.gold} />
                    ) : (
                        <>
                          <CameraAddIcon size={30} color={COLORS.gold} />
                          <Text style={s.imageCount}>{images.length}/10</Text>
                        </>
                    )}
                  </TouchableOpacity>
                  {images.map((uri, i) => (
                      <View key={uri} style={s.thumb}>
                        <Image source={{ uri }} style={s.thumbFill} resizeMode="cover" />
                        <TouchableOpacity style={s.thumbRemove} onPress={() => setImages((prev) => { deleteUpload(prev[i]); return prev.filter((_, idx) => idx !== i); })}>
                          <XIcon size={10} color={COLORS.white} strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                  ))}
                </ScrollView>

                <Text style={s.label}>{t('vendor.fieldName')} <Text style={s.req}>*</Text></Text>
                <TextInput style={s.input} placeholder={t('vendor.fieldNamePlaceholder')} placeholderTextColor={COLORS.gray2} value={name} onChangeText={setName} />

                <Text style={s.label}>영문 상품명 (English Name)</Text>
                <TextInput style={s.input} placeholder="e.g. Beginner Tattoo Machine Kit" placeholderTextColor={COLORS.gray2} value={nameEn} onChangeText={setNameEn} autoCapitalize="none" />

                <Text style={s.label}>한 줄 설명 (부제목) <Text style={s.req}>*</Text></Text>
                <TextInput
                    style={s.input}
                    placeholder="리스트에 노출될 핵심 설명을 적어주세요 (예: 입문용 최고의 머신)"
                    placeholderTextColor={COLORS.gray2}
                    value={subtitle}
                    onChangeText={setSubtitle}
                    maxLength={40}
                />

                <Text style={s.label}>{t('vendor.fieldCategory')} <Text style={s.req}>*</Text></Text>
                <View style={s.chipRow}>
                  {SUPPLY_CATEGORIES.map((c) => {
                    const active = category === c;
                    return (
                        <TouchableOpacity key={c} onPress={() => setCategory(active ? '' : c)} activeOpacity={0.75} style={[s.chip, active && s.chipActive]}>
                          <Text style={[s.chipText, active && s.chipTextActive]}>{c}</Text>
                        </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={s.label}>{t('vendor.fieldBrand')}</Text>
                <TextInput style={s.input} placeholder={t('vendor.fieldBrandPlaceholder')} placeholderTextColor={COLORS.gray2} value={brand} onChangeText={setBrand} />

                <View style={s.row}>
                  <View style={s.rowItem}>
                    <Text style={s.label}>{t('vendor.fieldPrice')} <Text style={s.req}>*</Text></Text>
                    <TextInput style={s.input} placeholder="15000" placeholderTextColor={COLORS.gray2} value={price} onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, ''))} keyboardType="numeric" />
                  </View>
                  <View style={s.rowItem}>
                    <Text style={s.label}>{t('vendor.fieldStock')}</Text>
                    <TextInput style={s.input} placeholder="100" placeholderTextColor={COLORS.gray2} value={stock} onChangeText={(v) => setStock(v.replace(/[^0-9]/g, ''))} keyboardType="numeric" />
                  </View>
                </View>

                <Text style={s.label}>{t('vendor.fieldDescription')}</Text>
                <TextInput style={[s.input, s.textarea]} placeholder={t('vendor.descPlaceholder')} placeholderTextColor={COLORS.gray2} value={description} onChangeText={setDescription} multiline textAlignVertical="top" />

                <Text style={s.label}>영문 설명 (English Description)</Text>
                <TextInput style={[s.input, s.textarea]} placeholder="Enter product description in English" placeholderTextColor={COLORS.gray2} value={descriptionEn} onChangeText={setDescriptionEn} multiline textAlignVertical="top" autoCapitalize="none" />

                <Text style={s.label}>1:1 문의 링크 (오픈채팅)</Text>
                <TextInput style={s.input} placeholder="https://open.kakao.com/..." placeholderTextColor={COLORS.gray2} value={openChatUrl} onChangeText={setOpenChatUrl} autoCapitalize="none" keyboardType="url" />

                <Text style={s.label}>구매 링크 (외부 스토어)</Text>
                <TextInput style={s.input} placeholder="https://smartstore.naver.com/..." placeholderTextColor={COLORS.gray2} value={storeUrl} onChangeText={setStoreUrl} autoCapitalize="none" keyboardType="url" />

                <View style={{ height: 24 }} />
              </ScrollView>

              <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
                <TouchableOpacity onPress={handleSubmit} disabled={!canSubmit || submitting} activeOpacity={0.85} style={[s.submitBtn, (!canSubmit || submitting) && s.submitBtnDisabled]}>
                  <Text style={[s.submitText, (!canSubmit || submitting) && s.submitTextDisabled]}>
                    {submitting ? t('vendor.saving') : isEdit ? t('vendor.submitEdit') : t('vendor.submitNew')}
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
        )}
      </SafeAreaView>
  );
};

export default ProductFormScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex1: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.black, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white, letterSpacing: 0.3 },
  content: { padding: 20 },
  label: { color: COLORS.white, fontSize: 14, fontWeight: '600', lineHeight: 20, marginBottom: 8, marginTop: 18 },
  req: { color: COLORS.gold },
  sub: { color: COLORS.gray2, fontSize: 11.5, lineHeight: 17, marginTop: 6, marginBottom: 4 },
  input: { backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: COLORS.white, lineHeight: 20 },
  textarea: { minHeight: 110 },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.chipBorder, backgroundColor: COLORS.card },
  chipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  chipText: { color: COLORS.gray, fontSize: 13, lineHeight: 18 },
  chipTextActive: { color: COLORS.gold, fontWeight: '600' },
  imageRow: { marginTop: 4, marginBottom: 4 },
  imageAdd: { width: 84, height: 84, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.gold, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', marginRight: 8, gap: 4 },
  imageCount: { fontSize: 11, color: COLORS.gray, lineHeight: 14 },
  thumb: { width: 84, height: 84, borderRadius: 10, marginRight: 8, position: 'relative' },
  thumbFill: { width: 84, height: 84, borderRadius: 10, backgroundColor: COLORS.elevated },
  thumbRemove: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  mainBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: COLORS.gold, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  mainBadgeText: { fontSize: 10, color: COLORS.black, fontWeight: '700', lineHeight: 13 },
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.black },
  submitBtn: { paddingVertical: 16, borderRadius: 12, backgroundColor: COLORS.gold, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: COLORS.elevated },
  submitText: { fontSize: 15, fontWeight: '700', color: COLORS.black, lineHeight: 20 },
  submitTextDisabled: { color: COLORS.gray2 },
});