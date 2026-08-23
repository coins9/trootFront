import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Share, Alert,
  Platform, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import {
  UserPlusIcon, ShieldCheckIcon, RefreshIcon, CheckCircleIcon,
  ChevronRightIcon,
} from '../icons';
import { useToast } from '../common/Toast';
import { studioApi, type StudioMember } from '../../../data/api';
import { ApiError } from '../../../data/api/client';
import { useTranslation } from '../../store/languageStore';

const EXPIRY_DAYS = 7;

interface Props {
  studioId: string;
  shopName?: string;
  inviteCode: string;
  inviteCodeExpiresAt: string | null;
  onCodeRefreshed: (code: string, expiresAt: string) => void;
}

const ShopInviteSection = memo(({
  studioId, shopName = '', inviteCode, inviteCodeExpiresAt, onCodeRefreshed,
}: Props) => {
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [members, setMembers] = useState<StudioMember[]>([]);

  const roleLabel = (role: StudioMember['role']): string => {
    switch (role) {
      case 'owner':   return t('shopInvite.roleOwner');
      case 'artist':  return t('shopInvite.roleArtist');
      case 'pending': return t('shopInvite.rolePending');
    }
  };
  const [membersLoading, setMembersLoading] = useState(true);
  const [input, setInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    studioApi.members(studioId)
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false));
  }, [studioId]);

  const expiryLabel = useMemo(() => {
    const suffix = t('shopInvite.expirySuffix');
    if (inviteCodeExpiresAt) {
      const d = new Date(inviteCodeExpiresAt);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${suffix}`;
    }
    const d = new Date();
    d.setDate(d.getDate() + EXPIRY_DAYS);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${suffix}`;
  }, [inviteCodeExpiresAt, t]);

  const regenerate = useCallback(() => {
    Alert.alert(
      t('shopInvite.regenAlertTitle'),
      t('shopInvite.regenAlertMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('shopInvite.regenAlertConfirm'),
          style: 'destructive',
          onPress: async () => {
            setRefreshing(true);
            try {
              const res = await studioApi.refreshCode(studioId);
              onCodeRefreshed(res.inviteCode, res.inviteCodeExpiresAt);
              toast(t('shopInvite.toastRegenSuccess'), { variant: 'success' });
            } catch (e) {
              toast(e instanceof ApiError ? e.userMessage : t('shopInvite.toastRegenError'), { variant: 'error' });
            } finally {
              setRefreshing(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [studioId, onCodeRefreshed, toast, t]);

  const shareCode = useCallback(async () => {
    try {
      await Share.share({
        message: t('shopInvite.shareMsg')
          .replace('{{shopName}}', shopName)
          .replace('{{code}}', inviteCode)
          .replace('{{days}}', String(EXPIRY_DAYS)),
      });
    } catch {
      toast(t('shopInvite.toastShareFailed'), { variant: 'error' });
    }
  }, [shopName, inviteCode, toast, t]);

  const copyCode = useCallback(() => {
    toast(t('shopInvite.toastCopied').replace('{{code}}', inviteCode), { variant: 'success' });
  }, [inviteCode, toast, t]);

  const handleJoin = useCallback(async () => {
    const val = input.trim().toUpperCase();
    if (val.length !== 6) {
      toast(t('shopInvite.toastInvalidCode'), { variant: 'error' });
      return;
    }
    setJoining(true);
    try {
      await studioApi.join(val);
      toast(t('shopInvite.toastJoinSuccess').replace('{{code}}', val), { variant: 'success' });
      setInput('');
      // Refresh members
      const updated = await studioApi.members(studioId);
      setMembers(updated);
    } catch (e) {
      toast(e instanceof ApiError ? e.userMessage : t('shopInvite.toastJoinError'), { variant: 'error' });
    } finally {
      setJoining(false);
    }
  }, [input, studioId, toast, t]);

  return (
    <View style={{ gap: 16 }}>
      {/* ── 초대코드 발송 ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconWrap}>
            <UserPlusIcon size={18} color={COLORS.gold} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{t('shopInvite.sendCodeTitle')}</Text>
            <Text style={styles.cardDesc}>{t('shopInvite.sendCodeDesc')}</Text>
          </View>
        </View>

        <View style={styles.codeBox}>
          <Text style={styles.codeText} selectable>{inviteCode}</Text>
          <Text style={styles.codeExpiry}>{expiryLabel}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={regenerate}
            activeOpacity={0.85}
            disabled={refreshing}
            style={[styles.actionBtn, styles.actionGhost]}
          >
            {refreshing
              ? <ActivityIndicator size="small" color={COLORS.white} />
              : <RefreshIcon size={14} color={COLORS.white} strokeWidth={1.8} />
            }
            <Text style={styles.actionGhostText}>{t('shopInvite.regenBtn')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={copyCode}
            activeOpacity={0.85}
            style={[styles.actionBtn, styles.actionGhost]}
          >
            <Text style={styles.actionGhostText}>{t('shopInvite.copyBtn')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={shareCode}
            activeOpacity={0.85}
            style={[styles.actionBtn, styles.actionPrimary]}
          >
            <Text style={styles.actionPrimaryText}>{t('shopInvite.shareBtn')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hintRow}>
          <ShieldCheckIcon size={13} color={COLORS.gray} strokeWidth={1.7} />
          <Text style={styles.hintText}>
            {t('shopInvite.codeHint').replace('{{days}}', String(EXPIRY_DAYS))}
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
            <Text style={styles.cardTitle}>{t('shopInvite.enterCodeTitle')}</Text>
            <Text style={styles.cardDesc}>{t('shopInvite.enterCodeDesc')}</Text>
          </View>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={(v) => setInput(v.toUpperCase().slice(0, 6))}
            placeholder={t('shopInvite.codePlaceholder')}
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
              (input.trim().length !== 6 || joining) && styles.joinBtnDisabled,
            ]}
            disabled={joining || input.trim().length !== 6}
          >
            <Text style={styles.joinBtnText}>
              {joining ? t('shopInvite.joiningBtn') : t('shopInvite.joinBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 샵 멤버 ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {t('shopInvite.membersTitle')} ({membersLoading ? '…' : members.length})
            </Text>
            <Text style={styles.cardDesc}>{shopName}</Text>
          </View>
        </View>

        {membersLoading ? (
          <ActivityIndicator size="small" color={COLORS.gold} style={{ paddingVertical: 20 }} />
        ) : members.length === 0 ? (
          <Text style={styles.emptyText}>{t('shopInvite.membersEmpty')}</Text>
        ) : (
          <View style={styles.memberList}>
            {members.map((m, i) => {
              const rLabel = roleLabel(m.role);
              return (
                <View
                  key={m.id}
                  style={[styles.memberRow, i === members.length - 1 && styles.memberRowLast]}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {(m.nickname || '?').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {m.nickname || t('shopInvite.memberNoNickname')}
                    </Text>
                    <Text style={styles.memberDate}>
                      {new Date(m.joinedAt).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')} {t('shopInvite.memberJoinedSuffix')}
                    </Text>
                  </View>
                  <View style={[
                    styles.rolePill,
                    m.role === 'owner'   && styles.rolePillOwner,
                    m.role === 'pending' && styles.rolePillPending,
                  ]}>
                    <Text style={[
                      styles.rolePillText,
                      m.role === 'owner'   && styles.rolePillOwnerText,
                      m.role === 'pending' && styles.rolePillPendingText,
                    ]}>
                      {rLabel}
                    </Text>
                  </View>
                  <ChevronRightIcon size={14} color={COLORS.gray} />
                </View>
              );
            })}
          </View>
        )}
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
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: 12,
  },
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
  joinBtnDisabled: { opacity: 0.45 },
  joinBtnText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  memberList: { gap: 0 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  memberRowLast: { borderBottomWidth: 0 },
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
  rolePillOwnerText: { color: COLORS.gold },
  rolePillPending: {
    borderColor: COLORS.gray3,
    backgroundColor: COLORS.elevated,
  },
  rolePillPendingText: { color: COLORS.gray },
});
