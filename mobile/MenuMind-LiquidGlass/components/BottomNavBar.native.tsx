import React from 'react';
import { View, StyleSheet, requireNativeComponent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

const NativeLiquidTabBar = requireNativeComponent<any>('LiquidTabBar');

export function BottomNavBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = insets.bottom > 0 ? insets.bottom : 16;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const scrimEnd = isDark ? 'rgba(0, 0, 0, 0.36)' : 'rgba(236, 244, 242, 0.42)';

  return (
    <View style={[styles.container, { paddingBottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.scrimContainer} pointerEvents="none">
        <ExpoLinearGradient colors={['transparent', scrimEnd]} style={StyleSheet.absoluteFill} />
      </View>

      <View style={styles.tabBarContainer}>
        <NativeLiquidTabBar
          key={`liquid-tabbar-${isDark ? 'dark' : 'light'}`}
          style={styles.nativeTabBar}
          selectedTabIndex={state.index}
          isDarkTheme={isDark}
          onTabSelected={(event: any) => {
            const index = event.nativeEvent.index;
            if (index >= 0 && index < state.routes.length) {
              const route = state.routes[index].name;
              navigation.navigate(route);
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  scrimContainer: {
    position: 'absolute',
    bottom: -54,
    left: 0,
    right: 0,
    height: 170,
    zIndex: -1,
  },
  tabBarContainer: {
    width: '100%',
    maxWidth: 500,
  },
  nativeTabBar: {
    width: '100%',
    height: 80,
  },
});
