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
  onTestWakeUp?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleActive,
  onPress,
  onTestWakeUp,
}) => {
  const { colors } = useTheme();
  const isWakeUp = task.focusArea?.toLowerCase() === 'wake up';
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
              <Text style={styles.emoji}>{isWakeUp ? '⏰' : focus.emoji}</Text>
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
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              <Badge
                label={task.focusArea || focus.name}
                color={focus.color + '20'}
                textColor={focus.color}
                style={styles.badge}
              />
              {isWakeUp && (
                <Badge
                  label="📸 60s Standing Verification"
                  color="#F59E0B20"
                  textColor="#D97706"
                  style={styles.badge}
                />
              )}
            </View>
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
          {isWakeUp && onTestWakeUp && (
            <TouchableOpacity
              onPress={() => onTestWakeUp(task)}
              style={styles.btnTestWakeUp}
            >
              <Text style={styles.btnTestWakeUpText}>📸 Test Alarm</Text>
            </TouchableOpacity>
          )}
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
  btnTestWakeUp: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
  },
  btnTestWakeUpText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
});
