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
import {
  PRODUCT_CATEGORIES, supplyVendorApi, type ProductPayload,
} from '../../../data/api/vendor';
import type { ProductCategory } from '../../../data/api';
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
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // 수정 모드면 기존 값을 채운다
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
        setCategory(found.category);
        setBrand(found.brand ?? '');
        setPrice(String(found.priceKrw));
        setStock(String(found.stock));
        setDescription(found.description ?? '');
        setExternalUrl(found.externalUrl ?? '');
        setImages(found.images ?? []);
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
    name.trim().length >= 2 && !!category && Number.isFinite(priceNum) && priceNum >= 0;

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

    const payload: ProductPayload = {
      name: name.trim(),
      category: category as ProductCategory,
      priceKrw: priceNum,
      stock: stock ? Number(stock) : 0,
      brand: brand.trim() || undefined,
      description: description.trim() || undefined,
      externalUrl: externalUrl.trim() || undefined,
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
    canSubmit, submitting, name, category, priceNum, stock, brand,
    description, externalUrl, images, isEdit, productId, toast, navigation, t,
  ]);

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
        <Text style={s.headerTitle}>{isEdit ? t('vendor.productEdit') : t('vendor.productAdd')}</Text>
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
            <Text style={s.label}>{t('vendor.fieldPhoto')}</Text>
            <Text style={s.sub}>{t('vendor.photoHint')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.imageRow}>
              <TouchableOpacity
                style={s.imageAdd}
                onPress={addImage}
                activeOpacity={0.75}
                disabled={uploading}
              >
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
                  <TouchableOpacity
                    style={s.thumbRemove}
                    onPress={() => setImages((prev) => { deleteUpload(prev[i]); return prev.filter((_, idx) => idx !== i); })}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <XIcon size={10} color={COLORS.white} strokeWidth={2.5} />
                  </TouchableOpacity>
                  {i === 0 && (
                    <View style={s.mainBadge}>
                      <Text style={s.mainBadgeText}>{t('vendor.photoPrimaryBadge')}</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <Text style={s.label}>{t('vendor.fieldName')} <Text style={s.req}>*</Text></Text>
            <TextInput
              style={s.input}
              placeholder={t('vendor.fieldNamePlaceholder')}
              placeholderTextColor={COLORS.gray2}
              value={name}
              onChangeText={setName}
              maxLength={200}
            />

            <Text style={s.label}>{t('vendor.fieldCategory')} <Text style={s.req}>*</Text></Text>
            <View style={s.chipRow}>
              {PRODUCT_CATEGORIES.map((c) => {
                const active = category === c.value;
                return (
                  <TouchableOpacity
                    key={c.value}
                    onPress={() => setCategory(active ? '' : c.value)}
                    activeOpacity={0.75}
                    style={[s.chip, active && s.chipActive]}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>{c.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.label}>{t('vendor.fieldBrand')}</Text>
            <TextInput
              style={s.input}
              placeholder={t('vendor.fieldBrandPlaceholder')}
              placeholderTextColor={COLORS.gray2}
              value={brand}
              onChangeText={setBrand}
              maxLength={100}
            />

            <View style={s.row}>
              <View style={s.rowItem}>
                <Text style={s.label}>{t('vendor.fieldPrice')} <Text style={s.req}>*</Text></Text>
                <TextInput
                  style={s.input}
                  placeholder="15000"
                  placeholderTextColor={COLORS.gray2}
                  value={price}
                  onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
              </View>
              <View style={s.rowItem}>
                <Text style={s.label}>{t('vendor.fieldStock')}</Text>
                <TextInput
                  style={s.input}
                  placeholder="100"
                  placeholderTextColor={COLORS.gray2}
                  value={stock}
                  onChangeText={(v) => setStock(v.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={s.label}>{t('vendor.fieldDescription')}</Text>
            <TextInput
              style={[s.input, s.textarea]}
              placeholder={t('vendor.descPlaceholder')}
              placeholderTextColor={COLORS.gray2}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />

            <Text style={s.label}>{t('vendor.fieldExternalUrl')}</Text>
            <TextInput
              style={s.input}
              placeholder={t('vendor.fieldExternalUrlPlaceholder')}
              placeholderTextColor={COLORS.gray2}
              value={externalUrl}
              onChangeText={setExternalUrl}
              autoCapitalize="none"
              maxLength={500}
            />
            <Text style={s.sub}>{t('vendor.externalUrlHint')}</Text>

            <View style={{ height: 24 }} />
          </ScrollView>

          <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
              activeOpacity={0.85}
              style={[s.submitBtn, (!canSubmit || submitting) && s.submitBtnDisabled]}
            >
              <Text style={[s.submitText, (!canSubmit || submitting) && s.submitTextDisabled]}>
                {submitting
                  ? t('vendor.saving')
                  : isEdit
                  ? t('vendor.submitEdit')
                  : t('vendor.submitNew')}
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

  label: {
    color: COLORS.white, fontSize: 14, fontWeight: '600',
    lineHeight: 20, marginBottom: 8, marginTop: 18,
  },
  req: { color: COLORS.gold },
  sub: { color: COLORS.gray2, fontSize: 11.5, lineHeight: 17, marginTop: 6, marginBottom: 4 },

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
  textarea: { minHeight: 110 },

  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.chipBorder, backgroundColor: COLORS.card,
  },
  chipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  chipText: { color: COLORS.gray, fontSize: 13, lineHeight: 18 },
  chipTextActive: { color: COLORS.gold, fontWeight: '600' },

  imageRow: { marginTop: 4, marginBottom: 4 },
  imageAdd: {
    width: 84, height: 84, borderRadius: 10,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.gold,
    backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8, gap: 4,
  },
  imageCount: { fontSize: 11, color: COLORS.gray, lineHeight: 14 },
  thumb: { width: 84, height: 84, borderRadius: 10, marginRight: 8, position: 'relative' },
  thumbFill: { width: 84, height: 84, borderRadius: 10, backgroundColor: COLORS.elevated },
  thumbRemove: {
    position: 'absolute', top: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  mainBadge: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: COLORS.gold, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  mainBadgeText: { fontSize: 10, color: COLORS.black, fontWeight: '700', lineHeight: 13 },

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
