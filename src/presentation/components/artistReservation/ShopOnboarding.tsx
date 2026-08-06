import React, { memo, useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import {
  StoreIcon, LocationPinIcon, CheckCircleIcon, UserPlusIcon,
} from '../icons';
import { useToast } from '../common/Toast';

interface Props {
  onRegister: (shopName: string, location: string) => void;
  onJoinCode: (code: string) => void;
}

const ShopOnboarding = memo(({ onRegister, onJoinCode }: Props) => {
  const { toast } = useToast();
  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState<null | 'register' | 'join'>(null);

  const canRegister = shopName.trim().length >= 2 && location.trim().length >= 2;
  const canJoin = code.trim().length === 6;

  const handleRegister = useCallback(() => {
    if (!canRegister) {
      toast('샵 이름과 위치를 모두 입력해주세요.', { variant: 'error' });
      return;
    }
    setLoading('register');
    setTimeout(() => {
      setLoading(null);
      onRegister(shopName.trim(), location.trim());
    }, 500);
  }, [canRegister, shopName, location, onRegister, toast]);

  const handleJoin = useCallback(() => {
    if (!canJoin) {
      toast('초대코드는 6자리 대문자·숫자 조합입니다.', { variant: 'error' });
      return;
    }
    setLoading('join');
    setTimeout(() => {
      setLoading(null);
      onJoinCode(code.trim().toUpperCase());
    }, 500);
  }, [canJoin, code, onJoinCode, toast]);

  return (
    <View style={{ gap: 16 }}>
      {/* Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroIconWrap}>
          <StoreIcon size={30} color={COLORS.gold} strokeWidth={1.6} />
        </View>
        <Text style={styles.heroTitle}>샵을 등록하고{'\n'}팀 일정을 함께 관리하세요</Text>
        <Text style={styles.heroDesc}>
          오너로 샵을 새로 등록하거나,{'\n'}
          이미 등록된 샵의 초대코드로 합류할 수 있습니다.
        </Text>
      </View>

      {/* 신규 등록 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconWrap}>
            <StoreIcon size={18} color={COLORS.gold} strokeWidth={1.7} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>샵 등록하기</Text>
            <Text style={styles.cardDesc}>
              오너로 새로운 샵을 개설합니다.
            </Text>
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>샵 이름</Text>
          <View style={styles.inputRow}>
            <StoreIcon size={16} color={COLORS.gray} strokeWidth={1.7} />
            <TextInput
              value={shopName}
              onChangeText={setShopName}
              placeholder="예: T:ROOT Studio"
              placeholderTextColor={COLORS.gray2}
              style={styles.textInput}
              maxLength={30}
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>위치</Text>
          <View style={styles.inputRow}>
            <LocationPinIcon size={16} color={COLORS.gray} />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="예: 서울 · 성수"
              placeholderTextColor={COLORS.gray2}
              style={styles.textInput}
              maxLength={30}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          activeOpacity={0.85}
          disabled={loading === 'register'}
          style={[
            styles.primaryBtn,
            !canRegister && styles.primaryBtnDisabled,
          ]}
        >
          <CheckCircleIcon size={16} color={COLORS.black} />
          <Text style={styles.primaryBtnText}>
            {loading === 'register' ? '등록 중…' : '샵 등록 완료'}
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
            <Text style={styles.cardTitle}>초대코드로 합류</Text>
            <Text style={styles.cardDesc}>
              오너에게 전달받은 6자리 코드를 입력하세요.
            </Text>
          </View>
        </View>

        <View style={styles.joinRow}>
          <TextInput
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase().slice(0, 6))}
            placeholder="예: ABC123"
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
            style={[
              styles.joinBtn,
              !canJoin && styles.joinBtnDisabled,
            ]}
          >
            <Text style={styles.joinBtnText}>
              {loading === 'join' ? '요청중…' : '합류하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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

  fieldWrap: { gap: 6 },
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

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 14,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
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
  joinBtnDisabled: {
    opacity: 0.45,
  },
  joinBtnText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
});
