import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TopAppBar } from '@/components/TopAppBar';
import Toast from 'react-native-toast-message';

const MATRIX_DOTS = Array.from({ length: 56 }, (_, index) => ({
  id: `approvals-dot-${index}`,
  left: (index % 8) * 16,
  top: Math.floor(index / 8) * 16,
  opacity: 0.08 + (index % 4) * 0.035,
}));

interface ContextItem {
  label: string;
  value: string;
  progress: number;
  isHigh?: boolean;
}

interface ApprovalItem {
  id: string;
  signalType: 'Pricing Signal' | 'Inventory Signal' | 'Menu Signal';
  title: string;
  confidence: number;
  recommendation: string;
  recommendationIcon: 'trending_up' | 'local_shipping' | 'shopping_cart';
  description: string;
  context?: ContextItem[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

interface RecentApproval {
  id: string;
  title: string;
  action: 'approved' | 'rejected';
  user: string;
  timestamp: Date;
}

function getMockApprovalsData() {
  const now = new Date();
  return {
    pendingApprovals: [
      {
        id: 'appr-1',
        signalType: 'Pricing Signal' as const,
        title: 'Competitor "Daily Brew" raised prices by 15%',
        confidence: 94,
        recommendation: 'Increase Signature Blend to $4.75 (+10%)',
        recommendationIcon: 'trending_up' as const,
        description: 'High local demand, competitor inventory low, margin optimization potential.',
        context: [
          { label: 'Demand Context', value: 'High', progress: 88, isHigh: true },
          { label: 'Competitor Inventory', value: 'Low', progress: 20, isHigh: false },
          { label: 'Margin Impact', value: '+12.4%', progress: 100, isHigh: true },
        ],
        status: 'pending' as const,
        createdAt: new Date(now.getTime() - 15 * 60 * 1000),
      },
      {
        id: 'appr-2',
        signalType: 'Inventory Signal' as const,
        title: 'Milk supply chain disruption in Northern District',
        confidence: 88,
        recommendation: 'Switch to "GreenValley" backup for 48 hours',
        recommendationIcon: 'local_shipping' as const,
        description: 'Current supplier delayed 24h, stock levels critical at 3 branches, GreenValley has immediate capacity.',
        context: [
          { label: 'Current Stock', value: 'Critical', progress: 15, isHigh: false },
          { label: 'Supplier Delay', value: '24h', progress: 80, isHigh: true },
          { label: 'Backup Available', value: 'Yes', progress: 100, isHigh: true },
        ],
        status: 'pending' as const,
        createdAt: new Date(now.getTime() - 35 * 60 * 1000),
      },
      {
        id: 'appr-3',
        signalType: 'Menu Signal' as const,
        title: 'Seasonal Pumpkin Spice latte demand spike detected',
        confidence: 91,
        recommendation: 'Add "Spiced Delight" combo at $7.25',
        recommendationIcon: 'shopping_cart' as const,
        description: 'Historical data shows 34% higher conversion with combo pricing during October.',
        context: [
          { label: 'Demand Trend', value: '+34%', progress: 85, isHigh: true },
          { label: 'Inventory Ready', value: 'Yes', progress: 100, isHigh: true },
          { label: 'Margin Impact', value: '+8.2%', progress: 75, isHigh: true },
        ],
        status: 'pending' as const,
        createdAt: new Date(now.getTime() - 55 * 60 * 1000),
      },
      {
        id: 'appr-4',
        signalType: 'Pricing Signal' as const,
        title: 'Weather alert: Heat wave expected this weekend',
        confidence: 96,
        recommendation: 'Launch "Cool Down" promotion - 15% off iced drinks',
        recommendationIcon: 'trending_up' as const,
        description: 'Temperature forecast shows 95°F+ for 3 days. Historical data suggests 22% increase in iced beverage demand.',
        context: [
          { label: 'Forecast', value: '95°F', progress: 95, isHigh: true },
          { label: 'Duration', value: '3 Days', progress: 60, isHigh: false },
          { label: 'Expected Lift', value: '+22%', progress: 90, isHigh: true },
        ],
        status: 'pending' as const,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
    ],
    recentApprovals: [
      { id: 'rec-1', title: 'Holiday Bonus Plan', action: 'approved' as const, user: 'you', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
      { id: 'rec-2', title: 'Pastry Order Adjustment', action: 'approved' as const, user: 'Sarah K.', timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
      { id: 'rec-3', title: 'Discount Code: LATE10', action: 'rejected' as const, user: 'you', timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    ],
  };
}

type FilterType = 'all' | 'pricing' | 'inventory' | 'menu';

function getSignalStyle(signalType: ApprovalItem['signalType'], isDark = false) {
  switch (signalType) {
    case 'Pricing Signal':
      return {
        color: isDark ? '#f59e0b' : '#d97706',
        bg: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.15)',
        border: isDark ? 'rgba(245, 158, 11, 0.36)' : '#d97706',
        icon: 'attach-money' as const,
      };
    case 'Inventory Signal':
      return {
        color: isDark ? '#35d6c5' : '#006f66',
        bg: isDark ? 'rgba(53, 214, 197, 0.10)' : 'rgba(0, 111, 102, 0.15)',
        border: isDark ? 'rgba(53, 214, 197, 0.34)' : '#006f66',
        icon: 'inventory-2' as const,
      };
    case 'Menu Signal':
      return {
        color: isDark ? '#38bdf8' : '#00628d',
        bg: isDark ? 'rgba(56, 189, 248, 0.10)' : 'rgba(0, 98, 141, 0.15)',
        border: isDark ? 'rgba(56, 189, 248, 0.32)' : '#00628d',
        icon: 'restaurant-menu' as const,
      };
  }
}

function getCardGradient(signalType: ApprovalItem['signalType'], isDark: boolean): readonly [string, string] {
  if (isDark) {
    switch (signalType) {
      case 'Pricing Signal': return ['rgba(35, 26, 14, 0.96)', 'rgba(9, 9, 9, 0.98)'] as const;
      case 'Inventory Signal': return ['rgba(10, 35, 32, 0.96)', 'rgba(8, 8, 8, 0.98)'] as const;
      case 'Menu Signal': return ['rgba(10, 28, 38, 0.96)', 'rgba(8, 8, 8, 0.98)'] as const;
    }
  }

  switch (signalType) {
    case 'Pricing Signal': return ['rgba(217, 119, 6, 0.09)', 'rgba(250, 250, 248, 1.0)'] as const;
    case 'Inventory Signal': return ['rgba(147, 228, 216, 0.15)', 'rgba(250, 252, 251, 1.0)'] as const;
    case 'Menu Signal': return ['rgba(0, 98, 141, 0.08)', 'rgba(249, 251, 252, 1.0)'] as const;
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export default function ApprovalsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = getStyles(colors, isDark);
  const insets = useSafeAreaInsets();
  const safeBottom = insets.bottom > 0 ? insets.bottom : 24;
  const paddingBottom = safeBottom + 110;

  const mockData = useMemo(() => getMockApprovalsData(), []);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>(mockData.pendingApprovals);
  const [recentApprovals, setRecentApprovals] = useState<RecentApproval[]>(mockData.recentApprovals);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApprovals = useMemo(() => {
    return pendingApprovals.filter((item) => {
      if (selectedFilter !== 'all') {
        const filterMap: Record<FilterType, string> = { all: '', pricing: 'Pricing Signal', inventory: 'Inventory Signal', menu: 'Menu Signal' };
        if (item.signalType !== filterMap[selectedFilter]) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [pendingApprovals, selectedFilter, searchQuery]);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    const item = pendingApprovals.find((i) => i.id === id);
    if (!item) return;

    setPendingApprovals((prev) => prev.filter((i) => i.id !== id));
    setRecentApprovals((prev) => [
      { id: `rec-${Date.now()}`, title: item.title, action: (action === 'approve' ? 'approved' : 'rejected') as 'approved' | 'rejected', user: 'you', timestamp: new Date() },
      ...prev,
    ].slice(0, 10));

    Toast.show({
      type: action === 'approve' ? 'success' : 'info',
      text1: action === 'approve' ? 'Approved' : 'Rejected',
      text2: item.title,
      position: 'top',
      visibilityTime: 2500,
    });
  };

  const handleApproveAll = () => {
    const highConfidence = pendingApprovals.filter((item) => item.confidence >= 90);
    if (highConfidence.length === 0) {
      Toast.show({ type: 'info', text1: 'No items', text2: 'No high-confidence approvals to process', position: 'top', visibilityTime: 2000 });
      return;
    }
    highConfidence.forEach((item) => handleAction(item.id, 'approve'));
  };

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'menu', label: 'Menu' },
  ];

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
      <TopAppBar title="Approvals" />

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
                <Text style={styles.heroBadge}>Approval Queue</Text>
              </View>
              <Text style={styles.heroTitle}>Decision{'\n'}Management</Text>
              <Text style={styles.heroDescription}>
                AI-generated recommendations awaiting your review. High-confidence items can be approved in bulk.
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{pendingApprovals.length}</Text>
                  <Text style={styles.heroStatLabel}>Pending</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{recentApprovals.filter((r) => r.action === 'approved').length}</Text>
                  <Text style={styles.heroStatLabel}>Approved</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{Math.round(pendingApprovals.reduce((s, i) => s + i.confidence, 0) / Math.max(1, pendingApprovals.length))}%</Text>
                  <Text style={styles.heroStatLabel}>Avg Conf</Text>
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

        {/* Search */}
        <Animated.View style={animStyle(sectionIdx++)}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={18} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search approvals..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </Animated.View>

        {/* Filter Chips */}
        <Animated.View style={animStyle(sectionIdx++)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
            {filterOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.filterChip, selectedFilter === opt.key && styles.filterChipActive]}
                onPress={() => setSelectedFilter(opt.key)}
              >
                <Text style={[styles.filterText, selectedFilter === opt.key && styles.filterTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Approval Cards */}
        {filteredApprovals.length === 0 ? (
          <Animated.View key="empty" style={animStyle(sectionIdx++)}>
            <View style={styles.emptyContainer}>
              <MaterialIcons name="done-all" size={48} color={colors.secondary} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyTitle}>No Approvals</Text>
              <Text style={styles.emptyText}>All items have been processed!</Text>
            </View>
          </Animated.View>
        ) : (
          filteredApprovals.map((item) => {
            const idx = sectionIdx++;
            const signalStyle = getSignalStyle(item.signalType, isDark);
            return (
              <Animated.View key={item.id} style={animStyle(idx)}>
                <LinearGradient colors={getCardGradient(item.signalType, isDark)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
                  {/* Header: Badge + Confidence */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.signalBadge, { backgroundColor: signalStyle.bg, borderColor: signalStyle.border }]}>
                      <MaterialIcons name={signalStyle.icon} size={14} color={signalStyle.color} />
                      <Text style={[styles.signalBadgeText, { color: signalStyle.color }]}>{item.signalType}</Text>
                    </View>
                    <View style={styles.confidencePill}>
                      <Text style={[styles.confidencePillText, { color: item.confidence >= 90 ? '#059669' : '#d97706' }]}>
                        {item.confidence}%
                      </Text>
                    </View>
                  </View>

                  {/* Title */}
                  <Text style={styles.cardTitle}>{item.title}</Text>

                  {/* Description */}
                  <Text style={styles.cardDescription}>{item.description}</Text>

                  {/* Context Bars */}
                  {item.context && item.context.length > 0 && (
                    <View style={styles.contextGrid}>
                      {item.context.map((ctx) => (
                        <View key={ctx.label} style={styles.contextItem}>
                          <View style={styles.contextHeader}>
                            <Text style={[styles.contextLabel, ctx.isHigh && { color: signalStyle.color }]}>{ctx.label}</Text>
                            <Text style={[styles.contextValue, ctx.isHigh && { color: signalStyle.color }]}>{ctx.value}</Text>
                          </View>
                          <View style={styles.contextTrack}>
                            <View style={[styles.contextFill, { width: `${ctx.progress}%`, backgroundColor: ctx.isHigh ? signalStyle.color : colors.onSurfaceVariant }]} />
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Recommendation */}
                  <View style={[styles.recommendationBox, { backgroundColor: `${signalStyle.color}10`, borderColor: `${signalStyle.color}25` }]}>
                    <MaterialIcons name={item.recommendationIcon === 'trending_up' ? 'trending-up' : item.recommendationIcon === 'local_shipping' ? 'local-shipping' : 'shopping-cart'} size={18} color={signalStyle.color} />
                    <Text style={[styles.recommendationText, { color: signalStyle.color }]}>{item.recommendation}</Text>
                  </View>

                  {/* View Details */}
                  <TouchableOpacity style={styles.viewDetailsButton} onPress={() => router.push({ pathname: '/approvals/[id]', params: { id: item.id } })}>
                    <MaterialIcons name="open-in-new" size={16} color={colors.primary} />
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <MaterialIcons name="chevron-right" size={16} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>

                  {/* Actions */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.approveButton} onPress={() => handleAction(item.id, 'approve')}>
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectButton} onPress={() => handleAction(item.id, 'reject')}>
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </Animated.View>
            );
          })
        )}

        {/* Bulk Action */}
        {pendingApprovals.length > 0 && (
          <Animated.View style={animStyle(sectionIdx++)}>
            <View style={styles.bulkActionContainer}>
              <TouchableOpacity style={styles.bulkActionButton} onPress={handleApproveAll}>
                <MaterialIcons name="done-all" size={18} color={colors.primary} />
                <Text style={styles.bulkActionText}>Approve All High-Confidence</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
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
    paddingTop: 20,
  },
  heroCard: {
    borderRadius: 14,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.55)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0 : 0.18,
    shadowRadius: 18,
    elevation: isDark ? 0 : 5,
    marginBottom: 32,
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
    backgroundColor: '#ff003c',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#050505' : colors.surfaceContainer,
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 28,
    gap: 10,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(190, 201, 198, 0.24)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.05,
    shadowRadius: 8,
    elevation: isDark ? 0 : 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: colors.onSurface,
    paddingVertical: 0,
  },
  filterScroll: {
    marginBottom: 32,
    overflow: 'visible',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.56)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(190, 201, 198, 0.34)',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isDark ? 0.16 : 0.25,
    shadowRadius: 12,
    elevation: isDark ? 0 : 3,
  },
  filterText: {
    fontFamily: 'Doto_700Bold',
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  card: {
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 78, 71, 0.1)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  signalBadgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  confidencePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
  },
  confidencePillText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 13,
  },
  cardTitle: {
    fontFamily: 'Doto_700Bold',
    fontSize: 20,
    color: colors.onSurface,
    letterSpacing: 0,
    marginBottom: 12,
  },
  cardDescription: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceVariant,
    marginBottom: 18,
  },
  contextGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  contextItem: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.64)',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.68)',
  },
  contextHeader: {
    gap: 2,
  },
  contextLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  contextValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: colors.onSurface,
  },
  contextTrack: {
    height: 4,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(190, 201, 198, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  contextFill: {
    height: '100%',
    borderRadius: 2,
    opacity: 0.7,
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  recommendationText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    flex: 1,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(190, 201, 198, 0.12)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(190, 201, 198, 0.14)',
    borderRadius: 10,
  },
  viewDetailsText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: colors.primary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.12 : 0.2,
    shadowRadius: 8,
    elevation: isDark ? 0 : 4,
  },
  approveButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(110, 121, 119, 0.3)',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: colors.primary,
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  bulkActionContainer: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.13)' : 'rgba(190, 201, 198, 0.3)',
    borderRadius: 100,
  },
  bulkActionText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
});
