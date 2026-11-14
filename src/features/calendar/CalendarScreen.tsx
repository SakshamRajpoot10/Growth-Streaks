import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { MonthNavigator } from './components/MonthNavigator';
import { HeatmapGrid } from './components/HeatmapGrid';
import { DayDetailSheet } from './components/DayDetailSheet';
import { Card } from '../../components/ui/Card';
import { openDatabase } from '../../db/client';
import { getAllTasks } from '../../db/queries/tasks';
import { getLogsByDate } from '../../db/queries/task-logs';
import { getDailyStats } from '../../db/queries/analytics';
import { getToday } from '../../utils/date';
import { useTheme } from '../../utils/theme';
import { Task } from '../../types/task';
import { TaskLog, DailyStats } from '../../types/task-log';

export const CalendarScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(getToday());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<Record<string, TaskLog>>({});
  const [logsByDate, setLogsByDate] = useState<Record<string, TaskLog[]>>({});
  const [todayStats, setTodayStats] = useState<DailyStats>({
    total: 0,
    completed: 0,
    declined: 0,
    missed: 0,
    pending: 0,
    rate: 0,
  });

  const todayStr = getToday();
  const todayDateObj = new Date();
  const todayFormatted = todayDateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const loadData = useCallback(() => {
    try {
      const db = openDatabase();
      const allTasks = getAllTasks(db);
      setTasks(allTasks);

      // Load today stats
      const stats = getDailyStats(db, todayStr);
      setTodayStats(stats);

      // Load logs for current selected month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
      const daysInMonth = new Date(year, month, 0).getDate();
      const endStr = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

      const monthLogs = db.getAllSync(
        'SELECT * FROM task_logs WHERE date BETWEEN ? AND ?',
        [startStr, endStr]
      ) as Array<Record<string, unknown>>;

      const logMapByDate: Record<string, TaskLog[]> = {};
      monthLogs.forEach((row) => {
        const item: TaskLog = {
          id: row.id as string,
          taskId: row.task_id as string,
          date: row.date as string,
          status: row.status as any,
          triggerCount: (row.trigger_count as number) || 0,
          respondedAt: (row.responded_at as string) || null,
          createdAt: row.created_at as number,
        };
        if (!logMapByDate[item.date]) {
          logMapByDate[item.date] = [];
        }
        logMapByDate[item.date].push(item);
      });
      setLogsByDate(logMapByDate);

      // Load logs for currently selected day
      const dayLogs = getLogsByDate(db, selectedDay);
      const selectedLogMap: Record<string, TaskLog> = {};
      dayLogs.forEach((l) => {
        selectedLogMap[l.taskId] = l;
      });
      setSelectedLogs(selectedLogMap);
    } catch (e) {
      // Handled safely
    }
  }, [currentDate, selectedDay, todayStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (dateStr: string) => {
    setSelectedDay(dateStr);
  };

  // Today summary message
  const getTodayMessage = () => {
    if (todayStats.total === 0) {
      return 'No routine logged for this day.';
    }
    if (todayStats.completed > 0) {
      return `${todayStats.completed} of ${todayStats.total} completed today (${todayStats.rate}%)`;
    }
    return `${todayStats.total} routines scheduled for today`;
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Today Header Banner */}
        <Card
          style={[
            styles.todayBanner,
            isDark
              ? { backgroundColor: '#131A29', borderColor: '#1E293B' }
              : { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' },
          ]}
        >
          <View style={styles.todayBannerContent}>
            <View>
              <Text style={[styles.todayDateText, { color: colors.text }]}>
                {todayFormatted}
              </Text>
              <Text style={[styles.todayStatusText, { color: todayStats.completed > 0 ? '#10B981' : colors.textSecondary }]}>
                {getTodayMessage()}
              </Text>
            </View>
            <View style={styles.todayIconWrapper}>
              <Text style={{ fontSize: 24 }}>
                {todayStats.completed > 0 ? '🔥' : '🌱'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Month Navigation */}
        <MonthNavigator
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* Calendar Grid with 1..31 days and leading spacers */}
        <HeatmapGrid
          year={currentDate.getFullYear()}
          month={currentDate.getMonth() + 1}
          tasks={tasks}
          logsByDate={logsByDate}
          selectedDate={selectedDay}
          onSelectDate={handleSelectDay}
        />

        {/* Day Detail Sheet for Selected Date */}
        <DayDetailSheet
          date={selectedDay}
          tasks={tasks}
          logs={selectedLogs}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  todayBanner: {
    padding: 16,
    marginVertical: 4,
    borderRadius: 16,
  },
  todayBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayDateText: {
    fontSize: 16,
    fontWeight: '800',
  },
  todayStatusText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  todayIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: 36,
  },
});
