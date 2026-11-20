import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { useFitnessStore } from '../../store/useFitnessStore';
import { openDatabase } from '../../db/client';
import {
  getLast7DaysLogs,
  getCalendarWeekLogs,
  getCalendarMonthLogs,
  FitnessDailyLog,
} from '../../db/queries/fitness';
import { FitnessDashboard, MetricType } from './components/FitnessDashboard';
import { FitnessMetricDetailScreen } from './components/FitnessMetricDetailScreen';

export const FitnessScreen: React.FC = () => {
  const { log, userGoals, loadFitnessData, startTracking } = useFitnessStore();

  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);
  const [last7DaysLogs, setLast7DaysLogs] = useState<FitnessDailyLog[]>([]);

  const loadAllLogs = useCallback(() => {
    try {
      const db = openDatabase();
      const now = new Date();
      const last7 = getLast7DaysLogs(db, now);
      setLast7DaysLogs(last7);
    } catch {}
  }, []);

  useEffect(() => {
    loadFitnessData();
    startTracking().catch(() => {});
    loadAllLogs();
  }, [loadFitnessData, startTracking, loadAllLogs]);

  return (
    <ScreenWrapper withTopInset={true}>
      <View style={styles.container}>
        {selectedMetric === null ? (
          // LEVEL 1: COMPLETE FITNESS & ACTIVITY DASHBOARD (Reference Image 1)
          <FitnessDashboard
            last7DaysLogs={last7DaysLogs}
            onSelectMetric={(metric) => setSelectedMetric(metric)}
            onRefresh={() => {
              loadFitnessData();
              loadAllLogs();
            }}
          />
        ) : (
          // LEVEL 2: DEDICATED METRIC DETAIL SCREEN (Reference Images 2, 3, 4)
          <FitnessMetricDetailScreen
            metric={selectedMetric}
            onBack={() => setSelectedMetric(null)}
            userGoals={userGoals}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
