import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../lib/mmkv';
import { ThemeMode } from '../types/settings';

const storageAdapter = {
  getItem: (name: string) => mmkvStorage.getString(name) ?? null,
  setItem: (name: string, value: string) => mmkvStorage.set(name, value),
  removeItem: (name: string) => mmkvStorage.remove(name),
};

interface SettingsState {
  theme: ThemeMode;
  defaultAlarmSound: string;
  vibrationEnabled: boolean;
  onboardingCompleted: boolean;
  setTheme: (theme: ThemeMode) => void;
  setDefaultAlarmSound: (sound: string) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      defaultAlarmSound: 'default_alarm',
      vibrationEnabled: true,
      onboardingCompleted: false,
      setTheme: (theme) => set({ theme }),
      setDefaultAlarmSound: (sound) => set({ defaultAlarmSound: sound }),
      setVibrationEnabled: (enabled) => set({ vibrationEnabled: enabled }),
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
    }),
    {
      name: 'growth-streaks-settings',
      storage: createJSONStorage(() => storageAdapter),
    }
  )
);
