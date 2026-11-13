import { create } from 'zustand';

interface AlarmState {
  activeAlarmTaskId: string | null;
  pendingAlarmIds: string[];
  setActiveAlarm: (taskId: string | null) => void;
  setPendingAlarms: (ids: string[]) => void;
  removePendingAlarm: (id: string) => void;
  clearAllAlarms: () => void;
}

export const useAlarmStore = create<AlarmState>((set) => ({
  activeAlarmTaskId: null,
  pendingAlarmIds: [],
  setActiveAlarm: (taskId) => set({ activeAlarmTaskId: taskId }),
  setPendingAlarms: (ids) => set({ pendingAlarmIds: ids }),
  removePendingAlarm: (id) =>
    set((state) => ({
      pendingAlarmIds: state.pendingAlarmIds.filter((aid) => aid !== id),
    })),
  clearAllAlarms: () => set({ activeAlarmTaskId: null, pendingAlarmIds: [] }),
}));

