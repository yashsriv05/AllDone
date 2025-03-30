import { Tabs } from 'expo-router';
import React from 'react';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="(notes)"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.clipboard" color={color} />,
        }}
      />
    </Tabs>
  );
}
