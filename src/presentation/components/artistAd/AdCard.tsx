import React, { memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import CachedImage from '../common/CachedImage';
import { COLORS } from '../../theme/colors';
import { TattooPlaceholderIcon, ChevronRightIcon } from '../icons';
import { ArtistAdItem } from '../../../domain/entities/artistAdTypes';
import StatBar from './StatBar';
import MiniLineChart from './MiniLineChart';

interface Props {
  ad: ArtistAdItem;
  onOpenDetail: () => void;
  onUp: () => void;
  onSuperUp: () => void;
  onCardAd: () => void;
  onBannerAd: () => void;
}

const AdCard = memo(({
  ad, onOpenDetail, onUp, onSuperUp, onCardAd, onBannerAd,
}: Props) => (
  <View style={styles.card}>
    {/* Top row */}
    <View style={styles.topRow}>
      <View style={styles.thumbWrap}>
        {ad.thumbnailUri ? (
          <CachedImage uri={ad.thumbnailUri} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <TattooPlaceholderIcon size={30} color="#3a3a3a" />
          </View>
        )}
      </View>
      <View style={styles.topBody}>
        <Text style={styles.statusLabel} numberOfLines={1}>{ad.statusLabel}</Text>
        <Text style={styles.title} numberOfLines={1}>{ad.title}</Text>
        <Text style={styles.period} numberOfLines={1}>
          광고 기간  {ad.periodStart} ~ {ad.periodEnd}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onOpenDetail}
        activeOpacity={0.75}
        style={styles.detailBtn}
      >
        <Text style={styles.detailText}>상세 보기</Text>
        <ChevronRightIcon size={14} color={COLORS.white} />
      </TouchableOpacity>
    </View>

    {/* Stats grid — 활성 광고일 때만 표시 */}
    {ad.status !== 'idle' && (
      <>
        <View style={styles.statsRow}>
          <StatBar label="노출수" metric={ad.impressions} />
          <View style={styles.statDivider} />
          <StatBar label="클릭수" metric={ad.clicks} />
          <View style={styles.statDivider} />
          <StatBar label="문의 건수" metric={ad.inquiries} />
        </View>
        <View style={styles.chartWrap}>
          <MiniLineChart data={ad.trend} height={92} />
        </View>
      </>
    )}

    {/* Action buttons */}
    <View style={styles.actionsRow}>
      <TouchableOpacity
        onPress={onUp}
        activeOpacity={0.85}
        style={[styles.actionBtn, styles.actionUp]}
      >
        <Text style={styles.actionUpText}>UP</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSuperUp}
        activeOpacity={0.85}
        style={[styles.actionBtn, styles.actionSuperUp]}
      >
        <Text style={styles.actionSuperUpText}>슈퍼UP</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onCardAd}
        activeOpacity={0.85}
        style={[styles.actionBtn, styles.actionCard]}
      >
        <Text style={styles.actionCardText}>카드광고</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onBannerAd}
        activeOpacity={0.85}
        style={[styles.actionBtn, styles.actionBanner]}
      >
        <Text style={styles.actionBannerText}>배너광고</Text>
      </TouchableOpacity>
    </View>
  </View>
));
AdCard.displayName = 'AdCard';
export default AdCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.5)',
    backgroundColor: COLORS.card,
    padding: 14,
    gap: 16,
    marginBottom: 14,
  },

  /* Top */
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbWrap: {
    width: 62, height: 62,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
  },
  thumb: { width: '100%', height: '100%' },
  thumbPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBody: {
    flex: 1,
    gap: 3,
  },
  statusLabel: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  period: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.elevated,
  },
  detailText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: COLORS.border,
  },

  /* Chart */
  chartWrap: {
    width: '100%',
  },

  /* Actions */
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionUp: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionUpText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionSuperUp: {
    backgroundColor: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  actionSuperUpText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  actionCard: {
    backgroundColor: COLORS.gold,
  },
  actionCardText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  actionBanner: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  actionBannerText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
});
