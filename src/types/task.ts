export type VerificationType = 'STANDARD' | 'WAKE_UP_VERIFICATION';

export interface Task {
  id: string;
  activityName: string;
  focusArea: string;
  verificationType?: VerificationType;
  scheduledTime: string; // "HH:MM"
  daysOfWeek: number[]; // 1=Mon..7=Sun
  alarmSound: string;
  preAlarmMinutes: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TaskFormData {
  activityName: string;
  focusArea: string;
  verificationType: VerificationType;
  scheduledTime: string;
  daysOfWeek: number[];
  alarmSound: string;
  preAlarmMinutes: number;
}
