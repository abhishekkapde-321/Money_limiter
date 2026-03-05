export const COLORS = {
  // Primary greens (money theme)
  primary: '#16A34A',
  primaryLight: '#22C55E',
  primaryLighter: '#DCFCE7',
  primaryDark: '#15803D',
  primaryBg: '#F0FDF4',

  // Accent
  accent: '#059669',
  accentLight: '#D1FAE5',

  // Status colors
  green: '#16A34A',
  yellow: '#EAB308',
  orange: '#F97316',
  red: '#EF4444',
  darkRed: '#991B1B',

  // Neutrals
  white: '#FFFFFF',
  bg: '#F8FAF9',
  cardBg: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textWhite: '#FFFFFF',

  // Shadows
  shadow: '#00000012',
  shadowDark: '#00000020',

  // Bonus
  bonusGold: '#F59E0B',
  bonusGoldLight: '#FEF3C7',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const getProgressColor = (percentage: number): string => {
  if (percentage > 100) return COLORS.darkRed;
  if (percentage >= 90) return COLORS.red;
  if (percentage >= 75) return COLORS.orange;
  if (percentage >= 50) return COLORS.yellow;
  return COLORS.green;
};

export const getProgressBgColor = (percentage: number): string => {
  if (percentage > 100) return '#FEE2E2';
  if (percentage >= 90) return '#FEE2E2';
  if (percentage >= 75) return '#FFF7ED';
  if (percentage >= 50) return '#FEF9C3';
  return '#DCFCE7';
};
