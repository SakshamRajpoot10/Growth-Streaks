import notifee, {
  TriggerType,
  AndroidImportance,
  AndroidCategory,
} from 'react-native-notify-kit';
import { calculateTriggerTimes } from '../../../utils/alarm-time';
import { Task } from '../../../types/task';
import { getToday } from '../../../utils/date';

export const ALARM_CHANNEL_ID = 'standup_accountability_alarms';

/**
 * Initializes the high-importance notification channel with native res/raw audio
 * required for Android full-screen alarms and STREAM_ALARM playback even when closed.
 */
export async function initializeAlarmChannel(soundId: string = 'gentle_chime'): Promise<string> {
  const channelId = `standup_alarm_${soundId}`;
  try {
    return await notifee.createChannel({
      id: channelId,
      name: `StandUp Alarm (${soundId})`,
      importance: AndroidImportance.HIGH,
      vibration: true,
      vibrationPattern: [0, 800, 400, 800],
      lights: true,
      sound: soundId, // Plays res/raw/{soundId}.mp3 via STREAM_ALARM
      bypassDnd: true,
    });
  } catch (error) {
    return ALARM_CHANNEL_ID;
  }
}

/**
 * Schedules the 3-strike alarm sequence for a given task for a target date.
 * - Trigger 1: 5 minutes before scheduled time
 * - Trigger 2: 3 minutes before scheduled time (if ignored)
 * - Trigger 3: Exactly at scheduled time
 * - Auto-fail: 5 minutes after scheduled time
 */
export async function scheduleTask3StrikeSequence(
  task: Task,
  date: string = getToday()
): Promise<void> {
  try {
    const soundName = task.alarmSound || 'gentle_chime';
    const channelId = await initializeAlarmChannel(soundName);
    const times = calculateTriggerTimes(date, task.scheduledTime, task.preAlarmMinutes);
    const now = Date.now();

    const triggers = [
      {
        strike: 1,
        id: `alarm_${task.id}_${date}_strike1`,
        timestamp: times.trigger1,
        title: `⏰ 5 min to: ${task.activityName}`,
        body: `Strike 1/3: Are you ready to execute? Tap YES to confirm or NO to skip.`,
      },
      {
        strike: 2,
        id: `alarm_${task.id}_${date}_strike2`,
        timestamp: times.trigger2,
        title: `⚠️ 3 min to: ${task.activityName}`,
        body: `Strike 2/3: Second call! Tap YES to start or NO to skip.`,
      },
      {
        strike: 3,
        id: `alarm_${task.id}_${date}_strike3`,
        timestamp: times.trigger3,
        title: `🚨 NOW: ${task.activityName}`,
        body: `Final Call: Your routine starts now! Confirm execution now.`,
      },
    ];

    for (const trig of triggers) {
      if (trig.timestamp > now) {
        try {
          await notifee.createTriggerNotification(
            {
              id: trig.id,
              title: trig.title,
              body: trig.body,
              data: {
                taskId: task.id,
                date,
                strike: String(trig.strike),
                isAutoFail: 'false',
              },
              android: {
                channelId,
                importance: AndroidImportance.HIGH,
                category: AndroidCategory.ALARM,
                sound: soundName,
                loopSound: true,
                fullScreenAction: {
                  id: 'default',
                  launchActivity: 'default',
                },
                autoCancel: false,
                ongoing: true,
                pressAction: {
                  id: 'default',
                  launchActivity: 'default',
                },
              },
            },
            {
              type: TriggerType.TIMESTAMP,
              timestamp: trig.timestamp,
              alarmManager: {
                allowWhileIdle: true,
              },
            }
          );
        } catch (trigErr) {
          // Handled gracefully so remaining triggers continue
        }
      }
    }

    // Schedule silent auto-fail trigger
    if (times.autoFail > now) {
      try {
        await notifee.createTriggerNotification(
          {
            id: `alarm_${task.id}_${date}_autofail`,
            title: 'Accountability Verification',
            body: 'Verifying completion status...',
            data: {
              taskId: task.id,
              date,
              strike: '3',
              isAutoFail: 'true',
            },
            android: {
              channelId,
              importance: AndroidImportance.MIN,
              autoCancel: true,
            },
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: times.autoFail,
            alarmManager: {
              allowWhileIdle: true,
            },
          }
        );
      } catch (afErr) {
        // Handled gracefully
      }
    }
  } catch (err) {
    // Top-level notification scheduling safety
  }
}

/**
 * Cancels all remaining pending notifications for a specific task and date.
 */
export async function cancelTaskAlarms(taskId: string, date: string): Promise<void> {
  const ids = [
    `alarm_${taskId}_${date}_strike1`,
    `alarm_${taskId}_${date}_strike2`,
    `alarm_${taskId}_${date}_strike3`,
    `alarm_${taskId}_${date}_autofail`,
  ];
  for (const id of ids) {
    try {
      await notifee.cancelNotification(id);
    } catch {
      // Ignore if already cancelled or fired
    }
  }
}
