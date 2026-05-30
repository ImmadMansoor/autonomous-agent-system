import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  Animated,
} from 'react-native';
import { TopAppBar } from '@/components/TopAppBar';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface InventoryItem {
  id: string;
  name: string;
  supplier: string;
  quantity: number;
  target: number;
  unit: string;
  pricePerUnit: number;
  status: 'urgent' | 'moderate' | 'stable';
  expiryDays: number;
  sparkline: number[];
  autoManage: boolean;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Espresso Beans',
    supplier: 'Arabica Select',
    quantity: 1.5,
    target: 10,
    unit: 'kg',
    pricePerUnit: 24.50,
    status: 'urgent',
    expiryDays: 1,
    sparkline: [2, 4, 3, 5, 7],
    autoManage: true,
  },
  {
    id: '2',
    name: 'Croissants',
    supplier: 'Local Bakery Co',
    quantity: 12,
    target: 30,
    unit: 'units',
    pricePerUnit: 2.10,
    status: 'moderate',
    expiryDays: 2,
    sparkline: [4, 5, 7, 4, 3],
    autoManage: false,
  },
  {
    id: '3',
    name: 'Oat Milk',
    supplier: 'Oatly Whls',
    quantity: 42,
    target: 48,
    unit: 'ct',
    pricePerUnit: 1.85,
    status: 'stable',
    expiryDays: 14,
    sparkline: [2, 3, 2, 4, 3],
    autoManage: true,
  },
];

const FILTER_CATEGORIES = ['All Items', 'Urgent', 'Moderate', 'Stable'];
const MATRIX_DOTS = Array.from({ length: 48 }, (_, index) => index);

export default function InventoryScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = getStyles(colors, isDark);
  const insets = useSafeAreaInsets();
  const safeBottom = insets.bottom > 0 ? insets.bottom : 24;
  const paddingBottom = safeBottom + 110;

  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [selectedFilter, setSelectedFilter] = useState('All Items');
  const [showAutoManaged, setShowAutoManaged] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleAutoManage = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, autoManage: !item.autoManage } : item
    ));
  };

  const filteredItems = items.filter((item) => {
    const matchesFilter = selectedFilter === 'All Items' ||
      item.status === selectedFilter.toLowerCase();
    const matchesAutoManage = !showAutoManaged || item.autoManage;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesAutoManage && matchesSearch;
  });

  const getStatusColor = (status: string, darkMode: boolean) => {
    const endColor = darkMode ? 'rgba(12, 13, 13, 0.98)' : 'rgba(248, 249, 255, 0.95)';
    const defaultText = darkMode ? '#5eead4' : '#00685f';
    switch (status) {
      case 'urgent':
        return {
          bg: darkMode ? 'rgba(248, 113, 113, 0.1)' as const : 'rgba(161, 17, 17, 0.12)' as const,
          text: darkMode ? '#f87171' as const : '#8b1a1a' as const,
          border: darkMode ? 'rgba(248, 113, 113, 0.22)' as const : 'rgba(161, 17, 17, 0.25)' as const,
          glow: 'rgba(161, 17, 17, 0.22)' as const,
          gradient: darkMode ? ['rgba(40, 16, 18, 0.96)', endColor] as const : ['rgba(161, 17, 17, 0.06)', endColor] as const,
        };
      case 'moderate':
        return {
          bg: darkMode ? 'rgba(251, 191, 36, 0.1)' as const : 'rgba(255, 193, 7, 0.15)' as const,
          text: darkMode ? '#fbbf24' as const : '#b38600' as const,
          border: darkMode ? 'rgba(251, 191, 36, 0.24)' as const : 'rgba(255, 193, 7, 0.3)' as const,
          glow: 'rgba(217, 119, 6, 0.22)' as const,
          gradient: darkMode ? ['rgba(42, 31, 13, 0.96)', endColor] as const : ['rgba(255, 193, 7, 0.06)', endColor] as const,
        };
      case 'stable':
        return {
          bg: darkMode ? 'rgba(94, 234, 212, 0.1)' as const : 'rgba(0, 104, 95, 0.15)' as const,
          text: darkMode ? '#5eead4' as const : '#00685f' as const,
          border: darkMode ? 'rgba(94, 234, 212, 0.24)' as const : 'rgba(0, 104, 95, 0.3)' as const,
          glow: 'rgba(0, 106, 98, 0.22)' as const,
          gradient: darkMode ? ['rgba(12, 35, 32, 0.96)', endColor] as const : ['rgba(0, 104, 95, 0.06)', endColor] as const,
        };
      default:
        return {
          bg: 'rgba(0, 104, 95, 0.15)' as const,
          text: defaultText,
          border: 'rgba(0, 104, 95, 0.3)' as const,
          glow: 'rgba(0, 106, 98, 0.22)' as const,
          gradient: darkMode ? ['rgba(12, 35, 32, 0.96)', endColor] as const : ['rgba(0, 104, 95, 0.06)', endColor] as const,
        };
    }
  };

  const calculateStatus = (quantity: number, target: number): 'urgent' | 'moderate' | 'stable' => {
    const percentage = (quantity / target) * 100;
    if (percentage < 30) return 'urgent';
    if (percentage < 70) return 'moderate';
    return 'stable';
  };

  const generateSparkline = (quantity: number, target: number, seed: number): number[] => {
    const percentage = (quantity / target) * 100;
    const base = Math.min(7, Math.ceil(percentage / 15));
    const offset = (seed % 3) - 1;
    const mainBar = Math.max(2, Math.min(7, base + offset));
    return [
      Math.max(1, mainBar - 2),
      Math.max(1, mainBar - 1),
      mainBar,
      Math.max(1, mainBar + (seed % 2)),
      Math.max(1, mainBar - ((seed + 1) % 2)),
    ];
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQuantity = Math.max(0, item.quantity + delta);
      const newStatus = calculateStatus(newQuantity, item.target);
      return { ...item, quantity: newQuantity, status: newStatus };
    }));
  };

  const handleRestock = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQuantity = item.target;
      const newStatus = calculateStatus(item.target, item.target);
      return { ...item, quantity: newQuantity, status: newStatus };
    }));
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
      <TopAppBar title="Inventory" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
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
                <Text style={styles.heroBadge}>Live Supply Intel</Text>
              </View>
              <Text style={styles.heroTitle}>Supply Chain{'\n'}Intelligence</Text>
              <Text style={styles.heroDescription}>
                AI monitoring {items.length} inventory nodes. {items.filter((i) => i.status === 'urgent').length} items need immediate attention.
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{items.length}</Text>
                  <Text style={styles.heroStatLabel}>Items</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{items.filter((i) => i.autoManage).length}</Text>
                  <Text style={styles.heroStatLabel}>Auto</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={[styles.heroStatValue, { color: '#fca5a5' }]}>{items.filter((i) => i.status === 'urgent').length}</Text>
                  <Text style={styles.heroStatLabel}>Urgent</Text>
                </View>
              </View>
            </View>
            <View style={styles.heroPattern} pointerEvents="none">
              {MATRIX_DOTS.map((dot) => <View key={dot} style={styles.matrixDot} />)}
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={animStyle(sectionIdx++)}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={18} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search premium inventory items..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </Animated.View>

        <Animated.View style={animStyle(sectionIdx++)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            {FILTER_CATEGORIES.map((filter) => {
              const isActive = selectedFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.filterChip, showAutoManaged && styles.filterChipActive]}
              onPress={() => setShowAutoManaged(!showAutoManaged)}
            >
              <MaterialIcons name="smart-toy" size={12} color={showAutoManaged ? '#ffffff' : colors.onSurfaceVariant} />
              <Text style={[styles.filterText, showAutoManaged && styles.filterTextActive, { marginLeft: 4 }]}>
                Auto
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        <Animated.View style={animStyle(sectionIdx++)}>
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Active Inventory</Text>
              <Text style={styles.listCount}>{filteredItems.length} Active Items</Text>
            </View>

            {filteredItems.map((item, index) => {
              const idx = sectionIdx++;
              const status = getStatusColor(item.status, isDark);
              const progress = (item.quantity / item.target) * 100;
              const isFirstCard = index === 0;

              return (
                <Animated.View key={item.id} style={animStyle(idx)}>
                <LinearGradient
                  colors={status.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.card, isFirstCard && styles.firstCard]}
                >
                <View style={styles.cardPattern} pointerEvents="none">
                  {MATRIX_DOTS.map((dot) => <View key={dot} style={styles.cardMatrixDot} />)}
                </View>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={[styles.statusBadge, {
                      backgroundColor: status.bg,
                      borderColor: status.border,
                    }]}>
                      <Text style={[styles.statusText, { color: status.text }]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardMeta}>
                    Supplier <Text style={styles.cardMetaHighlight}>{item.supplier}</Text> • Expires <Text style={{ color: item.expiryDays <= 2 ? status.text : colors.onSurfaceVariant }}>{item.expiryDays}d</Text>
                  </Text>
                </View>

                <View style={styles.quantityRow}>
                  <View style={styles.quantityMain}>
                    <Text style={[styles.quantityValue, { color: status.text }]}>
                      {item.quantity}<Text style={styles.quantityUnit}>{item.unit}</Text>
                    </Text>
                    <Text style={styles.quantityPrice}>${item.pricePerUnit.toFixed(2)}/{item.unit === 'kg' ? 'kg' : item.unit === 'ct' ? 'ct' : 'ut'}</Text>
                    <Text style={styles.quantityTarget}>Target {item.target}{item.unit}</Text>
                  </View>

                  <View style={styles.sparkline}>
                    {generateSparkline(item.quantity, item.target, parseInt(item.id)).map((height, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.sparklineBar,
                          {
                            height: height * 4,
                            backgroundColor: item.status === 'urgent' ? '#ef4444' : item.status === 'moderate' ? '#f59e0b' : '#22c55e',
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, {
                      width: `${Math.min(100, progress)}%`,
                      backgroundColor: item.status === 'urgent' ? (isDark ? '#ef4444' : '#a11111') : item.status === 'moderate' ? '#ffc107' : '#00685f'
                    }]} />
                  </View>
                </View>

                <View style={styles.autoManageRow}>
                  <View style={styles.autoManageLeft}>
                    <MaterialIcons name="smart-toy" size={18} color={colors.primary} />
                    <Text style={styles.autoManageText}>Auto-manage</Text>
                  </View>
                  <Switch
                    value={item.autoManage}
                    onValueChange={() => toggleAutoManage(item.id)}
                    trackColor={{ false: 'rgba(190, 201, 198, 0.3)', true: colors.primary }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View style={styles.actionRow}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <MaterialIcons name="remove" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.quantityNumber}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <MaterialIcons name="add" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.restockButton, {
                      backgroundColor: item.status === 'urgent' ? (isDark ? '#991b1b' : '#8b1a1a') : colors.primary
                    }]}
                    onPress={() => handleRestock(item.id)}
                  >
                    <Text style={styles.restockButtonText}>RESTOCK</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              </Animated.View>
            );
          })}
        </View>
        </Animated.View>
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
    borderRadius: 16,
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
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
    lineHeight: 29,
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
    right: 14,
    width: 104,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    opacity: 0.36,
  },
  matrixDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 28,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(190, 201, 198, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderRadius: 100,
    backgroundColor: isDark ? 'rgba(18, 18, 18, 0.86)' : 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(190, 201, 198, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  filterText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    lineHeight: 12,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listSection: {
    gap: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  listTitle: {
    fontFamily: 'Doto_800ExtraBold',
    fontSize: 18,
    color: colors.onSurface,
    letterSpacing: 0,
  },
  listCount: {
    fontFamily: 'Doto_700Bold',
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 78, 71, 0.1)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardPattern: {
    position: 'absolute',
    top: 22,
    right: 18,
    width: 96,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    opacity: isDark ? 0.18 : 0.16,
  },
  cardMatrixDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 104, 95, 0.55)',
  },
  firstCard: {
    minHeight: 280,
    paddingBottom: 32,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: colors.onSurface,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardMeta: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  cardMetaHighlight: {
    color: colors.onSurface,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  quantityMain: {
    flex: 1,
  },
  quantityValue: {
    fontFamily: 'Doto_700Bold',
    fontSize: 32,
    letterSpacing: 0,
  },
  quantityUnit: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  quantityPrice: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  quantityTarget: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.15,
    marginTop: 4,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 28,
  },
  sparklineBar: {
    width: 4,
    borderRadius: 1,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBg: {
    height: 10,
    backgroundColor: 'rgba(190, 201, 198, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
    padding: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  autoManageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  autoManageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoManageText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(190, 201, 198, 0.2)',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(190, 201, 198, 0.3)',
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityNumber: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: colors.onSurface,
    minWidth: 40,
    textAlign: 'center',
  },
  restockButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  restockButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
