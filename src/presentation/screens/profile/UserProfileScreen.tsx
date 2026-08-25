import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { useTranslation } from '../../store/languageStore';
import { BackArrowIcon, PersonSilhouette, WarningTriangleIcon } from '../../components/icons';
import CachedImage from '../../components/common/CachedImage';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { reportApi, userApi } from '../../../data/api';
import { useToast } from '../../components/common/Toast';

type RouteP = RouteProp<RootStackParamList, 'UserProfile'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface PublicProfile {
    id: string;
    nickname: string | null;
    profileImage: string | null;
}

const UserProfileScreen = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<RouteP>();
    const { userId, nickname: paramNickname, profileImage: paramImage } = route.params;

    const { t } = useTranslation();
    const { toast } = useToast();

    const [profile, setProfile] = useState<PublicProfile>({
        id: userId,
        nickname: paramNickname ?? null,
        profileImage: paramImage ?? null,
    });
    const [loading, setLoading] = useState(true);
    const [reporting, setReporting] = useState(false);

    useEffect(() => {
        userApi.publicProfile(userId)
            .then((data) => setProfile(data))
            .catch(() => {
                // 파라미터로 받은 기본값 유지 — API 실패해도 화면은 유지
            })
            .finally(() => setLoading(false));
    }, [userId]);

    const handleReport = () => {
        Alert.alert(
            t('report.title') as string || '신고하기',
            t('report.notice') as string || '이 사용자를 신고하시겠습니까? 허위 신고 시 불이익을 받을 수 있습니다.',
            [
                { text: t('common.cancel') as string || '취소', style: 'cancel' },
                {
                    text: t('report.submit') as string || '신고',
                    style: 'destructive',
                    onPress: async () => {
                        if (reporting) return;
                        setReporting(true);
                        try {
                            await reportApi.create({
                                targetType: 'user',
                                targetId: userId,
                                reason: 'etc',
                            });
                            toast(t('artistProfile.reported') as string || '신고가 접수되었습니다.', { variant: 'success' });
                        } catch {
                            toast(t('common.error') as string || '오류가 발생했습니다.', { variant: 'error' });
                        } finally {
                            setReporting(false);
                        }
                    },
                },
            ],
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.title') as string || '프로필'}</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color={COLORS.gold} />
                </View>
            ) : (
                <View style={styles.content}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatarWrap}>
                            {profile.profileImage ? (
                                <CachedImage uri={profile.profileImage} style={styles.avatar} resizeMode="cover" />
                            ) : (
                                <PersonSilhouette size={54} color="#3a3a3a" />
                            )}
                        </View>
                        <Text style={styles.nickname}>
                            {profile.nickname || t('artistProfile.anonymous') as string || '익명'}
                        </Text>
                        <Text style={styles.roleText}>{t('profile.modeUser') as string || '일반 회원'}</Text>
                    </View>

                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            activeOpacity={0.8}
                            onPress={handleReport}
                            disabled={reporting}
                        >
                            <WarningTriangleIcon size={18} color={COLORS.gray} />
                            <Text style={styles.actionText}>
                                {reporting
                                    ? (t('common.loading') as string || '처리 중...')
                                    : (t('report.title') as string || '해당 사용자 신고하기')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.white,
        letterSpacing: 0.3,
        lineHeight: 23,
    },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 32 },
    profileCard: {
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        paddingVertical: 32,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 24,
    },
    avatarWrap: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    avatar: { width: '100%', height: '100%' },
    nickname: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.white,
        lineHeight: 28,
        marginBottom: 4,
    },
    roleText: { fontSize: 13, color: COLORS.gold, fontWeight: '500', lineHeight: 18 },
    actionSection: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        gap: 12,
    },
    actionText: { fontSize: 15, fontWeight: '500', color: COLORS.gray, lineHeight: 21 },
});
