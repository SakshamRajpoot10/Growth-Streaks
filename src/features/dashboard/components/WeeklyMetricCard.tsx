import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { Colors } from '../../../constants/colors';

interface WeeklyMetricCardProps {
  totalAlarms: number;
  completedAlarms: number;
  successRate: number;
}

export const WeeklyMetricCard: React.FC<WeeklyMetricCardProps> = ({
  totalAlarms,
  completedAlarms,
  successRate,
}) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Weekly Performance</Text>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalAlarms}</Text>
          <Text style={styles.statLabel}>Alarms Set</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{completedAlarms}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text
            style={[
              styles.statValue,
              { color: successRate >= 70 ? Colors.light.primary : Colors.light.accent },
            ]}
          >
            {successRate}%
          </Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>
      <Text style={styles.summaryText}>
        {totalAlarms > 0
          ? `You set ${totalAlarms} alarms this week and completed ${completedAlarms}.`
          : 'No alarms registered yet for this week.'}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.light.border,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
});
