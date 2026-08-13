import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { BackArrowIcon, CheckCircleIcon, XIcon } from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import ConfirmModal, { ConfirmConfig } from '../../components/common/ConfirmModal';
import { ApiError } from '../../../data/api/client';
import { reservationApi, type ArtistReservationView } from '../../../data/api';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const formatSchedule = (iso: string) => {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  const hh = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = hh < 12 ? '오전' : '오후';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${d.getFullYear()}.${mm}.${dd} (${dow}) ${ampm} ${h12}:${min}`;
};

const ArtistReservationRequestsScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();

  const [items, setItems] = useState<ArtistReservationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reservationApi.forArtist({ status: 'requested', limit: 30 });
      setItems(res.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.userMessage : '예약 요청을 불러오지 못했습니다.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const doConfirm = useCallback(async (r: ArtistReservationView) => {
    setBusyId(r.id);
    try {
      await reservationApi.confirmByArtist(r.id);
      setItems((prev) => prev.filter((it) => it.id !== r.id));
      toast('예약을 확정했습니다. 예약관리에 등록됩니다.', { variant: 'success' });
    } catch (e) {
      toast(e instanceof ApiError ? e.userMessage : '확정에 실패했습니다.', { variant: 'error' });
    } finally {
      setBusyId(null);
    }
  }, [toast]);

  const doReject = useCallback((r: ArtistReservationView) => {
    setConfirm({
      title: '예약 요청 거절',
      message: `${r.customer?.nickname ?? '고객'}님의 예약 요청을 거절하시겠습니까?`,
      cancelLabel: '취소',
      confirmLabel: '거절',
      variant: 'danger',
      onConfirm: async () => {
        setConfirm(null);
        setBusyId(r.id);
        try {
          await reservationApi.rejectByArtist(r.id, '타투이스트 거절');
          setItems((prev) => prev.filter((it) => it.id !== r.id));
          toast('예약 요청을 거절했습니다.', { variant: 'error' });
        } catch (e) {
          toast(e instanceof ApiError ? e.userMessage : '처리에 실패했습니다.', { variant: 'error' });
        } finally {
          setBusyId(null);
        }
      },
    });
  }, [toast]);

  const renderItem = useCallback(({ item }: { item: ArtistReservationView }) => (
    <View style={s.card}>
      <View style={s.cardHead}>
        <Text style={s.customer}>{item.customer?.nickname ?? '고객'}</Text>
        <View style={s.pendingBadge}><Text style={s.pendingText}>요청</Text></View>
      </View>
      <Text style={s.schedule}>{formatSchedule(item.scheduledAt)}</Text>
      <View style={s.metaRow}>
        {!!item.bodyPart && <Text style={s.metaChip}>{item.bodyPart}</Text>}
        {!!item.sizePreset && <Text style={s.metaChip}>{item.sizePreset}</Text>}
        {item.referenceImages.length > 0 && (
          <Text style={s.metaChip}>레퍼런스 {item.referenceImages.length}장</Text>
        )}
      </View>
      {!!item.memo && <Text style={s.memo} numberOfLines={3}>{item.memo}</Text>}

      <View style={s.actions}>
        <TouchableOpacity
          style={[s.rejectBtn, busyId === item.id && s.btnBusy]}
          activeOpacity={0.8}
          disabled={busyId === item.id}
          onPress={() => doReject(item)}
        >
          <XIcon size={15} color={COLORS.gray} strokeWidth={2} />
          <Text style={s.rejectText}>거절</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.confirmBtn, busyId === item.id && s.btnBusy]}
          activeOpacity={0.85}
          disabled={busyId === item.id}
          onPress={() => doConfirm(item)}
        >
          {busyId === item.id ? (
            <ActivityIndicator size="small" color={COLORS.black} />
          ) : (
            <>
              <CheckCircleIcon size={16} color={COLORS.black} />
              <Text style={s.confirmText}>확정하기</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  ), [busyId, doConfirm, doReject]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>예약 요청함</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={s.state}><ActivityIndicator color={COLORS.gold} /></View>
      ) : error ? (
        <View style={s.state}>
          <Text style={s.stateText}>{error}</Text>
          <TouchableOpacity onPress={load} style={s.retry}><Text style={s.retryText}>다시 시도</Text></TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.state}>
              <Text style={s.emptyTitle}>대기 중인 예약 요청이 없습니다</Text>
              <Text style={s.stateText}>고객이 예약을 요청하면 여기에 표시됩니다.</Text>
            </View>
          }
        />
      )}

      <ConfirmModal config={confirm} onDismiss={() => setConfirm(null)} />
    </SafeAreaView>
  );
};

export default ArtistReservationRequestsScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.black,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white, letterSpacing: 0.3 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32, gap: 8 },
  stateText: { color: COLORS.gray, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  emptyTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  retry: { marginTop: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 9 },
  retryText: { color: COLORS.gold, fontSize: 13, fontWeight: '600' },

  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    padding: 16, marginBottom: 12, gap: 10,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  customer: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  pendingBadge: { borderWidth: 1, borderColor: COLORS.gold, backgroundColor: COLORS.goldDim, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  pendingText: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
  schedule: { color: COLORS.gold, fontSize: 13.5, fontWeight: '600' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: {
    color: COLORS.gray, fontSize: 12, backgroundColor: COLORS.elevated,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, overflow: 'hidden',
  },
  memo: { color: COLORS.gray, fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  rejectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 18,
  },
  rejectText: { color: COLORS.gray, fontSize: 14, fontWeight: '600' },
  confirmBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.gold, borderRadius: 10, paddingVertical: 13,
  },
  confirmText: { color: COLORS.black, fontSize: 14, fontWeight: '700' },
  btnBusy: { opacity: 0.6 },
});
