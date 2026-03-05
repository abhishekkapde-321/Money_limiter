import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Expense, DayRecord, AppNotification } from './types';

const STORAGE_KEY = 'money_tracker_state';

const getToday = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getDefaultState = (): AppState => ({
  dailyLimit: 100,
  bonusBalance: 0,
  todaySpent: 0,
  todayExpenses: [],
  history: [],
  lastResetDate: getToday(),
  notifications: [],
});

export const loadState = async (): Promise<AppState> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const state: AppState = JSON.parse(raw);
    return checkDayReset(state);
  } catch {
    return getDefaultState();
  }
};

export const saveState = async (state: AppState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};

const checkDayReset = (state: AppState): AppState => {
  const today = getToday();
  if (state.lastResetDate === today) return state;

  // Day has changed - finalize previous day
  const prevDay: DayRecord = {
    date: state.lastResetDate,
    expenses: [...state.todayExpenses],
    totalSpent: state.todaySpent,
    bonusEarned: state.dailyLimit - state.todaySpent,
  };

  const remaining = state.dailyLimit - state.todaySpent;
  const newBonus = state.bonusBalance + remaining;

  const newNotifications: AppNotification[] = [];
  if (remaining > 0) {
    newNotifications.push({
      id: Date.now().toString(),
      type: 'bonus',
      icon: '⭐',
      message: `₹${remaining} added to bonus from yesterday!`,
      timestamp: Date.now(),
    });
  }

  return {
    ...state,
    bonusBalance: newBonus,
    todaySpent: 0,
    todayExpenses: [],
    history: [prevDay, ...state.history],
    lastResetDate: today,
    notifications: [...newNotifications, ...state.notifications].slice(0, 50),
  };
};

export const addExpense = (state: AppState, amount: number, note: string): AppState => {
  const today = getToday();
  const expense: Expense = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    amount,
    note,
    timestamp: Date.now(),
    date: today,
  };

  const newTodaySpent = state.todaySpent + amount;
  const prevSpent = state.todaySpent;
  let newBonus = state.bonusBalance;
  const newNotifications: AppNotification[] = [];

  // If spending goes over limit, deduct from bonus immediately
  if (newTodaySpent > state.dailyLimit && prevSpent < state.dailyLimit) {
    const overAmount = newTodaySpent - state.dailyLimit;
    newBonus -= overAmount;
  } else if (prevSpent >= state.dailyLimit) {
    newBonus -= amount;
  }

  // Generate notifications based on percentage
  const pct = (newTodaySpent / state.dailyLimit) * 100;
  const prevPct = (prevSpent / state.dailyLimit) * 100;

  if (pct >= 50 && prevPct < 50) {
    newNotifications.push({
      id: Date.now().toString() + '_50',
      type: 'info',
      icon: '✅',
      message: '50% of daily limit reached',
      timestamp: Date.now(),
    });
  }
  if (pct >= 75 && prevPct < 75) {
    newNotifications.push({
      id: Date.now().toString() + '_75',
      type: 'warning',
      icon: '⚠️',
      message: '75% warning — slow down spending!',
      timestamp: Date.now(),
    });
  }
  if (pct >= 90 && prevPct < 90) {
    newNotifications.push({
      id: Date.now().toString() + '_90',
      type: 'danger',
      icon: '🔴',
      message: '90% alert — almost at limit!',
      timestamp: Date.now(),
    });
  }
  if (pct >= 100 && prevPct < 100) {
    newNotifications.push({
      id: Date.now().toString() + '_100',
      type: 'danger',
      icon: '🚨',
      message: '100% reached — limit exhausted!',
      timestamp: Date.now(),
    });
  }
  if (pct > 100 && prevPct <= 100) {
    newNotifications.push({
      id: Date.now().toString() + '_over',
      type: 'danger',
      icon: '❌',
      message: 'Limit crossed! Deducting from bonus.',
      timestamp: Date.now(),
    });
  }
  if (newBonus < 0 && state.bonusBalance >= 0) {
    newNotifications.push({
      id: Date.now().toString() + '_negbonus',
      type: 'danger',
      icon: '⚠️',
      message: 'Bonus balance is now negative!',
      timestamp: Date.now(),
    });
  }

  return {
    ...state,
    todaySpent: newTodaySpent,
    todayExpenses: [...state.todayExpenses, expense],
    bonusBalance: newBonus,
    notifications: [...newNotifications, ...state.notifications].slice(0, 50),
  };
};

export const clearAllData = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
