import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { DailyProgressRing } from './components/DailyProgressRing';
import { StreakCounter } from './components/StreakCounter';
import { WeeklyMetricCard } from './components/WeeklyMetricCard';
import { FitnessOverviewCard } from './components/FitnessOverviewCard';
import { UpcomingTaskList } from './components/UpcomingTaskList';
import { EmptyState } from '../../components/common/EmptyState';
import { useFitnessStore } from '../../store/useFitnessStore';
import { openDatabase } from '../../db/client';
import { getDailyStats, getWeeklyStats, getCompletedDates } from '../../db/queries/analytics';
import { getTasksForDay } from '../../db/queries/tasks';
import { getLogsByDate } from '../../db/queries/task-logs';
import { calculateCurrentStreak, calculateLongestStreak } from '../../utils/streak-calculator';
import { getToday, getTodayDayOfWeek, getWeekRange } from '../../utils/date';
import { Task } from '../../types/task';
import { TaskLog, DailyStats, WeeklyStats } from '../../types/task-log';

export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Record<string, TaskLog>>({});
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    total: 0,
    completed: 0,
    declined: 0,
    missed: 0,
    pending: 0,
    rate: 0,
  });
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    total: 0,
    completed: 0,
    declined: 0,
    missed: 0,
    pending: 0,
    rate: 0,
    startDate: '',
    endDate: '',
  });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  // Fitness Store hook
  const {
    log: fitnessLog,
    goal: fitnessGoal,
    fitnessStreak,
    loadFitnessData,
    simulateWalk,
    startTracking,
  } = useFitnessStore();

  const loadData = useCallback(() => {
    try {
      loadFitnessData();
      const db = openDatabase();
      const today = getToday();
      const todayDayOfWeek = getTodayDayOfWeek();
      const weekRange = getWeekRange();

      // Load today's tasks
      const todayTasks = getTasksForDay(db, todayDayOfWeek);
      setTasks(todayTasks);

      // Load today's logs
      const todayLogs = getLogsByDate(db, today);
      const logMap: Record<string, TaskLog> = {};
      todayLogs.forEach((l) => {
        logMap[l.taskId] = l;
      });
      setLogs(logMap);

      // Load analytics
      const dStats = getDailyStats(db, today);
      setDailyStats(dStats);

      const wStats = getWeeklyStats(db, weekRange.start, weekRange.end);
      setWeeklyStats(wStats);

      const completedDates = getCompletedDates(db);
      const streak = calculateCurrentStreak(completedDates);
      const longest = calculateLongestStreak(completedDates);
      setCurrentStreak(streak);
      setLongestStreak(longest);
    } catch (e) {
      // Handled safely
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <StreakCounter streak={currentStreak} longestStreak={longestStreak} />

        <DailyProgressRing
          completed={dailyStats.completed}
          total={tasks.length}
          percentage={tasks.length > 0 ? Math.round((dailyStats.completed / tasks.length) * 100) : 0}
        />

        <FitnessOverviewCard
          log={fitnessLog}
          goal={fitnessGoal}
          streak={fitnessStreak}
          onPressDetails={() => router.push('/(tabs)/fitness' as any)}
          onSimulateWalk={() => simulateWalk(500)}
        />

        <WeeklyMetricCard
          totalAlarms={weeklyStats.total}
          completedAlarms={weeklyStats.completed}
          successRate={weeklyStats.rate}
        />

        {tasks.length > 0 ? (
          <UpcomingTaskList
            tasks={tasks}
            logs={logs}
            onTaskPress={() => router.push('/(tabs)/tasks' as any)}
          />
        ) : (
          <EmptyState
            icon="🌱"
            title="Start Your Growth Routine"
            description="Create your first habit or accountability alarm to begin tracking streaks."
            actionTitle="+ Create Routine"
            onAction={() => router.push('/(tabs)/tasks' as any)}
          />
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  bottomSpacer: {
    height: 32,
  },
});
