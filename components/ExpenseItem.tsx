import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../lib/theme';
import { Expense } from '../lib/types';

interface Props {
  expense: Expense;
  runningTotal: number;
  dailyLimit: number;
}

export const ExpenseItem: React.FC<Props> = ({ expense, runningTotal, dailyLimit }) => {
  const time = new Date(expense.timestamp);
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isOverLimit = runningTotal > dailyLimit;

  return (
    <View style={styles.container}>
      <View style={styles.timeCol}>
        <Ionicons name="time-outline" size={14} color={COLORS.textTertiary} />
        <Text style={styles.time}>{timeStr}</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.amount}>-₹{expense.amount}</Text>
        {expense.note ? (
          <Text style={styles.note} numberOfLines={1}>{expense.note}</Text>
        ) : null}
      </View>
      <View style={styles.totalCol}>
        <Text style={[styles.runningTotal, isOverLimit && styles.overLimit]}>
          ₹{runningTotal}
        </Text>
        <Text style={styles.totalLabel}>total</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  timeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  middle: {
    flex: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  note: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  totalCol: {
    alignItems: 'flex-end',
  },
  runningTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  overLimit: {
    color: COLORS.red,
  },
  totalLabel: {
    fontSize: 10,
    color: COLORS.textTertiary,
  },
});
