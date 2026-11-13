import { format, addDays } from 'date-fns';

export interface AlarmTriggerTimes {
  trigger1: number; // epoch ms
  trigger2: number;
  trigger3: number;
  autoFail: number;
}

export function calculateTriggerTimes(
  date: string,
  scheduledTime: string,
  preAlarmMinutes: number = 5
): AlarmTriggerTimes {
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const baseDate = new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
  const baseMs = baseDate.getTime();

  return {
    trigger1: baseMs - preAlarmMinutes * 60 * 1000,
    trigger2: baseMs - (preAlarmMinutes - 2) * 60 * 1000,
    trigger3: baseMs,
    autoFail: baseMs + 5 * 60 * 1000,
  };
}

export function getNextOccurrenceDate(
  daysOfWeek: number[],
  currentDay: number = new Date().getDay() || 7
): string | null {
  if (daysOfWeek.length === 0) return null;

  for (let offset = 0; offset < 7; offset++) {
    const checkDay = ((currentDay - 1 + offset) % 7) + 1;
    if (daysOfWeek.includes(checkDay)) {
      return format(addDays(new Date(), offset), 'yyyy-MM-dd');
    }
  }
  return null;
}

