import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS, getProgressColor } from '../lib/theme';
import { loadState, getDefaultState } from '../lib/storage';
import { DayRecord } from '../lib/types';
import { ProgressBar } from '../components/ProgressBar';

export const HistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [history, setHistory] = useState<DayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [dailyLimit, setDailyLimit] = useState(100);

  const load = useCallback(async () => {
    const state = await loadState();
    setHistory(state.history);
    setDailyLimit(state.dailyLimit);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderDayCard = ({ item }: { item: DayRecord }) => {
    const pct = dailyLimit > 0 ? (item.totalSpent / dailyLimit) * 100 : 0;
    const color = getProgressColor(pct);
    const isExpanded = expandedDay === item.date;
    const saved = item.bonusEarned > 0;

    return (
      <TouchableOpacity
        style={styles.dayCard}
        activeOpacity={0.7}
        onPress={() => setExpandedDay(isExpanded ? null : item.date)}
      >
        <View style={styles.dayHeader}>
          <View style={styles.dayDateCol}>
            <Text style={styles.dayDate}>{formatDate(item.date)}</Text>
            <Text style={styles.dayExpCount}>
              {item.expenses.length} expense{item.expenses.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.dayAmountCol}>
            <Text style={[styles.dayAmount, { color }]}>₹{item.totalSpent}</Text>
            <View style={[styles.bonusBadge, { backgroundColor: saved ? '#DCFCE7' : '#FEE2E2' }]}>
              <Text style={[styles.bonusText, { color: saved ? COLORS.green : COLORS.red }]}>
                {saved ? '+' : ''}₹{item.bonusEarned}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: SPACING.sm }}>
          <ProgressBar percentage={pct} height={8} />
        </View>

        {isExpanded && item.expenses.length > 0 && (
          <View style={styles.expandedSection}>
            {item.expenses.map((exp, idx) => (
              <View key={exp.id} style={styles.histExpItem}>
                <Text style={styles.histExpTime}>
                  {new Date(exp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.histExpAmount}>₹{exp.amount}</Text>
                {exp.note ? <Text style={styles.histExpNote}>{exp.note}</Text> : null}
              </View>
            ))}
          </View>
        )}

        <View style={styles.expandIndicator}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.textTertiary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="time" size={48} color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Spending History</Text>
        <Text style={styles.headerSubtitle}>{history.length} day{history.length !== 1 ? 's' : ''} tracked</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={item => item.date}
        renderItem={renderDayCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="calendar-outline" size={56} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptySubtitle}>Your daily spending records will appear here</Text>
          </View>
        }
      />
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
    paddingVertical: 80,
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
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  dayCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayDateCol: {},
  dayDate: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dayExpCount: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  dayAmountCol: {
    alignItems: 'flex-end',
  },
  dayAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  bonusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  expandedSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  histExpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.md,
  },
  histExpTime: {
    fontSize: 12,
    color: COLORS.textTertiary,
    width: 55,
  },
  histExpAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  histExpNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  expandIndicator: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});
