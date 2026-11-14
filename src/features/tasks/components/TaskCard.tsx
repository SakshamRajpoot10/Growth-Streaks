import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Task } from '../../../types/task';
import { getFocusAreaById } from '../../../constants/focus-areas';
import { formatTime, getDayName } from '../../../utils/date';
import { useTheme } from '../../../utils/theme';

interface TaskCardProps {
  task: Task;
  onToggleActive: (task: Task) => void;
  onPress: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleActive,
  onPress,
}) => {
  const { colors } = useTheme();
  const focus = getFocusAreaById(task.focusArea);
  const daysText =
    task.daysOfWeek.length === 7
      ? 'Every day'
      : task.daysOfWeek.map(getDayName).join(', ');

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onPress(task)}>
      <Card style={task.isActive ? styles.card : styles.inactiveCardWrapper}>
        <View style={styles.headerRow}>
          <View style={styles.titleInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.emoji}>{focus.emoji}</Text>
              <Text
                style={[
                  styles.title,
                  { color: colors.text },
                  !task.isActive && styles.inactiveText,
                ]}
              >
                {task.activityName}
              </Text>
            </View>
            <Badge
              label={task.focusArea || focus.name}
              color={focus.color + '20'}
              textColor={focus.color}
              style={styles.badge}
            />
          </View>
          <Switch
            value={task.isActive}
            onValueChange={() => onToggleActive(task)}
            trackColor={{ false: '#71717A', true: colors.primaryLight }}
            thumbColor={task.isActive ? colors.primary : '#FAFAFA'}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.time, { color: colors.primary }]}>
            ⏰ {formatTime(task.scheduledTime)}
          </Text>
          <Text style={[styles.days, { color: colors.textSecondary }]}>{daysText}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 6,
  },
  inactiveCardWrapper: {
    padding: 16,
    marginVertical: 6,
    opacity: 0.6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  inactiveText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
  },
  time: {
    fontSize: 14,
    fontWeight: '700',
  },
  days: {
    fontSize: 12,
    fontWeight: '600',
  },
});
