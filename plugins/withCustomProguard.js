const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withCustomProguard(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const proguardPath = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'proguard-rules.pro'
      );
      const rules = `
# Comprehensive R8 & ProGuard Rules for Growth Streak

-dontwarn **
-ignorewarnings
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}

# Notifee / Notification Kit
-keep class app.notifee.** { *; }
-keep class io.invertase.notifee.** { *; }
-dontwarn app.notifee.**
-dontwarn io.invertase.notifee.**

# Expo Native Modules
-keep class expo.modules.av.** { *; }
-keep class expo.modules.camera.** { *; }
-keep class expo.modules.sensors.** { *; }
-keep class expo.modules.sqlite.** { *; }
-keep class expo.modules.core.** { *; }

# React Native & Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# Android Security: Strip verbose & debug logging from release binary
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
}
`;
      if (fs.existsSync(proguardPath)) {
        fs.appendFileSync(proguardPath, rules);
      }
      return config;
    },
  ]);
};
