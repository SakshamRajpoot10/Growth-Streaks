import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../utils/theme';
import { Task } from '../../../types/task';
import { TaskLog } from '../../../types/task-log';
import { formatTime } from '../../../utils/date';

interface DayDetailSheetProps {
  date: string;
  tasks: Task[];
  logs: Record<string, TaskLog>;
}

export const DayDetailSheet: React.FC<DayDetailSheetProps> = ({
  date,
  tasks,
  logs,
}) => {
  const { colors, isDark } = useTheme();

  // Parse YYYY-MM-DD safely without timezone shifts
  const [yearStr, monthStr, dayStr] = date.split('-');
  const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));

  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const jsDay = dateObj.getDay();
  const isoDay = jsDay === 0 ? 7 : jsDay;

  // Filter tasks that are scheduled on this day of week
  const scheduledTasks = tasks.filter((t) => t.daysOfWeek.includes(isoDay));

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: colors.text }]}>
          📅 {formattedDate}
        </Text>
        <Text style={[styles.taskCount, { color: colors.textSecondary }]}>
          {scheduledTasks.length} {scheduledTasks.length === 1 ? 'routine' : 'routines'}
        </Text>
      </View>

      {scheduledTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No routines scheduled for this day.
          </Text>
        </View>
      ) : (
        scheduledTasks.map((task) => {
          const log = logs[task.id];
          const getStatusBadge = () => {
            if (!log || log.status === 'pending') {
              return (
                <Badge
                  label="⏳ Scheduled"
                  color={isDark ? '#422006' : '#FEF3C7'}
                  textColor={isDark ? '#FBBF24' : '#B45309'}
                />
              );
            }
            if (log.status === 'yes') {
              return (
                <Badge
                  label="✅ Completed"
                  color={isDark ? '#064E3B' : '#DCFCE7'}
                  textColor={isDark ? '#34D399' : '#15803D'}
                />
              );
            }
            if (log.status === 'no') {
              return (
                <Badge
                  label="❌ Skipped"
                  color={isDark ? '#450A0A' : '#FEE2E2'}
                  textColor={isDark ? '#F87171' : '#B91C1C'}
                />
              );
            }
            return (
              <Badge
                label="⚠️ Missed"
                color={isDark ? '#334155' : '#E2E8F0'}
                textColor={isDark ? '#94A3B8' : '#475569'}
              />
            );
          };

          return (
            <View
              key={task.id}
              style={[
                styles.taskRow,
                { borderBottomColor: isDark ? '#1E293B' : colors.surfaceVariant },
              ]}
            >
              <View style={styles.taskMeta}>
                <Text style={[styles.taskTitle, { color: colors.text }]}>{task.activityName}</Text>
                <View style={styles.subMeta}>
                  <Text style={[styles.taskTime, { color: colors.primary }]}>
                    ⏰ {formatTime(task.scheduledTime)}
                  </Text>
                  <Text style={[styles.taskFocus, { color: colors.textSecondary }]}>
                    • {task.focusArea}
                  </Text>
                </View>
              </View>
              {getStatusBadge()}
            </View>
          );
        })
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  taskMeta: {
    flex: 1,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  subMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  taskTime: {
    fontSize: 13,
    fontWeight: '700',
  },
  taskFocus: {
    fontSize: 12,
    marginLeft: 6,
  },
  emptyContainer: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
