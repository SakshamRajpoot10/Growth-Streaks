const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin that enables full-screen lock-screen display for alarms.
 * Adds android:showWhenLocked, android:turnScreenOn, and android:showForAllUsers
 * to the main Activity in AndroidManifest.xml.
 */
module.exports = function withAlarmLockScreen(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application?.[0];
    if (!mainApplication || !Array.isArray(mainApplication.activity)) {
      return config;
    }

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

    return config;
  });
};
