import { useEffect, useState } from 'react';
import notifee, { AuthorizationStatus } from 'react-native-notify-kit';
import { Pedometer } from 'expo-sensors';
import { Camera } from 'expo-camera';
import { Platform } from 'react-native';
import { NativeBridge } from '../../../services/native-bridge';

/**
 * Cold-Start Universal Permissions Hook:
 * Automatically prompts the user for all essential hardware capabilities
 * on initial launch:
 * 1. Notifications & Alarm alerts
 * 2. Physical Activity (Hardware pedometer step detection)
 * 3. Camera (Front selfie camera for 30s standing wake-up verification)
 * 4. Full screen intent & exact alarms (Android 14+)
 */
export function useAlarmPermissions() {
  const [hasPermission, setHasPermission] = useState(false);
  const [canScheduleExact, setCanScheduleExact] = useState(false);
  const [activityPermission, setActivityPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);

  useEffect(() => {
    async function requestAllAppPermissions() {
      // 1. Notification Permissions
      try {
        const notifSettings = await notifee.requestPermission();
        setHasPermission(
          notifSettings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
          notifSettings.authorizationStatus === AuthorizationStatus.PROVISIONAL
        );
      } catch {
        setHasPermission(true);
      }

      // 2. Android Physical Activity Recognition (Critical for hardware pedometer)
      try {
        const pedoPerm = await Pedometer.requestPermissionsAsync();
        setActivityPermission(pedoPerm.granted || pedoPerm.status === 'granted');
      } catch {
        // Handled safely
      }

      // 3. Camera Permission (For 30s standing wake-up verification)
      try {
        const camPerm = await Camera.requestCameraPermissionsAsync();
        setCameraPermission(camPerm.granted || camPerm.status === 'granted');
      } catch {
        // Handled safely
      }

      if (Platform.OS === 'android') {
        try {
          const exact = await NativeBridge.canScheduleExactAlarms();
          setCanScheduleExact(exact);
          const fullScreen = await NativeBridge.canUseFullScreenIntent();
          if (!fullScreen) {
            await NativeBridge.openFullScreenIntentSettings();
          }
        } catch {}
      }
    }

    // Delay by 400ms after splash screen to ensure native window is ready
    const timer = setTimeout(() => {
      requestAllAppPermissions().catch(() => {});
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return {
    hasPermission,
    canScheduleExact,
    activityPermission,
    cameraPermission,
  };
}
