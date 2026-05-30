import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar as RNStatusBar, Animated } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

interface TopAppBarProps {
  title?: string;
}

const menuMindMark = require('../assets/images/menumind-mark.png');

export function TopAppBar({ title = 'Operations' }: TopAppBarProps) {
  const insets = useSafeAreaInsets();
  const { theme, themeMode, setThemeMode } = useTheme();
  const toggleProgress = useRef(new Animated.Value(theme === 'dark' ? 1 : 0)).current;
  const statusBarHeight = RNStatusBar.currentHeight || 0;
  const paddingTop = (insets.top > 0 ? insets.top : statusBarHeight > 0 ? statusBarHeight : 24) + 12;

  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    Animated.spring(toggleProgress, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: false,
      speed: 18,
      bounciness: 5,
    }).start();
  }, [isDark, toggleProgress]);

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  const thumbTranslate = toggleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 29],
  });

  return (
    <View style={[styles.container, { paddingTop, backgroundColor: isDark ? 'rgba(0, 0, 0, 0.92)' : 'rgba(248, 249, 255, 0.92)', borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.72)' }]}>
      <View style={styles.leftSection}>
        <View style={styles.logoContainer}>
          <Image source={menuMindMark} style={styles.logoImage} />
        </View>
        <View style={styles.brandContainer}>
          <Text style={[styles.brand, { color: colors.primary }]}>MenuMind</Text>
          <Text style={[styles.brandSubtitle, { color: colors.onSurfaceVariant }]}>Cafe Operations</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={[
            styles.themeSwitch,
            {
              backgroundColor: isDark ? 'rgba(18, 20, 20, 0.95)' : 'rgba(232, 238, 236, 0.95)',
              borderColor: isDark ? 'rgba(128, 203, 196, 0.28)' : 'rgba(0, 104, 95, 0.24)',
            },
          ]}
          onPress={toggleTheme}
          activeOpacity={0.82}
          accessibilityRole="switch"
          accessibilityState={{ checked: isDark }}
          accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          <Feather name="sun" size={13} color={isDark ? 'rgba(128, 203, 196, 0.38)' : colors.primary} />
          <Feather name="moon" size={13} color={isDark ? colors.primary : 'rgba(0, 104, 95, 0.36)'} />
          <Animated.View
            style={[
              styles.themeThumb,
              {
                transform: [{ translateX: thumbTranslate }],
                backgroundColor: isDark ? '#071211' : '#ffffff',
                borderColor: isDark ? 'rgba(128, 203, 196, 0.55)' : 'rgba(0, 104, 95, 0.18)',
                shadowColor: isDark ? '#00d8b3' : '#00685f',
              },
            ]}
          >
            <View style={[styles.themeThumbCore, { backgroundColor: isDark ? colors.primary : '#f59e0b' }]} />
            {isDark && <View style={styles.moonCutout} />}
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="notifications-none" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKVc0GAshnDEYIjDop2aS-cfPyeP_GrxSipmtiqn2JKl6y9gVgNUcEhcCkIQDwxrVIiLYNLKJx4GxvCI7J9aENi1MPOkUKECFKlPO_GEpNmPz175Y_VqImh0fJjEaq3fQR4MZISCG8eGBCJddvz0Uar9zEMUqBg_LxfH5t7kpaetcV545r2XEozuGRFMrMQqpJATVWIjo377vQsLcgG3NZiesVJ8Uk_u2P9nDZoO9XY-ye8zisk2gUlrRQYzxeMtNJGuzo17IrhhLw' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    position: 'absolute',
    top: 0,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#061011',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    shadowColor: '#00d8b3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  brandContainer: {
    gap: 0,
  },
  brand: {
    fontFamily: 'Doto_800ExtraBold',
    fontSize: 22,
    letterSpacing: 0,
  },
  brandSubtitle: {
    fontFamily: 'Doto_600SemiBold',
    fontSize: 11,
    letterSpacing: 0,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
  },
  themeSwitch: {
    width: 58,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  themeThumb: {
    position: 'absolute',
    top: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.34,
    shadowRadius: 8,
    elevation: 4,
  },
  themeThumbCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  moonCutout: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#071211',
    right: 5,
    top: 5,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 78, 71, 0.2)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
});
