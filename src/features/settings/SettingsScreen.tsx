import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/colors';
import { useSettingsStore } from '../../store/useSettingsStore';

export const SettingsScreen: React.FC = () => {
  const {
    vibrationEnabled,
    setVibrationEnabled,
    theme,
    setTheme,
  } = useSettingsStore();

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>App Preferences</Text>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.itemTitle}>Alarm Vibration</Text>
              <Text style={styles.itemSubtitle}>Vibrate device on 3-strike alarm sequence</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: '#BDBDBD', true: Colors.light.primaryLight }}
              thumbColor={vibrationEnabled ? Colors.light.primary : '#FAFAFA'}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.itemTitle}>Dark Theme</Text>
              <Text style={styles.itemSubtitle}>Enable high contrast dark theme</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
              trackColor={{ false: '#BDBDBD', true: Colors.light.primaryLight }}
              thumbColor={theme === 'dark' ? Colors.light.primary : '#FAFAFA'}
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>About & Privacy</Text>

        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoTitle}>Architecture</Text>
            <Text style={styles.infoValue}>100% Offline (SQLite)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoTitle}>Full-Screen Intent</Text>
            <Text style={styles.infoValue}>Active Accountability</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoTitle}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </Card>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            🔒 Growth Streaks collects zero personal telemetry and works completely without internet access. All streaks, logs, and routines remain local to your device.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
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
    color: Colors.light.text,
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
    maxWidth: 240,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surfaceVariant,
  },
  infoTitle: {
    fontSize: 14,
    color: Colors.light.text,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  privacyNote: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 36,
  },
  privacyText: {
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 18,
    textAlign: 'center',
  },
});

