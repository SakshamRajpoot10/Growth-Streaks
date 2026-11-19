import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calculateNiceScale } from '../utils/chart-scaling';

export interface MiniDayData {
  dayLabel: string; // 'S', 'M', 'T', 'W', 'T', 'F', 'S'
  value: number;
  isToday: boolean;
  isGoalMet?: boolean;
}

interface MiniTrendBarChartProps {
  data: MiniDayData[];
  barColor?: string;
  goalValue?: number | null;
  showGoalLine?: boolean;
}

const CHART_HEIGHT = 44;

export const MiniTrendBarChart: React.FC<MiniTrendBarChartProps> = ({
  data,
  barColor = '#3B82F6',
  goalValue,
  showGoalLine = true,
}) => {
  const maxDataVal = Math.max(...data.map((d) => d.value), 0);
  const { top: scaleMax } = calculateNiceScale(maxDataVal, goalValue);

  const hasValidGoal = goalValue != null && goalValue > 0;
  const goalLineBottom =
    hasValidGoal ? Math.min(CHART_HEIGHT, Math.max(4, (goalValue / scaleMax) * CHART_HEIGHT)) : 0;

  return (
    <View style={styles.container}>
      {/* Bars Row with Background Goal Line */}
      <View style={styles.chartArea}>
        {/* Dashed Goal Reference Line */}
        {showGoalLine && goalLineBottom > 0 && (
          <View style={[styles.goalLine, { bottom: goalLineBottom }]} />
        )}

        {/* 7 Daily Bars */}
        <View style={styles.barsRow}>
          {data.map((item, index) => {
            const barHeight = item.value > 0 ? Math.max(4, Math.min(CHART_HEIGHT, (item.value / scaleMax) * CHART_HEIGHT)) : 2;

            return (
              <View key={`mini-bar-${index}`} style={styles.barCol}>
                {/* Checkmark indicator if goal met */}
                <View style={styles.checkSlot}>
                  {item.isGoalMet ? (
                    <Text style={[styles.checkMark, { color: barColor }]}>✓</Text>
                  ) : null}
                </View>

                {/* Vertical Bar */}
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: barHeight,
                        backgroundColor: item.value > 0 ? barColor : 'rgba(148, 163, 184, 0.25)',
                        opacity: item.isToday ? 1.0 : 0.8,
                      },
                    ]}
                  />
                </View>

                {/* Day Letter Label */}
                <Text
                  style={[
                    styles.dayLabel,
                    item.isToday && styles.dayLabelToday,
                  ]}
                >
                  {item.dayLabel}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartArea: {
    width: '100%',
    height: CHART_HEIGHT + 24,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(148, 163, 184, 0.45)',
    borderStyle: 'dashed',
    zIndex: 1,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    zIndex: 2,
  },
  barCol: {
    alignItems: 'center',
    width: 14,
  },
  checkSlot: {
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  checkMark: {
    fontSize: 9,
    fontWeight: '900',
  },
  barTrack: {
    height: CHART_HEIGHT,
    width: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: 8,
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
  },
  dayLabelToday: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
