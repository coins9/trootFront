import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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

type Nav = NativeStackNavigationProp<RootStackParamList>;

type PostStatus = '모집중' | '마감';

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

const FILTER_TABS: { key: 'all' | ShopMatchingCategory; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: '부스 쉐어', label: '부스 쉐어' },
  { key: '타투 모델 구인 (비기너)', label: '타투 모델' },
  { key: '사진/영상 편집자', label: '사진/영상' },
];

const MOCK_POSTS: MyShopPost[] = [
  {
    id: 'p1',
    category: '부스 쉐어',
    title: '강남 프리미엄 타투 부스 쉐어 (베드 2대)',
    region: '서울 · 강남/서초',
    status: '모집중',
    createdAt: '2026-08-05',
    likeCount: 24,
    commentCount: 8,
    viewCount: 312,
  },
  {
    id: 'p2',
    category: '타투 모델 구인 (비기너)',
    title: '미니타투 무료 모델 구합니다 (라인워크)',
    region: '서울 · 홍대/합정/망원',
    status: '모집중',
    createdAt: '2026-08-03',
    likeCount: 51,
    commentCount: 17,
    viewCount: 604,
  },
  {
    id: 'p3',
    category: '사진/영상 편집자',
    title: '타투 작업 영상 편집해드립니다',
    region: '경기/인천',
    status: '마감',
    createdAt: '2026-07-28',
    likeCount: 12,
    commentCount: 3,
    viewCount: 189,
  },
];

const StatusBadge = ({ status }: { status: PostStatus }) => (
  <View style={[s.statusBadge, status === '마감' && s.statusBadgeClosed]}>
    <Text style={[s.statusText, status === '마감' && s.statusTextClosed]}>{status}</Text>
  </View>
);

const PostCard = React.memo(({ post, onEdit, onToggleStatus, onDelete }: {
  post: MyShopPost;
  onEdit: (p: MyShopPost) => void;
  onToggleStatus: (p: MyShopPost) => void;
  onDelete: (p: MyShopPost) => void;
}) => (
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
          {post.status === '모집중' ? '마감하기' : '재모집'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={s.actionBtn}
        onPress={() => onEdit(post)}
        activeOpacity={0.75}
      >
        <EditPenIcon size={15} color={COLORS.gold} />
        <Text style={s.actionBtnText}>수정</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.actionBtn, s.actionBtnDanger]}
        onPress={() => onDelete(post)}
        activeOpacity={0.75}
      >
        <Text style={[s.actionBtnText, s.actionBtnTextDanger]}>삭제</Text>
      </TouchableOpacity>
    </View>
  </View>
));

const MyShopPostsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { toast } = useToast();

  const [posts, setPosts] = useState<MyShopPost[]>(MOCK_POSTS);
  const [filter, setFilter] = useState<'all' | ShopMatchingCategory>('all');
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  const filtered = useMemo(
    () => (filter === 'all' ? posts : posts.filter(p => p.category === filter)),
    [posts, filter],
  );

  const handleEdit = useCallback((post: MyShopPost) => {
    navigation.navigate('ShopWrite', { initialCategory: post.category });
  }, [navigation]);

  const handleToggleStatus = useCallback((post: MyShopPost) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? { ...p, status: p.status === '모집중' ? '마감' : '모집중' }
          : p,
      ),
    );
    toast(
      post.status === '모집중' ? '모집을 마감했습니다' : '다시 모집을 시작합니다',
      { variant: 'success' },
    );
  }, [toast]);

  const handleDelete = useCallback((post: MyShopPost) => {
    setConfirm({
      title: '글 삭제',
      message: '이 글을 삭제하시겠습니까?\n삭제한 글은 복구할 수 없습니다.',
      cancelLabel: '취소',
      confirmLabel: '삭제',
      variant: 'danger',
      onConfirm: () => {
        setPosts(prev => prev.filter(p => p.id !== post.id));
        setConfirm(null);
        toast('글이 삭제되었습니다', { variant: 'success' });
      },
    });
  }, [toast]);

  const renderItem = useCallback(({ item }: { item: MyShopPost }) => (
    <PostCard
      post={item}
      onEdit={handleEdit}
      onToggleStatus={handleToggleStatus}
      onDelete={handleDelete}
    />
  ), [handleEdit, handleToggleStatus, handleDelete]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>샵&매칭 글 관리</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.filterBar}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setFilter(tab.key)}
            style={[s.filterTab, filter === tab.key && s.filterTabActive]}
            activeOpacity={0.75}
          >
            <Text style={[s.filterTabText, filter === tab.key && s.filterTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <PenIcon size={40} color={COLORS.gray3} />
            <Text style={s.emptyTitle}>작성한 글이 없습니다</Text>
            <Text style={s.emptyDesc}>샵&매칭에서 첫 글을 작성해보세요</Text>
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => navigation.navigate('ShopWrite')}
              activeOpacity={0.85}
            >
              <PenIcon size={16} color={COLORS.black} />
              <Text style={s.emptyBtnText}>글쓰기</Text>
            </TouchableOpacity>
          </View>
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
