import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../utils/theme';
import { FitnessDailyLog, FitnessGoal } from '../../../db/queries/fitness';

interface FitnessOverviewCardProps {
  log: FitnessDailyLog;
  goal: FitnessGoal;
  streak: number;
  onPressDetails?: () => void;
}

export const FitnessOverviewCard: React.FC<FitnessOverviewCardProps> = ({
  log,
  goal,
  streak,
  onPressDetails,
}) => {
  const { colors, isDark } = useTheme();

  // Calculate percentage of target achieved
  let targetNum = goal.targetValue || 3.0;
  let currentNum = 0;
  let unit = '';

  switch (goal.goalType) {
    case 'distance_km':
      currentNum = log.distanceKm;
      unit = 'km';
      break;
    case 'calories':
      currentNum = log.calories;
      unit = 'kcal';
      break;
    case 'active_minutes':
      currentNum = log.activeMinutes;
      unit = 'min';
      break;
    case 'steps':
      currentNum = log.steps;
      unit = 'steps';
      break;
  }

  const pct = Math.min(100, Math.round((currentNum / (targetNum || 1)) * 100));
  const isGoalDone = currentNum >= targetNum;

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Today's Movement</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Target: {targetNum} {unit}
          </Text>
        </View>
        {streak > 0 && (
          <View style={[styles.streakBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7' }]}>
            <Text style={[styles.streakText, { color: '#10B981' }]}>🏃 {streak}D STREAK</Text>
          </View>
        )}
      </View>

      {/* Progress Ring / Visual Area */}
      <View style={styles.mainProgressContainer}>
        <View style={[styles.stepCircle, { borderColor: isGoalDone ? '#10B981' : colors.primaryLight }]}>
          <Text style={styles.footprintIcon}>👟</Text>
          <Text style={[styles.stepBigNumber, { color: colors.text }]}>
            {log.steps.toLocaleString()}
          </Text>
          <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>STEPS TODAY</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarWrapper}>
        <View style={[styles.progressBarTrack, { backgroundColor: colors.borderSubtle }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${pct}%`,
                backgroundColor: isGoalDone ? '#10B981' : '#EA580C',
              },
            ]}
          />
        </View>
        <Text style={[styles.pctText, { color: isGoalDone ? '#10B981' : '#EA580C' }]}>
          {pct}% {isGoalDone ? '✓ GOAL COMPLETED' : 'OF DAILY GOAL'}
        </Text>
      </View>

      {/* 3 Metric Pills */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricPill, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.metricVal, { color: colors.text }]}>{log.distanceKm} km</Text>
          <Text style={[styles.metricLbl, { color: colors.textSecondary }]}>Distance</Text>
        </View>
        <View style={[styles.metricPill, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.metricVal, { color: colors.text }]}>{log.calories} kcal</Text>
          <Text style={[styles.metricLbl, { color: colors.textSecondary }]}>Burned</Text>
        </View>
        <View style={[styles.metricPill, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.metricVal, { color: colors.text }]}>{log.activeMinutes} min</Text>
          <Text style={[styles.metricLbl, { color: colors.textSecondary }]}>Active</Text>
        </View>
      </View>

      {/* Navigation Controls */}
      {onPressDetails && (
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onPressDetails} style={styles.btnDetails}>
            <Text style={styles.btnDetailsText}>View Fit Analytics ➔</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  streakBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '800',
  },
  mainProgressContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  stepCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footprintIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  stepBigNumber: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressBarWrapper: {
    marginVertical: 8,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  metricPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  metricLbl: {
    fontSize: 11,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  btnTestWalk: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnTestText: {
    fontSize: 12,
    fontWeight: '600',
  },
  btnDetails: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  btnDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
});
