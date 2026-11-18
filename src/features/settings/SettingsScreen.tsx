import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Vibration, Platform, TouchableOpacity } from 'react-native';
import notifee from 'react-native-notify-kit';
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

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Alarm & Battery Reliability</Text>

        <Card style={styles.card}>
          <View style={styles.reliabilityRow}>
            <Text style={{ fontSize: 20 }}>⚡</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Keep Alarms Accurate (OEM Devices)</Text>
              <Text style={[styles.itemSubtitle, { color: colors.textSecondary, maxWidth: '100%', marginTop: 4 }]}>
                On Realme, Oppo, Samsung, and Xiaomi phones, please ensure StandUp is set to "Don't Optimize / Unrestricted" in Android Battery Settings so alarms ring on time when your screen is locked.
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
                  onPress={() => {
                    if (Platform.OS === 'android') {
                      notifee.openBatteryOptimizationSettings().catch(() => {});
                    }
                  }}
                >
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>🔋 Battery Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
                  onPress={() => {
                    if (Platform.OS === 'android') {
                      notifee.openAlarmPermissionSettings().catch(() => {});
                    }
                  }}
                >
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>⏰ Alarm Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Device Permissions Guide</Text>

        <Card style={styles.card}>
          <View style={styles.permissionItem}>
            <Text style={[styles.permissionName, { color: colors.text }]}>⏰ Exact Alarms & Wake Lock</Text>
            <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>
              Wakes device up from deep sleep to ring at the exact second you set.
            </Text>
          </View>
          <View style={[styles.permissionItem, { borderTopWidth: 1, borderTopColor: isDark ? '#1F2937' : '#F1F5F9' }]}>
            <Text style={[styles.permissionName, { color: colors.text }]}>📷 Front Selfie Camera</Text>
            <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>
              Used solely for the 30-second standing posture verification. Images are processed locally in memory and never stored or uploaded.
            </Text>
          </View>
          <View style={[styles.permissionItem, { borderTopWidth: 1, borderTopColor: isDark ? '#1F2937' : '#F1F5F9' }]}>
            <Text style={[styles.permissionName, { color: colors.text }]}>🚶 Physical Activity & Pedometer</Text>
            <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>
              Connects to hardware step sensor to record daily walking streaks with 0% battery impact.
            </Text>
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>About & Privacy</Text>

        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>Privacy Model</Text>
            <Text style={[styles.infoValue, { color: '#10B981' }]}>100% Offline • Zero Telemetry</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>Database Storage</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>Local SQLite WAL Engine</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>Alarm Engine</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>Android Exact AlarmManager</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>Ringtones</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>21 Built-In Sounds</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>Edition</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>StandUp Production v1.0.0</Text>
          </View>
        </Card>

        <View style={[styles.privacyNote, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#EFF6FF', borderColor: isDark ? 'rgba(56, 189, 248, 0.22)' : '#BFDBFE' }]}>
          <Text style={[styles.privacyText, { color: isDark ? '#38BDF8' : '#1E40AF' }]}>
            🔒 StandUp collects zero personal telemetry, tracks no user data, and never transmits information across the internet. All streaks, habits, logs, and routines remain permanently on your device for lifetime privacy.
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
  reliabilityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  permissionItem: {
    paddingVertical: 10,
  },
  permissionName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  permissionDesc: {
    fontSize: 13,
    lineHeight: 18,
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
