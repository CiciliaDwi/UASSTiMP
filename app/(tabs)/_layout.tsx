import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="bookings/index" />
      <Stack.Screen name="profile/index" />
      <Stack.Screen name="films/[id]" />
      <Stack.Screen name="cafes/[id]" />
    </Stack>
  );
}
