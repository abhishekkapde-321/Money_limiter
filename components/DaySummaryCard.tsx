import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS, getProgressColor } from '../lib/theme';
import { ProgressBar } from './ProgressBar';

interface Props {
  dailyLimit: number;
  todaySpent: number;
  bonusBalance: number;
}

export const DaySummaryCard: React.FC<Props> = ({ dailyLimit, todaySpent, bonusBalance }) => {
  const remaining = Math.max(0, dailyLimit - todaySpent);
  const percentage = dailyLimit > 0 ? (todaySpent / dailyLimit) * 100 : 0;
  const progressColor = getProgressColor(percentage);
  const isOver = todaySpent > dailyLimit;
  const overBy = isOver ? todaySpent - dailyLimit : 0;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.cardTitle}>Daily Summary</Text>
          <Text style={styles.cardSubtitle}>
            {isOver ? 'Over budget!' : percentage >= 75 ? 'Watch your spending' : 'Looking good!'}
          </Text>
        </View>
        <View style={[styles.percentBadge, { backgroundColor: progressColor + '20' }]}>
          <Text style={[styles.percentText, { color: progressColor }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <ProgressBar percentage={percentage} height={12} />
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>₹0</Text>
          <Text style={styles.progressLabel}>₹{dailyLimit}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Text style={{ fontSize: 16 }}>💰</Text>
          </View>
          <Text style={styles.statLabel}>Daily Limit</Text>
          <Text style={styles.statValue}>₹{dailyLimit}</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: isOver ? '#FEE2E2' : '#FEF3C7' }]}>
            <Text style={{ fontSize: 16 }}>💸</Text>
          </View>
          <Text style={styles.statLabel}>Spent Today</Text>
          <Text style={[styles.statValue, isOver && { color: COLORS.red }]}>₹{todaySpent}</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: remaining > 0 ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={{ fontSize: 16 }}>{remaining > 0 ? '🟢' : '🔴'}</Text>
          </View>
          <Text style={styles.statLabel}>{isOver ? 'Over By' : 'Remaining'}</Text>
          <Text style={[styles.statValue, isOver && { color: COLORS.red }]}>
            {isOver ? `-₹${overBy}` : `₹${remaining}`}
          </Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: bonusBalance >= 0 ? '#FEF3C7' : '#FEE2E2' }]}>
            <Text style={{ fontSize: 16 }}>⭐</Text>
          </View>
          <Text style={styles.statLabel}>Bonus</Text>
          <Text style={[
            styles.statValue,
            { color: bonusBalance >= 0 ? COLORS.bonusGold : COLORS.red }
          ]}>
            {bonusBalance >= 0 ? `₹${bonusBalance}` : `-₹${Math.abs(bonusBalance)}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerLeft: {},
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  percentBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  percentText: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressSection: {
    marginBottom: SPACING.xl,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statItem: {
    width: '47%',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
});
