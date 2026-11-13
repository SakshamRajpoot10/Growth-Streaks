import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../../../types/task';
import { TaskLog } from '../../../types/task-log';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Colors } from '../../../constants/colors';
import { getFocusAreaById } from '../../../constants/focus-areas';
import { formatTime } from '../../../utils/date';

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
  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No routines left for today.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Today's Routines</Text>
      {tasks.map((task) => {
        const log = logs[task.id];
        const focus = getFocusAreaById(task.focusArea);

        const getStatusBadge = () => {
          if (!log || log.status === 'pending') {
            return <Badge label="⏳ Pending" color="#FFF9C4" textColor="#F57F17" />;
          }
          if (log.status === 'yes') {
            return <Badge label="✅ Done" color="#E8F5E9" textColor="#2E7D32" />;
          }
          if (log.status === 'no') {
            return <Badge label="❌ Skipped" color="#FFEBEE" textColor="#C62828" />;
          }
          return <Badge label="⚠️ Missed" color="#ECEFF1" textColor="#546E7A" />;
        };

        return (
          <TouchableOpacity
            key={task.id}
            activeOpacity={0.8}
            onPress={() => onTaskPress?.(task)}
          >
            <Card style={styles.taskCard}>
              <View style={styles.leftContent}>
                <Text style={styles.time}>{formatTime(task.scheduledTime)}</Text>
                <View style={styles.titleRow}>
                  <Text style={styles.focusEmoji}>{focus.emoji}</Text>
                  <Text style={styles.taskTitle}>{task.activityName}</Text>
                </View>
                <Text style={styles.focusLabel}>{focus.name}</Text>
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
    color: Colors.light.text,
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
    color: Colors.light.primary,
    marginBottom: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  focusEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  focusLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  rightContent: {
    marginLeft: 12,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});
