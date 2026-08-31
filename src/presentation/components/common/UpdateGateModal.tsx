import React, { useCallback } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, Linking,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { useTranslation } from '../../store/languageStore';
import { useVersionGate } from '../../hooks/useVersionGate';

/**
 * 앱 최상단에 마운트. 버전이 낮으면 업데이트 안내/강제 모달을 띄운다.
 * - force: 닫기 불가 (백드롭·백버튼으로 안 닫힘)
 * - optional: "나중에" 로 닫기 가능
 * 조회 실패 시엔 아무것도 렌더하지 않아 앱 사용을 막지 않는다.
 */
const UpdateGateModal = () => {
  const { t } = useTranslation();
  const { status, storeUrl, dismiss } = useVersionGate();

  const openStore = useCallback(() => {
    if (storeUrl) Linking.openURL(storeUrl).catch(() => {});
  }, [storeUrl]);

  if (status !== 'force' && status !== 'optional') return null;

  const isForce = status === 'force';

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      // 강제 업데이트는 백버튼으로도 닫히면 안 됨
      onRequestClose={isForce ? () => {} : dismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {isForce ? t('versionGate.forceTitle' as any) : t('versionGate.optionalTitle' as any)}
          </Text>
          <Text style={styles.message}>
            {isForce ? t('versionGate.forceMsg' as any) : t('versionGate.optionalMsg' as any)}
          </Text>

          <TouchableOpacity style={styles.updateBtn} activeOpacity={0.85} onPress={openStore}>
            <Text style={styles.updateText}>{t('versionGate.updateBtn' as any)}</Text>
          </TouchableOpacity>

          {!isForce && (
            <TouchableOpacity style={styles.laterBtn} activeOpacity={0.7} onPress={dismiss}>
              <Text style={styles.laterText}>{t('versionGate.later' as any)}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default UpdateGateModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: COLORS.sheet,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 25,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
  },
  updateBtn: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  updateText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  laterBtn: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  laterText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
});
