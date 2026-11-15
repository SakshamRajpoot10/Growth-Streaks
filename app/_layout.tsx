import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { openDatabase } from '../src/db/client';
import { seedDefaults } from '../src/db/seed';
import { registerBackgroundAlarmHandler } from '../src/features/alarm/services/alarm-handler';
import { initializeAlarmChannel } from '../src/features/alarm/services/alarm-scheduler';
import { useAlarmPermissions } from '../src/features/alarm/hooks/useAlarmPermissions';

// Safely register background handler with try/catch to guarantee zero startup crash
try {
  registerBackgroundAlarmHandler();
} catch {
  // Guarded against cold-start lifecycle race conditions
}

export default function RootLayout() {
  useAlarmPermissions();

  useEffect(() => {
    try {
      const db = openDatabase();
      seedDefaults(db);
      initializeAlarmChannel();
    } catch {
      // Handled silently
    }
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
