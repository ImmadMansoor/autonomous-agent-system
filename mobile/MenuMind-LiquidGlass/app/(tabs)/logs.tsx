import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar as RNStatusBar,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TopAppBar } from '@/components/TopAppBar';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MATRIX_DOTS = Array.from({ length: 56 }, (_, index) => ({
  id: `logs-dot-${index}`,
  left: (index % 8) * 16,
  top: Math.floor(index / 8) * 16,
  opacity: 0.08 + (index % 4) * 0.035,
}));

type LogCategory = 'pricing' | 'inventory' | 'staffing';

interface LogItem {
  id: string;
  icon: 'attach-money' | 'inventory-2' | 'group';
  title: string;
  timeAgo: string;
  confidence: number;
  description: string;
  sources: string[];
  latency: string;
  model: string;
  traceId: string;
  vector: string;
  category: LogCategory;
}

const AI_LOGS: LogItem[] = [
  {
    id: 'l1',
    icon: 'attach-money',
    title: 'Surge Pricing Triggered',
    timeAgo: '2m ago',
    confidence: 94,
    description: 'Predicted 20% traffic surge based on local event data (City Marathon) and current sunny weather trajectory.',
    sources: ['Weather API', 'Local Events'],
    latency: '124ms',
    model: 'v2.4-stable',
    traceId: '8f2-11ea-96b2',
    vector: '[0.12, -0.45, 0.89...]',
    category: 'pricing',
  },
  {
    id: 'l2',
    icon: 'inventory-2',
    title: 'Pre-order: Fresh Salmon',
    timeAgo: '45m ago',
    confidence: 88,
    description: 'High probability of stock-out by Friday evening based on consumption velocity and supplier lead times.',
    sources: ['Sales History', 'Supplier API'],
    latency: '89ms',
    model: 'v2.4-stable',
    traceId: '3a1-42cd-bc39',
    vector: '[0.34, 0.11, -0.22...]',
    category: 'inventory',
  },
  {
    id: 'l3',
    icon: 'group',
    title: 'Early Shift Dismissal',
    timeAgo: '1h ago',
    confidence: 76,
    description: 'Unexpected dip in walk-ins during the last 90 minutes. Recommending staff reduction for 2 server nodes to optimize labor cost.',
    sources: ['IoT Sensors', 'POS Logs'],
    latency: '156ms',
    model: 'v2.4-stable',
    traceId: '1e9-92ff-0104',
    vector: '[-0.05, 0.67, 0.12...]',
    category: 'staffing',
  },
  {
    id: 'l4',
    icon: 'inventory-2',
    title: 'Automated Supplier Reorder',
    timeAgo: '2h ago',
    confidence: 99,
    description: 'Daily par level check triggered auto-reorder for 15kg Espresso Beans. Supplier lead time: 48hrs.',
    sources: ['POS Logs', 'Supplier API'],
    latency: '67ms',
    model: 'v2.3-stable',
    traceId: '4b7-83aa-df12',
    vector: '[0.91, -0.23, 0.45...]',
    category: 'inventory',
  },
  {
    id: 'l5',
    icon: 'attach-money',
    title: 'Happy Hour Optimization',
    timeAgo: '3h ago',
    confidence: 82,
    description: 'Adjusted happy hour discount from 15% to 12% based on margin analysis and footfall projection.',
    sources: ['Sales History', 'Weather API'],
    latency: '142ms',
    model: 'v2.4-stable',
    traceId: '2c5-67fb-8910',
    vector: '[-0.78, 0.33, -0.12...]',
    category: 'pricing',
  },
];

const CATEGORY_COLORS: Record<LogCategory, string> = {
  pricing: '#d97706',
  inventory: '#00685f',
  staffing: '#0284c7',
};

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return '#059669';
  if (confidence >= 75) return '#d97706';
  return '#dc2626';
}

export default function LogsScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = getStyles(colors, isDark);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const statusBarHeight = RNStatusBar.currentHeight || 0;
  const safeTop = insets.top > 0 ? insets.top : statusBarHeight > 0 ? statusBarHeight : 24;
  const paddingTop = safeTop + 72;
  const safeBottom = insets.bottom > 0 ? insets.bottom : 24;
  const paddingBottom = safeBottom + 110;

  const [selectedFilter, setSelectedFilter] = useState<'all' | LogCategory>('all');
  const router = useRouter();

  const filteredLogs = AI_LOGS.filter(
    (log) => selectedFilter === 'all' || log.category === selectedFilter
  );

  const SECTION_ANIM_COUNT = 12;
  const opacity = useRef(Array.from({ length: SECTION_ANIM_COUNT }, () => new Animated.Value(0))).current;
  const translateY = useRef(Array.from({ length: SECTION_ANIM_COUNT }, () => new Animated.Value(24))).current;

  useEffect(() => {
    Animated.stagger(
      100,
      opacity.map((o, i) =>
        Animated.parallel([
          Animated.timing(o, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(translateY[i], { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      )
    ).start();
  }, []);

  function animStyle(i: number) {
    return { opacity: opacity[i], transform: [{ translateY: translateY[i] }] };
  }

  let sectionIdx = 0;

  return (
    <View style={styles.container}>
      <TopAppBar title="AI Logs" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop, paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveWrapper}>
          {/* Hero Card */}
          <Animated.View style={animStyle(sectionIdx++)}>
          <LinearGradient
            colors={['#00685f', '#004d47']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroLabelRow}>
                <View style={styles.heroDot} />
                <Text style={styles.heroBadge}>Decision Transparency</Text>
              </View>
              <Text style={styles.heroTitle}>Core Intelligence{'\n'}Logs</Text>
              <Text style={styles.heroDescription}>
                Real-time trace of all AI decisions. Our neural network processes over 150 data points to generate precise operational triggers.
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{AI_LOGS.length}</Text>
                  <Text style={styles.heroStatLabel}>Total</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{new Set(AI_LOGS.map((l) => l.category)).size}</Text>
                  <Text style={styles.heroStatLabel}>Categories</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{Math.max(...AI_LOGS.map((l) => l.confidence))}%</Text>
                  <Text style={styles.heroStatLabel}>Best</Text>
                </View>
              </View>
            </View>
            <View style={styles.heroPattern} pointerEvents="none">
              {MATRIX_DOTS.map((dot) => (
                <View
                  key={dot.id}
                  style={[styles.heroPatternDot, { left: dot.left, top: dot.top, opacity: dot.opacity }]}
                />
              ))}
            </View>
          </LinearGradient>
          </Animated.View>

          {/* Filter Chips */}
          <Animated.View style={animStyle(sectionIdx++)}>
          <View style={styles.chipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {(['all', 'inventory', 'pricing', 'staffing'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.chip, selectedFilter === filter && styles.chipActive]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={[styles.chipText, selectedFilter === filter && styles.chipTextActive]}>
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          </Animated.View>

          {/* Log Cards */}
          <Animated.View style={animStyle(sectionIdx++)}>
          <View style={styles.logsContainer}>
            {filteredLogs.map((log) => {
              const categoryColor = CATEGORY_COLORS[log.category];
              return (
                <TouchableOpacity
                  key={log.id}
                  style={styles.logCard}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/logs/[id]', params: { id: log.id } })}
                >
                  {/* Top Row: Icon + Title + Time */}
                  <View style={styles.logTopRow}>
                    <View style={[styles.logIconContainer, { backgroundColor: `${categoryColor}15` }]}>
                      <MaterialIcons name={log.icon} size={22} color={categoryColor} />
                    </View>
                    <View style={styles.logTitleContainer}>
                      <Text style={styles.logTitle}>{log.title}</Text>
                      <Text style={styles.logTime}>{log.timeAgo}</Text>
                    </View>
                    <View style={[styles.confidenceBadge, { backgroundColor: `${getConfidenceColor(log.confidence)}15` }]}>
                      <Text style={[styles.confidenceText, { color: getConfidenceColor(log.confidence) }]}>
                        {log.confidence}%
                      </Text>
                      <Text style={[styles.confidenceLabel, { color: getConfidenceColor(log.confidence) }]}>
                        Confidence
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  <View style={styles.logDescriptionContainer}>
                    <Text style={styles.logDescription}>"{log.description}"</Text>
                  </View>

                  {/* Source Chips */}
                  <View style={styles.sourcesRow}>
                    {log.sources.map((source) => (
                      <View key={source} style={[styles.sourceChip, { backgroundColor: `${categoryColor}10`, borderColor: `${categoryColor}30` }]}>
                        <Text style={[styles.sourceChipText, { color: categoryColor }]}>{source}</Text>
                      </View>
                    ))}
                  </View>

                  {/* View Details */}
                  <View style={styles.viewDetailsRow}>
                    <MaterialIcons name="open-in-new" size={14} color={colors.primary} />
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <MaterialIcons name="chevron-right" size={14} color={colors.onSurfaceVariant} />
                  </View>

                  {/* Divider */}
                  <View style={styles.logDivider} />

                  {/* Metadata Row */}
                  <View style={styles.metadataRow}>
                    <View style={styles.metadataItem}>
                      <Text style={styles.metadataLabel}>LATENCY</Text>
                      <Text style={styles.metadataValue}>{log.latency}</Text>
                    </View>
                    <View style={styles.metadataDot} />
                    <View style={styles.metadataItem}>
                      <Text style={styles.metadataLabel}>MODEL</Text>
                      <Text style={styles.metadataValue}>{log.model}</Text>
                    </View>
                  </View>

                  {/* Trace Row */}
                  <View style={styles.traceRow}>
                    <Text style={styles.traceText}>
                      TRACE_ID: <Text style={styles.traceValue}>{log.traceId}</Text>
                    </Text>
                    <Text style={styles.traceDivider}>|</Text>
                    <Text style={styles.traceText}>
                      VECTOR: <Text style={styles.traceValue}>{log.vector}</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 800,
    gap: 24,
    paddingHorizontal: 16,
  },

  // Hero Card
  heroCard: {
    borderRadius: 16,
    padding: 24,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  heroContent: {
    gap: 12,
    zIndex: 1,
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  heroBadge: {
    fontFamily: 'Doto_700Bold',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: 'Doto_800ExtraBold',
    fontSize: 24,
    color: '#ffffff',
    lineHeight: 28,
    letterSpacing: 0,
  },
  heroDescription: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontFamily: 'Doto_800ExtraBold',
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: 0,
  },
  heroStatLabel: {
    fontFamily: 'Doto_700Bold',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroPattern: {
    position: 'absolute',
    top: 18,
    right: 10,
    width: 128,
    height: 112,
    opacity: 0.58,
  },
  heroPatternDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ffffff',
  },

  // Filter Chips
  chipsContainer: {
    paddingVertical: 4,
  },
  chipsScroll: {
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: 'Doto_700Bold',
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  chipTextActive: {
    color: '#ffffff',
  },

  // Log Cards
  logsContainer: {
    gap: 16,
  },
  logCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  logTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logTitleContainer: {
    flex: 1,
  },
  logTitle: {
    fontFamily: 'Doto_700Bold',
    fontSize: 15,
    color: colors.onSurface,
  },
  logTime: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    opacity: 0.7,
  },
  confidenceBadge: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 60,
  },
  confidenceText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 16,
  },
  confidenceLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  logDescriptionContainer: {
    marginTop: 14,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 14,
  },
  logDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  sourcesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  sourceChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  sourceChipText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: 'rgba(190, 201, 198, 0.1)',
    borderRadius: 8,
  },
  viewDetailsText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: colors.primary,
  },
  logDivider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    opacity: 0.5,
    marginVertical: 14,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  metadataValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: colors.onSurface,
  },
  metadataDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.onSurfaceVariant,
    opacity: 0.4,
  },
  traceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  traceText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: colors.onSurfaceVariant,
    opacity: 0.5,
  },
  traceValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.onSurface,
    opacity: 0.7,
  },
  traceDivider: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: colors.onSurfaceVariant,
    opacity: 0.3,
  },
});
