import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { COLORS, RADIUS, getProgressColor, getProgressBgColor } from '../lib/theme';

interface ProgressBarProps {
  percentage: number;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, height = 14 }) => {
  const width = useSharedValue(0);
  const color = getProgressColor(percentage);
  const bgColor = getProgressBgColor(percentage);

  useEffect(() => {
    width.value = withSpring(Math.min(percentage, 100), {
      damping: 15,
      stiffness: 80,
    });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={[styles.container, { height, backgroundColor: bgColor }]}>
      <Animated.View
        style={[
          styles.fill,
          { height, backgroundColor: color },
          animatedStyle,
        ]}
      />
      {percentage > 100 && (
        <View style={[styles.overflowIndicator, { backgroundColor: COLORS.darkRed }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: RADIUS.full,
  },
  overflowIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
  },
});
