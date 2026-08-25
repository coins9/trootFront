import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { useTranslation } from '../../store/languageStore';
import { BackArrowIcon, PersonSilhouette, WarningTriangleIcon } from '../../components/icons';
import CachedImage from '../../components/common/CachedImage';
import { RootStackParamList } from '../../../infrastructure/navigation/RootNavigator';
import { reportApi } from '../../../data/api'; // 신고하기 API
import { useToast } from '../../components/common/Toast';

type RouteP = RouteProp<RootStackParamList, 'UserProfile'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const UserProfileScreen = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<RouteP>();
    const { userId, nickname, profileImage } = route.params;

    const { t } = useTranslation();
    const { toast } = useToast();
    const [reporting, setReporting] = useState(false);

    // 유저 신고 처리 로직
    const handleReport = () => {
        Alert.alert(
            t('report.title') || '신고하기',
            t('report.notice') || '이 사용자를 신고하시겠습니까? 허위 신고 시 불이익을 받을 수 있습니다.',
            [
                { text: t('common.cancel') || '취소', style: 'cancel' },
                {
                    text: t('report.submit') || '신고',
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
                            toast(t('artistProfile.reported') || '신고가 접수되었습니다.', { variant: 'success' });
                        } catch (error) {
                            toast(t('common.error') || '오류가 발생했습니다.', { variant: 'error' });
                        } finally {
                            setReporting(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <BackArrowIcon size={24} color={COLORS.white} strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.title') || '프로필'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {/* 프로필 이미지 & 기본 정보 */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarWrap}>
                        {profileImage ? (
                            <CachedImage uri={profileImage} style={styles.avatar} resizeMode="cover" />
                        ) : (
                            <PersonSilhouette size={54} color="#3a3a3a" />
                        )}
                    </View>
                    <Text style={styles.nickname}>{nickname || t('artistProfile.anonymous') || '익명'}</Text>
                    <Text style={styles.roleText}>{t('profile.modeUser') || '일반 회원'}</Text>
                </View>

                {/* 액션 버튼들 (신고하기 등) */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        activeOpacity={0.8}
                        onPress={handleReport}
                    >
                        <WarningTriangleIcon size={18} color={COLORS.gray} />
                        <Text style={styles.actionText}>{t('report.title') || '해당 사용자 신고하기'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
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
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 32,
    },
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
        overflow: 'hidden',
        backgroundColor: COLORS.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    nickname: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.white,
        lineHeight: 28,
        marginBottom: 4,
    },
    roleText: {
        fontSize: 13,
        color: COLORS.gold,
        fontWeight: '500',
    },
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
    actionText: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.gray,
    },
});