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

interface LogDetail {
  trigger: string;
  affectedItems: string[];
  metrics: { label: string; value: string }[];
  relatedActions: { type: string; description: string; status: 'completed' | 'pending' }[];
  notes: string[];
  timestamp: string;
  duration: string;
}

const MOCK_DETAILS: Record<string, LogDetail> = {
  'reas-1': {
    trigger: 'Weather API: Local temperature reached 85°F (forecast)',
    affectedItems: ['Iced Latte', 'Iced Americano', 'Cold Brew'],
    metrics: [
      { label: 'Price Adjustment', value: '-$0.50' },
      { label: 'Expected Volume Increase', value: '+14%' },
      { label: 'Margin Impact', value: '-2.3%' },
      { label: 'Forecast Accuracy', value: '94%' },
    ],
    relatedActions: [
      { type: 'Menu Update', description: 'Updated pricing across all POS terminals', status: 'completed' },
      { type: 'Inventory Alert', description: 'Pre-positioned extra espresso for anticipated volume', status: 'completed' },
      { type: 'Marketing', description: 'Push notification for cold beverage deals', status: 'pending' },
    ],
    notes: [
      'Historical data shows 87% correlation between temps above 84°F and cold beverage demand',
      'Competitor pricing analysis shows opportunity for price optimization',
      'Summer seasonal adjustment protocol activated',
    ],
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    duration: '4.2s',
  },
  'reas-2': {
    trigger: 'Supplier API: Central Dairy Co. flagged shipping delay',
    affectedItems: ['Sourdough Bread', 'Avocado Toast'],
    metrics: [
      { label: 'Current Stock', value: '12 units' },
      { label: 'Morning Demand', value: '45 units' },
      { label: 'Deficit', value: '-33 units' },
      { label: 'Shelf Life', value: '3 days' },
    ],
    relatedActions: [
      { type: 'Menu Update', description: 'De-listed Sourdough from all morning items', status: 'completed' },
      { type: 'Customer Alert', description: 'Notified 234 mobile order customers', status: 'completed' },
      { type: 'Alternative Order', description: 'Contacted backup supplier for emergency stock', status: 'pending' },
    ],
    notes: [
      'Automatic de-listing triggered per inventory policy',
      'Backup supplier (Artisan Bakery) can deliver by 9 AM',
      'Customer satisfaction impact: low (low morning Sourdough order rate)',
    ],
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    duration: '2.8s',
  },
  'reas-3': {
    trigger: 'Inventory Analytics: Muffin surplus detected (expiring in 48h)',
    affectedItems: ['Blueberry Muffin', 'Chocolate Muffin', 'Banana Bread'],
    metrics: [
      { label: 'Surplus Weight', value: '4.2kg' },
      { label: 'Waste Value', value: '$63.00' },
      { label: 'Potential Savings', value: '$42.50' },
      { label: 'Pairing Success Rate', value: '67%' },
    ],
    relatedActions: [
      { type: 'Promo Activation', description: 'Enabled "Muffin Pairing" on all kiosks', status: 'completed' },
      { type: 'Upsell Training', description: 'Sent tip to baristas for active upselling', status: 'completed' },
      { type: 'Price Reduction', description: 'Applied 15% discount on muffin drinks combos', status: 'completed' },
    ],
    notes: [
      'Predictive waste algorithm flagged 72 hours ago',
      'Upsell pairings: Any medium/large hot beverage + muffin = $1 off',
      'Expected ROI: 67% reduction in muffin waste',
    ],
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    duration: '1.9s',
  },
  'l1': {
    trigger: 'Weather API: Local temperature reached 85°F (forecast)',
    affectedItems: ['Iced Latte', 'Iced Americano', 'Cold Brew'],
    metrics: [
      { label: 'Price Adjustment', value: '-$0.50' },
      { label: 'Expected Volume Increase', value: '+14%' },
      { label: 'Margin Impact', value: '-2.3%' },
      { label: 'Forecast Accuracy', value: '94%' },
    ],
    relatedActions: [
      { type: 'Menu Update', description: 'Updated pricing across all POS terminals', status: 'completed' },
      { type: 'Inventory Alert', description: 'Pre-positioned extra espresso for anticipated volume', status: 'completed' },
      { type: 'Marketing', description: 'Push notification for cold beverage deals', status: 'pending' },
    ],
    notes: [
      'Historical data shows 87% correlation between temps above 84°F and cold beverage demand',
      'Competitor pricing analysis shows opportunity for price optimization',
      'Summer seasonal adjustment protocol activated',
    ],
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    duration: '4.2s',
  },
  'l2': {
    trigger: 'Supplier API: Central Dairy Co. flagged shipping delay',
    affectedItems: ['Sourdough Bread', 'Avocado Toast'],
    metrics: [
      { label: 'Current Stock', value: '12 units' },
      { label: 'Morning Demand', value: '45 units' },
      { label: 'Deficit', value: '-33 units' },
      { label: 'Shelf Life', value: '3 days' },
    ],
    relatedActions: [
      { type: 'Menu Update', description: 'De-listed Sourdough from all morning items', status: 'completed' },
      { type: 'Customer Alert', description: 'Notified 234 mobile order customers', status: 'completed' },
      { type: 'Alternative Order', description: 'Contacted backup supplier for emergency stock', status: 'pending' },
    ],
    notes: [
      'Automatic de-listing triggered per inventory policy',
      'Backup supplier (Artisan Bakery) can deliver by 9 AM',
      'Customer satisfaction impact: low (low morning Sourdough order rate)',
    ],
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    duration: '2.8s',
  },
  'l3': {
    trigger: 'IoT Sensors: Foot traffic anomaly detected in last 90 minutes',
    affectedItems: ['Front-of-House Staff', 'Barista Station'],
    metrics: [
      { label: 'Traffic Drop', value: '-15%' },
      { label: 'Current Staff', value: '6 nodes' },
      { label: 'Optimal Staff', value: '4 nodes' },
      { label: 'Hourly Savings', value: '$64' },
    ],
    relatedActions: [
      { type: 'Staff Schedule', description: 'Reduced 2 server nodes for remainder of shift', status: 'completed' },
      { type: 'Labor Cost', description: 'Optimized labor cost by $64/hr', status: 'completed' },
    ],
    notes: [
      'Traffic pattern matches historical Tuesday afternoon slump',
      'Weather: overcast, correlating with 12% average footfall reduction',
      'No local events detected that would affect afternoon traffic',
    ],
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    duration: '1.5s',
  },
  'l4': {
    trigger: 'Inventory Analytics: Daily par level check completed',
    affectedItems: ['Espresso Beans - 15kg'],
    metrics: [
      { label: 'Current Stock', value: '3.2kg' },
      { label: 'Par Level', value: '10kg' },
      { label: 'Order Amount', value: '15kg' },
      { label: 'Lead Time', value: '48hrs' },
    ],
    relatedActions: [
      { type: 'Supplier Order', description: 'Auto-placed order with Central Roasters', status: 'completed' },
      { type: 'Inventory Alert', description: 'Updated projected stock levels', status: 'completed' },
    ],
    notes: [
      'Auto-reorder threshold: 40% of par level',
      'Current supplier reliability score: 98.2%',
      'Estimated restock arrival: 2 days from order',
    ],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: '0.9s',
  },
  'l5': {
    trigger: 'Sales History: Margin analysis triggered happy hour review',
    affectedItems: ['All Beverages', 'Happy Hour Menu'],
    metrics: [
      { label: 'Current Discount', value: '15%' },
      { label: 'Proposed Discount', value: '12%' },
      { label: 'Margin Improvement', value: '+3.2%' },
      { label: 'Footfall Projection', value: 'Stable' },
    ],
    relatedActions: [
      { type: 'Pricing Policy', description: 'Updated happy hour discount schedule', status: 'completed' },
      { type: 'POS Update', description: 'Propagated new pricing to all terminals', status: 'completed' },
    ],
    notes: [
      'Footfall analysis shows no significant drop-off at 12% vs 15% discount',
      'Competitor analysis shows average happy hour discount at 10%',
      'Optimal balance between margin and customer retention achieved',
    ],
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    duration: '1.2s',
  },
};

const ITEM_META: Record<string, { type: string; icon: string; color: string; title: string; description: string; confidence: number }> = {
  'reas-1': { type: 'Pricing Logic', icon: 'attach-money', color: '#d97706', title: 'Surge Pricing Triggered', description: 'Predicted 20% traffic surge based on local event data (City Marathon) and current sunny weather trajectory.', confidence: 94 },
  'reas-2': { type: 'Inventory', icon: 'inventory-2', color: '#00685f', title: 'Pre-order: Fresh Salmon', description: 'High probability of stock-out by Friday evening based on consumption velocity and supplier lead times.', confidence: 88 },
  'reas-3': { type: 'Demand Forecast', icon: 'trending-up', color: '#00628d', title: 'Weekend Traffic Surge Predicted', description: 'AI analyzing 12K transactions projects 22% weekend traffic increase. Peak predicted Saturday at 11 AM.', confidence: 91 },
  'reas-4': { type: 'Pricing Logic', icon: 'attach-money', color: '#d97706', title: 'Happy Hour Optimization', description: 'Adjusted happy hour discount from 15% to 12% based on margin analysis and footfall projection.', confidence: 82 },
  'l1': { type: 'Pricing Logic', icon: 'attach-money', color: '#d97706', title: 'Surge Pricing Triggered', description: 'Predicted 20% traffic surge based on local event data (City Marathon) and current sunny weather trajectory.', confidence: 94 },
  'l2': { type: 'Inventory', icon: 'inventory-2', color: '#00685f', title: 'Pre-order: Fresh Salmon', description: 'High probability of stock-out by Friday evening based on consumption velocity and supplier lead times.', confidence: 88 },
  'l3': { type: 'Staffing', icon: 'group', color: '#0284c7', title: 'Early Shift Dismissal', description: 'Unexpected dip in walk-ins during the last 90 minutes. Recommending staff reduction for 2 server nodes to optimize labor cost.', confidence: 76 },
  'l4': { type: 'Inventory', icon: 'inventory-2', color: '#00685f', title: 'Automated Supplier Reorder', description: 'Daily par level check triggered auto-reorder for 15kg Espresso Beans. Supplier lead time: 48hrs.', confidence: 99 },
  'l5': { type: 'Pricing Logic', icon: 'attach-money', color: '#d97706', title: 'Happy Hour Optimization', description: 'Adjusted happy hour discount from 15% to 12% based on margin analysis and footfall projection.', confidence: 82 },
};

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return '#059669';
  if (confidence >= 75) return '#d97706';
  return '#dc2626';
}

export default function LogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarHeight = RNStatusBar.currentHeight || 0;
  const safeTop = insets.top > 0 ? insets.top : statusBarHeight > 0 ? statusBarHeight : 24;
  const safeBottom = insets.bottom > 0 ? insets.bottom : 24;

  const meta = ITEM_META[id];
  const details = MOCK_DETAILS[id];

  if (!meta || !details) {
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
          <Text style={styles.notFoundText}>Log not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.light.primary} />
          <Text style={styles.backText}>Back to Logs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: safeBottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={[styles.headerCard, { borderColor: meta.color }]}>
          <View style={styles.headerTopRow}>
            <View style={[styles.typeBadge, { backgroundColor: `${meta.color}18` }]}>
              <MaterialIcons name={meta.icon as any} size={16} color={meta.color} />
              <Text style={[styles.typeText, { color: meta.color }]}>{meta.type}</Text>
            </View>
            <View style={styles.timeRow}>
              <MaterialIcons name="access-time" size={14} color={Colors.light.onSurfaceVariant} />
              <Text style={styles.timeText}>2m ago</Text>
            </View>
          </View>

          <Text style={styles.headerTitle}>{meta.title}</Text>
          <Text style={styles.headerDescription}>{meta.description}</Text>

          {/* Confidence Bar */}
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceHeader}>
              <MaterialIcons name="analytics" size={18} color={Colors.light.primary} />
              <Text style={styles.confidenceLabel}>Confidence Score</Text>
              <Text style={[styles.confidenceValue, { color: getConfidenceColor(meta.confidence) }]}>
                {meta.confidence}%
              </Text>
            </View>
            <View style={styles.confidenceTrack}>
              <View style={[styles.confidenceFill, { width: `${meta.confidence}%`, backgroundColor: getConfidenceColor(meta.confidence) }]} />
            </View>
          </View>
        </View>

        {/* Trigger Card */}
        <View style={styles.detailCard}>
          <View style={styles.detailCardHeader}>
            <MaterialIcons name="bolt" size={18} color={Colors.light.primary} />
            <Text style={styles.detailCardTitle}>Trigger</Text>
          </View>
          <Text style={styles.detailCardBody}>{details.trigger}</Text>
        </View>

        {/* Timing Card */}
        <View style={styles.detailCard}>
          <View style={styles.detailCardHeader}>
            <MaterialIcons name="schedule" size={18} color={Colors.light.primary} />
            <Text style={styles.detailCardTitle}>Timing</Text>
          </View>
          <View style={styles.timingRows}>
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>Executed</Text>
              <Text style={styles.timingValue}>{new Date(details.timestamp).toLocaleTimeString()}</Text>
            </View>
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>Processing Time</Text>
              <Text style={styles.timingValue}>{details.duration}</Text>
            </View>
          </View>
        </View>

        {/* Affected Items */}
        {details.affectedItems.length > 0 && (
          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <MaterialIcons name="inventory-2" size={18} color={Colors.light.tertiary} />
              <Text style={styles.detailCardTitle}>Affected Items</Text>
            </View>
            <View style={styles.chipsRow}>
              {details.affectedItems.map((item) => (
                <View key={item} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Metrics */}
        {details.metrics.length > 0 && (
          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <MaterialIcons name="bar-chart" size={18} color={Colors.light.primary} />
              <Text style={styles.detailCardTitle}>Metrics</Text>
            </View>
            <View style={styles.metricsGrid}>
              {details.metrics.map((metric) => (
                <View key={metric.label} style={styles.metricBox}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Related Actions */}
        {details.relatedActions.length > 0 && (
          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <MaterialIcons name="fact-check" size={18} color={Colors.light.tertiary} />
              <Text style={styles.detailCardTitle}>Related Actions</Text>
            </View>
            <View style={styles.actionsList}>
              {details.relatedActions.map((action) => (
                <View key={action.description} style={styles.actionRow}>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionType}>{action.type}:</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                  </View>
                  <MaterialIcons
                    name={action.status === 'completed' ? 'check-circle' : 'warning'}
                    size={18}
                    color={action.status === 'completed' ? '#059669' : '#d97706'}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        {details.notes.length > 0 && (
          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <MaterialIcons name="notes" size={18} color={Colors.light.onSurfaceVariant} />
              <Text style={styles.detailCardTitle}>Notes</Text>
            </View>
            <View style={styles.notesList}>
              {details.notes.map((note, i) => (
                <View key={i} style={[styles.noteRow, i < details.notes.length - 1 && styles.noteRowBorder]}>
                  <Text style={styles.noteBullet}>•</Text>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
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

  // Timing
  timingRows: {
    gap: 10,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timingLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: Colors.light.onSurfaceVariant,
  },
  timingValue: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: Colors.light.onSurface,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: Colors.light.surfaceContainer,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: Colors.light.onSurface,
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
  actionsList: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainer,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  actionContent: {
    flex: 1,
  },
  actionType: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    color: Colors.light.primary,
    marginBottom: 2,
  },
  actionDescription: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: Colors.light.onSurface,
  },

  // Notes
  notesList: {
    gap: 0,
  },
  noteRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
  },
  noteRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  noteBullet: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.light.primary,
    marginTop: 1,
    width: 12,
  },
  noteText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    lineHeight: 18,
    color: Colors.light.onSurfaceVariant,
    flex: 1,
  },
});
