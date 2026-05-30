import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

const THROUGHPUT_VALUES = [72, 85, 91, 78, 88, 95, 82];

export function SystemHealthCard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const animatedValue = useRef(new Animated.Value(THROUGHPUT_VALUES[0])).current;
  const [displayValue, setDisplayValue] = useState(THROUGHPUT_VALUES[0]);
  const indexRef = useRef(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });
    return () => animatedValue.removeListener(listener);
  }, [animatedValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (indexRef.current + 1) % THROUGHPUT_VALUES.length;
      const nextValue = THROUGHPUT_VALUES[nextIndex];
      indexRef.current = nextIndex;

      Animated.timing(animatedValue, {
        toValue: nextValue,
        duration: 800,
        easing: Easing.bezier(0.2, 1, 0.4, 1), // Percussive easing
        useNativeDriver: false,
      }).start();
    }, 3000);

    return () => clearInterval(interval);
  }, [animatedValue]);

  const barWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainer, borderColor: isDark ? '#333' : '#e5e5e5' }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.onSurface }]}>AI Reasoning Engine</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Continuous Optimization • Cycle sync 2m ago</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
          <View style={[styles.pulseDot, { backgroundColor: colors.onPrimary }]} />
          <Text style={[styles.statusText, { color: colors.onPrimary }]}>Active Optimizer</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabel, { color: colors.onSurfaceVariant }]}>PROCESSING THROUGHPUT</Text>
          <Text style={[styles.progressValue, { color: colors.primary }]}>{displayValue}%</Text>
        </View>
        <View style={[styles.progressBarBackground, { backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }]}>
          <Animated.View style={[styles.progressBarFill, { width: barWidth, backgroundColor: colors.primary }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 24,
    marginHorizontal: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    flexShrink: 1,
  },
  title: {
    fontFamily: 'Doto_800ExtraBold',
    fontSize: 20,
    marginBottom: 4,
    letterSpacing: 0,
  },
  subtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'Doto_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  progressContainer: {
    gap: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressLabel: {
    fontFamily: 'Doto_700Bold',
    fontSize: 10,
    letterSpacing: 0,
  },
  progressValue: {
    fontFamily: 'Doto_800ExtraBold',
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: 0,
  },
  progressBarBackground: {
    height: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
});
