import React, { memo, useCallback, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import Config from 'react-native-config';
import { COLORS } from '../../theme/colors';
import {
  StoreIcon, CheckCircleIcon, UserPlusIcon,
} from '../icons';
import { useToast } from '../common/Toast';
import { useTranslation } from '../../store/languageStore';

interface LocationMeta {
  address: string;
  lat?: number;
  lng?: number;
}

interface Props {
  onRegister: (shopName: string, address: string, lat?: number, lng?: number) => void;
  onJoinCode: (code: string) => void;
}

const ShopOnboarding = memo(({ onRegister, onJoinCode }: Props) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);
  const [shopName, setShopName] = useState('');
  const [locationMeta, setLocationMeta] = useState<LocationMeta | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState<null | 'register' | 'join'>(null);

  const canRegister = shopName.trim().length >= 2 && locationMeta !== null;
  const canJoin = code.trim().length === 6;

  const handleRegister = useCallback(() => {
    if (!canRegister || !locationMeta) {
      toast(t('shopOnboarding.toastFillRequired'), { variant: 'error' });
      return;
    }
    setLoading('register');
    setTimeout(() => {
      setLoading(null);
      onRegister(shopName.trim(), locationMeta.address, locationMeta.lat, locationMeta.lng);
    }, 300);
  }, [canRegister, shopName, locationMeta, onRegister, toast, t]);

  const handleJoin = useCallback(() => {
    if (!canJoin) {
      toast(t('shopOnboarding.toastInvalidCode'), { variant: 'error' });
      return;
    }
    setLoading('join');
    setTimeout(() => {
      setLoading(null);
      onJoinCode(code.trim().toUpperCase());
    }, 300);
  }, [canJoin, code, onJoinCode, toast, t]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ gap: 16 }}
    >
      {/* Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroIconWrap}>
          <StoreIcon size={30} color={COLORS.gold} strokeWidth={1.6} />
        </View>
        <Text style={styles.heroTitle}>{t('shopOnboarding.heroTitle')}</Text>
        <Text style={styles.heroDesc}>{t('shopOnboarding.heroDesc')}</Text>
      </View>

      {/* 신규 등록 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconWrap}>
            <StoreIcon size={18} color={COLORS.gold} strokeWidth={1.7} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{t('shopOnboarding.registerTitle')}</Text>
            <Text style={styles.cardDesc}>{t('shopOnboarding.registerDesc')}</Text>
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>{t('shopOnboarding.fieldShopName')}</Text>
          <View style={styles.inputRow}>
            <StoreIcon size={16} color={COLORS.gray} strokeWidth={1.7} />
            <TextInput
              value={shopName}
              onChangeText={setShopName}
              placeholder={t('shopOnboarding.fieldShopNamePlaceholder')}
              placeholderTextColor={COLORS.gray2}
              style={styles.textInput}
              maxLength={30}
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>{t('shopOnboarding.fieldLocation')}</Text>
          <View style={styles.placesWrap}>
            <GooglePlacesAutocomplete
              ref={placesRef}
              placeholder={t('shopOnboarding.locationPlaceholder')}
              query={{
                key: Config.GOOGLE_PLACES_API_KEY ?? '',
                language: 'ko',
              }}
              fetchDetails
              onPress={(data: any, details: any) => {
                const address: string =
                  details?.formatted_address ?? data.description;
                const lat: number | undefined = details?.geometry?.location?.lat;
                const lng: number | undefined = details?.geometry?.location?.lng;
                setLocationMeta({ address, lat, lng });
              }}
              enablePoweredByContainer={false}
              keepResultsAfterBlur
              styles={{
                container: { flex: 0 },
                textInputContainer: {
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  paddingHorizontal: 0,
                },
                textInput: {
                  color: COLORS.white,
                  fontSize: 14,
                  fontWeight: '500',
                  lineHeight: 19,
                  backgroundColor: COLORS.elevated,
                  borderWidth: 1,
                  borderColor: locationMeta ? COLORS.gold : COLORS.border,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: Platform.OS === 'ios' ? 12 : 8,
                  height: undefined,
                  margin: 0,
                },
                listView: {
                  backgroundColor: COLORS.card,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 10,
                  marginTop: 4,
                  zIndex: 999,
                },
                row: {
                  backgroundColor: COLORS.card,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                },
                description: {
                  color: COLORS.white,
                  fontSize: 13,
                  lineHeight: 18,
                },
                separator: {
                  height: 1,
                  backgroundColor: COLORS.border,
                },
              }}
            />
          </View>
          {locationMeta && (
            <Text style={styles.locationConfirmed}>
              {locationMeta.address}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          activeOpacity={0.85}
          disabled={loading === 'register'}
          style={[styles.primaryBtn, !canRegister && styles.primaryBtnDisabled]}
        >
          <CheckCircleIcon size={16} color={COLORS.black} />
          <Text style={styles.primaryBtnText}>
            {loading === 'register' ? t('shopOnboarding.registerLoading') : t('shopOnboarding.registerComplete')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 초대코드로 합류 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconWrap}>
            <UserPlusIcon size={18} color={COLORS.gold} strokeWidth={1.7} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{t('shopOnboarding.joinTitle')}</Text>
            <Text style={styles.cardDesc}>{t('shopOnboarding.joinDesc')}</Text>
          </View>
        </View>

        <View style={styles.joinRow}>
          <TextInput
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase().slice(0, 6))}
            placeholder={t('shopOnboarding.joinCodePlaceholder')}
            placeholderTextColor={COLORS.gray2}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            style={styles.joinInput}
          />
          <TouchableOpacity
            onPress={handleJoin}
            activeOpacity={0.85}
            disabled={loading === 'join'}
            style={[styles.joinBtn, !canJoin && styles.joinBtnDisabled]}
          >
            <Text style={styles.joinBtnText}>
              {loading === 'join' ? t('shopOnboarding.joinLoading') : t('shopOnboarding.joinBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
});
ShopOnboarding.displayName = 'ShopOnboarding';
export default ShopOnboarding;

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.35)',
    backgroundColor: 'rgba(212,168,67,0.06)',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  heroIconWrap: {
    width: 60, height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.5)',
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    textAlign: 'center',
  },
  heroDesc: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 16,
    gap: 14,
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerIconWrap: {
    width: 34, height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.4)',
    backgroundColor: COLORS.elevated,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  cardDesc: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  fieldWrap: { gap: 6, zIndex: 10 },
  fieldLabel: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
  },
  textInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
    padding: 0,
  },
  placesWrap: {
    zIndex: 100,
  },
  locationConfirmed: {
    color: COLORS.gold,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 14,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  joinRow: {
    flexDirection: 'row',
    gap: 8,
  },
  joinInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 3,
  },
  joinBtn: {
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnDisabled: { opacity: 0.45 },
  joinBtnText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
});
