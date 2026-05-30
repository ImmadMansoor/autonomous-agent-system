import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';

const tabs = [
  { id: 'operations', route: 'index', icon: 'dashboard', label: 'Operations' },
  { id: 'approvals', route: 'approvals', icon: 'fact-check', label: 'Approvals' },
  { id: 'inventory', route: 'inventory', icon: 'inventory-2', label: 'Inventory' },
  { id: 'analytics', route: 'analytics', icon: 'analytics', label: 'Analytics' },
  { id: 'logs', route: 'logs', icon: 'psychology', label: 'AI Logs' },
];

export function BottomNavBar({ state, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const bottomOffset = insets.bottom > 0 ? insets.bottom : 16;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <View style={[styles.container, { bottom: bottomOffset, paddingHorizontal: 16 }]}>
            <View style={styles.blurContainer}>
                <BlurView 
                    intensity={Platform.OS === 'ios' ? 20 : 15} 
                    tint="default" 
                    style={StyleSheet.absoluteFillObject}
                />
                
                <View style={styles.innerReflection} />

                <View style={styles.navWrapper}>
                    {tabs.map((tab, index) => {
                        const isFocused = state.index === index;
                        const color = isFocused 
                            ? (isDark ? Colors.dark.tint : Colors.light.tint) 
                            : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)');

                        return (
                            <TouchableOpacity
                                key={tab.id}
                                onPress={() => navigation.navigate(tab.route)}
                                style={styles.tabButton}
                            >
                                <MaterialIcons name={tab.icon as any} size={28} color={color} />
                                {isFocused && (
                                    <View style={[styles.activeDot, { backgroundColor: color }]} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 80,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  innerReflection: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minWidth: 50,
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
