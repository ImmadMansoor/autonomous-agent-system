import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { MenuMindService } from '../api';

const FALLBACK_ITEMS = [
  {
    id: 'fallback-1',
    icon: 'psychology',
    tag: 'Demand Forecast',
    message: 'Planner optimized pastry production for the morning peak.',
    time: 'Live',
  },
  {
    id: 'fallback-2',
    icon: 'shield',
    tag: 'Policy Check',
    message: 'Margin guardrails verified before approval routing.',
    time: 'Now',
  },
];

export function ActiveReasoningFeed() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = getStyles(colors, isDark);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const runData = await MenuMindService.getLatestRun();
        if (runData && runData.length > 0 && runData[0].traces) {
          const mapped = runData[0].traces.map((trace: any) => ({
            id: trace.id.toString(),
            icon: trace.step_type === 'action_execution' ? 'bolt' :
              trace.step_type === 'policy_check' ? 'shield' : 'psychology',
            tag: trace.step_type.replace('_', ' ').toUpperCase(),
            message: trace.content,
            time: new Date(trace.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setFeedItems(mapped.slice(0, 5));
          setUsingFallback(false);
          return;
        }
        setFeedItems(FALLBACK_ITEMS);
        setUsingFallback(true);
      } catch (err) {
        console.error('Failed to load traces:', err);
        setFeedItems(FALLBACK_ITEMS);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Reasoning Engine Logs</Text>
          {usingFallback && <Text style={styles.syncState}>Local preview feed</Text>}
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/logs')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.feedList}>
        {loading && feedItems.length === 0 ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          feedItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.feedItem}
              onPress={() => {
                if (!item.id.startsWith('fallback')) {
                  router.push({ pathname: '/logs/[id]', params: { id: item.id } });
                }
              }}
              activeOpacity={0.72}
            >
              <View style={styles.leftContent}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name={item.icon as any} size={20} color={colors.primary} />
                </View>
                <View style={styles.textContent}>
                  <Text style={styles.tag}>{item.tag}</Text>
                  <Text style={styles.message}>{item.message}</Text>
                </View>
              </View>
              <View style={styles.rightContent}>
                <Text style={styles.time}>{item.time}</Text>
                {!item.id.startsWith('fallback') && (
                  <MaterialIcons name="chevron-right" size={18} color={colors.onSurfaceVariant} />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
}

const getStyles = (colors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
  container: {
    marginHorizontal: 16,
    gap: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: colors.primary,
    letterSpacing: 0,
  },
  syncState: {
    marginTop: 2,
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 9,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  viewAll: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  feedList: {
    gap: 12,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: isDark ? '#2a2a2a' : '#d8dfdd',
    borderRadius: 8,
    padding: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    flex: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? '#101918' : 'rgba(0, 104, 95, 0.10)',
    borderWidth: 1,
    borderColor: isDark ? '#243231' : 'rgba(0, 104, 95, 0.18)',
  },
  textContent: {
    flex: 1,
    gap: 4,
  },
  tag: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 10,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  message: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 19,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 10,
  },
  time: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 10,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.3,
  },
});
