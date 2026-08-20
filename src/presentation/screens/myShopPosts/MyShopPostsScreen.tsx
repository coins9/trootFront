import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import {
  BackArrowIcon, EditPenIcon, HeartIcon, CommentIcon, EyeIcon,
  RegionIcon, PenIcon,
} from '../../components/icons';
import { useToast } from '../../components/common/Toast';
import ConfirmModal, { ConfirmConfig } from '../../components/common/ConfirmModal';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { ShopMatchingCategory } from '../../../domain/entities/shopTypes';
import { usePagedApi } from '../../hooks/useApi';
import { shopApi, ShopPost, ShopCategory } from '../../../data/api';
import { useTranslation } from '../../store/languageStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'MyShopPosts'>;

type PostStatus = 'open' | 'closed';

interface MyShopPost {
  id: string;
  category: ShopMatchingCategory;
  title: string;
  region: string;
  status: PostStatus;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
}

const CATEGORY_LABEL: Record<ShopMatchingCategory, string> = {
  '부스 쉐어': '부스 쉐어',
  '타투 모델 구인 (비기너)': '타투 모델',
  '사진/영상 편집자': '사진/영상',
};

const API_TO_CATEGORY: Record<ShopCategory, ShopMatchingCategory> = {
  booth_share: '부스 쉐어',
  booth_share_overseas: '부스 쉐어',
  model_recruit: '타투 모델 구인 (비기너)',
  media_expert: '사진/영상 편집자',
};

const toMyPost = (p: ShopPost): MyShopPost => ({
  id: p.id,
  category: API_TO_CATEGORY[p.category] ?? '부스 쉐어',
  title: p.title,
  region: p.region ?? '',
  status: (p.status === 'open' ? 'open' : 'closed') as 'open' | 'closed',
  createdAt: p.createdAt.slice(0, 10),
  likeCount: p.likeCount,
  commentCount: p.applicationCount,
  viewCount: p.viewCount,
});

const StatusBadge = ({ status }: { status: PostStatus }) => {
  const { t } = useTranslation();
  return (
    <View style={[s.statusBadge, status === 'closed' && s.statusBadgeClosed]}>
      <Text style={[s.statusText, status === 'closed' && s.statusTextClosed]}>
        {status === 'open' ? t('myShopPosts.statusOpen') : t('myShopPosts.statusClosed')}
      </Text>
    </View>
  );
};

const PostCard = React.memo(({ post, onEdit, onToggleStatus, onDelete }: {
  post: MyShopPost;
  onEdit: (p: MyShopPost) => void;
  onToggleStatus: (p: MyShopPost) => void;
  onDelete: (p: MyShopPost) => void;
}) => {
  const { t } = useTranslation();
  return (
  <View style={s.card}>
    <View style={s.cardTop}>
      <View style={s.categoryTag}>
        <Text style={s.categoryTagText}>{CATEGORY_LABEL[post.category]}</Text>
      </View>
      <StatusBadge status={post.status} />
    </View>

    <Text style={s.cardTitle} numberOfLines={2}>{post.title}</Text>

    <View style={s.cardMeta}>
      <RegionIcon size={13} color={COLORS.gray} />
      <Text style={s.cardMetaText}>{post.region}</Text>
      <Text style={s.cardDot}>·</Text>
      <Text style={s.cardMetaText}>{post.createdAt}</Text>
    </View>

    <View style={s.statsRow}>
      <View style={s.statItem}>
        <HeartIcon size={14} color={COLORS.gray} />
        <Text style={s.statText}>{post.likeCount}</Text>
      </View>
      <View style={s.statItem}>
        <CommentIcon size={14} color={COLORS.gray} />
        <Text style={s.statText}>{post.commentCount}</Text>
      </View>
      <View style={s.statItem}>
        <EyeIcon size={14} color={COLORS.gray} />
        <Text style={s.statText}>{post.viewCount}</Text>
      </View>
    </View>

    <View style={s.actionRow}>
      <TouchableOpacity
        style={s.actionBtn}
        onPress={() => onToggleStatus(post)}
        activeOpacity={0.75}
      >
        <Text style={s.actionBtnText}>
          {post.status === 'open' ? t('myShopPosts.statusClosed') : t('myShopPosts.statusOpen')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={s.actionBtn}
        onPress={() => onEdit(post)}
        activeOpacity={0.75}
      >
        <EditPenIcon size={15} color={COLORS.gold} />
        <Text style={s.actionBtnText}>{t('common.edit')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.actionBtn, s.actionBtnDanger]}
        onPress={() => onDelete(post)}
        activeOpacity={0.75}
      >
        <Text style={[s.actionBtnText, s.actionBtnTextDanger]}>{t('common.delete')}</Text>
      </TouchableOpacity>
    </View>
  </View>
  );
});

const MyShopPostsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();

  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  const {
    items: rawItems,
    loading,
    loadingMore,
    loadMore,
    setItems,
    reload,
  } = usePagedApi((cursor) => shopApi.mine({ cursor }), []);

  // 화면 포커스 복귀 시 목록 재조회 (글 작성/수정 후 반영)
  const hasFocused = useRef(false);
  useFocusEffect(useCallback(() => {
    if (!hasFocused.current) { hasFocused.current = true; return; }
    reload();
  }, [reload]));

  const posts = useMemo(() => rawItems.map(toMyPost), [rawItems]);

  const handleEdit = useCallback((post: MyShopPost) => {
    navigation.navigate('ShopWrite', { initialCategory: post.category, postId: post.id });
  }, [navigation]);

  const handleToggleStatus = useCallback(async (post: MyShopPost) => {
    const nextStatus = post.status === 'open' ? 'closed' : 'open';
    setItems(prev =>
      prev.map(p => p.id === post.id ? { ...p, status: nextStatus as PostStatus } : p),
    );
    try {
      await shopApi.setStatus(post.id, nextStatus);
      toast(
        nextStatus === 'closed' ? t('myShopPosts.statusClosed') : t('myShopPosts.statusOpen'),
        { variant: 'success' },
      );
    } catch {
      setItems(prev =>
        prev.map(p => p.id === post.id ? { ...p, status: (nextStatus === 'closed' ? 'open' : 'closed') as PostStatus } : p),
      );
      toast(t('common.error'), { variant: 'error' });
    }
  }, [setItems, toast, t]);

  const handleDelete = useCallback((post: MyShopPost) => {
    setConfirm({
      title: t('myShopPosts.deleteTitle'),
      message: t('myShopPosts.deleteMsg'),
      cancelLabel: t('common.cancel'),
      confirmLabel: t('common.delete'),
      variant: 'danger',
      onConfirm: async () => {
        setConfirm(null);
        setItems(prev => prev.filter(p => p.id !== post.id));
        try {
          await shopApi.remove(post.id);
          toast(t('myShopPosts.deleteSuccess'), { variant: 'success' });
        } catch {
          toast(t('myShopPosts.deleteFailed'), { variant: 'error' });
        }
      },
    });
  }, [setItems, toast, t]);

  const renderItem = useCallback(({ item }: { item: MyShopPost }) => (
    <PostCard
      post={item}
      onEdit={handleEdit}
      onToggleStatus={handleToggleStatus}
      onDelete={handleDelete}
    />
  ), [handleEdit, handleToggleStatus, handleDelete]);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('myShopPosts.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[s.listContent, { paddingBottom: 16 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={COLORS.gold} style={{ marginVertical: 16 }} /> : null
        }
        ListEmptyComponent={
          loading ? (
            <View style={s.empty}>
              <ActivityIndicator color={COLORS.gold} size="large" />
            </View>
          ) : (
            <View style={s.empty}>
              <PenIcon size={40} color={COLORS.gray3} />
              <Text style={s.emptyTitle}>{t('myShopPosts.empty')}</Text>
              <Text style={s.emptyDesc}>{t('myShopPosts.writeFirst')}</Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => navigation.navigate('ShopWrite')}
                activeOpacity={0.85}
              >
                <PenIcon size={16} color={COLORS.black} />
                <Text style={s.emptyBtnText}>{t('shop.writeHeader')}</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      <ConfirmModal config={confirm} onDismiss={() => setConfirm(null)} />
    </SafeAreaView>
  );
};

export default MyShopPostsScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },

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

  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bg,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.card,
  },
  filterTabActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  filterTabText: { fontSize: 13, color: COLORS.gray, lineHeight: 18 },
  filterTabTextActive: { color: COLORS.gold, fontWeight: '600' },

  listContent: { padding: 16, paddingTop: 4, backgroundColor: COLORS.bg, flexGrow: 1 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  categoryTag: {
    backgroundColor: COLORS.elevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryTagText: { fontSize: 11, color: COLORS.gold, fontWeight: '600', lineHeight: 14 },

  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.goldDim,
  },
  statusBadgeClosed: { backgroundColor: 'rgba(136,136,136,0.15)' },
  statusText: { fontSize: 11, color: COLORS.gold, fontWeight: '700', lineHeight: 14 },
  statusTextClosed: { color: COLORS.gray },

  cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.white, lineHeight: 21, marginBottom: 8 },

  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  cardMetaText: { fontSize: 12, color: COLORS.gray, flexShrink: 1, lineHeight: 16 },
  cardDot: { fontSize: 12, color: COLORS.gray3, marginHorizontal: 2 },

  statsRow: { flexDirection: 'row', gap: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 13, color: COLORS.gray, lineHeight: 17 },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
  },
  actionBtnDanger: { borderColor: 'rgba(232,85,85,0.3)' },
  actionBtnText: { fontSize: 13, color: COLORS.gold, fontWeight: '600', lineHeight: 17 },
  actionBtnTextDanger: { color: COLORS.danger },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 16, color: COLORS.white, fontWeight: '600', marginTop: 8 },
  emptyDesc: { fontSize: 13, color: COLORS.gray, lineHeight: 18 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
  },
  emptyBtnText: { fontSize: 14, color: COLORS.black, fontWeight: '700', lineHeight: 18 },
});
