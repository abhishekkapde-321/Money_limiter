import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../lib/theme';

interface Props {
  amount: number;
  onPress: (amount: number) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const QuickAmountButton: React.FC<Props> = ({ amount, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withTiming(1, { duration: 120 })
    );
    onPress(amount);
  };

  return (
    <AnimatedTouchable
      style={[styles.button, animatedStyle]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>₹{amount}</Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.sm,
  },
  text: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '700',
  },
});
