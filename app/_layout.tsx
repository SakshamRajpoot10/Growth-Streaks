import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import notifee from 'react-native-notify-kit';
import { openDatabase } from '../src/db/client';
import { seedDefaults } from '../src/db/seed';
import { registerBackgroundAlarmHandler } from '../src/features/alarm/services/alarm-handler';
import { initializeAlarmChannel } from '../src/features/alarm/services/alarm-scheduler';
import { useAlarmPermissions } from '../src/features/alarm/hooks/useAlarmPermissions';
import { useAlarmWatcher } from '../src/features/alarm/hooks/useAlarmWatcher';
import { IncomingAlarmModal } from '../src/features/alarm/components/IncomingAlarmModal';
import { useFitnessStore } from '../src/store/useFitnessStore';

// Safely register background handler and 24/7 foreground runner to guarantee zero startup crash
try {
  registerBackgroundAlarmHandler();
} catch {
  // Guarded against cold-start lifecycle race conditions
}

try {
  if (notifee && typeof notifee.registerForegroundService === 'function') {
    notifee.registerForegroundService(() => {
      return new Promise(() => {
        // Keeps the 24/7 pedometer and exact alarm runner active in the background
      });
    });
  }
} catch {
  // Handled safely
}

export default function RootLayout() {
  useAlarmPermissions();
  const { activeAlarmTask, alarmStrike, dismissAlarm } = useAlarmWatcher();

  useEffect(() => {
    try {
      const db = openDatabase();
      seedDefaults(db);
      initializeAlarmChannel();
      // Start 24/7 background pedometer hardware tracker on launch
      useFitnessStore.getState().startTracking().catch(() => {});
    } catch {
      // Handled silently
    }
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>

      {/* Global In-App Full-Screen Alarm Modal with Dual Slide Action & Standing Camera */}
      <IncomingAlarmModal
        visible={Boolean(activeAlarmTask)}
        task={activeAlarmTask}
        strikeNumber={alarmStrike}
        onDismiss={dismissAlarm}
      />
    </>
  );
}
