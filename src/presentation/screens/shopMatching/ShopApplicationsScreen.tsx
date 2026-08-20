import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { BackArrowIcon, CommentIcon } from '../../components/icons';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { shopApi, ShopPost, ShopCategory } from '../../../data/api';
import { ShopMatchingCategory } from '../../../domain/entities/shopTypes';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ShopApplications'>;

const CATEGORY_TO_API: Record<ShopMatchingCategory, ShopCategory[]> = {
  '부스 쉐어': ['booth_share', 'booth_share_overseas'],
  '타투 모델 구인 (비기너)': ['model_recruit'],
  '사진/영상 편집자': ['media_expert'],
};

const CATEGORY_LABEL: Record<ShopMatchingCategory, string> = {
  '부스 쉐어': '부스 쉐어',
  '타투 모델 구인 (비기너)': '타투 모델',
  '사진/영상 편집자': '사진/영상',
};

interface Applicant {
  id: string;
  name?: string;
  message?: string;
  appliedAt?: string;
  [key: string]: unknown;
}

const ShopApplicationsScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { category } = route.params;

  const [posts, setPosts] = useState<ShopPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState<Record<string, Applicant[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingApplicants, setLoadingApplicants] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const apiCategories = CATEGORY_TO_API[category];
    shopApi.mine().then((page) => {
      const filtered = page.items.filter((p) =>
        apiCategories.includes(p.category as ShopCategory),
      );
      setPosts(filtered);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [category]);

  const handleToggle = useCallback(async (postId: string) => {
    const next = !expanded[postId];
    setExpanded((prev) => ({ ...prev, [postId]: next }));
    if (next && !applicants[postId]) {
      setLoadingApplicants((prev) => ({ ...prev, [postId]: true }));
      try {
        const data = await shopApi.applications(postId) as Applicant[];
        setApplicants((prev) => ({ ...prev, [postId]: data }));
      } catch {
        setApplicants((prev) => ({ ...prev, [postId]: [] }));
      } finally {
        setLoadingApplicants((prev) => ({ ...prev, [postId]: false }));
      }
    }
  }, [expanded, applicants]);

  const renderApplicant = useCallback(({ item }: { item: Applicant }) => (
    <View style={s.applicantRow}>
      <Text style={s.applicantName}>{item.name ?? item.id}</Text>
      {!!item.message && (
        <Text style={s.applicantMsg} numberOfLines={2}>{item.message}</Text>
      )}
      {!!item.appliedAt && (
        <Text style={s.applicantDate}>{String(item.appliedAt).slice(0, 10)}</Text>
      )}
    </View>
  ), []);

  const renderPost = useCallback(({ item }: { item: ShopPost }) => {
    const isOpen = expanded[item.id];
    const list = applicants[item.id] ?? [];
    const isLoading = loadingApplicants[item.id];

    return (
      <View style={s.postCard}>
        <TouchableOpacity
          onPress={() => handleToggle(item.id)}
          activeOpacity={0.8}
          style={s.postHeader}
        >
          <View style={s.postInfo}>
            <Text style={s.postTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={s.postDate}>{item.createdAt?.slice(0, 10) ?? ''}</Text>
          </View>
          <View style={s.postMeta}>
            <CommentIcon size={14} color={COLORS.gold} />
            <Text style={s.postCount}>{item.applicationCount}</Text>
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={s.applicantsWrap}>
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.gold} style={{ padding: 16 }} />
            ) : list.length === 0 ? (
              <Text style={s.emptyText}>지원자가 없습니다.</Text>
            ) : (
              <FlatList
                data={list}
                keyExtractor={(a) => a.id}
                renderItem={renderApplicant}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </View>
    );
  }, [expanded, applicants, loadingApplicants, handleToggle, renderApplicant]);

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
        <Text style={s.headerTitle}>{CATEGORY_LABEL[category]} 지원 현황</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.gold} style={{ flex: 1 }} />
      ) : posts.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>등록한 게시물이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          renderItem={renderPost}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default ShopApplicationsScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

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

  list: { padding: 16, gap: 12 },

  postCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  postInfo: { flex: 1, gap: 4 },
  postTitle: { fontSize: 14, fontWeight: '600', color: COLORS.white, lineHeight: 20 },
  postDate: { fontSize: 12, color: COLORS.gray, lineHeight: 17 },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postCount: { fontSize: 14, fontWeight: '700', color: COLORS.gold, lineHeight: 20 },

  applicantsWrap: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  applicantRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 4,
  },
  applicantName: { fontSize: 14, fontWeight: '600', color: COLORS.white, lineHeight: 20 },
  applicantMsg: { fontSize: 13, color: COLORS.gray2, lineHeight: 18 },
  applicantDate: { fontSize: 11, color: COLORS.gray, lineHeight: 16 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: COLORS.gray, lineHeight: 20, padding: 16, textAlign: 'center' },
});
