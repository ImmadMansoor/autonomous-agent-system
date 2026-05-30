import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

export function AISuggestionCard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="auto-awesome" size={26} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Boost pastry production by 20% for AM peak.</Text>
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>94% Probability</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: isDark ? '#2a2a2a' : '#d8dfdd',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: 8,
    padding: 18,
    marginHorizontal: 16,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: isDark ? '#101918' : 'rgba(0, 104, 95, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#243231' : 'rgba(0, 104, 95, 0.18)',
  },
  content: {
    flex: 1,
    gap: 12,
  },
  text: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: colors.onSurface,
    lineHeight: 24,
    letterSpacing: 0,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  confidenceLabel: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  scoreBadge: {
    backgroundColor: isDark ? '#111f1d' : 'rgba(0, 104, 95, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: isDark ? '#25413d' : 'rgba(0, 104, 95, 0.18)',
  },
  scoreText: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
});
