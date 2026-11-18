const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin that enables:
 * 1. Full-screen lock-screen display for alarms (showWhenLocked, turnScreenOn, showForAllUsers).
 * 2. 24/7 background pedometer tracking via Notifee ForegroundService (foregroundServiceType="health").
 */
module.exports = function withAlarmLockScreen(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application?.[0];
    if (!mainApplication) {
      return config;
    }

    if (Array.isArray(mainApplication.activity)) {
      const mainActivity = mainApplication.activity.find(
        (a) => a.$ && a.$['android:name'] === '.MainActivity'
      );

      if (mainActivity) {
        if (!mainActivity.$) {
          mainActivity.$ = {};
        }
        mainActivity.$['android:showWhenLocked'] = 'true';
        mainActivity.$['android:turnScreenOn'] = 'true';
        mainActivity.$['android:showForAllUsers'] = 'true';
        mainActivity.$['android:excludeFromRecents'] = 'false';
      }
    }

    if (!mainApplication.service) {
      mainApplication.service = [];
    }
    const hasService = mainApplication.service.some(
      (s) => s.$ && s.$['android:name'] === 'app.notifee.core.ForegroundService'
    );
    if (!hasService) {
      mainApplication.service.push({
        $: {
          'android:name': 'app.notifee.core.ForegroundService',
          'android:foregroundServiceType': 'health',
        },
      });
    }

    return config;
  });
};
