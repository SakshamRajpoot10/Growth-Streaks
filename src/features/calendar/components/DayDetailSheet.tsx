import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Colors } from '../../../constants/colors';
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
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card style={styles.card}>
      <Text style={styles.header}>{formattedDate}</Text>
      {tasks.length === 0 ? (
        <Text style={styles.emptyText}>No routines logged for this day.</Text>
      ) : (
        tasks.map((task) => {
          const log = logs[task.id];
          const getStatusBadge = () => {
            if (!log || log.status === 'pending') {
              return <Badge label="⏳ Pending" color="#FFF9C4" textColor="#F57F17" />;
            }
            if (log.status === 'yes') {
              return <Badge label="✅ Completed" color="#E8F5E9" textColor="#2E7D32" />;
            }
            if (log.status === 'no') {
              return <Badge label="❌ Skipped" color="#FFEBEE" textColor="#C62828" />;
            }
            return <Badge label="⚠️ Missed" color="#ECEFF1" textColor="#546E7A" />;
          };

          return (
            <View key={task.id} style={styles.taskRow}>
              <View>
                <Text style={styles.taskTitle}>{task.activityName}</Text>
                <Text style={styles.taskTime}>{formatTime(task.scheduledTime)}</Text>
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
  header: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surfaceVariant,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  taskTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    paddingVertical: 8,
  },
});
