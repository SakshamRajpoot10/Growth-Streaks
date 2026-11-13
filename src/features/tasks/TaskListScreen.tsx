import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { openDatabase } from '../../db/client';
import { getAllTasks, createTask, updateTask, toggleTask, deleteTask } from '../../db/queries/tasks';
import { scheduleTask3StrikeSequence, cancelTaskAlarms } from '../alarm/services/alarm-scheduler';
import { getToday } from '../../utils/date';
import { generateUUID } from '../../utils/uuid';
import { Task, TaskFormData } from '../../types/task';

export const TaskListScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = useCallback(() => {
    try {
      const db = openDatabase();
      const list = getAllTasks(db);
      setTasks(list);
    } catch {
      // Handled silently
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (formData: TaskFormData) => {
    try {
      const db = openDatabase();
      const newId = generateUUID();
      const created = createTask(db, {
        id: newId,
        activityName: formData.activityName,
        focusArea: formData.focusArea,
        scheduledTime: formData.scheduledTime,
        daysOfWeek: formData.daysOfWeek,
        alarmSound: formData.alarmSound,
        preAlarmMinutes: formData.preAlarmMinutes,
        isActive: true,
      });

      // Schedule 3-strike alarm for today if active
      await scheduleTask3StrikeSequence(created, getToday());

      setIsCreating(false);
      loadTasks();
    } catch {
      Alert.alert('Error', 'Failed to save routine.');
    }
  };

  const handleUpdateTask = async (formData: TaskFormData) => {
    if (!editingTask) return;
    try {
      const db = openDatabase();
      const updated = updateTask(db, editingTask.id, {
        activityName: formData.activityName,
        focusArea: formData.focusArea,
        scheduledTime: formData.scheduledTime,
        daysOfWeek: formData.daysOfWeek,
        alarmSound: formData.alarmSound,
        preAlarmMinutes: formData.preAlarmMinutes,
      });

      if (updated && updated.isActive) {
        await cancelTaskAlarms(updated.id, getToday());
        await scheduleTask3StrikeSequence(updated, getToday());
      }

      setEditingTask(null);
      loadTasks();
    } catch {
      Alert.alert('Error', 'Failed to update routine.');
    }
  };

  const handleToggleActive = async (task: Task) => {
    try {
      const db = openDatabase();
      const updated = toggleTask(db, task.id);
      if (updated) {
        if (updated.isActive) {
          await scheduleTask3StrikeSequence(updated, getToday());
        } else {
          await cancelTaskAlarms(updated.id, getToday());
        }
      }
      loadTasks();
    } catch {
      // Handled silently
    }
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to remove "${task.activityName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const db = openDatabase();
            await cancelTaskAlarms(task.id, getToday());
            deleteTask(db, task.id);
            setEditingTask(null);
            loadTasks();
          },
        },
      ]
    );
  };

  if (isCreating) {
    return (
      <ScreenWrapper>
        <TaskForm
          onSubmit={handleCreateTask}
          submitLabel="Create Routine"
        />
        <Button
          title="Cancel"
          variant="secondary"
          onPress={() => setIsCreating(false)}
          style={styles.cancelBtn}
        />
      </ScreenWrapper>
    );
  }

  if (editingTask) {
    return (
      <ScreenWrapper>
        <TaskForm
          initialData={{
            activityName: editingTask.activityName,
            focusArea: editingTask.focusArea,
            scheduledTime: editingTask.scheduledTime,
            daysOfWeek: editingTask.daysOfWeek,
            alarmSound: editingTask.alarmSound,
            preAlarmMinutes: editingTask.preAlarmMinutes,
          }}
          onSubmit={handleUpdateTask}
          submitLabel="Update Routine"
        />
        <Button
          title="Delete Routine"
          variant="danger"
          onPress={() => handleDeleteTask(editingTask)}
          style={styles.deleteBtn}
        />
        <Button
          title="Cancel"
          variant="secondary"
          onPress={() => setEditingTask(null)}
          style={styles.cancelBtn}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.topBar}>
        <Button
          title="+ Add Routine"
          onPress={() => setIsCreating(true)}
          style={styles.addBtn}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleActive={handleToggleActive}
              onPress={(t) => setEditingTask(t)}
            />
          ))
        ) : (
          <EmptyState
            icon="⏰"
            title="No Routines Created"
            description="Add your first habit, study block, or workout to activate lock-screen alarms."
            actionTitle="+ Add Routine"
            onAction={() => setIsCreating(true)}
          />
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  addBtn: {
    minWidth: 140,
  },
  cancelBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
  deleteBtn: {
    marginTop: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});
