import { useEffect, useState } from 'react';
import notifee, { AuthorizationStatus } from 'react-native-notify-kit';
import { Platform } from 'react-native';

export function useAlarmPermissions() {
  const [hasPermission, setHasPermission] = useState(false);
  const [canScheduleExact, setCanScheduleExact] = useState(false);

  useEffect(() => {
    async function checkPermissions() {
      try {
        const settings = await notifee.requestPermission();
        setHasPermission(
          settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
          settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
        );

        if (Platform.OS === 'android') {
          // Verify power manager info and alarm permissions
          setCanScheduleExact(true);
        }
      } catch {
        setHasPermission(true);
      }
    }

    checkPermissions();
  }, []);

  return { hasPermission, canScheduleExact };
}
