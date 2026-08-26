import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { BackArrowIcon, BellIcon } from '../../components/icons';
import { useTranslation } from '../../store/languageStore';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { notificationApi, type UserNotificationItem } from '../../../data/api';
import { usePagedApi } from '../../hooks/useApi';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const NotificationListScreen = () => {
  const navigation = useNavigation<Nav>();
  const { t, language } = useTranslation();
  const { items, loading, loadingMore, error, loadMore, reload } = usePagedApi(
    (cursor) => notificationApi.list({ cursor, limit: 20 }),
    [],
  );

  useFocusEffect(useCallback(() => { void reload(); }, [reload]));

  const openNotification = useCallback(async (item: UserNotificationItem) => {
    if (!item.readAt) await notificationApi.markRead(item.id);
    const { screen, productId, reservationId, shopPostId } = item.data;
    if (screen === 'ReservationManage') navigation.navigate('ReservationManage');
    else if (screen === 'TattooReview') navigation.navigate('TattooReview');
    else if (screen === 'TattooSupplyDetail' && productId) navigation.navigate('TattooSupplyDetail', { productId });
    else if (screen === 'TattooShareDetail' && shopPostId) {
      // 상세 객체가 필요한 기존 route는 안전한 ID 기반 전환 전까지 알림함에 머문다.
    }
    void reservationId;
    void reload();
  }, [navigation, reload]);

  const renderItem = useCallback(({ item }: { item: UserNotificationItem }) => (
    <TouchableOpacity style={[styles.item, !item.readAt && styles.itemUnread]} onPress={() => void openNotification(item)} activeOpacity={0.8}>
      <View style={[styles.unreadDot, item.readAt && styles.unreadDotHidden]} />
      <View style={styles.itemBody}>
        <Text style={styles.itemTitle}>{language === 'en' ? item.titleEn : item.titleKo}</Text>
        <Text style={styles.itemText}>{language === 'en' ? item.bodyEn : item.bodyKo}</Text>
        <Text style={styles.itemDate}>{new Date(item.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'ko-KR')}</Text>
      </View>
    </TouchableOpacity>
  ), [language, openNotification]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <BackArrowIcon size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('notification.listTitle')}</Text>
      </View>

      {loading && items.length === 0 ? <View style={styles.empty}><ActivityIndicator color={COLORS.gold} /></View> : error ? <View style={styles.empty}>
        <Text style={styles.emptyText}>{error}</Text>
        <TouchableOpacity onPress={() => void reload()}><Text style={styles.retryText}>{t('common.retry')}</Text></TouchableOpacity>
      </View> : items.length === 0 ? <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <BellIcon size={36} color={COLORS.gray} strokeWidth={1.4} />
        </View>
        <Text style={styles.emptyText}>{t('notification.listEmpty')}</Text>
      </View> : <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshing={loading}
        onRefresh={reload}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={COLORS.gold} /> : null}
      />}
    </SafeAreaView>
  );
};

export default NotificationListScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.black,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginLeft: 4,
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryText: { color: COLORS.gold, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  listContent: { padding: 16, gap: 10 },
  item: { flexDirection: 'row', gap: 10, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  itemUnread: { borderColor: COLORS.gold },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold, marginTop: 6 },
  unreadDotHidden: { opacity: 0 },
  itemBody: { flex: 1, gap: 5 },
  itemTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  itemText: { color: COLORS.gray, fontSize: 13, lineHeight: 19 },
  itemDate: { color: COLORS.gray2, fontSize: 11, lineHeight: 16, marginTop: 3 },
});
