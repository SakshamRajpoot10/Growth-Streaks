import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Vibration, Platform } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTheme } from '../../utils/theme';

export const SettingsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const {
    vibrationEnabled,
    setVibrationEnabled,
    theme,
    setTheme,
  } = useSettingsStore();

  const handleVibrationToggle = (val: boolean) => {
    setVibrationEnabled(val);
    if (val && Platform.OS !== 'web') {
      try {
        Vibration.vibrate([0, 300, 150, 300]);
      } catch {}
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App Preferences</Text>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Alarm Vibration</Text>
              <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                Vibrate device on 3-strike alarm sequence
              </Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleVibrationToggle}
              trackColor={{ false: '#71717A', true: colors.primaryLight }}
              thumbColor={vibrationEnabled ? colors.primary : '#FAFAFA'}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Dark Theme</Text>
              <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                Enable high-contrast night theme
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
              trackColor={{ false: '#71717A', true: colors.primaryLight }}
              thumbColor={theme === 'dark' ? colors.primary : '#FAFAFA'}
            />
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>About & Privacy</Text>

        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>Architecture</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>100% Offline (SQLite WAL)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>Lock-Screen Alarms</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>3-Strike Active Engine</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>Ringtones</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>10 Built-In Sounds</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>App Version</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0 (Play Store Edition)</Text>
          </View>
        </Card>

        <View style={[styles.privacyNote, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#EFF6FF', borderColor: isDark ? 'rgba(56, 189, 248, 0.22)' : '#BFDBFE' }]}>
          <Text style={[styles.privacyText, { color: isDark ? '#38BDF8' : '#1E40AF' }]}>
            🔒 Growth Streaks collects zero personal telemetry and works completely without internet access. All streaks, logs, and routines remain local to your device for lifetime privacy.
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    padding: 16,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 13,
    marginTop: 2,
    maxWidth: 240,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoTitle: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  privacyNote: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 24,
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 19,
  },
});
