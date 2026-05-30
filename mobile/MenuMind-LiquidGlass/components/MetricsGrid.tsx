import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

interface Metric {
  id: string;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  unit?: string;
}

const metrics: Metric[] = [
  { id: '1', label: 'Revenue Lift', value: '$4,200', change: '12.4%', positive: true },
  { id: '2', label: 'Stockouts Saved', value: '18', unit: 'Critical items' },
  { id: '3', label: 'Auto-Adjusted', value: '42', unit: 'Live prices' },
  { id: '4', label: 'Avg Ticket', value: '$14.50', change: '5.2%', positive: true },
];

export function MetricsGrid() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {metrics.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
            {item.change ? (
              <View style={styles.changeRow}>
                <MaterialIcons
                  name={item.positive ? 'arrow-upward' : 'arrow-downward'}
                  size={14}
                  color={colors.secondary}
                />
                <Text style={styles.changeText}>{item.change}</Text>
              </View>
            ) : (
              <Text style={styles.unitText}>{item.unit}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const getStyles = (colors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: isDark ? '#2a2a2a' : '#d8dfdd',
    padding: 16,
    paddingBottom: 12,
    borderRadius: 8,
  },
  label: {
    fontFamily: 'Doto_700Bold',
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0,
    marginBottom: 10,
  },
  value: {
    fontFamily: 'Doto_800ExtraBold',
    fontSize: 30,
    lineHeight: 34,
    color: colors.primary,
    letterSpacing: 0,
    marginBottom: 6,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  changeText: {
    fontFamily: 'Doto_700Bold',
    fontSize: 12,
    lineHeight: 16,
    color: colors.secondary,
  },
  unitText: {
    fontFamily: 'Doto_600SemiBold',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
});
