import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetLog, type NetEntry } from '../../../infrastructure/debug/netLog';

const COLORS = {
  bg: '#0B0B0B', card: '#161616', border: '#282828', gold: '#D4A843',
  white: '#FFF', gray: '#8E8E8E', ok: '#45C173', err: '#E85555',
};

const time = (at: number) => {
  const d = new Date(at);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

const Row = ({ e }: { e: NetEntry }) => {
  const [open, setOpen] = useState(false);
  const color = e.ok ? COLORS.ok : COLORS.err;
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => setOpen((v) => !v)} style={s.row}>
      <View style={s.rowTop}>
        <Text style={[s.status, { color }]}>{e.status || 'ERR'}</Text>
        <Text style={s.method}>{e.method}</Text>
        <Text style={s.path} numberOfLines={1}>{e.path}</Text>
        <Text style={s.dur}>{e.durationMs}ms</Text>
      </View>
      <View style={s.rowMeta}>
        <Text style={s.metaText}>{time(e.at)}</Text>
        {!!e.errorCode && <Text style={[s.metaText, { color: COLORS.err }]}> · {e.errorCode}</Text>}
        {!!e.requestId && <Text style={s.metaText}> · {e.requestId.slice(0, 8)}</Text>}
      </View>
      {open && (
        <View style={s.detail}>
          {!!e.reqBody && <Text style={s.detailText}>▸ req: {e.reqBody}</Text>}
          {!!e.resBody && <Text style={[s.detailText, { color: e.ok ? COLORS.gray : COLORS.err }]}>▸ res: {e.resBody}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const NetDebugOverlay = () => {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const entries = useNetLog((st) => st.entries);
  const clear = useNetLog((st) => st.clear);
  const errCount = entries.filter((e) => !e.ok).length;

  return (
    <>
      <TouchableOpacity
        style={[s.fab, { bottom: insets.bottom + 84 }]}
        activeOpacity={0.85}
        onPress={() => setVisible(true)}
      >
        <Text style={s.fabText}>NET</Text>
        {errCount > 0 && (
          <View style={s.badge}><Text style={s.badgeText}>{errCount}</Text></View>
        )}
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setVisible(false)}>
        <Pressable style={s.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={[s.sheet, { paddingBottom: insets.bottom + 12, paddingTop: insets.top + 8 }]} onPress={() => {}}>
            <View style={s.header}>
              <Text style={s.title}>네트워크 로그 ({entries.length})</Text>
              <View style={s.headerBtns}>
                <TouchableOpacity onPress={clear} style={s.hBtn}><Text style={s.hBtnText}>지우기</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setVisible(false)} style={s.hBtn}><Text style={s.hBtnText}>닫기</Text></TouchableOpacity>
              </View>
            </View>
            <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
              {entries.length === 0 ? (
                <Text style={s.empty}>아직 요청이 없습니다. 화면을 이동해보세요.</Text>
              ) : (
                entries.map((e) => <Row key={e.id} e={e} />)
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default NetDebugOverlay;

const s = StyleSheet.create({
  fab: {
    position: 'absolute', right: 14, width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center', zIndex: 9999, elevation: 12,
  },
  fabText: { color: COLORS.gold, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  badge: {
    position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.err, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '80%', backgroundColor: COLORS.bg, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  headerBtns: { flexDirection: 'row', gap: 8 },
  hBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  hBtnText: { color: COLORS.gray, fontSize: 12, fontWeight: '600' },
  list: { paddingVertical: 8 },
  empty: { color: COLORS.gray, fontSize: 13, textAlign: 'center', paddingVertical: 40 },

  row: { paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  status: { fontSize: 12, fontWeight: '800', width: 34 },
  method: { color: COLORS.gold, fontSize: 11, fontWeight: '700', width: 46 },
  path: { color: COLORS.white, fontSize: 12, flex: 1 },
  dur: { color: COLORS.gray, fontSize: 11 },
  rowMeta: { flexDirection: 'row', marginTop: 3, marginLeft: 42 },
  metaText: { color: COLORS.gray, fontSize: 10.5 },
  detail: { marginTop: 6, marginLeft: 42, gap: 3 },
  detailText: { color: COLORS.gray, fontSize: 11, lineHeight: 15 },
});
