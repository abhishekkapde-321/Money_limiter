import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeIn,
  FadeInDown,
  SlideInDown,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../lib/theme';
import { AppState, Expense, AppNotification } from '../lib/types';
import { loadState, saveState, addExpense as addExpenseAction, getDefaultState } from '../lib/storage';
import { DaySummaryCard } from '../components/DaySummaryCard';
import { ProgressBar } from '../components/ProgressBar';
import { QuickAmountButton } from '../components/QuickAmountButton';
import { ExpenseItem } from '../components/ExpenseItem';
import { NotificationToast } from '../components/NotificationToast';

const QUICK_AMOUNTS = [10, 20, 50, 100];

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [state, setState] = useState<AppState>(getDefaultState());
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);
  const prevNotifCount = useRef(0);

  const buttonScale = useSharedValue(1);

  const loadData = useCallback(async () => {
    const s = await loadState();
    setState(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // Watch for new notifications
  useEffect(() => {
    if (state.notifications.length > prevNotifCount.current) {
      const newOnes = state.notifications.slice(0, state.notifications.length - prevNotifCount.current);
      setActiveToasts(prev => [...newOnes, ...prev].slice(0, 3));
    }
    prevNotifCount.current = state.notifications.length;
  }, [state.notifications.length]);

  const handleAddExpense = useCallback(async (amount?: number) => {
    const val = amount || parseFloat(amountInput);
    if (!val || val <= 0 || isNaN(val)) {
      return;
    }

    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 60 }),
      withTiming(1, { duration: 100 })
    );

    const note = amount ? '' : noteInput;
    const newState = addExpenseAction(state, val, note);
    setState(newState);
    await saveState(newState);
    setAmountInput('');
    setNoteInput('');
  }, [amountInput, noteInput, state]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isFirstLoad = state.todayExpenses.length === 0 && state.history.length === 0;

  // Build running totals
  let runningTotal = 0;
  const expensesWithTotals = state.todayExpenses.map(e => {
    runningTotal += e.amount;
    return { ...e, runningTotal };
  });

  const renderHeader = () => (
    <View>
      {/* Toasts */}
      <View style={styles.toastContainer}>
        {activeToasts.map(toast => (
          <NotificationToast
            key={toast.id}
            notification={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </View>

      {/* Summary Card */}
      <DaySummaryCard
        dailyLimit={state.dailyLimit}
        todaySpent={state.todaySpent}
        bonusBalance={state.bonusBalance}
      />

      {/* First Load Message */}
      {isFirstLoad && (
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.welcomeCard}>
          <View style={styles.welcomeIconWrap}>
            <Ionicons name="wallet-outline" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.welcomeTitle}>Money tracker activated!</Text>
          <Text style={styles.welcomeText}>
            Your daily limit is ₹100. Please enter your first expense below.
          </Text>
        </Animated.View>
      )}

      {/* Add Expense Section */}
      <View style={styles.addSection}>
        <Text style={styles.sectionTitle}>Add Expense</Text>

        {/* Quick Buttons */}
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map(amt => (
            <QuickAmountButton key={amt} amount={amt} onPress={handleAddExpense} />
          ))}
        </View>

        {/* Input Fields */}
        <View style={styles.inputRow}>
          <View style={styles.amountInputWrap}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Amount"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
              returnKeyType="next"
            />
          </View>
        </View>

        <View style={styles.noteInputWrap}>
          <Ionicons name="create-outline" size={18} color={COLORS.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note (optional)"
            placeholderTextColor={COLORS.textTertiary}
            value={noteInput}
            onChangeText={setNoteInput}
            returnKeyType="done"
            onSubmitEditing={() => handleAddExpense()}
          />
        </View>

        <Animated.View style={buttonAnimStyle}>
          <TouchableOpacity
            style={[
              styles.addButton,
              (!amountInput || parseFloat(amountInput) <= 0) && styles.addButtonDisabled,
            ]}
            onPress={() => handleAddExpense()}
            activeOpacity={0.8}
            disabled={!amountInput || parseFloat(amountInput) <= 0}
          >
            <Ionicons name="add-circle" size={22} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Notifications Panel */}
      {state.notifications.length > 0 && (
        <View style={styles.notifSection}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {state.notifications.slice(0, 5).map((notif, idx) => (
            <View key={notif.id + idx} style={styles.notifItem}>
              <Text style={styles.notifIcon}>{notif.icon}</Text>
              <View style={styles.notifContent}>
                <Text style={styles.notifMessage}>{notif.message}</Text>
                <Text style={styles.notifTime}>
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Expense Log Header */}
      {expensesWithTotals.length > 0 && (
        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>Today's Expenses</Text>
          <Text style={styles.expenseCount}>{expensesWithTotals.length} items</Text>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isFirstLoad) return null;
    if (expensesWithTotals.length > 0) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="receipt-outline" size={48} color={COLORS.textTertiary} />
        <Text style={styles.emptyText}>No expenses yet today</Text>
        <Text style={styles.emptySubtext}>Add your first expense above</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <Ionicons name="wallet" size={48} color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.appHeader}>
          <View>
            <Text style={styles.appTitle}>Personal Money Tracker</Text>
            <Text style={styles.appSubtitle}>Smart daily spending control</Text>
          </View>
          <View style={styles.dateChip}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
        </View>

        <FlatList
          data={[...expensesWithTotals].reverse()}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ExpenseItem
              expense={item}
              runningTotal={item.runningTotal}
              dailyLimit={state.dailyLimit}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  appHeader: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primaryLighter,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  welcomeCard: {
    backgroundColor: COLORS.primaryLighter,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '40',
  },
  welcomeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  welcomeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: SPACING.xs,
  },
  welcomeText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  addSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  quickRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  amountInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  noteInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  noteInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  notifSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    ...SHADOWS.sm,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  notifIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  notifContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifMessage: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginLeft: SPACING.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xs,
  },
  expenseCount: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
});
