import { Tabs } from 'expo-router';
import React from 'react';
import { BottomNavBar } from '@/components/BottomNavBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: 'absolute', backgroundColor: 'transparent', elevation: 0, borderTopWidth: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Operations',
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Approvals',
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'AI Logs',
        }}
      />
    </Tabs>
  );
}
