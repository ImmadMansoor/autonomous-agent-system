import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import Toast from 'react-native-toast-message';

interface ContextItem {
  label: string;
  value: string;
  progress: number;
  isHigh?: boolean;
}

interface ApprovalDetail {
  signalType: 'Pricing Signal' | 'Inventory Signal' | 'Menu Signal';
  title: string;
  confidence: number;
  recommendation: string;
  recommendationIcon: 'trending_up' | 'local_shipping' | 'shopping_cart';
  description: string;
  context: ContextItem[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  id: string;
}

const MOCK_APPROVALS: Record<string, ApprovalDetail> = {
  'appr-1': {
    id: 'appr-1',
    signalType: 'Pricing Signal',
    title: 'Competitor "Daily Brew" raised prices by 15%',
    confidence: 94,
    recommendation: 'Increase Signature Blend to $4.75 (+10%)',
    recommendationIcon: 'trending_up',
    description: 'High local demand, competitor inventory low, margin optimization potential.',
    context: [
      { label: 'Demand Context', value: 'High', progress: 88, isHigh: true },
      { label: 'Competitor Inventory', value: 'Low', progress: 20, isHigh: false },
      { label: 'Margin Impact', value: '+12.4%', progress: 100, isHigh: true },
    ],
    status: 'pending',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  'appr-2': {
    id: 'appr-2',
    signalType: 'Inventory Signal',
    title: 'Milk supply chain disruption in Northern District',
    confidence: 88,
    recommendation: 'Switch to "GreenValley" backup for 48 hours',
    recommendationIcon: 'local_shipping',
    description: 'Current supplier delayed 24h, stock levels critical at 3 branches, GreenValley has immediate capacity.',
    context: [
      { label: 'Current Stock', value: 'Critical', progress: 15, isHigh: false },
      { label: 'Supplier Delay', value: '24h', progress: 80, isHigh: true },
      { label: 'Backup Available', value: 'Yes', progress: 100, isHigh: true },
    ],
    status: 'pending',
    createdAt: new Date(Date.now() - 35 * 60 * 1000),
  },
  'appr-3': {
    id: 'appr-3',
    signalType: 'Menu Signal',
    title: 'Seasonal Pumpkin Spice latte demand spike detected',
    confidence: 91,
    recommendation: 'Add "Spiced Delight" combo at $7.25',
    recommendationIcon: 'shopping_cart',
    description: 'Historical data shows 34% higher conversion with combo pricing during October.',
    context: [
      { label: 'Demand Trend', value: '+34%', progress: 85, isHigh: true },
      { label: 'Inventory Ready', value: 'Yes', progress: 100, isHigh: true },
      { label: 'Margin Impact', value: '+8.2%', progress: 75, isHigh: true },
    ],
    status: 'pending',
    createdAt: new Date(Date.now() - 55 * 60 * 1000),
  },
  'appr-4': {
    id: 'appr-4',
    signalType: 'Pricing Signal',
    title: 'Weather alert: Heat wave expected this weekend',
    confidence: 96,
    recommendation: 'Launch "Cool Down" promotion - 15% off iced drinks',
    recommendationIcon: 'trending_up',
    description: 'Temperature forecast shows 95°F+ for 3 days. Historical data suggests 22% increase in iced beverage demand.',
    context: [
      { label: 'Forecast', value: '95°F', progress: 95, isHigh: true },
      { label: 'Duration', value: '3 Days', progress: 60, isHigh: false },
      { label: 'Expected Lift', value: '+22%', progress: 90, isHigh: true },
    ],
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
};

function getSignalStyle(signalType: ApprovalDetail['signalType']) {
  switch (signalType) {
    case 'Pricing Signal':
      return { color: '#d97706', bg: 'rgba(217, 119, 6, 0.15)', border: '#d97706', icon: 'attach-money' as const };
    case 'Inventory Signal':
      return { color: '#006f66', bg: 'rgba(0, 111, 102, 0.15)', border: '#006f66', icon: 'inventory-2' as const };
    case 'Menu Signal':
      return { color: '#00628d', bg: 'rgba(0, 98, 141, 0.15)', border: '#00628d', icon: 'restaurant-menu' as const };
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return '#059669';
  if (confidence >= 75) return '#d97706';
  return '#dc2626';
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

export default function ApprovalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarHeight = RNStatusBar.currentHeight || 0;
  const safeTop = insets.top > 0 ? insets.top : statusBarHeight > 0 ? statusBarHeight : 24;
  const safeBottom = insets.bottom > 0 ? insets.bottom : 24;

  const detail = id ? MOCK_APPROVALS[id] : undefined;
  const signalStyle = detail ? getSignalStyle(detail.signalType) : undefined;

  if (!detail || !signalStyle) {
    return (
      <View style={[styles.container, { paddingTop: safeTop }]}>
        <View style={styles.backRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.light.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <MaterialIcons name="search-off" size={48} color={Colors.light.onSurfaceVariant} />
          <Text style={styles.notFoundText}>Approval not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.light.primary} />
          <Text style={styles.backText}>Back to Approvals</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: safeBottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={[styles.headerCard, { borderColor: signalStyle.color }]}>
          <View style={styles.headerTopRow}>
            <View style={[styles.typeBadge, { backgroundColor: `${signalStyle.color}18` }]}>
              <MaterialIcons name={signalStyle.icon} size={16} color={signalStyle.color} />
              <Text style={[styles.typeText, { color: signalStyle.color }]}>{detail.signalType}</Text>
            </View>
            <View style={styles.timeRow}>
              <MaterialIcons name="access-time" size={14} color={Colors.light.onSurfaceVariant} />
              <Text style={styles.timeText}>{formatRelativeTime(detail.createdAt)}</Text>
            </View>
          </View>

          <Text style={styles.headerTitle}>{detail.title}</Text>
          <Text style={styles.headerDescription}>{detail.description}</Text>

          {/* Confidence Bar */}
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceHeader}>
              <MaterialIcons name="analytics" size={18} color={Colors.light.primary} />
              <Text style={styles.confidenceLabel}>Confidence Score</Text>
              <Text style={[styles.confidenceValue, { color: getConfidenceColor(detail.confidence) }]}>
                {detail.confidence}%
              </Text>
            </View>
            <View style={styles.confidenceTrack}>
              <View style={[styles.confidenceFill, { width: `${detail.confidence}%`, backgroundColor: getConfidenceColor(detail.confidence) }]} />
            </View>
          </View>
        </View>

        {/* Status Card */}
        <View style={styles.detailCard}>
          <View style={styles.detailCardHeader}>
            <MaterialIcons name="info" size={18} color={Colors.light.primary} />
            <Text style={styles.detailCardTitle}>Status</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, {
              backgroundColor: detail.status === 'approved' ? 'rgba(5, 150, 105, 0.12)' :
                detail.status === 'rejected' ? 'rgba(220, 38, 38, 0.12)' :
                'rgba(217, 119, 6, 0.12)',
            }]}>
              <Text style={[styles.statusText, {
                color: detail.status === 'approved' ? '#059669' :
                  detail.status === 'rejected' ? '#dc2626' : '#d97706',
              }]}>
                {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Recommendation Card */}
        <View style={styles.detailCard}>
          <View style={styles.detailCardHeader}>
            <MaterialIcons name="lightbulb" size={18} color={Colors.light.primary} />
            <Text style={styles.detailCardTitle}>Recommendation</Text>
          </View>
          <View style={[styles.recommendationBox, { backgroundColor: `${signalStyle.color}10`, borderColor: `${signalStyle.color}25` }]}>
            <MaterialIcons name={detail.recommendationIcon === 'trending_up' ? 'trending-up' : detail.recommendationIcon === 'local_shipping' ? 'local-shipping' : 'shopping-cart'} size={20} color={signalStyle.color} />
            <Text style={[styles.recommendationText, { color: signalStyle.color }]}>{detail.recommendation}</Text>
          </View>
        </View>

        {/* Context / Metrics */}
        {detail.context.length > 0 && (
          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <MaterialIcons name="bar-chart" size={18} color={Colors.light.primary} />
              <Text style={styles.detailCardTitle}>Context Metrics</Text>
            </View>
            <View style={styles.contextList}>
              {detail.context.map((ctx) => (
                <View key={ctx.label} style={styles.contextRow}>
                  <View style={styles.contextRowHeader}>
                    <Text style={[styles.contextLabel, ctx.isHigh && { color: signalStyle.color }]}>{ctx.label}</Text>
                    <Text style={[styles.contextValue, ctx.isHigh && { color: signalStyle.color }]}>{ctx.value}</Text>
                  </View>
                  <View style={styles.contextTrack}>
                    <View style={[styles.contextFill, { width: `${ctx.progress}%`, backgroundColor: ctx.isHigh ? signalStyle.color : Colors.light.onSurfaceVariant }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI Analysis */}
        <View style={styles.detailCard}>
          <View style={styles.detailCardHeader}>
            <MaterialIcons name="psychology" size={18} color={Colors.light.tertiary} />
            <Text style={styles.detailCardTitle}>AI Analysis</Text>
          </View>
          <Text style={styles.detailCardBody}>
            {detail.signalType === 'Pricing Signal'
              ? 'Analysis indicates optimal price adjustment based on competitive positioning and local demand elasticity. Recommended adjustment stays within the 8-12% band for maximum revenue without customer churn risk.'
              : detail.signalType === 'Inventory Signal'
              ? 'Supply chain anomaly detected through real-time supplier monitoring. Backup vendor has been pre-vetted and can fulfill at 98% of current contract pricing. Switching is recommended within the next 2 hours to avoid stockouts during peak hours.'
              : 'Seasonal demand pattern recognized from 3 years of historical transaction data. Combo pricing strategy has proven effective with 34% average conversion lift during seasonal transitions.'}
          </Text>
        </View>

        {/* Impact Projection */}
        {detail.context.some((c) => c.label === 'Margin Impact' || c.label === 'Expected Lift') && (
          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <MaterialIcons name="trending-up" size={18} color="#059669" />
              <Text style={styles.detailCardTitle}>Projected Impact</Text>
            </View>
            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Revenue Impact</Text>
                <Text style={styles.metricValue}>
                  {detail.context.find((c) => c.label === 'Margin Impact')?.value || detail.context.find((c) => c.label === 'Expected Lift')?.value || '+'}
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Confidence</Text>
                <Text style={styles.metricValue}>{detail.confidence}%</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Processing Time</Text>
                <Text style={styles.metricValue}>1.2s</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Status</Text>
                <Text style={[styles.metricValue, {
                  color: detail.status === 'pending' ? '#d97706' : detail.status === 'approved' ? '#059669' : '#dc2626',
                }]}>
                  {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.detailCard}>
          <View style={styles.detailCardHeader}>
            <MaterialIcons name="fact-check" size={18} color={Colors.light.tertiary} />
            <Text style={styles.detailCardTitle}>Available Actions</Text>
          </View>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => {
              Toast.show({ type: 'success', text1: 'Approved', text2: detail.title, position: 'top', visibilityTime: 2500 });
              router.back();
            }}
          >
            <MaterialIcons name="check-circle" size={18} color="#ffffff" />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => {
              Toast.show({ type: 'info', text1: 'Rejected', text2: detail.title, position: 'top', visibilityTime: 2500 });
              router.back();
            }}
          >
            <MaterialIcons name="cancel" size={18} color={Colors.light.onSurface} />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  backRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: Colors.light.surfaceContainerLowest,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: Colors.light.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: Colors.light.onSurfaceVariant,
  },

  // Header Card
  headerCard: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
    color: Colors.light.onSurface,
    marginBottom: 8,
  },
  headerDescription: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.onSurfaceVariant,
  },
  confidenceContainer: {
    marginTop: 18,
    backgroundColor: Colors.light.surfaceContainer,
    borderRadius: 12,
    padding: 14,
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  confidenceLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
    flex: 1,
  },
  confidenceValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
  },
  confidenceTrack: {
    height: 6,
    backgroundColor: Colors.light.surfaceContainerHigh,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 9999,
  },

  // Detail Cards
  detailCard: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  detailCardTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: Colors.light.onSurface,
  },
  detailCardBody: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    lineHeight: 20,
    color: Colors.light.onSurfaceVariant,
  },

  // Status
  statusRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  statusText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Recommendation
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  recommendationText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    flex: 1,
  },

  // Context
  contextList: {
    gap: 14,
  },
  contextRow: {
    gap: 6,
  },
  contextRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contextLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
  },
  contextValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.light.onSurface,
  },
  contextTrack: {
    height: 6,
    backgroundColor: Colors.light.surfaceContainerHigh,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  contextFill: {
    height: '100%',
    borderRadius: 9999,
    opacity: 0.7,
  },

  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricBox: {
    backgroundColor: Colors.light.surfaceContainer,
    borderRadius: 12,
    padding: 14,
    minWidth: '47%',
    flex: 1,
  },
  metricLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: Colors.light.onSurfaceVariant,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: Colors.light.onSurface,
  },

  // Actions
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  approveButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(110, 121, 119, 0.3)',
    paddingVertical: 16,
    borderRadius: 12,
  },
  rejectButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.light.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
