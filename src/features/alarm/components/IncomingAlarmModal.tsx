import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  Vibration,
  Platform,
} from 'react-native';
import { DualSlideBar } from './DualSlideBar';
import { WakeUpCameraModal } from './WakeUpCameraModal';
import { RewardedAdPromptModal } from './RewardedAdPromptModal';
import { playSoundPreview, stopSoundPreview } from '../../../utils/sound-preview';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { Task } from '../../../types/task';
import { formatTime } from '../../../utils/date';
import { openDatabase } from '../../../db/client';
import { upsertLog } from '../../../db/queries/task-logs';
import { cancelTaskAlarms } from '../services/alarm-scheduler';
import { generateUUID } from '../../../utils/uuid';
import { getToday } from '../../../utils/date';
import { NativeBridge } from '../../../services/native-bridge';

interface IncomingAlarmModalProps {
  visible: boolean;
  task: Task | null;
  onDismiss: () => void;
  strikeNumber?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const IncomingAlarmModal: React.FC<IncomingAlarmModalProps> = ({
  visible,
  task,
  onDismiss,
  strikeNumber = 1,
}) => {
  const { vibrationEnabled } = useSettingsStore();
  const [isWakeUpCameraActive, setIsWakeUpCameraActive] = useState(false);
  const [showRewardPrompt, setShowRewardPrompt] = useState(false);

  const isWakeUpTask = task?.verificationType === 'WAKE_UP_VERIFICATION';

  // Audio and vibration on alarm appearance
  useEffect(() => {
    if (visible && task && !isWakeUpCameraActive) {
      playSoundPreview(task.alarmSound || 'gentle_chime', true);
      if (vibrationEnabled && Platform.OS !== 'web') {
        try {
          Vibration.vibrate([0, 800, 400, 800], true);
        } catch {}
      }
    }

    return () => {
      if (!isWakeUpCameraActive) {
        stopSoundPreview();
        try {
          Vibration.cancel();
        } catch {}
      }
    };
  }, [visible, task, isWakeUpCameraActive, vibrationEnabled]);

  const handleSlideRightConfirm = async () => {
    if (!task) return;

    if (isWakeUpTask) {
      // Transition to front selfie camera standing verification!
      // Sound and vibration turn OFF when camera is opened, per user specification
      stopSoundPreview();
      NativeBridge.stopAlarm().catch(() => {});
      try {
        Vibration.cancel();
      } catch {}
      setIsWakeUpCameraActive(true);
      return;
    }

    // Normal routine confirmed
    stopSoundPreview();
    NativeBridge.stopAlarm().catch(() => {});
    try {
      Vibration.cancel();
    } catch {}

    try {
      const db = openDatabase();
      const today = getToday();
      upsertLog(db, {
        id: generateUUID(),
        taskId: task.id,
        date: today,
        status: 'yes',
        triggerCount: strikeNumber,
        respondedAt: new Date().toISOString(),
      });
      await cancelTaskAlarms(task.id, today);
    } catch {}

    setShowRewardPrompt(true);
  };

  const handleSlideLeftSkip = async () => {
    if (!task) return;

    stopSoundPreview();
    NativeBridge.stopAlarm().catch(() => {});
    try {
      Vibration.cancel();
    } catch {}

    try {
      const db = openDatabase();
      const today = getToday();
      upsertLog(db, {
        id: generateUUID(),
        taskId: task.id,
        date: today,
        status: 'no',
        triggerCount: strikeNumber,
        respondedAt: new Date().toISOString(),
      });
      await cancelTaskAlarms(task.id, today);
    } catch {}

    onDismiss();
  };

  const handleWakeUpCameraSuccess = async () => {
    if (!task) return;
    setIsWakeUpCameraActive(false);
    NativeBridge.stopAlarm().catch(() => {});

    try {
      const db = openDatabase();
      const today = getToday();
      upsertLog(db, {
        id: generateUUID(),
        taskId: task.id,
        date: today,
        status: 'yes',
        triggerCount: strikeNumber,
        respondedAt: new Date().toISOString(),
      });
      await cancelTaskAlarms(task.id, today);
    } catch {}

    setShowRewardPrompt(true);
  };

  if (!visible || !task) return null;

  return (
    <>
      <Modal
        visible={visible && !isWakeUpCameraActive && !showRewardPrompt}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
      >
        <View style={styles.container}>
          {/* Top Banner */}
          <View style={styles.topSection}>
            <View style={styles.badgeRow}>
              <View style={styles.preAlarmBadge}>
                <Text style={styles.preAlarmBadgeText}>⚡ 5 MIN ADVANCE NOTICE</Text>
              </View>
              <View style={styles.strikeBadge}>
                <Text style={styles.strikeBadgeText}>STRIKE {strikeNumber}/3</Text>
              </View>
            </View>

            <Text style={styles.bellEmoji}>⏰</Text>
            <Text style={styles.currentTimeText}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.scheduledSubText}>
              Scheduled for {formatTime(task.scheduledTime)}
            </Text>
          </View>

          {/* Routine Information */}
          <View style={styles.centerSection}>
            <Text style={styles.taskTitle}>{task.activityName}</Text>
            <Text style={styles.focusArea}>{task.focusArea || 'Daily Habit'}</Text>
            <Text style={styles.promptNotice}>
              {isWakeUpTask
                ? 'Slide right to open front camera & stand straight for 30 seconds.'
                : 'Confirm execution now to protect your streak, or slide left to skip.'}
            </Text>
          </View>

          {/* Bottom Slide Bar Controls */}
          <View style={styles.bottomSection}>
            <DualSlideBar
              onSlideRight={handleSlideRightConfirm}
              onSlideLeft={handleSlideLeftSkip}
              confirmLabel={isWakeUpTask ? 'Camera Verify' : 'Doing It'}
              skipLabel="Skip Routine"
            />
          </View>
        </View>
      </Modal>

      {/* Embedded Wake-Up Standing Camera */}
      {isWakeUpTask && (
        <WakeUpCameraModal
          visible={isWakeUpCameraActive}
          taskTitle={task.activityName}
          alarmSound={task.alarmSound || 'gentle_chime'}
          onSuccess={handleWakeUpCameraSuccess}
          onCancelOrAbandon={() => {
            setIsWakeUpCameraActive(false);
            onDismiss();
          }}
        />
      )}

      {/* Optional Post-Completion Rewarded Ad Prompt Modal */}
      <RewardedAdPromptModal
        visible={showRewardPrompt}
        routineTitle={task.activityName}
        onClose={() => {
          setShowRewardPrompt(false);
          onDismiss();
        }}
        onRewardReceived={() => {
          setShowRewardPrompt(false);
          onDismiss();
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  preAlarmBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  preAlarmBadgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  strikeBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  strikeBadgeText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bellEmoji: {
    fontSize: 48,
    marginVertical: 8,
  },
  currentTimeText: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: -1,
  },
  scheduledSubText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
  },
  centerSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  taskTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  focusArea: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  promptNotice: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
});
