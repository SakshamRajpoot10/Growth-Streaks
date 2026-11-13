export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  defaultAlarmSound: string;
  vibrationEnabled: boolean;
  onboardingCompleted: boolean;
  streakStartDate: string | null;
}

