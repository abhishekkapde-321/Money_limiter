import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../lib/theme';
import { loadState, clearAllData, getDefaultState } from '../lib/storage';
import { AppState } from '../lib/types';

export const StatsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [state, setState] = useState<AppState>(getDefaultState());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const s = await loadState();
    setState(s);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const totalDays = state.history.length + 1; // +1 for today
  const totalSpentAllTime = state.history.reduce((sum, d) => sum + d.totalSpent, 0) + state.todaySpent;
  const avgDaily = totalDays > 0 ? Math.round(totalSpentAllTime / totalDays) : 0;
  const daysUnderBudget = state.history.filter(d => d.totalSpent <= state.dailyLimit).length;
  const daysOverBudget = state.history.filter(d => d.totalSpent > state.dailyLimit).length;
  const bestDay = state.history.length > 0
    ? state.history.reduce((best, d) => d.totalSpent < best.totalSpent ? d : best, state.history[0])
    : null;
  const worstDay = state.history.length > 0
    ? state.history.reduce((worst, d) => d.totalSpent > worst.totalSpent ? d : worst, state.history[0])
    : null;
  const totalBonusEarned = state.history.reduce((sum, d) => sum + Math.max(0, d.bonusEarned), 0);
  const streakDays = (() => {
    let streak = state.todaySpent <= state.dailyLimit ? 1 : 0;
    for (const day of state.history) {
      if (day.totalSpent <= state.dailyLimit) streak++;
      else break;
    }
    return streak;
  })();

  const handleReset = async () => {
    await clearAllData();
    setState(getDefaultState());
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="stats-chart" size={48} color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
        <Text style={styles.headerSubtitle}>Your spending insights</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakIconWrap}>
            <Text style={{ fontSize: 32 }}>🔥</Text>
          </View>
          <Text style={styles.streakNumber}>{streakDays}</Text>
          <Text style={styles.streakLabel}>Day{streakDays !== 1 ? 's' : ''} Under Budget Streak</Text>
        </View>

        {/* Overview Cards */}
        <View style={styles.cardRow}>
          <View style={[styles.miniCard, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.green} />
            <Text style={styles.miniValue}>₹{totalSpentAllTime}</Text>
            <Text style={styles.miniLabel}>Total Spent</Text>
          </View>
          <View style={[styles.miniCard, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="trending-down-outline" size={24} color="#3B82F6" />
            <Text style={styles.miniValue}>₹{avgDaily}</Text>
            <Text style={styles.miniLabel}>Daily Average</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.miniCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={{ fontSize: 22 }}>⭐</Text>
            <Text style={styles.miniValue}>₹{state.bonusBalance}</Text>
            <Text style={styles.miniLabel}>Current Bonus</Text>
          </View>
          <View style={[styles.miniCard, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="trophy-outline" size={24} color={COLORS.green} />
            <Text style={styles.miniValue}>₹{totalBonusEarned}</Text>
            <Text style={styles.miniLabel}>Total Bonus Earned</Text>
          </View>
        </View>

        {/* Budget Compliance */}
        <View style={styles.complianceCard}>
          <Text style={styles.cardTitle}>Budget Compliance</Text>
          <View style={styles.complianceRow}>
            <View style={styles.complianceItem}>
              <View style={[styles.complianceDot, { backgroundColor: COLORS.green }]} />
              <Text style={styles.complianceValue}>{daysUnderBudget}</Text>
              <Text style={styles.complianceLabel}>Under Budget</Text>
            </View>
            <View style={styles.complianceDivider} />
            <View style={styles.complianceItem}>
              <View style={[styles.complianceDot, { backgroundColor: COLORS.red }]} />
              <Text style={styles.complianceValue}>{daysOverBudget}</Text>
              <Text style={styles.complianceLabel}>Over Budget</Text>
            </View>
            <View style={styles.complianceDivider} />
            <View style={styles.complianceItem}>
              <View style={[styles.complianceDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.complianceValue}>{totalDays}</Text>
              <Text style={styles.complianceLabel}>Total Days</Text>
            </View>
          </View>

          {/* Visual bar */}
          {totalDays > 1 && (
            <View style={styles.complianceBar}>
              <View
                style={[
                  styles.complianceBarFill,
                  {
                    backgroundColor: COLORS.green,
                    flex: daysUnderBudget || 0.1,
                  },
                ]}
              />
              <View
                style={[
                  styles.complianceBarFill,
                  {
                    backgroundColor: COLORS.red,
                    flex: daysOverBudget || 0.1,
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* Best & Worst Days */}
        {bestDay && worstDay && (
          <View style={styles.bestWorstRow}>
            <View style={[styles.bwCard, { borderLeftColor: COLORS.green }]}>
              <Text style={styles.bwTitle}>💚 Best Day</Text>
              <Text style={styles.bwDate}>{formatDate(bestDay.date)}</Text>
              <Text style={[styles.bwAmount, { color: COLORS.green }]}>₹{bestDay.totalSpent}</Text>
            </View>
            <View style={[styles.bwCard, { borderLeftColor: COLORS.red }]}>
              <Text style={styles.bwTitle}>🔴 Worst Day</Text>
              <Text style={styles.bwDate}>{formatDate(worstDay.date)}</Text>
              <Text style={[styles.bwAmount, { color: COLORS.red }]}>₹{worstDay.totalSpent}</Text>
            </View>
          </View>
        )}

        {/* Recent 7 Days Mini Chart */}
        {state.history.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Recent Spending</Text>
            <View style={styles.barChart}>
              {state.history.slice(0, 7).reverse().map((day, idx) => {
                const pct = Math.min((day.totalSpent / state.dailyLimit) * 100, 150);
                const barHeight = Math.max(8, (pct / 150) * 120);
                const isOver = day.totalSpent > state.dailyLimit;
                return (
                  <View key={day.date} style={styles.barCol}>
                    <Text style={styles.barAmount}>₹{day.totalSpent}</Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: isOver ? COLORS.red : COLORS.primary,
                        },
                      ]}
                    />
                    <Text style={styles.barLabel}>
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                );
              })}
            </View>
            {/* Limit line label */}
            <View style={styles.limitLine}>
              <View style={styles.limitDash} />
              <Text style={styles.limitLabel}>₹{state.dailyLimit} limit</Text>
            </View>
          </View>
        )}

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={18} color={COLORS.red} />
          <Text style={styles.resetText}>Reset All Data</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  streakCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  streakIconWrap: {
    marginBottom: SPACING.sm,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.primary,
  },
  streakLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  miniCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  miniValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  miniLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  complianceCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  complianceItem: {
    alignItems: 'center',
  },
  complianceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: SPACING.xs,
  },
  complianceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  complianceLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  complianceDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.borderLight,
  },
  complianceBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: SPACING.lg,
    gap: 2,
  },
  complianceBarFill: {
    borderRadius: 4,
  },
  bestWorstRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  bwCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  bwTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  bwDate: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  bwAmount: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: SPACING.xs,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 160,
    paddingTop: 20,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barAmount: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontWeight: '600',
    marginBottom: 4,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 8,
  },
  barLabel: {
    fontSize: 9,
    color: COLORS.textTertiary,
    marginTop: 4,
    fontWeight: '500',
  },
  limitLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  limitDash: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.textTertiary,
  },
  limitLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.red,
  },
});
