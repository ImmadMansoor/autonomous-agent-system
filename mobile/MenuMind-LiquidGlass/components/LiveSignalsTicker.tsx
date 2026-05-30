import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

const signalItems = [
  { id: '1', icon: 'warning', tone: 'error', text: 'Milk Supply: Critical' },
  { id: '2', icon: 'trending-up', tone: 'secondary', text: 'Traffic Surge Detected' },
  { id: '3', icon: 'cloud', tone: 'primary', text: 'Weather: Rain Expected' },
];

export function LiveSignalsTicker() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = getStyles(colors, isDark);

  const toneColor = (tone: string) => {
    if (tone === 'error') return isDark ? '#ff6b6b' : Colors.light.error;
    if (tone === 'secondary') return colors.secondary;
    return colors.primary;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {signalItems.map((signal) => (
          <View key={signal.id} style={styles.pill}>
            <MaterialIcons name={signal.icon as any} size={18} color={toneColor(signal.tone)} />
            <Text style={styles.text}>{signal.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: isDark ? '#2a2a2a' : '#d8dfdd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 10,
  },
  text: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: colors.onSurface,
  },
});
