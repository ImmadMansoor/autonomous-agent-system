import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { TopAppBar } from '@/components/TopAppBar';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import Toast from 'react-native-toast-message';

const MATRIX_DOTS = Array.from({ length: 56 }, (_, index) => ({
  id: `analytics-dot-${index}`,
  left: (index % 8) * 16,
  top: Math.floor(index / 8) * 16,
  opacity: 0.08 + (index % 4) * 0.035,
}));

interface ThroughputDataPoint {
  id: string;
  label: string;
  signals: number;
  aiActions: number;
}

interface Signal {
  id: string;
  source: string;
  icon: 'public' | 'cloud' | 'forum' | 'inventory-2';
  title: string;
  description: string;
  timestamp: Date;
  status: 'parsed' | 'review' | 'automated';
}

interface Recommendation {
  id: string;
  signalType: string;
  signalTypeIcon: 'trending-up' | 'local-shipping' | 'shopping-cart';
  title: string;
  confidence: number;
  recommendation: string;
  description: string;
  status: 'pending' | 'executed' | 'dismissed';
}

const MOCK_THROUGHPUT: ThroughputDataPoint[] = [
  { id: 't1', label: '6AM', signals: 12, aiActions: 8 },
  { id: 't2', label: '8AM', signals: 28, aiActions: 18 },
  { id: 't3', label: '10AM', signals: 42, aiActions: 31 },
  { id: 't4', label: '12PM', signals: 55, aiActions: 40 },
  { id: 't5', label: '2PM', signals: 38, aiActions: 22 },
  { id: 't6', label: '4PM', signals: 48, aiActions: 35 },
  { id: 't7', label: '6PM', signals: 52, aiActions: 38 },
  { id: 't8', label: '8PM', signals: 30, aiActions: 20 },
];

const MOCK_SIGNALS: Signal[] = [
  { id: 'sig-1', source: 'Weather API', icon: 'cloud', title: 'Heat Wave Alert', description: 'Temperature forecast 95°F+ for weekend. Iced beverage demand expected to surge 22%.', timestamp: new Date(Date.now() - 12 * 60 * 1000), status: 'parsed' },
  { id: 'sig-2', source: 'Sales History', icon: 'public', title: 'Seasonal Pumpkin Spike', description: 'Historical data shows 34% higher conversion with combo pricing during October.', timestamp: new Date(Date.now() - 35 * 60 * 1000), status: 'parsed' },
  { id: 'sig-3', source: 'Supplier API', icon: 'inventory-2', title: 'Milk Supply Disruption', description: 'Central Dairy Co. flagged 24h delay. Critical stock levels at 3 branches.', timestamp: new Date(Date.now() - 55 * 60 * 1000), status: 'review' },
  { id: 'sig-4', source: 'IoT Sensors', icon: 'forum', title: 'Foot Traffic Dip', description: 'Unexpected 15% drop in walk-ins during last 90 minutes.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'automated' },
];

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  { id: 'rec-1', signalType: 'Pricing Signal', signalTypeIcon: 'trending-up', title: 'Adjust Iced Drink Pricing', confidence: 94, recommendation: 'Increase Iced Latte to $4.95 (+10%)', description: 'High demand + low competitor availability creates margin optimization opportunity.', status: 'pending' },
  { id: 'rec-2', signalType: 'Inventory Signal', signalTypeIcon: 'local-shipping', title: 'Switch Milk Supplier', confidence: 88, recommendation: 'Activate GreenValley backup for 48 hours', description: 'Current supplier delayed 24h. GreenValley has immediate capacity at 98% of contract pricing.', status: 'pending' },
  { id: 'rec-3', signalType: 'Menu Signal', signalTypeIcon: 'shopping-cart', title: 'Launch Pumpkin Combo', confidence: 91, recommendation: 'Add "Spiced Delight" combo at $7.25', description: 'Combo pricing historically drives 34% higher conversion in seasonal transitions.', status: 'pending' },
];

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return '#059669';
  if (confidence >= 75) return '#d97706';
  return '#dc2626';
}

function getStatusStyle(status: Signal['status']) {
  switch (status) {
    case 'parsed': return { label: 'AI Parsed', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' };
    case 'review': return { label: 'Needs Review', color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)' };
    case 'automated': return { label: 'Automated', color: '#00685f', bg: 'rgba(0, 104, 95, 0.12)' };
  }
}

function getSignalTypeColor(type: string): string {
  switch (type) {
    case 'Pricing Signal': return '#d97706';
    case 'Inventory Signal': return '#006f66';
    case 'Menu Signal': return '#00628d';
    default: return '#00685f';
  }
}

function getSourceIcon(name: string): keyof typeof MaterialIcons.glyphMap {
  switch (name) {
    case 'Weather API': return 'cloud';
    case 'Sales History': return 'public';
    case 'Supplier API': return 'inventory-2';
    case 'IoT Sensors': return 'forum';
    default: return 'notifications';
  }
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = getStyles(colors, isDark);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const safeBottom = insets.bottom > 0 ? insets.bottom : 24;
  const paddingBottom = safeBottom + 110;
  const chartWidth = Math.min(width - 88, 600);

  const [signals] = useState<Signal[]>(MOCK_SIGNALS);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS);
  const [isExecuting, setIsExecuting] = useState(false);

  const pendingRecommendations = useMemo(() => recommendations.filter((r) => r.status === 'pending'), [recommendations]);
  const newSignalsToday = signals.length;
  const avgConfidence = Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length);

  const selectedSignal = signals.find((s) => s.id === selectedSignalId);
  const activeContext = selectedSignal
    ? `Signal from ${selectedSignal.source}: "${selectedSignal.description}"`
    : 'Select a signal from the feed to view AI interpretation and recommendations.';

  const handleExecute = (id: string) => {
    setRecommendations((prev) => prev.map((r) => r.id === id ? { ...r, status: 'executed' as const } : r));
    Toast.show({ type: 'success', text1: 'Executed', text2: 'Recommendation applied successfully', position: 'top', visibilityTime: 2000 });
  };

  const handleDismiss = (id: string) => {
    setRecommendations((prev) => prev.map((r) => r.id === id ? { ...r, status: 'dismissed' as const } : r));
    Toast.show({ type: 'info', text1: 'Dismissed', text2: 'Recommendation dismissed', position: 'top', visibilityTime: 2000 });
  };

  const handleExecuteAll = async () => {
    setIsExecuting(true);
    await new Promise((r) => setTimeout(r, 800));
    setRecommendations((prev) => prev.map((r) => r.status === 'pending' ? { ...r, status: 'executed' as const } : r));
    setIsExecuting(false);
    Toast.show({ type: 'success', text1: 'All Executed', text2: `${pendingRecommendations.length} recommendations applied`, position: 'top', visibilityTime: 2000 });
  };

  const handleDismissAll = () => {
    setRecommendations((prev) => prev.map((r) => r.status === 'pending' ? { ...r, status: 'dismissed' as const } : r));
    Toast.show({ type: 'info', text1: 'All Dismissed', text2: 'Pending recommendations dismissed', position: 'top', visibilityTime: 2000 });
  };

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
      <TopAppBar title="Intelligence" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
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
                <Text style={styles.heroBadge}>Predictive Intelligence</Text>
              </View>
              <Text style={styles.heroTitle}>Signal Analytics{'\n'}Dashboard</Text>
              <Text style={styles.heroDescription}>
                AI monitoring {signals.length} active signals. {pendingRecommendations.length} recommendations pending review.
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{signals.length}</Text>
                  <Text style={styles.heroStatLabel}>Signals</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{pendingRecommendations.length}</Text>
                  <Text style={styles.heroStatLabel}>Pending</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{avgConfidence}%</Text>
                  <Text style={styles.heroStatLabel}>Confidence</Text>
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

        {/* System Throughput Chart */}
        <Animated.View style={animStyle(sectionIdx++)}>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartLabelRow}>
                <View style={styles.liveDot} />
                <Text style={styles.chartLabel}>Live Monitoring</Text>
              </View>
              <Text style={styles.chartTitle}>System Throughput</Text>
            </View>
            <LineChart
              data={{
                labels: MOCK_THROUGHPUT.map((d) => d.label),
                datasets: [
                  { data: MOCK_THROUGHPUT.map((d) => d.signals), color: () => '#00685f' },
                  { data: MOCK_THROUGHPUT.map((d) => d.aiActions), color: () => '#0284c7' },
                ],
                legend: ['Signals', 'AI Actions'],
              }}
              width={chartWidth}
              height={180}
              yAxisSuffix=""
              yAxisInterval={1}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: () => '#e2e8f0',
                labelColor: () => '#6e7977',
                propsForBackgroundLines: { stroke: '#eef2f6', strokeDasharray: '4' },
                propsForLabels: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 10 },
                fillShadowGradientFrom: '#00685f',
                fillShadowGradientTo: 'rgba(0, 104, 95, 0)',
                fillShadowGradientFromOpacity: 0.15,
                fillShadowGradientToOpacity: 0,
              }}
              bezier
              style={styles.chart}
            />
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#00685f' }]} />
                <Text style={styles.legendText}>Signals</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#0284c7' }]} />
                <Text style={styles.legendText}>AI Actions</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Signals Feed + AI Interpretation Panel */}
        <View style={styles.twoColumnLayout}>
          {/* Signals Feed */}
          <Animated.View style={[animStyle(sectionIdx++), styles.signalsColumn]}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <MaterialIcons name="rss-feed" size={18} color={Colors.light.primary} />
                  <Text style={styles.sectionTitle}>Ingested Signals</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{newSignalsToday} New Today</Text>
                </View>
              </View>
              <View style={styles.signalsList}>
                {signals.length === 0 ? (
                  <Text style={styles.emptyText}>No signals available</Text>
                ) : (
                  signals.map((signal) => {
                    const isSelected = selectedSignalId === signal.id;
                    const statusStyle = getStatusStyle(signal.status);
                    return (
                      <TouchableOpacity
                        key={signal.id}
                        style={[styles.signalCard, isSelected && styles.signalCardSelected]}
                        onPress={() => setSelectedSignalId(signal.id === selectedSignalId ? null : signal.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.signalTopRow}>
                          <View style={[styles.signalIconBox, { backgroundColor: `${getSignalTypeColor(signal.source === 'Weather API' ? 'Pricing Signal' : signal.source === 'Sales History' ? 'Menu Signal' : 'Inventory Signal')}15` }]}>
                            <MaterialIcons name={getSourceIcon(signal.source)} size={16} color={getSignalTypeColor(signal.source === 'Weather API' ? 'Pricing Signal' : signal.source === 'Sales History' ? 'Menu Signal' : 'Inventory Signal')} />
                          </View>
                          <View style={styles.signalInfo}>
                            <Text style={styles.signalSource}>{signal.source}</Text>
                            <Text style={styles.signalTimestamp}>{formatRelativeTime(signal.timestamp)}</Text>
                          </View>
                          <View style={[styles.signalStatusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.signalStatusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
                          </View>
                        </View>
                        <Text style={styles.signalTitle}>{signal.title}</Text>
                        <Text style={styles.signalDescription} numberOfLines={2}>{signal.description}</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>
          </Animated.View>

          {/* AI Interpretation Panel */}
          <Animated.View style={[animStyle(sectionIdx++), styles.interpretationColumn]}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <MaterialIcons name="psychology" size={18} color={Colors.light.primary} />
                  <Text style={styles.sectionTitle}>AI Interpretation</Text>
                </View>
                {avgConfidence > 0 && (
                  <View style={[styles.confidenceMiniBadge, { backgroundColor: `${getConfidenceColor(avgConfidence)}15` }]}>
                    <Text style={[styles.confidenceMiniText, { color: getConfidenceColor(avgConfidence) }]}>{avgConfidence}%</Text>
                  </View>
                )}
              </View>

              {/* Active Signal Context */}
              <View style={styles.contextBox}>
                <MaterialIcons name="format-quote" size={16} color={Colors.light.onSurfaceVariant} style={{ opacity: 0.4 }} />
                <Text style={styles.contextText}>{activeContext}</Text>
              </View>

              {/* Operational Impact */}
              {selectedSignal && (
                <View style={styles.impactRow}>
                  <View style={styles.impactCard}>
                    <Text style={styles.impactLabel}>Projected Traffic</Text>
                    <Text style={styles.impactValue}>+22%</Text>
                    <View style={styles.impactBar}>
                      <View style={[styles.impactBarFill, { width: '82%', backgroundColor: '#059669' }]} />
                    </View>
                  </View>
                  <View style={styles.impactCard}>
                    <Text style={styles.impactLabel}>Wait Time Risk</Text>
                    <View style={styles.impactValueRow}>
                      <Text style={[styles.impactValue, { color: '#d97706' }]}>Medium</Text>
                    </View>
                    <View style={styles.impactBar}>
                      <View style={[styles.impactBarFill, { width: '55%', backgroundColor: '#d97706' }]} />
                    </View>
                    <Text style={styles.impactDelay}>Est. delay: 4-7 min</Text>
                  </View>
                </View>
              )}

              {/* AI Recommendations */}
              <View style={styles.recsSection}>
                <Text style={styles.recsSectionTitle}>AI Recommendations</Text>
                {pendingRecommendations.length === 0 ? (
                  <View style={styles.emptyRecs}>
                    <MaterialIcons name="check-circle" size={24} color={Colors.light.secondary} />
                    <Text style={styles.emptyRecsText}>No pending recommendations</Text>
                  </View>
                ) : (
                  pendingRecommendations.map((rec) => {
                    const typeColor = getSignalTypeColor(rec.signalType);
                    return (
                      <View key={rec.id} style={styles.recCard}>
                        <View style={styles.recHeader}>
                          <View style={[styles.recTypeBadge, { backgroundColor: `${typeColor}15`, borderColor: `${typeColor}30` }]}>
                            <MaterialIcons name={rec.signalTypeIcon === 'trending-up' ? 'trending-up' : rec.signalTypeIcon === 'local-shipping' ? 'local-shipping' : 'shopping-cart'} size={14} color={typeColor} />
                            <Text style={[styles.recTypeText, { color: typeColor }]}>{rec.signalType}</Text>
                          </View>
                          <View style={[styles.recConfidence, { backgroundColor: `${getConfidenceColor(rec.confidence)}15` }]}>
                            <Text style={[styles.recConfidenceText, { color: getConfidenceColor(rec.confidence) }]}>{rec.confidence}%</Text>
                          </View>
                        </View>
                        <Text style={styles.recTitle}>{rec.title}</Text>
                        <Text style={styles.recDescription}>{rec.description}</Text>
                        <View style={[styles.recRecommendationBox, { backgroundColor: `${typeColor}10`, borderColor: `${typeColor}25` }]}>
                          <MaterialIcons name="lightbulb" size={14} color={typeColor} />
                          <Text style={[styles.recRecommendationText, { color: typeColor }]}>{rec.recommendation}</Text>
                        </View>
                        <View style={styles.recActions}>
                          <TouchableOpacity style={styles.recExecuteButton} onPress={() => handleExecute(rec.id)}>
                            <Text style={styles.recExecuteText}>Execute</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.recDismissButton} onPress={() => handleDismiss(rec.id)}>
                            <Text style={styles.recDismissText}>Dismiss</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {/* Bulk Actions */}
              {pendingRecommendations.length > 0 && (
                <View style={styles.bulkActions}>
                  <TouchableOpacity
                    style={[styles.bulkExecuteButton, isExecuting && { opacity: 0.6 }]}
                    onPress={handleExecuteAll}
                    disabled={isExecuting}
                  >
                    <MaterialIcons name={isExecuting ? 'hourglass-top' : 'done-all'} size={16} color="#ffffff" />
                    <Text style={styles.bulkExecuteText}>
                      {isExecuting ? 'Executing...' : `Execute All (${pendingRecommendations.length})`}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bulkDismissButton} onPress={handleDismissAll} disabled={isExecuting}>
                    <Text style={styles.bulkDismissText}>Dismiss All</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    marginTop: 120,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },

  // Hero Card
  heroCard: {
    borderRadius: 16,
    padding: 24,
    overflow: 'hidden',
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
    gap: 0,
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

  // Chart
  chartCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
  },
  chartLabel: {
    fontFamily: 'Doto_700Bold',
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  chartTitle: {
    fontFamily: 'Doto_800ExtraBold',
    fontSize: 20,
    color: colors.onSurface,
    letterSpacing: 0,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: 'Doto_700Bold',
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },

  // Two column layout
  twoColumnLayout: {
    gap: 20,
  },
  signalsColumn: {},
  interpretationColumn: {},

  // Section cards
  sectionCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f6',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Doto_700Bold',
    fontSize: 15,
    color: colors.onSurface,
  },
  countBadge: {
    backgroundColor: 'rgba(0, 104, 95, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  countBadgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceMiniBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceMiniText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 12,
  },

  // Signals Feed
  signalsList: {
    padding: 16,
    gap: 12,
  },
  signalCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    gap: 8,
  },
  signalCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 104, 95, 0.04)',
  },
  signalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signalIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signalInfo: {
    flex: 1,
  },
  signalSource: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: colors.onSurface,
  },
  signalTimestamp: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  signalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  signalStatusText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  signalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: colors.onSurface,
  },
  signalDescription: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: colors.onSurfaceVariant,
  },

  // Context box
  contextBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: colors.surfaceContainerLow,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  contextText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    flex: 1,
  },

  // Impact row
  impactRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  impactCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  impactLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  impactValue: {
    fontFamily: 'Doto_700Bold',
    fontSize: 20,
    color: colors.primary,
    letterSpacing: 0,
  },
  impactValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  impactBar: {
    height: 4,
    backgroundColor: 'rgba(190, 201, 198, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  impactBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  impactDelay: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },

  // Recommendations
  recsSection: {
    padding: 16,
    gap: 12,
  },
  recsSectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyRecs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  emptyRecsText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  recCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  recTypeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  recConfidence: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recConfidenceText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 11,
  },
  recTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: colors.onSurface,
  },
  recDescription: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: colors.onSurfaceVariant,
  },
  recRecommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  recRecommendationText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    flex: 1,
  },
  recActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  recExecuteButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  recExecuteText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recDismissButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(110, 121, 119, 0.3)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  recDismissText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Bulk actions
  bulkActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingTop: 0,
  },
  bulkExecuteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bulkExecuteText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bulkDismissButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(110, 121, 119, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulkDismissText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
