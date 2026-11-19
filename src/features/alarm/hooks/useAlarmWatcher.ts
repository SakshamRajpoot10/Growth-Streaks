import { useEffect, useState, useCallback, useRef } from 'react';
import notifee, { EventType, Event } from 'react-native-notify-kit';
import { openDatabase } from '../../../db/client';
import { getTasksForDay } from '../../../db/queries/tasks';
import { getTodayFitnessLog } from '../../../db/queries/fitness';
import { getToday, getTodayDayOfWeek } from '../../../utils/date';
import { Task } from '../../../types/task';
import { TaskLog } from '../../../types/task-log';

export function useAlarmWatcher() {
  const [activeAlarmTask, setActiveAlarmTask] = useState<Task | null>(null);
  const [alarmStrike, setAlarmStrike] = useState(1);
  const dismissedInSession = useRef<Set<string>>(new Set());

  // Check today's active tasks against current wall clock time (5 minutes early pre-alarm check)
  const checkActiveAlarms = useCallback(() => {
    try {
      const db = openDatabase();
      const today = getToday();
      const todayDayOfWeek = getTodayDayOfWeek();
      const tasks = getTasksForDay(db, todayDayOfWeek);

      const now = Date.now();

      for (const task of tasks) {
        if (!task.isActive) continue;
        if (dismissedInSession.current.has(task.id)) continue;

        // Check if already responded today
        const existing = db.getFirstSync(
          'SELECT status FROM task_logs WHERE task_id = ? AND date = ?',
          [task.id, today]
        ) as { status: string } | null;

        if (existing && existing.status !== 'pending') {
          // Already answered today
          continue;
        }

        // Parse scheduled time
        const [hours, minutes] = task.scheduledTime.split(':').map(Number);
        const scheduledDate = new Date();
        scheduledDate.setHours(hours, minutes, 0, 0);
        const scheduledMs = scheduledDate.getTime();

        const preAlarmMinutes = task.preAlarmMinutes || 5;
        const trigger1Ms = scheduledMs - preAlarmMinutes * 60 * 1000;
        const autoFailMs = scheduledMs + 5 * 60 * 1000;

        // Auto-fail: If current time is past the 5-minute post-alarm window, mark as MISSED immediately!
        // Prevents stale alarm from ringing when opened late.
        if (now > autoFailMs) {
          try {
            const existingLog = db.getFirstSync(
              'SELECT id FROM task_logs WHERE task_id = ? AND date = ?',
              [task.id, today]
            );
            if (!existingLog) {
              db.runSync(
                `INSERT INTO task_logs (id, task_id, date, status, trigger_count, responded_at, created_at)
                 VALUES (?, ?, ?, 'missed', 3, NULL, datetime('now'))`,
                [`missed_${task.id}_${today}`, task.id, today]
              );
            }
          } catch {}
          dismissedInSession.current.add(task.id);
          continue;
        }

        // If current time is within active ringing window:
        if (now >= trigger1Ms && now <= autoFailMs) {
          let strike = 1;
          if (now >= scheduledMs - 2 * 60 * 1000) strike = 2;
          if (now >= scheduledMs) strike = 3;

          setActiveAlarmTask(task);
          setAlarmStrike(strike);
          break; // Show one active alarm at a time
        }
      }
    } catch {
      // Handled silently
    }
  }, []);

  // Set up periodic check every 10 seconds
  useEffect(() => {
    checkActiveAlarms();
    const interval = setInterval(checkActiveAlarms, 10000);
    return () => clearInterval(interval);
  }, [checkActiveAlarms]);

  // Listen to notifee foreground events and check for launch from full-screen notification
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      if (notifee) {
        // Check if app was opened by an alarm notification or full-screen intent
        notifee.getInitialNotification().then((initial) => {
          const taskId = initial?.notification?.data?.taskId;
          if (taskId) {
            try {
              const db = openDatabase();
              const row = db.getFirstSync('SELECT * FROM tasks WHERE id = ?', [String(taskId)]) as any;
              if (row) {
                const strike = parseInt(String(initial.notification?.data?.strike || '1'), 10);
                setActiveAlarmTask({
                  id: row.id,
                  activityName: row.activity_name,
                  focusArea: row.focus_area,
                  verificationType: (row.verification_type as any) || 'STANDARD',
                  scheduledTime: row.scheduled_time,
                  daysOfWeek: JSON.parse(row.days_of_week || '[1,2,3,4,5,6,7]'),
                  alarmSound: row.alarm_sound,
                  preAlarmMinutes: row.pre_alarm_minutes,
                  isActive: Boolean(row.is_active),
                  createdAt: row.created_at,
                  updatedAt: row.updated_at,
                });
                setAlarmStrike(strike);
              }
            } catch {}
          }
        }).catch(() => {});

        if (typeof notifee.onForegroundEvent === 'function') {
          unsubscribe = notifee.onForegroundEvent(({ type, detail }: Event) => {
            const taskId = detail?.notification?.data?.taskId;
            if (taskId && (type === EventType.DELIVERED || type === EventType.PRESS)) {
              try {
                const db = openDatabase();
                const row = db.getFirstSync('SELECT * FROM tasks WHERE id = ?', [String(taskId)]) as any;
                if (row) {
                  const strike = parseInt(String(detail.notification?.data?.strike || '1'), 10);
                  setActiveAlarmTask({
                    id: row.id,
                    activityName: row.activity_name,
                    focusArea: row.focus_area,
                    verificationType: (row.verification_type as any) || 'STANDARD',
                    scheduledTime: row.scheduled_time,
                    daysOfWeek: JSON.parse(row.days_of_week || '[1,2,3,4,5,6,7]'),
                    alarmSound: row.alarm_sound,
                    preAlarmMinutes: row.pre_alarm_minutes,
                    isActive: Boolean(row.is_active),
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                  });
                  setAlarmStrike(strike);
                }
              } catch {}
            }
          });
        }
      }
    } catch {}

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const dismissAlarm = useCallback(() => {
    if (activeAlarmTask) {
      dismissedInSession.current.add(activeAlarmTask.id);
    }
    setActiveAlarmTask(null);
  }, [activeAlarmTask]);

  const triggerTestAlarm = useCallback((task: Task) => {
    setActiveAlarmTask(task);
    setAlarmStrike(1);
  }, []);

  return {
    activeAlarmTask,
    alarmStrike,
    dismissAlarm,
    triggerTestAlarm,
  };
}
