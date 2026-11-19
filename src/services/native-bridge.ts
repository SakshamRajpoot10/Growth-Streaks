import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { StandUpNativeModule } = NativeModules;

const nativeEmitter =
  Platform.OS === 'android' && StandUpNativeModule
    ? new NativeEventEmitter(StandUpNativeModule)
    : null;

export const NativeBridge = {
  isAvailable: Platform.OS === 'android' && Boolean(StandUpNativeModule),

  // ==========================================
  // ALARM ENGINE
  // ==========================================

  async canScheduleExactAlarms(): Promise<boolean> {
    if (!this.isAvailable) return true;
    try {
      return await StandUpNativeModule.canScheduleExactAlarms();
    } catch {
      return false;
    }
  },

  async canUseFullScreenIntent(): Promise<boolean> {
    if (!this.isAvailable) return true;
    try {
      return await StandUpNativeModule.canUseFullScreenIntent();
    } catch {
      return true;
    }
  },

  async openFullScreenIntentSettings(): Promise<boolean> {
    if (!this.isAvailable) return true;
    try {
      return await StandUpNativeModule.openFullScreenIntentSettings();
    } catch {
      return false;
    }
  },

  async scheduleAlarm(
    triggerId: string,
    timestamp: number,
    soundName: string,
    title: string,
    taskId: string,
    strike: number,
    verificationType: string = 'STANDARD'
  ): Promise<boolean> {
    if (!this.isAvailable) return false;
    try {
      return await StandUpNativeModule.scheduleAlarm(
        triggerId,
        timestamp,
        soundName,
        title,
        taskId,
        strike,
        verificationType
      );
    } catch {
      return false;
    }
  },

  async cancelAlarm(triggerId: string): Promise<boolean> {
    if (!this.isAvailable) return false;
    try {
      return await StandUpNativeModule.cancelAlarm(triggerId);
    } catch {
      return false;
    }
  },

  async stopAlarm(): Promise<boolean> {
    if (!this.isAvailable) return false;
    try {
      return await StandUpNativeModule.stopAlarmService();
    } catch {
      return false;
    }
  },

  async isAlarmRinging(): Promise<boolean> {
    if (!this.isAvailable) return false;
    try {
      return await StandUpNativeModule.isAlarmRinging();
    } catch {
      return false;
    }
  },

  // ==========================================
  // FITNESS RECORDING API (NO PERMANENT NOTIFICATION)
  // ==========================================

  async subscribeRecordingApi(): Promise<boolean> {
    if (!this.isAvailable) return false;
    try {
      return await StandUpNativeModule.subscribeRecordingApi();
    } catch {
      return false;
    }
  },

  async readTodayRecordingSteps(): Promise<number> {
    if (!this.isAvailable) return 0;
    try {
      return await StandUpNativeModule.readTodayRecordingSteps();
    } catch {
      return 0;
    }
  },

  async readHourlyRecordingSteps(): Promise<Record<string, number>> {
    if (!this.isAvailable) return {};
    try {
      return await StandUpNativeModule.readHourlyRecordingSteps();
    } catch {
      return {};
    }
  },

  // ==========================================
  // LIVE FOREGROUND SENSOR (NO PERMANENT NOTIFICATION)
  // ==========================================

  async startLiveSensor(): Promise<boolean> {
    if (!this.isAvailable) return false;
    try {
      return await StandUpNativeModule.startLiveSensorTracker();
    } catch {
      return false;
    }
  },

  async stopLiveSensor(): Promise<boolean> {
    if (!this.isAvailable) return false;
    try {
      return await StandUpNativeModule.stopLiveSensorTracker();
    } catch {
      return false;
    }
  },

  onLiveSensorStepUpdate(callback: (liveSessionSteps: number) => void): (() => void) | null {
    if (!nativeEmitter) return null;
    const subscription = nativeEmitter.addListener('onLiveSensorStepUpdate', (...args: any[]) => {
      const steps = args[0];
      callback(typeof steps === 'number' ? steps : Number(steps) || 0);
    });
    return () => {
      subscription.remove();
    };
  },
};
