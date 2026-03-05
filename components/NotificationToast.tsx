import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../lib/theme';
import { AppNotification } from '../lib/types';

interface Props {
  notification: AppNotification;
  onDismiss: () => void;
}

const TYPE_COLORS = {
  success: { bg: '#DCFCE7', border: '#16A34A', text: '#15803D' },
  warning: { bg: '#FEF9C3', border: '#EAB308', text: '#A16207' },
  danger: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
  info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1D4ED8' },
  bonus: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
};

export const NotificationToast: React.FC<Props> = ({ notification, onDismiss }) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const colors = TYPE_COLORS[notification.type];

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 400 });
    opacity.value = withTiming(1, { duration: 300 });

    const timer = setTimeout(() => {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      setTimeout(onDismiss, 350);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.bg, borderLeftColor: colors.border },
        animatedStyle,
      ]}
    >
      <Text style={styles.icon}>{notification.icon}</Text>
      <Text style={[styles.message, { color: colors.text }]}>
        {notification.message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    ...SHADOWS.md,
  },
  icon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});
