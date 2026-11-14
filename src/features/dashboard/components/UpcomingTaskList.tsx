import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../../../types/task';
import { TaskLog } from '../../../types/task-log';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { getFocusAreaById } from '../../../constants/focus-areas';
import { formatTime } from '../../../utils/date';
import { useTheme } from '../../../utils/theme';

interface UpcomingTaskListProps {
  tasks: Task[];
  logs: Record<string, TaskLog>; // taskId -> log
  onTaskPress?: (task: Task) => void;
}

export const UpcomingTaskList: React.FC<UpcomingTaskListProps> = ({
  tasks,
  logs,
  onTaskPress,
}) => {
  const { colors, isDark } = useTheme();

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No routines left for today.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionHeader, { color: colors.text }]}>Today's Routines</Text>
      {tasks.map((task) => {
        const log = logs[task.id];
        const focus = getFocusAreaById(task.focusArea);

        const getStatusBadge = () => {
          if (!log || log.status === 'pending') {
            return (
              <Badge
                label="⏳ Pending"
                color={isDark ? '#422006' : '#FEF3C7'}
                textColor={isDark ? '#FBBF24' : '#B45309'}
              />
            );
          }
          if (log.status === 'yes') {
            return (
              <Badge
                label="✅ Done"
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
          <TouchableOpacity
            key={task.id}
            activeOpacity={0.8}
            onPress={() => onTaskPress?.(task)}
          >
            <Card style={styles.taskCard}>
              <View style={styles.leftContent}>
                <Text style={[styles.time, { color: colors.primary }]}>
                  ⏰ {formatTime(task.scheduledTime)}
                </Text>
                <View style={styles.titleRow}>
                  <Text style={styles.focusEmoji}>{focus.emoji}</Text>
                  <Text style={[styles.taskTitle, { color: colors.text }]}>{task.activityName}</Text>
                </View>
                <Text style={[styles.focusLabel, { color: colors.textSecondary }]}>{task.focusArea || focus.name}</Text>
              </View>
              <View style={styles.rightContent}>{getStatusBadge()}</View>
            </Card>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginVertical: 4,
  },
  leftContent: {
    flex: 1,
  },
  time: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  focusEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  focusLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  rightContent: {
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
