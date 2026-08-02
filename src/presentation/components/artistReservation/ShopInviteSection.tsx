import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Share, Alert,
  Platform,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import {
  UserPlusIcon, ShieldCheckIcon, RefreshIcon, CheckCircleIcon,
  ChevronRightIcon,
} from '../icons';
import { useToast } from '../common/Toast';

/** 6자리 대문자+숫자 코드 */
const genCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};

interface ShopMember {
  id: string;
  nickname: string;
  role: '오너' | '아티스트' | '초대 대기';
  joinedAt: string;
}

const MOCK_MEMBERS: ShopMember[] = [
  { id: 'm1', nickname: 'MINSOO',    role: '오너',      joinedAt: '2024.03.01' },
  { id: 'm2', nickname: 'RIN.INK',   role: '아티스트', joinedAt: '2024.03.14' },
  { id: 'm3', nickname: 'ZERO_ART',  role: '아티스트', joinedAt: '2024.04.02' },
  { id: 'm4', nickname: 'YURI',      role: '초대 대기', joinedAt: '2024.08.02' },
];

const EXPIRY_DAYS = 7;

interface Props {
  shopName?: string;
}

const ShopInviteSection = memo(({ shopName = 'T:ROOT Studio' }: Props) => {
  const { toast } = useToast();
  const [code, setCode] = useState<string>(() => genCode());
  const [input, setInput] = useState<string>('');
  const [joining, setJoining] = useState(false);

  const expiryLabel = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + EXPIRY_DAYS);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day} 만료`;
  }, []);

  const regenerate = useCallback(() => {
    Alert.alert(
      '초대코드 재발급',
      '기존 코드는 즉시 무효화되며 새 코드가 발급됩니다. 진행하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '재발급',
          style: 'destructive',
          onPress: () => {
            setCode(genCode());
            toast('새 초대코드가 발급되었습니다.', { variant: 'success' });
          },
        },
      ],
      { cancelable: true },
    );
  }, [toast]);

  const shareCode = useCallback(async () => {
    try {
      await Share.share({
        message: `[${shopName}] 아티스트 초대\n초대코드: ${code}\n${EXPIRY_DAYS}일간 유효합니다.`,
      });
    } catch {
      toast('공유를 완료하지 못했습니다.', { variant: 'error' });
    }
  }, [shopName, code, toast]);

  const copyCode = useCallback(() => {
    // 실제 환경에서는 @react-native-clipboard/clipboard 를 활용
    toast(`코드 ${code} 를 클립보드에 복사했습니다.`, { variant: 'success' });
  }, [code, toast]);

  const handleJoin = useCallback(() => {
    const val = input.trim().toUpperCase();
    if (val.length !== 6) {
      toast('초대코드는 6자리 대문자·숫자 조합입니다.', { variant: 'error' });
      return;
    }
    setJoining(true);
    setTimeout(() => {
      setJoining(false);
      toast(`${val} 코드로 샵 합류 요청이 전송되었습니다.`, { variant: 'success' });
      setInput('');
    }, 600);
  }, [input, toast]);

  return (
    <View style={{ gap: 16 }}>
      {/* ── 초대코드 발송 ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconWrap}>
            <UserPlusIcon size={18} color={COLORS.gold} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>초대코드 발송</Text>
            <Text style={styles.cardDesc}>
              샵에 합류시킬 아티스트에게 코드를 공유하세요.
            </Text>
          </View>
        </View>

        <View style={styles.codeBox}>
          <Text style={styles.codeText} selectable>{code}</Text>
          <Text style={styles.codeExpiry}>{expiryLabel}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={regenerate}
            activeOpacity={0.85}
            style={[styles.actionBtn, styles.actionGhost]}
          >
            <RefreshIcon size={14} color={COLORS.white} strokeWidth={1.8} />
            <Text style={styles.actionGhostText}>재발급</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={copyCode}
            activeOpacity={0.85}
            style={[styles.actionBtn, styles.actionGhost]}
          >
            <Text style={styles.actionGhostText}>복사</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={shareCode}
            activeOpacity={0.85}
            style={[styles.actionBtn, styles.actionPrimary]}
          >
            <Text style={styles.actionPrimaryText}>공유하기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hintRow}>
          <ShieldCheckIcon size={13} color={COLORS.gray} strokeWidth={1.7} />
          <Text style={styles.hintText}>
            코드는 {EXPIRY_DAYS}일간 유효하며, 사용 시 1회 소진됩니다.
          </Text>
        </View>
      </View>

      {/* ── 초대코드 입력 ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconWrap}>
            <CheckCircleIcon size={18} color={COLORS.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>초대코드 입력</Text>
            <Text style={styles.cardDesc}>
              전달받은 6자리 코드를 입력해 샵에 합류하세요.
            </Text>
          </View>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={(v) => setInput(v.toUpperCase().slice(0, 6))}
            placeholder="예: ABC123"
            placeholderTextColor={COLORS.gray2}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            style={styles.textInput}
          />
          <TouchableOpacity
            onPress={handleJoin}
            activeOpacity={0.85}
            style={[
              styles.joinBtn,
              input.trim().length !== 6 && styles.joinBtnDisabled,
            ]}
            disabled={joining || input.trim().length !== 6}
          >
            <Text style={styles.joinBtnText}>
              {joining ? '요청중…' : '합류'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 샵 멤버 ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>샵 멤버 ({MOCK_MEMBERS.length})</Text>
            <Text style={styles.cardDesc}>{shopName}</Text>
          </View>
        </View>

        <View style={styles.memberList}>
          {MOCK_MEMBERS.map((m, i) => (
            <View
              key={m.id}
              style={[styles.memberRow, i === MOCK_MEMBERS.length - 1 && styles.memberRowLast]}
            >
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{m.nickname.slice(0, 1)}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.memberName} numberOfLines={1}>{m.nickname}</Text>
                <Text style={styles.memberDate}>{m.joinedAt} 합류</Text>
              </View>
              <View style={[
                styles.rolePill,
                m.role === '오너' && styles.rolePillOwner,
                m.role === '초대 대기' && styles.rolePillPending,
              ]}>
                <Text style={[
                  styles.rolePillText,
                  m.role === '오너' && styles.rolePillOwnerText,
                  m.role === '초대 대기' && styles.rolePillPendingText,
                ]}>
                  {m.role}
                </Text>
              </View>
              <ChevronRightIcon size={14} color={COLORS.gray} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});
ShopInviteSection.displayName = 'ShopInviteSection';
export default ShopInviteSection;

const styles = StyleSheet.create({
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

  /* Code display */
  codeBox: {
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212,168,67,0.06)',
    paddingVertical: 22,
    alignItems: 'center',
    gap: 8,
  },
  codeText: {
    color: COLORS.gold,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: 6,
    fontVariant: ['tabular-nums'],
  },
  codeExpiry: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  actionGhost: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
  },
  actionGhostText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  actionPrimary: {
    flex: 1.4,
    backgroundColor: COLORS.gold,
  },
  actionPrimaryText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    flexShrink: 1,
  },

  /* Input */
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  textInput: {
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

  /* Members */
  memberList: {
    gap: 0,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  memberRowLast: {
    borderBottomWidth: 0,
  },
  memberAvatar: {
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  memberName: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  memberDate: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
  },
  rolePill: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
  },
  rolePillText: {
    color: COLORS.gray,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
  },
  rolePillOwner: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212,168,67,0.14)',
  },
  rolePillOwnerText: {
    color: COLORS.gold,
  },
  rolePillPending: {
    borderColor: COLORS.gray3,
    backgroundColor: COLORS.elevated,
  },
  rolePillPendingText: {
    color: COLORS.gray,
  },
});
