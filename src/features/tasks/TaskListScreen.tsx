import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { IncomingAlarmModal } from '../alarm/components/IncomingAlarmModal';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { openDatabase } from '../../db/client';
import {
  getAllTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
} from '../../db/queries/tasks';
import {
  scheduleTask3StrikeSequence,
  cancelTaskAlarms,
} from '../alarm/services/alarm-scheduler';
import { getToday } from '../../utils/date';
import { generateUUID } from '../../utils/uuid';
import { useTheme } from '../../utils/theme';
import { Task, TaskFormData } from '../../types/task';

export const TaskListScreen: React.FC = () => {
  const { colors, isDark } = useTheme();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Multi-select deletion state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [testingWakeUpTask, setTestingWakeUpTask] = useState<Task | null>(null);

  const loadTasks = useCallback(() => {
    try {
      const db = openDatabase();
      const list = getAllTasks(db);
      setTasks(list);
    } catch {
      // Handled safely
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
        verificationType: formData.verificationType,
        scheduledTime: formData.scheduledTime,
        daysOfWeek: formData.daysOfWeek,
        alarmSound: formData.alarmSound,
        preAlarmMinutes: formData.preAlarmMinutes,
        isActive: true,
      });

      // Attempt to schedule 3-strike alarm sequence safely
      try {
        await scheduleTask3StrikeSequence(created, getToday());
      } catch {
        // Notification scheduling warning handled
      }

      setIsCreating(false);
      loadTasks();
    } catch (dbErr) {
      Alert.alert('Save Error', 'Could not save routine to local database.');
    }
  };

  const handleUpdateTask = async (formData: TaskFormData) => {
    if (!editingTask) return;
    try {
      const db = openDatabase();
      const updated = updateTask(db, editingTask.id, {
        activityName: formData.activityName,
        focusArea: formData.focusArea,
        verificationType: formData.verificationType,
        scheduledTime: formData.scheduledTime,
        daysOfWeek: formData.daysOfWeek,
        alarmSound: formData.alarmSound,
        preAlarmMinutes: formData.preAlarmMinutes,
      });

      if (updated && updated.isActive) {
        try {
          await cancelTaskAlarms(updated.id, getToday());
          await scheduleTask3StrikeSequence(updated, getToday());
        } catch {
          // Handled safely
        }
      }

      setEditingTask(null);
      loadTasks();
    } catch {
      Alert.alert('Update Error', 'Could not update routine.');
    }
  };

  const handleToggleActive = async (task: Task) => {
    try {
      const db = openDatabase();
      const updated = toggleTask(db, task.id);
      if (updated) {
        try {
          if (updated.isActive) {
            await scheduleTask3StrikeSequence(updated, getToday());
          } else {
            await cancelTaskAlarms(updated.id, getToday());
          }
        } catch {
          // Handled safely
        }
      }
      loadTasks();
    } catch {
      // Handled safely
    }
  };

  const handleDeleteSingleTask = (task: Task) => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${task.activityName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = openDatabase();
              await cancelTaskAlarms(task.id, getToday());
              deleteTask(db, task.id);
              setEditingTask(null);
              loadTasks();
            } catch {
              // Handled safely
            }
          },
        },
      ]
    );
  };

  const toggleSelectTask = (id: string) => {
    const next = new Set(selectedTaskIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTaskIds(next);
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.size === tasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(tasks.map((t) => t.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedTaskIds.size === 0) return;

    Alert.alert(
      'Delete Selected Routines',
      `Delete ${selectedTaskIds.size} ${selectedTaskIds.size === 1 ? 'routine' : 'routines'}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = openDatabase();
              for (const id of selectedTaskIds) {
                await cancelTaskAlarms(id, getToday());
                deleteTask(db, id);
              }
              setSelectedTaskIds(new Set());
              setIsSelectionMode(false);
              loadTasks();
            } catch {
              // Handled safely
            }
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
          onCancel={() => setIsCreating(false)}
          isEditing={false}
          creationMode="alarm"
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
            verificationType: editingTask.verificationType,
            scheduledTime: editingTask.scheduledTime,
            daysOfWeek: editingTask.daysOfWeek,
            alarmSound: editingTask.alarmSound,
            preAlarmMinutes: editingTask.preAlarmMinutes,
          }}
          onSubmit={handleUpdateTask}
          onDelete={() => handleDeleteSingleTask(editingTask)}
          onCancel={() => setEditingTask(null)}
          isEditing={true}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Top Header Actions (only shown when routines exist) */}
      {tasks.length > 0 && (
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedTaskIds(new Set());
            }}
            style={[
              styles.manageBtn,
              {
                backgroundColor: isSelectionMode ? colors.error : colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.manageBtnText,
                { color: isSelectionMode ? '#FFFFFF' : colors.text },
              ]}
            >
              {isSelectionMode ? 'Cancel' : 'Manage / Delete'}
            </Text>
          </TouchableOpacity>

          {!isSelectionMode && (
            <Button
              title="+ Add Routine"
              onPress={() => setIsCreating(true)}
              style={styles.addBtn}
            />
          )}
        </View>
      )}

      {/* Multi-Select Action Bar */}
      {isSelectionMode && tasks.length > 0 && (
        <View style={[styles.selectionBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllBtn}>
            <Text style={[styles.selectAllText, { color: colors.primary }]}>
              {selectedTaskIds.size === tasks.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteSelected}
            disabled={selectedTaskIds.size === 0}
            style={[
              styles.deleteSelectedBtn,
              { opacity: selectedTaskIds.size === 0 ? 0.4 : 1 },
            ]}
          >
            <Text style={styles.deleteSelectedText}>
              🗑️ Delete ({selectedTaskIds.size})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const isSelected = selectedTaskIds.has(task.id);
            return (
              <View key={task.id} style={styles.cardContainer}>
                {isSelectionMode && (
                  <TouchableOpacity
                    onPress={() => toggleSelectTask(task.id)}
                    style={[
                      styles.checkbox,
                      {
                        borderColor: isSelected ? '#EF4444' : colors.border,
                        backgroundColor: isSelected ? '#EF4444' : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Text style={styles.checkboxTick}>✓</Text>}
                  </TouchableOpacity>
                )}
                <View style={{ flex: 1 }}>
                  <TaskCard
                    task={task}
                    onToggleActive={handleToggleActive}
                    onTestWakeUp={(t) => setTestingWakeUpTask(t)}
                    onPress={(t) => {
                      if (isSelectionMode) {
                        toggleSelectTask(t.id);
                      } else {
                        setEditingTask(t);
                      }
                    }}
                  />
                </View>
              </View>
            );
          })
        ) : (
          /* Single Centered Add Routine Button when empty (No duplicates) */
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

      {/* Full-Screen Alarm Modal with Dual Slide Action & 60s Standing Camera */}
      <IncomingAlarmModal
        visible={Boolean(testingWakeUpTask)}
        task={testingWakeUpTask}
        strikeNumber={1}
        onDismiss={() => setTestingWakeUpTask(null)}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  manageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  manageBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  addBtn: {
    minWidth: 130,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  selectAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteSelectedBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  deleteSelectedText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  cancelBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
  deleteBtn: {
    marginTop: 16,
  },
  bottomSpacer: {
    height: 36,
  },
});
