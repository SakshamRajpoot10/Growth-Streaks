const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin that copies all alarm .mp3 files into android/app/src/main/res/raw/
 * so Android's native AlarmManager & NotificationManager can play them in the background
 * via STREAM_ALARM even when the app is closed, killed, or the screen is locked.
 */
const withAlarmSounds = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const rawResDir = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'res',
        'raw'
      );

      if (!fs.existsSync(rawResDir)) {
        fs.mkdirSync(rawResDir, { recursive: true });
      }

      const soundsDir = path.join(projectRoot, 'assets', 'sounds');
      if (fs.existsSync(soundsDir)) {
        const files = fs.readdirSync(soundsDir);
        for (const file of files) {
          if (file.endsWith('.mp3')) {
            const src = path.join(soundsDir, file);
            const dest = path.join(rawResDir, file);
            fs.copyFileSync(src, dest);
          }
        }
      }
      return config;
    },
  ]);
};

module.exports = withAlarmSounds;
