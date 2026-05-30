import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';
import {
  Doto_600SemiBold,
  Doto_700Bold,
  Doto_800ExtraBold,
} from '@expo-google-fonts/doto';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { theme } = useTheme();

  const toastConfig = {
    success: (props: BaseToastProps) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#059669', borderLeftWidth: 4, backgroundColor: theme === 'dark' ? '#121212' : '#ffffff' }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        text1Style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: theme === 'dark' ? '#ffffff' : '#000000' }}
        text2Style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: theme === 'dark' ? '#889392' : '#737373' }}
      />
    ),
    info: (props: BaseToastProps) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#00685f', borderLeftWidth: 4, backgroundColor: theme === 'dark' ? '#121212' : '#ffffff' }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        text1Style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: theme === 'dark' ? '#ffffff' : '#000000' }}
        text2Style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: theme === 'dark' ? '#889392' : '#737373' }}
      />
    ),
  };

  return (
    <>
      <Stack screenOptions={{ contentStyle: { backgroundColor: theme === 'dark' ? '#000000' : '#f5f5f5' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="logs/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="approvals/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Toast config={toastConfig} />
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
    Doto_600SemiBold,
    Doto_700Bold,
    Doto_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
