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
import { useTranslation } from '../../store/languageStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const formatSchedule = (iso: string, language: string) => {
  const d = new Date(iso);
  if (language === 'ko') {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
    const hh = d.getHours();
    const min = String(d.getMinutes()).padStart(2, '0');
    const ampm = hh < 12 ? '오전' : '오후';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${d.getFullYear()}.${mm}.${dd} (${dow}) ${ampm} ${h12}:${min}`;
  }
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
};

const ArtistReservationRequestsScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t, language } = useTranslation();

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
      setError(e instanceof ApiError ? e.userMessage : t('common.error'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const doConfirm = useCallback(async (r: ArtistReservationView) => {
    setBusyId(r.id);
    try {
      await reservationApi.confirmByArtist(r.id);
      setItems((prev) => prev.filter((it) => it.id !== r.id));
      toast(t('reservationRequests.confirmSuccess'), { variant: 'success' });
    } catch (e) {
      toast(e instanceof ApiError ? e.userMessage : t('reservationRequests.confirmFailed'), { variant: 'error' });
    } finally {
      setBusyId(null);
    }
  }, [toast, t]);

  const doReject = useCallback((r: ArtistReservationView) => {
    const name = r.customer?.nickname ?? t('reservationRequests.customerFallback');
    setConfirm({
      title: t('reservationRequests.rejectTitle'),
      message: t('reservationRequests.rejectMsg').replace('{{name}}', name),
      cancelLabel: t('common.cancel'),
      confirmLabel: t('reservationRequests.rejectLabel'),
      variant: 'danger',
      onConfirm: async () => {
        setConfirm(null);
        setBusyId(r.id);
        try {
          await reservationApi.rejectByArtist(r.id, 'artist_rejected');
          setItems((prev) => prev.filter((it) => it.id !== r.id));
          toast(t('reservationRequests.rejectSuccess'), { variant: 'error' });
        } catch (e) {
          toast(e instanceof ApiError ? e.userMessage : t('reservationRequests.actionFailed'), { variant: 'error' });
        } finally {
          setBusyId(null);
        }
      },
    });
  }, [toast, t]);

  const renderItem = useCallback(({ item }: { item: ArtistReservationView }) => (
    <View style={s.card}>
      <View style={s.cardHead}>
        <Text style={s.customer}>{item.customer?.nickname ?? t('reservationRequests.customerFallback')}</Text>
        <View style={s.pendingBadge}>
          <Text style={s.pendingText}>{t('reservationRequests.requestBadge')}</Text>
        </View>
      </View>
      <Text style={s.schedule}>{formatSchedule(item.scheduledAt, language)}</Text>
      <View style={s.metaRow}>
        {!!item.bodyPart && <Text style={s.metaChip}>{item.bodyPart}</Text>}
        {!!item.sizePreset && <Text style={s.metaChip}>{item.sizePreset}</Text>}
        {item.referenceImages.length > 0 && (
          <Text style={s.metaChip}>
            {t('reservationRequests.refCount').replace('{{count}}', String(item.referenceImages.length))}
          </Text>
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
          <Text style={s.rejectText}>{t('reservationRequests.rejectLabel')}</Text>
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
              <Text style={s.confirmText}>{t('reservationRequests.confirmBtn')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  ), [busyId, doConfirm, doReject, t, language]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('reservationRequests.title')}</Text>
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
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.state}>
              <Text style={s.emptyTitle}>{t('reservationRequests.emptyTitle')}</Text>
              <Text style={s.stateText}>{t('reservationRequests.emptySubtitle')}</Text>
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
  emptyTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  retry: { marginTop: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 9 },
  retryText: { color: COLORS.gold, fontSize: 13, fontWeight: '600', lineHeight: 18 },

  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    padding: 16, marginBottom: 12, gap: 10,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  customer: { color: COLORS.white, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  pendingBadge: { borderWidth: 1, borderColor: COLORS.gold, backgroundColor: COLORS.goldDim, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  pendingText: { color: COLORS.gold, fontSize: 11, fontWeight: '700', lineHeight: 15 },
  schedule: { color: COLORS.gold, fontSize: 13.5, fontWeight: '600', lineHeight: 19 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: {
    color: COLORS.gray, fontSize: 12, backgroundColor: COLORS.elevated,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, overflow: 'hidden',
    lineHeight: 17,
  },
  memo: { color: COLORS.gray, fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  rejectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 18,
  },
  rejectText: { color: COLORS.gray, fontSize: 14, fontWeight: '600', lineHeight: 19 },
  confirmBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.gold, borderRadius: 10, paddingVertical: 13,
  },
  confirmText: { color: COLORS.black, fontSize: 14, fontWeight: '700', lineHeight: 19 },
  btnBusy: { opacity: 0.6 },
});
