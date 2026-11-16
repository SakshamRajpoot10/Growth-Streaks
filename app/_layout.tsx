import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { openDatabase } from '../src/db/client';
import { seedDefaults } from '../src/db/seed';
import { registerBackgroundAlarmHandler } from '../src/features/alarm/services/alarm-handler';
import { initializeAlarmChannel } from '../src/features/alarm/services/alarm-scheduler';
import { useAlarmPermissions } from '../src/features/alarm/hooks/useAlarmPermissions';
import { useAlarmWatcher } from '../src/features/alarm/hooks/useAlarmWatcher';
import { IncomingAlarmModal } from '../src/features/alarm/components/IncomingAlarmModal';

// Safely register background handler with try/catch to guarantee zero startup crash
try {
  registerBackgroundAlarmHandler();
} catch {
  // Guarded against cold-start lifecycle race conditions
}

export default function RootLayout() {
  useAlarmPermissions();
  const { activeAlarmTask, alarmStrike, dismissAlarm } = useAlarmWatcher();

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
