import React, { useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Animated, StatusBar as RNStatusBar, Text } from 'react-native';
import { TopAppBar } from '@/components/TopAppBar';
import { SystemHealthCard } from '@/components/SystemHealthCard';
import { FeaturedForecast } from '@/components/FeaturedForecast';
import { LiveSignalsTicker } from '@/components/LiveSignalsTicker';
import { MetricsGrid } from '@/components/MetricsGrid';
import { NeedsAttentionCard } from '@/components/NeedsAttentionCard';
import { AISuggestionCard } from '@/components/AISuggestionCard';
import { ActiveReasoningFeed } from '@/components/ActiveReasoningFeed';
import { Colors } from '@/constants/Colors';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

const SECTIONS = [
  <SystemHealthCard />,
  <FeaturedForecast />,
  <LiveSignalsTicker />,
  <MetricsGrid />,
  <NeedsAttentionCard />,
  <AISuggestionCard />,
  <ActiveReasoningFeed />,
];

export default function OperationsScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const statusBarHeight = RNStatusBar.currentHeight || 0;
  const safeTop = insets.top > 0 ? insets.top : statusBarHeight > 0 ? statusBarHeight : 24;
  const paddingTop = safeTop + 72;

  const safeBottom = insets.bottom > 0 ? insets.bottom : 24;
  const paddingBottom = safeBottom + 110;

  const opacity = useRef(SECTIONS.map(() => new Animated.Value(0))).current;
  const translateY = useRef(SECTIONS.map(() => new Animated.Value(24))).current;

  useEffect(() => {
    Animated.stagger(
      100,
      opacity.map((_, i) =>
        Animated.parallel([
          Animated.timing(opacity[i], {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(translateY[i], {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();
  }, [opacity, translateY]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <TopAppBar />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop, paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section, i) => (
          <Animated.View
            key={i}
            style={{ opacity: opacity[i], transform: [{ translateY: translateY[i] }] }}
          >
            {section}
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 24,
  },
});
