import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Config from 'react-native-config';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
    BackArrowIcon, CameraAddIcon, XIcon, WarningTriangleIcon, ChevronRightIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import { useImageUpload } from '../../hooks/useImageUpload';
import { deleteUpload } from '../../../data/api/upload';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import {
    ShopMatchingCategory,
    ShareLighting, ShareBedCount,
    SHARE_REGION_OPTIONS,
    SharePriceType, ShareStencil
} from '../../../domain/entities/shopTypes';
import { shopApi, ShopCategory } from '../../../data/api';
import { useTranslation } from '../../store/languageStore';
import {
    regionLabel, lightingLabel, bedLabel, expertCareerLabel,
    expertWorkKindLabel, writeStyleLabel, specialtyLabel,
    overseasCountryLabel,
    // 🚨 여기서 누락되었던 헬퍼 함수들을 완벽하게 임포트합니다!
    priceTypeLabel, stencilLabel, photoZoneLabel, stencilOptions
} from '../../utils/shopDisplayMap';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteP = RouteProp<RootStackParamList, 'ShopWrite'>;

/* ── 카테고리 탭 ── */
const CATEGORIES: ShopMatchingCategory[] = [
    '부스 쉐어',
    '타투 모델 구인 (비기너)',
    '사진/영상 편집자',
];

/* ── 공통 옵션 ── */
const STYLE_OPTS = ['블랙워크', '라인워크', '올드스쿨', '뉴스쿨', '이레즈미', '수채화', '미니타투', '커버업'];
const OVERSEAS_COUNTRY_OPTS = ['일본', '미국', '프랑스', '독일', '영국', '태국', '싱가포르', '홍콩', '대만', '호주', '캐나다', '이탈리아', '기타'];
const OVERSEAS_CURRENCY_OPTS = ['USD', 'JPY', 'EUR', 'GBP', 'THB', 'SGD', 'HKD', 'TWD', 'AUD', 'KRW'];
const DOMESTIC_REGION_OPTS = SHARE_REGION_OPTIONS.filter((r) => r !== '전체');

/* ── 칩 선택 컴포넌트 ── */
const ChipSelect = React.memo(({
                                   options, selected, onToggle, renderLabel,
                               }: {
    options: string[];
    selected: string[];
    onToggle: (v: string) => void;
    multi?: boolean;
    renderLabel?: (v: string) => string;
}) => (
    <View style={s.chipRow}>
        {options.map(opt => {
            const active = selected.includes(opt);
            return (
                <TouchableOpacity
                    key={opt}
                    onPress={() => onToggle(opt)}
                    activeOpacity={0.75}
                    style={[s.chip, active && s.chipActive]}
                >
                    <Text style={[s.chipText, active && s.chipTextActive]}>{renderLabel ? renderLabel(opt) : opt}</Text>
                </TouchableOpacity>
            );
        })}
    </View>
));

/* ── 섹션 레이블 ── */
const SectionLabel = ({ label, required }: { label: string; required?: boolean }) => (
    <View style={s.sectionLabelRow}>
        <Text style={s.sectionLabel}>{label}</Text>
        {required && <Text style={s.required}>*</Text>}
    </View>
);

/* ─────────────────────────────────────────────────────
 * 부스 쉐어 폼
 * ───────────────────────────────────────────────────── */
interface BoothForm {
    title: string;
    titleEn: string;
    region: string;
    priceType: SharePriceType;
    price: string;
    stencilType: ShareStencil | '';
    hasPhotoZone: boolean;
    bedCount: ShareBedCount | '';
    lighting: ShareLighting | '';
    maxOccupancy: string;
    description: string;
    descriptionEn: string;
    contact: string;
}

const EMPTY_BOOTH: BoothForm = {
    title: '', titleEn: '', region: '',
    priceType: 'daily', price: '',
    stencilType: '', hasPhotoZone: false,
    bedCount: '', lighting: '', maxOccupancy: '',
    description: '', descriptionEn: '', contact: '',
};

const BoothShareForm = ({ form, setForm, writeLang }: {
    form: BoothForm;
    setForm: React.Dispatch<React.SetStateAction<BoothForm>>;
    writeLang: 'ko' | 'en';
}) => {
    const { t } = useTranslation();
    const toggle = useCallback((field: keyof BoothForm) => (v: string) => {
        setForm(p => ({ ...p, [field]: p[field] === v ? '' : v }));
    }, [setForm]);

    return (
        <>
            {writeLang === 'ko' ? (
                <>
                    <SectionLabel label={t('shop.writeForm.titleLabel' as any)} required />
                    <TextInput
                        style={s.input}
                        placeholder={t('shop.writeForm.titlePlaceholder' as any)}
                        placeholderTextColor={COLORS.gray2}
                        value={form.title}
                        onChangeText={v => setForm(p => ({ ...p, title: v }))}
                        maxLength={40}
                    />
                </>
            ) : (
                <>
                    <SectionLabel label="Title (English)" />
                    <TextInput
                        style={s.input}
                        placeholder="e.g. Gangnam Tattoo Studio – Booth Share"
                        placeholderTextColor={COLORS.gray2}
                        value={form.titleEn}
                        onChangeText={v => setForm(p => ({ ...p, titleEn: v }))}
                        maxLength={40}
                        autoCapitalize="sentences"
                    />
                </>
            )}

            <SectionLabel label={t('shop.writeForm.regionLabel' as any)} required />
            <ChipSelect
                options={DOMESTIC_REGION_OPTS}
                selected={form.region ? [form.region] : []}
                onToggle={toggle('region')}
                renderLabel={v => regionLabel(t as any, v as any)}
            />

            <SectionLabel label={t('shop.writeForm.priceLabel' as any) || '이용 금액'} required />
            <View style={s.priceTypeWrap}>
                <TouchableOpacity
                    onPress={() => setForm(p => ({ ...p, priceType: 'daily' }))}
                    style={[s.priceTypeBtn, form.priceType === 'daily' && s.priceTypeBtnActive]}
                >
                    <Text style={[s.priceTypeText, form.priceType === 'daily' && s.priceTypeTextActive]}>
                        {priceTypeLabel(t as any, 'daily')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setForm(p => ({ ...p, priceType: 'monthly' }))}
                    style={[s.priceTypeBtn, form.priceType === 'monthly' && s.priceTypeBtnActive]}
                >
                    <Text style={[s.priceTypeText, form.priceType === 'monthly' && s.priceTypeTextActive]}>
                        {priceTypeLabel(t as any, 'monthly')}
                    </Text>
                </TouchableOpacity>
            </View>
            <TextInput
                style={s.input}
                placeholder={form.priceType === 'daily' ? (t('shop.writeForm.priceDailyPlaceholder' as any) || "1일 이용 금액을 입력해주세요") : (t('shop.writeForm.priceMonthlyPlaceholder' as any) || "월 부스 비용을 입력해주세요")}
                placeholderTextColor={COLORS.gray2}
                value={form.price}
                onChangeText={v => setForm(p => ({ ...p, price: v.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
            />

            <SectionLabel label={t('shop.writeForm.bedCountLabel' as any)} required />
            <ChipSelect
                options={['1대', '2대', '3대', '4대 이상']}
                selected={form.bedCount ? [form.bedCount] : []}
                onToggle={toggle('bedCount')}
                renderLabel={v => bedLabel(t as any, v as any)}
            />

            <SectionLabel label={t('shop.writeForm.stencilLabel' as any) || '스텐실 기기'} />
            <ChipSelect
                options={stencilOptions(t as any)}
                selected={form.stencilType ? [form.stencilType] : []}
                onToggle={toggle('stencilType')}
                renderLabel={v => stencilLabel(t as any, v)}
            />

            <SectionLabel label={t('shop.writeForm.photoZoneLabel' as any) || '촬영존'} />
            <ChipSelect
                options={['촬영존 구비']}
                selected={form.hasPhotoZone ? ['촬영존 구비'] : []}
                onToggle={() => setForm(p => ({ ...p, hasPhotoZone: !p.hasPhotoZone }))}
                renderLabel={v => photoZoneLabel(t as any, v as any)}
            />

            <SectionLabel label={t('shop.writeForm.lightingLabel' as any)} />
            <ChipSelect
                options={['LED (백색광)', '자연광', '조도 조절 (디밍)', '촬영용 조명 구비']}
                selected={form.lighting ? [form.lighting] : []}
                onToggle={toggle('lighting')}
                renderLabel={v => lightingLabel(t as any, v as any)}
            />

            <SectionLabel label={t('shop.writeForm.maxOccupancyLabel' as any)} />
            <TextInput
                style={s.input}
                placeholder={t('shop.writeForm.maxOccupancyPlaceholder' as any)}
                placeholderTextColor={COLORS.gray2}
                value={form.maxOccupancy}
                onChangeText={v => setForm(p => ({ ...p, maxOccupancy: v.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
            />

            {writeLang === 'ko' ? (
                <>
                    <SectionLabel label={t('shop.writeForm.spaceIntroLabel' as any)} required />
                    <TextInput
                        style={[s.input, s.textarea]}
                        placeholder="공간 소개 및 지원물품(물티슈, 잉크, 장갑 등), 이용 규칙을 자세하게 적어주세요."
                        placeholderTextColor={COLORS.gray2}
                        value={form.description}
                        onChangeText={v => setForm(p => ({ ...p, description: v }))}
                        multiline
                        maxLength={500}
                    />
                </>
            ) : (
                <>
                    <SectionLabel label="Description (English)" />
                    <TextInput
                        style={[s.input, s.textarea]}
                        placeholder="Space features, provided supplies (wipes, ink, gloves, etc.), and rules."
                        placeholderTextColor={COLORS.gray2}
                        value={form.descriptionEn}
                        onChangeText={v => setForm(p => ({ ...p, descriptionEn: v }))}
                        multiline
                        maxLength={500}
                        autoCapitalize="sentences"
                    />
                </>
            )}

            <SectionLabel label={t('shop.writeForm.contactLabel' as any)} required />
            <TextInput
                style={s.input}
                placeholder={t('shop.writeForm.contactPlaceholder' as any)}
                placeholderTextColor={COLORS.gray2}
                value={form.contact}
                onChangeText={v => setForm(p => ({ ...p, contact: v }))}
            />
        </>
    );
};

/* ─────────────────────────────────────────────────────
 * 해외 부스 쉐어 폼
 * ───────────────────────────────────────────────────── */
interface OverseasBoothForm {
    title: string;
    titleEn: string;
    country: string;
    city: string;
    priceType: SharePriceType;
    price: string;
    currency: string;
    stencilType: ShareStencil | '';
    hasPhotoZone: boolean;
    bedCount: ShareBedCount | '';
    lighting: ShareLighting | '';
    description: string;
    descriptionEn: string;
    contact: string;
}

const EMPTY_OVERSEAS_BOOTH: OverseasBoothForm = {
    title: '', titleEn: '', country: '', city: '',
    priceType: 'daily', price: '', currency: 'USD',
    stencilType: '', hasPhotoZone: false,
    bedCount: '', lighting: '', description: '', descriptionEn: '', contact: '',
};

const OverseasBoothShareForm = ({ form, setForm, writeLang }: {
    form: OverseasBoothForm;
    setForm: React.Dispatch<React.SetStateAction<OverseasBoothForm>>;
    writeLang: 'ko' | 'en';
}) => {
    const { t } = useTranslation();
    const cityRef = useRef<GooglePlacesAutocompleteRef>(null);
    const toggle = useCallback((field: keyof OverseasBoothForm) => (v: string) => {
        setForm(p => ({ ...p, [field]: p[field] === v ? '' : v }));
    }, [setForm]);

    return (
        <>
            {writeLang === 'ko' ? (
                <>
                    <SectionLabel label={t('shop.writeForm.titleKoLabel' as any)} required />
                    <TextInput
                        style={s.input}
                        placeholder={t('shop.writeForm.titleKoPlaceholder' as any)}
                        placeholderTextColor={COLORS.gray2}
                        value={form.title}
                        onChangeText={v => setForm(p => ({ ...p, title: v }))}
                        maxLength={60}
                    />
                </>
            ) : (
                <>
                    <SectionLabel label="Title (English)" />
                    <TextInput
                        style={s.input}
                        placeholder="e.g. Tokyo Shinjuku Booth Share – 1 Bed Available"
                        placeholderTextColor={COLORS.gray2}
                        value={form.titleEn}
                        onChangeText={v => setForm(p => ({ ...p, titleEn: v }))}
                        maxLength={60}
                        autoCapitalize="sentences"
                    />
                </>
            )}

            <SectionLabel label={t('shop.writeForm.countryLabel' as any)} required />
            <ChipSelect
                options={OVERSEAS_COUNTRY_OPTS}
                selected={form.country ? [form.country] : []}
                onToggle={toggle('country')}
                renderLabel={v => overseasCountryLabel(t as any, v as any)}
            />

            <SectionLabel label={t('shop.writeForm.cityLabel' as any)} required />
            <View style={s.placesWrap}>
                <GooglePlacesAutocomplete
                    ref={cityRef}
                    placeholder={t('shop.writeForm.cityPlaceholder' as any)}
                    query={{
                        key: Config.GOOGLE_PLACES_API_KEY ?? '',
                        language: 'en',
                        types: '(cities)',
                    }}
                    fetchDetails={false}
                    onPress={(data) => {
                        setForm(p => ({ ...p, city: data.description }));
                    }}
                    textInputProps={{
                        placeholderTextColor: COLORS.gray2,
                        onChangeText: v => setForm(p => ({ ...p, city: v })),
                    }}
                    enablePoweredByContainer={false}
                    styles={{
                        container: { flex: 1 },
                        textInputContainer: { backgroundColor: 'transparent' },
                        textInput: s.placesInput,
                        listView: s.placesList,
                        row: s.placesRow,
                        description: s.placesDescription,
                        separator: { height: 1, backgroundColor: COLORS.border },
                    }}
                />
            </View>

            <SectionLabel label={t('shop.writeForm.overseasPriceLabel' as any)} required />
            <View style={s.priceTypeWrap}>
                <TouchableOpacity
                    onPress={() => setForm(p => ({ ...p, priceType: 'daily' }))}
                    style={[s.priceTypeBtn, form.priceType === 'daily' && s.priceTypeBtnActive]}
                >
                    <Text style={[s.priceTypeText, form.priceType === 'daily' && s.priceTypeTextActive]}>
                        {priceTypeLabel(t as any, 'daily')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setForm(p => ({ ...p, priceType: 'monthly' }))}
                    style={[s.priceTypeBtn, form.priceType === 'monthly' && s.priceTypeBtnActive]}
                >
                    <Text style={[s.priceTypeText, form.priceType === 'monthly' && s.priceTypeTextActive]}>
                        {priceTypeLabel(t as any, 'monthly')}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={s.row}>
                <TextInput
                    style={[s.input, s.flex1]}
                    placeholder={form.priceType === 'daily' ? (t('shop.writeForm.priceDailyPlaceholder' as any) || "1일 비용") : (t('shop.writeForm.priceMonthlyPlaceholder' as any) || "월 부스 비용")}
                    placeholderTextColor={COLORS.gray2}
                    value={form.price}
                    onChangeText={v => setForm(p => ({ ...p, price: v.replace(/[^0-9]/g, '') }))}
                    keyboardType="numeric"
                />
                <View style={s.currencyWrap}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <ChipSelect
                            options={OVERSEAS_CURRENCY_OPTS}
                            selected={[form.currency]}
                            onToggle={v => setForm(p => ({ ...p, currency: v }))}
                        />
                    </ScrollView>
                </View>
            </View>

            <SectionLabel label={t('shop.writeForm.bedCountLabel' as any)} required />
            <ChipSelect
                options={['1대', '2대', '3대', '4대 이상']}
                selected={form.bedCount ? [form.bedCount] : []}
                onToggle={toggle('bedCount')}
                renderLabel={v => bedLabel(t as any, v as any)}
            />

            <SectionLabel label={t('shop.writeForm.stencilLabel' as any) || '스텐실 기기'} />
            <ChipSelect
                options={stencilOptions(t as any)}
                selected={form.stencilType ? [form.stencilType] : []}
                onToggle={toggle('stencilType')}
                renderLabel={v => stencilLabel(t as any, v)}
            />

            <SectionLabel label={t('shop.writeForm.photoZoneLabel' as any) || '촬영존'} />
            <ChipSelect
                options={['촬영존 구비']}
                selected={form.hasPhotoZone ? ['촬영존 구비'] : []}
                onToggle={() => setForm(p => ({ ...p, hasPhotoZone: !p.hasPhotoZone }))}
                renderLabel={v => photoZoneLabel(t as any, v as any)}
            />

            <SectionLabel label={t('shop.writeForm.lightingLabel' as any)} />
            <ChipSelect
                options={['LED (백색광)', '자연광', '조도 조절 (디밍)', '촬영용 조명 구비']}
                selected={form.lighting ? [form.lighting] : []}
                onToggle={toggle('lighting')}
                renderLabel={v => lightingLabel(t as any, v as any)}
            />

            {writeLang === 'ko' ? (
                <>
                    <SectionLabel label={t('shop.writeForm.introKoLabel' as any)} required />
                    <TextInput
                        style={[s.input, s.textarea]}
                        placeholder="공간 소개 및 지원물품(물티슈, 잉크, 장갑 등), 이용 규칙을 자세하게 적어주세요."
                        placeholderTextColor={COLORS.gray2}
                        value={form.description}
                        onChangeText={v => setForm(p => ({ ...p, description: v }))}
                        multiline
                        maxLength={600}
                    />
                </>
            ) : (
                <>
                    <SectionLabel label="Description (English)" />
                    <TextInput
                        style={[s.input, s.textarea]}
                        placeholder="Space features, provided supplies (wipes, ink, gloves, etc.), and rules."
                        placeholderTextColor={COLORS.gray2}
                        value={form.descriptionEn}
                        onChangeText={v => setForm(p => ({ ...p, descriptionEn: v }))}
                        multiline
                        maxLength={600}
                        autoCapitalize="sentences"
                    />
                </>
            )}

            <SectionLabel label={t('shop.writeForm.overseasContactLabel' as any)} required />
            <TextInput
                style={s.input}
                placeholder="Instagram @username / Email / WhatsApp"
                placeholderTextColor={COLORS.gray2}
                value={form.contact}
                onChangeText={v => setForm(p => ({ ...p, contact: v }))}
                autoCapitalize="none"
            />
        </>
    );
};

/* ─────────────────────────────────────────────────────
 * 타투 모델 구인 폼 / 사진영상 편집자 폼 (이전과 동일)
 * ───────────────────────────────────────────────────── */
interface ModelForm {
    title: string; titleEn: string; region: string; styles: string[];
    materialFee: string; workPeriod: string; description: string; descriptionEn: string; contact: string;
}

const EMPTY_MODEL: ModelForm = {
    title: '', titleEn: '', region: '', styles: [], materialFee: '', workPeriod: '',
    description: '', descriptionEn: '', contact: '',
};

const ModelRecruitForm = ({ form, setForm, writeLang }: {
    form: ModelForm; setForm: React.Dispatch<React.SetStateAction<ModelForm>>; writeLang: 'ko' | 'en';
}) => {
    const { t } = useTranslation();
    const toggleRegion = useCallback((v: string) => { setForm(p => ({ ...p, region: p.region === v ? '' : v })); }, [setForm]);
    const toggleStyle = useCallback((v: string) => {
        setForm(p => ({ ...p, styles: p.styles.includes(v) ? p.styles.filter(s => s !== v) : [...p.styles, v] }));
    }, [setForm]);

    return (
        <>
            <SectionLabel label={t('shop.writeForm.postTitleLabel' as any)} required />
            <TextInput
                style={s.input}
                placeholder={writeLang === 'ko' ? t('shop.writeForm.postTitlePlaceholder' as any) : "e.g. Looking for a mini tattoo model"}
                placeholderTextColor={COLORS.gray2}
                value={writeLang === 'ko' ? form.title : form.titleEn}
                onChangeText={v => writeLang === 'ko' ? setForm(p => ({ ...p, title: v })) : setForm(p => ({ ...p, titleEn: v }))}
                maxLength={40}
            />

            <SectionLabel label={t('shop.writeForm.regionLabel' as any)} required />
            <ChipSelect options={DOMESTIC_REGION_OPTS} selected={form.region ? [form.region] : []} onToggle={toggleRegion} renderLabel={v => regionLabel(t as any, v as any)} />

            <SectionLabel label={t('shop.writeForm.workStyleLabel' as any)} required />
            <ChipSelect options={STYLE_OPTS} selected={form.styles} onToggle={toggleStyle} multi renderLabel={v => writeStyleLabel(t as any, v as any)} />

            <SectionLabel label={t('shop.writeForm.materialFeeLabel' as any)} />
            <TextInput style={s.input} placeholder={t('shop.writeForm.materialFeePlaceholder' as any)} placeholderTextColor={COLORS.gray2} value={form.materialFee} onChangeText={v => setForm(p => ({ ...p, materialFee: v.replace(/[^0-9]/g, '') }))} keyboardType="numeric" />

            <SectionLabel label={t('shop.writeForm.workPeriodLabel' as any)} required />
            <TextInput style={s.input} placeholder={t('shop.writeForm.workPeriodPlaceholder' as any)} placeholderTextColor={COLORS.gray2} value={form.workPeriod} onChangeText={v => setForm(p => ({ ...p, workPeriod: v }))} maxLength={50} />

            <SectionLabel label={writeLang === 'ko' ? t('shop.writeForm.detailsLabel' as any) : "Description (English)"} required />
            <TextInput
                style={[s.input, s.textarea]}
                placeholder={writeLang === 'ko' ? t('shop.writeForm.detailsPlaceholder' as any) : "Body part, size, requirements, etc."}
                placeholderTextColor={COLORS.gray2}
                value={writeLang === 'ko' ? form.description : form.descriptionEn}
                onChangeText={v => writeLang === 'ko' ? setForm(p => ({ ...p, description: v })) : setForm(p => ({ ...p, descriptionEn: v }))}
                multiline maxLength={500}
            />

            <SectionLabel label={t('shop.writeForm.contactFieldLabel' as any)} required />
            <TextInput style={s.input} placeholder={t('shop.writeForm.contactFieldPlaceholder' as any)} placeholderTextColor={COLORS.gray2} value={form.contact} onChangeText={v => setForm(p => ({ ...p, contact: v }))} />
        </>
    );
};

interface MediaForm {
    specialty: '사진' | '영상' | ''; nickname: string; region: string; experience: string;
    workKinds: string[]; priceMin: string; priceMax: string; description: string; descriptionEn: string; instagramUrl: string; contact: string;
}

const EMPTY_MEDIA: MediaForm = {
    specialty: '', nickname: '', region: '', experience: '', workKinds: [], priceMin: '', priceMax: '', description: '', descriptionEn: '', instagramUrl: '', contact: '',
};

const EXPERIENCE_OPTS = ['1년 미만', '1~3년', '3~5년', '5년 이상'];

const MediaExpertForm = ({ form, setForm, writeLang }: {
    form: MediaForm; setForm: React.Dispatch<React.SetStateAction<MediaForm>>; writeLang: 'ko' | 'en';
}) => {
    const { t } = useTranslation();
    const toggleRegion = useCallback((v: string) => { setForm(p => ({ ...p, region: p.region === v ? '' : v })); }, [setForm]);
    const toggleExp = useCallback((v: string) => { setForm(p => ({ ...p, experience: p.experience === v ? '' : v })); }, [setForm]);
    const toggleWork = useCallback((v: string) => {
        setForm(p => ({ ...p, workKinds: p.workKinds.includes(v) ? p.workKinds.filter(w => w !== v) : [...p.workKinds, v] }));
    }, [setForm]);

    return (
        <>
            <SectionLabel label={t('shop.writeForm.specialtyLabel' as any)} required />
            <ChipSelect options={['사진', '영상']} selected={form.specialty ? [form.specialty] : []} onToggle={v => setForm(p => ({ ...p, specialty: p.specialty === v ? '' : v as any }))} renderLabel={v => specialtyLabel(t as any, v as any)} />

            <SectionLabel label={t('shop.writeForm.nicknameLabel' as any)} required />
            <TextInput style={s.input} placeholder={t('shop.writeForm.nicknamePlaceholder' as any)} placeholderTextColor={COLORS.gray2} value={form.nickname} onChangeText={v => setForm(p => ({ ...p, nickname: v }))} maxLength={30} />

            <SectionLabel label={t('shop.writeForm.activeRegionLabel' as any)} required />
            <ChipSelect options={DOMESTIC_REGION_OPTS} selected={form.region ? [form.region] : []} onToggle={toggleRegion} renderLabel={v => regionLabel(t as any, v as any)} />

            <SectionLabel label={t('shop.writeForm.careerLabel' as any)} required />
            <ChipSelect options={EXPERIENCE_OPTS} selected={form.experience ? [form.experience] : []} onToggle={toggleExp} renderLabel={v => expertCareerLabel(t as any, v as any)} />

            <SectionLabel label={t('shop.writeForm.workKindsLabel' as any)} required />
            <ChipSelect options={['사진 촬영', '사진 보정', '영상 촬영', '영상 편집']} selected={form.workKinds} onToggle={toggleWork} multi renderLabel={v => expertWorkKindLabel(t as any, v as any)} />

            <SectionLabel label={t('shop.writeForm.priceRangeLabel' as any)} />
            <View style={s.row}>
                <TextInput style={[s.input, s.flex1]} placeholder={t('shop.writeForm.priceMinPlaceholder' as any)} placeholderTextColor={COLORS.gray2} value={form.priceMin} onChangeText={v => setForm(p => ({ ...p, priceMin: v.replace(/[^0-9]/g, '') }))} keyboardType="numeric" />
                <Text style={s.rangeSep}>~</Text>
                <TextInput style={[s.input, s.flex1]} placeholder={t('shop.writeForm.priceMaxPlaceholder' as any)} placeholderTextColor={COLORS.gray2} value={form.priceMax} onChangeText={v => setForm(p => ({ ...p, priceMax: v.replace(/[^0-9]/g, '') }))} keyboardType="numeric" />
            </View>

            <SectionLabel label={writeLang === 'ko' ? t('shop.writeForm.introStyleLabel' as any) : "Description (English)"} required />
            <TextInput
                style={[s.input, s.textarea]}
                placeholder={writeLang === 'ko' ? t('shop.writeForm.introStylePlaceholder' as any) : "Introduce your work style, equipment, and portfolio in English."}
                placeholderTextColor={COLORS.gray2}
                value={writeLang === 'ko' ? form.description : form.descriptionEn}
                onChangeText={v => writeLang === 'ko' ? setForm(p => ({ ...p, description: v })) : setForm(p => ({ ...p, descriptionEn: v }))}
                multiline maxLength={500}
            />

            <SectionLabel label={t('shop.writeForm.instagramLabel' as any)} />
            <TextInput style={s.input} placeholder="@username" placeholderTextColor={COLORS.gray2} value={form.instagramUrl} onChangeText={v => setForm(p => ({ ...p, instagramUrl: v }))} autoCapitalize="none" />

            <SectionLabel label={t('shop.writeForm.contactFieldLabel' as any)} required />
            <TextInput style={s.input} placeholder={t('shop.writeForm.contactFieldPlaceholder' as any)} placeholderTextColor={COLORS.gray2} value={form.contact} onChangeText={v => setForm(p => ({ ...p, contact: v }))} />
        </>
    );
};

/* ─────────────────────────────────────────────────────
 * 이미지 추가 섹션
 * ───────────────────────────────────────────────────── */
const ImageSection = ({ images, onAdd, onRemove, uploading }: {
    images: string[];
    onAdd: () => void;
    onRemove: (i: number) => void;
    uploading: boolean;
}) => {
    const { t } = useTranslation();
    return (
        <View>
            <SectionLabel label={t('shop.writeForm.imageAttach' as any)} />
            <Text style={s.imageHint}>{t('shop.writeForm.imageHint' as any)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.imageScroll}>
                <TouchableOpacity style={s.imageAdd} onPress={onAdd} activeOpacity={0.75} disabled={uploading}>
                    {uploading ? (
                        <ActivityIndicator color={COLORS.gold} />
                    ) : (
                        <>
                            <CameraAddIcon size={32} color={COLORS.gold} />
                            <Text style={s.imageAddCount}>{images.length}/10</Text>
                        </>
                    )}
                </TouchableOpacity>
                {images.map((uri, i) => (
                    <View key={uri} style={s.imageThumb}>
                        <Image source={{ uri }} style={s.imagePlaceholder} resizeMode="cover" />
                        <TouchableOpacity
                            style={s.imageRemoveBtn}
                            onPress={() => onRemove(i)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                            <XIcon size={10} color={COLORS.white} strokeWidth={2.5} />
                        </TouchableOpacity>
                        {i === 0 && (
                            <View style={s.imageBadge}>
                                <Text style={s.imageBadgeText}>{t('shop.writeForm.imageFeatured' as any)}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

/* ─────────────────────────────────────────────────────
 * 메인 화면
 * ───────────────────────────────────────────────────── */
const ShopWriteScreen = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<RouteP>();
    const insets = useSafeAreaInsets();
    const { toast } = useToast();
    const { t } = useTranslation();

    const postId = route.params?.postId;
    const isEdit = !!postId;

    const [category, setCategory] = useState<ShopMatchingCategory>(
        route.params?.initialCategory ?? '부스 쉐어',
    );
    const [boothKind, setBoothKind] = useState<'domestic' | 'overseas'>(
        route.params?.boothKind ?? 'domestic',
    );
    const [writeLang, setWriteLang] = useState<'ko' | 'en'>('ko');
    const [images, setImages] = useState<string[]>([]);
    const [boothForm, setBoothForm] = useState<BoothForm>(EMPTY_BOOTH);
    const [overseasBoothForm, setOverseasBoothForm] = useState<OverseasBoothForm>(EMPTY_OVERSEAS_BOOTH);
    const [modelForm, setModelForm] = useState<ModelForm>(EMPTY_MODEL);
    const [mediaForm, setMediaForm] = useState<MediaForm>(EMPTY_MEDIA);
    const [submitting, setSubmitting] = useState(false);
    const [detailLoading, setDetailLoading] = useState(isEdit);

    useEffect(() => {
        if (!postId) return;
        setDetailLoading(true);
        shopApi.detail(postId).then((post) => {
            const a = post.attributes as Record<string, unknown>;
            setImages(post.images ?? []);
            if (post.category === 'booth_share') {
                setCategory('부스 쉐어');
                setBoothKind('domestic');
                setBoothForm({
                    title: post.title ?? '',
                    titleEn: post.titleEn ?? '',
                    region: post.region ?? '',
                    priceType: (a.priceType as SharePriceType) ?? 'daily',
                    price: post.priceKrw != null ? String(post.priceKrw) : '',
                    stencilType: (a.stencilType as ShareStencil) ?? '',
                    hasPhotoZone: !!a.hasPhotoZone,
                    bedCount: (a.bedCount as BoothForm['bedCount']) ?? '',
                    lighting: (a.lighting as BoothForm['lighting']) ?? '',
                    maxOccupancy: a.maxOccupancy != null ? String(a.maxOccupancy) : '',
                    description: post.description ?? '',
                    descriptionEn: post.descriptionEn ?? '',
                    contact: post.contact ?? '',
                });
            } else if (post.category === 'booth_share_overseas') {
                setCategory('부스 쉐어');
                setBoothKind('overseas');
                setOverseasBoothForm({
                    title: post.title ?? '',
                    titleEn: post.titleEn ?? '',
                    country: (a.country as string) ?? '',
                    city: (a.city as string) ?? '',
                    priceType: (a.priceType as SharePriceType) ?? 'daily',
                    price: a.pricePerDay != null ? String(a.pricePerDay) : '',
                    currency: (a.currency as string) ?? 'USD',
                    stencilType: (a.stencilType as ShareStencil) ?? '',
                    hasPhotoZone: !!a.hasPhotoZone,
                    bedCount: (a.bedCount as OverseasBoothForm['bedCount']) ?? '',
                    lighting: (a.lighting as OverseasBoothForm['lighting']) ?? '',
                    description: post.description ?? '',
                    descriptionEn: post.descriptionEn ?? '',
                    contact: post.contact ?? '',
                });
            } else if (post.category === 'model_recruit') {
                setCategory('타투 모델 구인 (비기너)');
                setModelForm({
                    title: post.title ?? '',
                    titleEn: post.titleEn ?? '',
                    region: post.region ?? '',
                    styles: Array.isArray(a.styles) ? (a.styles as string[]) : [],
                    materialFee: a.materialFee != null ? String(a.materialFee) : '',
                    workPeriod: (a.workPeriod as string) ?? '',
                    description: post.description ?? '',
                    descriptionEn: post.descriptionEn ?? '',
                    contact: post.contact ?? '',
                });
            } else if (post.category === 'media_expert') {
                setCategory('사진/영상 편집자');
                setMediaForm({
                    specialty: (a.specialty as MediaForm['specialty']) ?? '',
                    nickname: (a.nickname as string) ?? '',
                    region: post.region ?? '',
                    experience: (a.experience as string) ?? '',
                    workKinds: Array.isArray(a.workKinds) ? (a.workKinds as string[]) : [],
                    priceMin: a.priceMin != null ? String(a.priceMin) : '',
                    priceMax: a.priceMax != null ? String(a.priceMax) : '',
                    description: post.description ?? '',
                    descriptionEn: post.descriptionEn ?? '',
                    instagramUrl: (a.instagramUrl as string) ?? '',
                    contact: post.contact ?? '',
                });
            }
        }).catch(() => {
            toast(t('shop.writeForm.loadFailed' as any), { variant: 'error' });
        }).finally(() => setDetailLoading(false));
    }, [postId, toast, t]);

    const { pickAndUpload, uploading } = useImageUpload({
        scope: 'shop',
        max: 10,
        current: images.length,
        onError: (m) => toast(m, { variant: 'error' }),
    });

    const handleAddImage = useCallback(async () => {
        const urls = await pickAndUpload();
        if (urls.length) setImages(p => [...p, ...urls]);
    }, [pickAndUpload]);

    const handleRemoveImage = useCallback((i: number) => {
        setImages(p => {
            deleteUpload(p[i]);
            return p.filter((_, idx) => idx !== i);
        });
    }, []);

    const isValid = useCallback((): boolean => {
        if (category === '부스 쉐어') {
            if (boothKind === 'overseas') {
                return !!(overseasBoothForm.title.trim() && overseasBoothForm.country && overseasBoothForm.city.trim() && overseasBoothForm.price && overseasBoothForm.currency && overseasBoothForm.bedCount && overseasBoothForm.description.trim() && overseasBoothForm.contact.trim());
            }
            return !!(boothForm.title.trim() && boothForm.region && boothForm.price && boothForm.bedCount && boothForm.description.trim() && boothForm.contact.trim());
        }
        if (category === '타투 모델 구인 (비기너)') {
            return !!(modelForm.title.trim() && modelForm.region && modelForm.styles.length > 0 && modelForm.workPeriod.trim() && modelForm.description.trim() && modelForm.contact.trim());
        }
        return !!(mediaForm.specialty && mediaForm.nickname.trim() && mediaForm.region && mediaForm.experience && mediaForm.workKinds.length > 0 && mediaForm.description.trim() && mediaForm.contact.trim());
    }, [category, boothKind, boothForm, overseasBoothForm, modelForm, mediaForm]);

    const buildBody = useCallback(() => {
        if (category === '부스 쉐어') {
            if (boothKind === 'overseas') {
                const f = overseasBoothForm;
                return {
                    category: 'booth_share_overseas' as ShopCategory,
                    title: f.title.trim(),
                    titleEn: f.titleEn.trim() || f.title.trim(),
                    description: f.description.trim(),
                    descriptionEn: f.descriptionEn.trim() || f.description.trim(),
                    region: `${f.city.trim()}, ${f.country}`,
                    images,
                    contact: f.contact.trim() || null,
                    priceKrw: null,
                    attributes: {
                        country: f.country,
                        city: f.city.trim(),
                        priceType: f.priceType,
                        pricePerDay: f.price ? Number(f.price) : null,
                        currency: f.currency,
                        stencilType: f.stencilType || null,
                        hasPhotoZone: f.hasPhotoZone,
                        bedCount: f.bedCount,
                        lighting: f.lighting || null,
                    },
                };
            }
            return {
                category: 'booth_share' as ShopCategory,
                title: boothForm.title.trim(),
                titleEn: boothForm.titleEn.trim() || null,
                description: boothForm.description.trim(),
                descriptionEn: boothForm.descriptionEn.trim() || null,
                region: boothForm.region || null,
                images,
                contact: boothForm.contact.trim() || null,
                priceKrw: boothForm.price ? Number(boothForm.price) : null,
                attributes: {
                    priceType: boothForm.priceType,
                    stencilType: boothForm.stencilType || null,
                    hasPhotoZone: boothForm.hasPhotoZone,
                    bedCount: boothForm.bedCount,
                    lighting: boothForm.lighting || null,
                    maxOccupancy: boothForm.maxOccupancy ? Number(boothForm.maxOccupancy) : null,
                },
            };
        }
        if (category === '타투 모델 구인 (비기너)') {
            return {
                category: 'model_recruit' as ShopCategory,
                title: modelForm.title.trim(),
                titleEn: modelForm.titleEn.trim() || null,
                description: modelForm.description.trim(),
                descriptionEn: modelForm.descriptionEn.trim() || null,
                region: modelForm.region || null,
                images,
                contact: modelForm.contact.trim() || null,
                priceKrw: modelForm.materialFee ? Number(modelForm.materialFee) : null,
                attributes: {
                    styles: modelForm.styles,
                    workPeriod: modelForm.workPeriod.trim(),
                },
            };
        }
        return {
            category: 'media_expert' as ShopCategory,
            title: `[${mediaForm.specialty}] ${mediaForm.nickname.trim()}`,
            description: mediaForm.description.trim(),
            descriptionEn: mediaForm.descriptionEn.trim() || null,
            region: mediaForm.region || null,
            images,
            contact: mediaForm.contact.trim() || null,
            priceKrw: mediaForm.priceMin ? Number(mediaForm.priceMin) : null,
            attributes: {
                specialty: mediaForm.specialty,
                nickname: mediaForm.nickname.trim(),
                experience: mediaForm.experience,
                workKinds: mediaForm.workKinds,
                priceMin: mediaForm.priceMin ? Number(mediaForm.priceMin) : null,
                priceMax: mediaForm.priceMax ? Number(mediaForm.priceMax) : null,
                instagramUrl: mediaForm.instagramUrl.trim() || null,
            },
        };
    }, [category, boothKind, boothForm, overseasBoothForm, modelForm, mediaForm, images]);

    const handleSubmit = useCallback(async () => {
        if (!isValid()) {
            toast(t('shop.writeRequired' as any), { variant: 'error' });
            return;
        }
        if (submitting) return;
        setSubmitting(true);
        try {
            if (isEdit && postId) {
                await shopApi.update(postId, buildBody());
            } else {
                await shopApi.create(buildBody());
            }
            toast(isEdit ? t('shop.updateSuccess' as any) : t('shop.writeSuccess' as any), { variant: 'success' });
            navigation.goBack();
        } catch {
            toast(isEdit ? t('shop.updateFailed' as any) : t('shop.writeFailed' as any), { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    }, [isValid, submitting, isEdit, postId, buildBody, toast, navigation, t]);

    const handleCategoryChange = useCallback((cat: ShopMatchingCategory) => {
        setCategory(cat);
    }, []);

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

            {/* 헤더 */}
            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>{isEdit ? t('shop.editHeader' as any) : t('shop.writeHeader' as any)}</Text>
                <TouchableOpacity
                    onPress={handleSubmit}
                    style={[s.submitBtn, isValid() && s.submitBtnActive]}
                    activeOpacity={0.8}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color={COLORS.black} />
                    ) : (
                        <Text style={[s.submitText, isValid() && s.submitTextActive]}>{isEdit ? t('shop.editSubmit' as any) : t('shop.writeSubmit' as any)}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* 카테고리 탭 */}
            <View style={s.tabBar}>
                {CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => handleCategoryChange(cat)}
                        style={[s.tab, category === cat && s.tabActive]}
                        activeOpacity={0.75}
                    >
                        <Text style={[s.tabText, category === cat && s.tabTextActive]} numberOfLines={1}>
                            {cat === '부스 쉐어' ? t('shop.tab.booth' as any) :
                                cat === '타투 모델 구인 (비기너)' ? t('shop.tab.model' as any) : t('shop.tab.media' as any)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 부스 쉐어 국내/해외 토글 */}
            {category === '부스 쉐어' && (
                <View style={s.boothToggleWrap}>
                    <View style={s.boothToggle}>
                        <View style={[s.boothToggleThumb, boothKind === 'overseas' && s.boothToggleThumbRight]} />
                        <TouchableOpacity
                            onPress={() => setBoothKind('domestic')}
                            activeOpacity={0.8}
                            style={s.boothToggleSegment}
                        >
                            <Text style={[s.boothToggleText, boothKind === 'domestic' && s.boothToggleTextActive]}>
                                {t('shop.writeForm.domesticBooth' as any)}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setBoothKind('overseas')}
                            activeOpacity={0.8}
                            style={s.boothToggleSegment}
                        >
                            <Text style={[s.boothToggleText, boothKind === 'overseas' && s.boothToggleTextActive]}>
                                {t('shop.writeForm.overseasBooth' as any)}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* 언어 선택 토글 */}
            <View style={s.langToggleWrap}>
                <View style={s.langToggle}>
                    <View style={[s.langToggleThumb, writeLang === 'en' && s.langToggleThumbRight]} />
                    <TouchableOpacity onPress={() => setWriteLang('ko')} activeOpacity={0.8} style={s.langToggleSegment}>
                        <Text style={[s.langToggleText, writeLang === 'ko' && s.langToggleTextActive]}>한국어</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setWriteLang('en')} activeOpacity={0.8} style={s.langToggleSegment}>
                        <Text style={[s.langToggleText, writeLang === 'en' && s.langToggleTextActive]}>English</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {detailLoading ? (
                <View style={s.loadingWrap}>
                    <ActivityIndicator size="large" color={COLORS.gold} />
                </View>
            ) : null}

            <KeyboardAvoidingView
                style={s.flex1}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 8}
            >
                <ScrollView
                    style={s.scroll}
                    contentContainerStyle={[s.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 60 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* 이미지 섹션 */}
                    <ImageSection images={images} onAdd={handleAddImage} onRemove={handleRemoveImage} uploading={uploading} />

                    <View style={s.divider} />

                    {/* 카테고리별 폼 */}
                    {category === '부스 쉐어' && boothKind === 'overseas' && (
                        <OverseasBoothShareForm form={overseasBoothForm} setForm={setOverseasBoothForm} writeLang={writeLang} />
                    )}
                    {category === '부스 쉐어' && boothKind === 'domestic' && (
                        <BoothShareForm form={boothForm} setForm={setBoothForm} writeLang={writeLang} />
                    )}
                    {category === '타투 모델 구인 (비기너)' && (
                        <ModelRecruitForm form={modelForm} setForm={setModelForm} writeLang={writeLang} />
                    )}
                    {category === '사진/영상 편집자' && (
                        <MediaExpertForm form={mediaForm} setForm={setMediaForm} writeLang={writeLang} />
                    )}

                    {/* 운영 정책 안내 */}
                    <TouchableOpacity
                        style={s.policyBanner}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('SafetyPolicy')}
                    >
                        <WarningTriangleIcon size={16} color={COLORS.gold} />
                        <View style={s.policyTextWrap}>
                            <Text style={s.policyTitle}>{t('shop.writePolicyTitle' as any)}</Text>
                            <Text style={s.policyDesc}>{t('shop.writePolicyDesc' as any)}</Text>
                            <View style={s.policyLinkRow}>
                                <Text style={s.policyLink}>{t('shop.writePolicyLink' as any)}</Text>
                                <ChevronRightIcon size={13} color={COLORS.gold} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ShopWriteScreen;

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.black },
    flex1: { flex: 1 },
    loadingWrap: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    scroll: { flex: 1, backgroundColor: COLORS.bg },
    scrollContent: { padding: 20 },

    /* 가격 타입 토글 둥글고 예쁜 스타일 */
    priceTypeWrap: {
        flexDirection: 'row',
        marginBottom: 8,
        backgroundColor: COLORS.elevated,
        borderRadius: 8,
        padding: 4,
    },
    priceTypeBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    priceTypeBtnActive: {
        backgroundColor: COLORS.card,
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    priceTypeText: { fontSize: 13, color: COLORS.gray, fontWeight: '600' },
    priceTypeTextActive: { color: COLORS.gold, fontWeight: '700' },

    /* 정책 배너 */
    policyBanner: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 24,
        padding: 14,
        borderRadius: 12,
        backgroundColor: COLORS.goldDim,
        borderWidth: 1,
        borderColor: 'rgba(212,168,67,0.28)',
    },
    policyTextWrap: { flex: 1, gap: 5 },
    policyTitle: { fontSize: 13, fontWeight: '700', color: COLORS.gold, lineHeight: 18 },
    policyDesc: { fontSize: 12, color: COLORS.gray, lineHeight: 18 },
    policyLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
    policyLink: { fontSize: 12, fontWeight: '600', color: COLORS.gold, lineHeight: 16 },

    /* 헤더 */
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
    submitBtn: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: COLORS.elevated,
    },
    submitBtnActive: { backgroundColor: COLORS.gold },
    submitText: { fontSize: 14, fontWeight: '600', color: COLORS.gray },
    submitTextActive: { color: COLORS.black },

    /* 카테고리 탭 */
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.black,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: COLORS.gold },
    tabText: { fontSize: 13, color: COLORS.gray, fontWeight: '500' },
    tabTextActive: { color: COLORS.gold, fontWeight: '700' },

    /* 국내/해외 서브탭 */
    boothToggleWrap: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.bg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    boothToggle: {
        flexDirection: 'row',
        height: 44,
        backgroundColor: COLORS.card,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        position: 'relative',
    },
    boothToggleThumb: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        width: '50%',
        borderRadius: 18,
        backgroundColor: COLORS.gold,
    },
    boothToggleThumbRight: {
        left: '50%',
        transform: [{ translateX: -4 }],
    },
    boothToggleSegment: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boothToggleText: { fontSize: 13, color: COLORS.gray2, fontWeight: '500', lineHeight: 18 },
    boothToggleTextActive: { color: COLORS.black, fontWeight: '700' },

    /* 언어 선택 토글 */
    langToggleWrap: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: COLORS.bg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    langToggle: {
        flexDirection: 'row',
        height: 38,
        backgroundColor: COLORS.card,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        position: 'relative',
    },
    langToggleThumb: {
        position: 'absolute',
        top: 3,
        bottom: 3,
        left: 3,
        width: '50%',
        borderRadius: 16,
        backgroundColor: COLORS.gold,
    },
    langToggleThumbRight: {
        left: '50%',
        transform: [{ translateX: -3 }],
    },
    langToggleSegment: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    langToggleText: { fontSize: 13, color: COLORS.gray2, fontWeight: '500' as const, lineHeight: 18 },
    langToggleTextActive: { color: COLORS.black, fontWeight: '700' as const },

    /* 통화 선택 */
    currencyWrap: { flex: 1 },

    /* 섹션 레이블 */
    sectionLabelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 8 },
    sectionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.white },
    required: { fontSize: 14, color: COLORS.gold, marginLeft: 3 },

    /* 입력 필드 */
    input: {
        backgroundColor: COLORS.card,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        lineHeight: 20,
    },
    textarea: { minHeight: 110, textAlignVertical: 'top', lineHeight: 22 },

    /* 칩 */
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.chipBorder,
        backgroundColor: COLORS.card,
    },
    chipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
    chipText: { fontSize: 13, color: COLORS.gray, lineHeight: 18 },
    chipTextActive: { color: COLORS.gold, fontWeight: '600' },

    /* 이미지 */
    imageHint: { fontSize: 12, color: COLORS.gray2, marginBottom: 10, lineHeight: 16 },
    imageScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
    imageAdd: {
        width: 86,
        height: 86,
        borderRadius: 10,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: COLORS.gold,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        gap: 4,
    },
    imageAddCount: { fontSize: 11, color: COLORS.gray, lineHeight: 14 },
    imageThumb: { width: 86, height: 86, borderRadius: 10, marginRight: 8, position: 'relative' },
    imagePlaceholder: { width: 86, height: 86, borderRadius: 10, backgroundColor: COLORS.elevated },
    imageRemoveBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(0,0,0,0.65)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: COLORS.gold,
        borderRadius: 4,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    imageBadgeText: { fontSize: 10, color: COLORS.black, fontWeight: '700', lineHeight: 13 },

    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },

    /* 레이아웃 헬퍼 */
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rangeSep: { fontSize: 16, color: COLORS.gray, fontWeight: '500' },

    /* Places Autocomplete */
    placesWrap: {
        backgroundColor: COLORS.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        zIndex: 50,
    },
    placesInput: {
        backgroundColor: 'transparent',
        color: COLORS.white,
        fontSize: 14,
        lineHeight: 20,
        height: 44,
        margin: 0,
        paddingHorizontal: 14,
    },
    placesList: {
        position: 'absolute' as any,
        top: 46,
        left: 0,
        right: 0,
        backgroundColor: COLORS.elevated,
        borderRadius: 10,
        zIndex: 200,
        elevation: 10,
    },
    placesRow: {
        backgroundColor: COLORS.elevated,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    placesDescription: {
        color: COLORS.white,
        fontSize: 14,
        lineHeight: 20,
    },
});