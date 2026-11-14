import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../utils/theme';

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
  const { colors } = useTheme();

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>Weekly Performance</Text>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.text }]}>{totalAlarms}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Alarms Set</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.text }]}>{completedAlarms}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.statBox}>
          <Text
            style={[
              styles.statValue,
              { color: successRate >= 70 ? colors.primary : colors.accent },
            ]}
          >
            {successRate}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Success Rate</Text>
        </View>
      </View>
      <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
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
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 32,
  },
  summaryText: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});
