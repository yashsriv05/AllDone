import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {

  return (
    <Stack>
        <Stack.Screen options={{headerTitle:'AllDone', headerTitleAlign:'left', headerShown:false,}} name="index"/>
        <Stack.Screen options={{headerTitle:'Note', headerTitleAlign:'left'}} name="[note]"/>
    </Stack>
  );
}
