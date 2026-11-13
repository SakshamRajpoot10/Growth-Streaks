import notifee, { EventType, Event } from 'react-native-notify-kit';
import { openDatabase } from '../../../db/client';
import { upsertLog } from '../../../db/queries/task-logs';
import { cancelTaskAlarms } from './alarm-scheduler';
import { generateUUID } from '../../../utils/uuid';
import { TaskLogStatus } from '../../../types/task-log';

/**
 * Handles background notification events (lock-screen button presses, auto-fail dismissals)
 * when the app is minimized, in background, or closed.
 */
export async function handleBackgroundAlarmEvent({ type, detail }: Event): Promise<void> {
  const { notification, pressAction } = detail;
  const data = notification?.data;

  if (!data || !data.taskId || !data.date) {
    return;
  }

  const taskId = String(data.taskId);
  const date = String(data.date);
  const strike = parseInt(String(data.strike || '1'), 10);
  const isAutoFail = data.isAutoFail === 'true';

  const db = openDatabase();

  // 1. Auto-fail check
  if (isAutoFail) {
    const existing = db.getFirstSync(
      'SELECT status FROM task_logs WHERE task_id = ? AND date = ?',
      [taskId, date]
    ) as { status: string } | null;

    if (!existing || existing.status === 'pending') {
      upsertLog(db, {
        id: generateUUID(),
        taskId,
        date,
        status: 'missed',
        triggerCount: 3,
        respondedAt: null,
      });
    }
    if (notification?.id) {
      await notifee.cancelNotification(notification.id);
    }
    return;
  }

  // 2. Interactive action presses: YES or NO
  if (type === EventType.ACTION_PRESS && pressAction) {
    let resolvedStatus: TaskLogStatus = 'pending';

    if (pressAction.id === 'action_yes') {
      resolvedStatus = 'yes';
    } else if (pressAction.id === 'action_no') {
      resolvedStatus = 'no';
    }

    if (resolvedStatus !== 'pending') {
      upsertLog(db, {
        id: generateUUID(),
        taskId,
        date,
        status: resolvedStatus,
        triggerCount: strike,
        respondedAt: new Date().toISOString(),
      });

      // Crucial: Cancel the remaining strikes so user is not alerted again
      await cancelTaskAlarms(taskId, date);
      if (notification?.id) {
        await notifee.cancelNotification(notification.id);
      }
    }
  }
}

/**
 * Registers the background event listener with notifee.
 * Must be invoked at the top-level app entry point.
 */
export function registerBackgroundAlarmHandler(): void {
  notifee.onBackgroundEvent(handleBackgroundAlarmEvent);
}

