import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

interface AttentionItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: 'restock' | 'pricing' | 'staffing';
}

const MOCK_ITEMS: AttentionItem[] = [
  {
    id: 'att-1',
    title: 'APPROVAL REQ',
    subtitle: 'Auto-Restock Coffee Beans (50lb)',
    description: 'System predicts peak demand for Sunday events. Suggested restock ensures 100% availability.',
    type: 'restock',
  },
  {
    id: 'att-2',
    title: 'PRICE REVIEW',
    subtitle: 'Cold Brew Surge Pricing Active',
    description: 'Temperature forecast shows 3-day heatwave. Recommend extending surge pricing through Monday.',
    type: 'pricing',
  },
];

export function NeedsAttentionCard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [items, setItems] = useState<AttentionItem[]>(MOCK_ITEMS);

  const handleConfirm = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    Toast.show({
      type: 'success',
      text1: 'CONFIRMED',
      text2: 'Queued for fulfillment',
      position: 'top',
      visibilityTime: 2500,
    });
  };

  const handleDismiss = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    const isLast = items.length <= 1;
    Toast.show({
      type: 'info',
      text1: isLast ? 'ALL CLEAR' : 'DISMISSED',
      text2: isLast ? 'No pending approvals' : 'Item dismissed',
      position: 'top',
      visibilityTime: 2500,
    });
  };

  const typeConfig = (type: AttentionItem['type']) => {
    switch (type) {
      case 'restock':
        return { icon: 'inventory-2' as const, color: colors.primary };
      case 'pricing':
        return { icon: 'attach-money' as const, color: '#D71921' }; // Nothing Red
      case 'staffing':
        return { icon: 'group' as const, color: colors.onSurface };
    }
  };

  return (
    <View style={styles.wrapper}>
      {items.map((item) => {
        const config = typeConfig(item.type);
        return (
          <View key={item.id} style={[styles.card, { backgroundColor: colors.surfaceContainer, borderColor: isDark ? '#333' : '#e5e5e5' }]}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: config.color }]}>{item.title}</Text>
                <Text style={[styles.subtitle, { color: colors.onSurface }]}>{item.subtitle}</Text>
              </View>
              <MaterialIcons name={config.icon} size={28} color={colors.onSurface} />
            </View>

            <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>{item.description}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={() => handleConfirm(item.id)}
              >
                <Text style={[styles.confirmButtonText, { color: colors.onPrimary }]}>CONFIRM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.dismissButton, { borderColor: isDark ? '#333' : '#e5e5e5' }]}
                onPress={() => handleDismiss(item.id)}
              >
                <Text style={[styles.dismissButtonText, { color: colors.onSurface }]}>DISMISS</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {items.length === 0 && (
        <View style={[styles.emptyCard, { backgroundColor: colors.surfaceContainer, borderColor: isDark ? '#333' : '#e5e5e5' }]}>
          <MaterialIcons name="done-all" size={32} color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.onSurface }]}>ALL CAUGHT UP</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    gap: 16,
  },
  card: {
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: 'Doto_700Bold',
    fontSize: 20,
    letterSpacing: 0,
    lineHeight: 24,
  },
  description: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    marginBottom: 32,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999, // Nothing pill buttons
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
  },
  confirmButtonText: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  dismissButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  dismissButtonText: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  emptyCard: {
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  emptyText: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
});
