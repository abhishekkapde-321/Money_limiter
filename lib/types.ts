export interface Expense {
  id: string;
  amount: number;
  note: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
}

export interface DayRecord {
  date: string;
  expenses: Expense[];
  totalSpent: number;
  bonusEarned: number; // positive if under limit, negative if over
}

export interface AppState {
  dailyLimit: number;
  bonusBalance: number;
  todaySpent: number;
  todayExpenses: Expense[];
  history: DayRecord[];
  lastResetDate: string;
  notifications: AppNotification[];
}

export interface AppNotification {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info' | 'bonus';
  icon: string;
  message: string;
  timestamp: number;
}

export type RootStackParamList = {
  Main: undefined;
  History: undefined;
  Stats: undefined;
};
