import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { MonthNavigator } from './components/MonthNavigator';
import { HeatmapGrid } from './components/HeatmapGrid';
import { DayDetailSheet } from './components/DayDetailSheet';
import { openDatabase } from '../../db/client';
import { getMonthlyHeatmapData } from '../../db/queries/analytics';
import { getAllTasks } from '../../db/queries/tasks';
import { getLogsByDate } from '../../db/queries/task-logs';
import { getToday } from '../../utils/date';
import { HeatmapDay, TaskLog } from '../../types/task-log';
import { Task } from '../../types/task';

export const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [heatmapDays, setHeatmapDays] = useState<HeatmapDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(getToday());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<Record<string, TaskLog>>({});

  const loadMonthData = useCallback(() => {
    try {
      const db = openDatabase();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const days = getMonthlyHeatmapData(db, year, month);
      setHeatmapDays(days);

      const allTasks = getAllTasks(db);
      setTasks(allTasks);

      const logs = getLogsByDate(db, selectedDay);
      const logMap: Record<string, TaskLog> = {};
      logs.forEach((l) => {
        logMap[l.taskId] = l;
      });
      setSelectedLogs(logMap);
    } catch (e) {
      console.error('Error loading calendar data:', e);
    }
  }, [currentDate, selectedDay]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: HeatmapDay) => {
    setSelectedDay(day.date);
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <MonthNavigator
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <HeatmapGrid
          days={heatmapDays}
          onSelectDay={handleSelectDay}
          selectedDate={selectedDay}
        />

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
  bottomSpacer: {
    height: 32,
  },
});
