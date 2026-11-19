import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Vibration,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import { playSoundPreview, stopSoundPreview } from '../../../utils/sound-preview';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { NativeBridge } from '../../../services/native-bridge';

interface WakeUpCameraModalProps {
  visible: boolean;
  taskTitle: string;
  alarmSound?: string;
  onSuccess: () => void;
  onCancelOrAbandon?: () => void;
}

const REQUIRED_SECONDS = 30; // 30 seconds standing requirement
const INACTIVITY_TIMEOUT_SECONDS = 60; // 1 minute window before alarm rings again if lying in bed

export const WakeUpCameraModal: React.FC<WakeUpCameraModalProps> = ({
  visible,
  taskTitle,
  alarmSound = 'gentle_chime',
  onSuccess,
  onCancelOrAbandon,
}) => {
  const { vibrationEnabled } = useSettingsStore();
  const [phase, setPhase] = useState<'standing_camera' | 'celebration'>('standing_camera');
  const [secondsRemaining, setSecondsRemaining] = useState(REQUIRED_SECONDS);
  const [isStandingDetected, setIsStandingDetected] = useState(false);
  const [isReAlarmRinging, setIsReAlarmRinging] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const totalElapsedInCameraRef = useRef(0);

  // Initialize state when modal opens
  useEffect(() => {
    if (visible) {
      setPhase('standing_camera');
      setSecondsRemaining(REQUIRED_SECONDS);
      setIsStandingDetected(false);
      setIsReAlarmRinging(false);
      totalElapsedInCameraRef.current = 0;

      // Crucial: Alarm sound turns OFF when camera opens, per user specification
      stopSoundPreview();
      try {
        Vibration.cancel();
      } catch {}
    } else {
      stopSoundPreview();
      try {
        Vibration.cancel();
      } catch {}
    }

    return () => {
      stopSoundPreview();
      try {
        Vibration.cancel();
      } catch {}
    };
  }, [visible]);

  // Request camera permission on mount if needed
  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission().catch(() => {});
    }
  }, [visible, permission]);

  // Hardware Accelerometer Posture Sensing (Checking if phone is upright at eye/torso level)
  useEffect(() => {
    let sub: { remove: () => void } | null = null;

    if (visible && phase === 'standing_camera') {
      try {
        Accelerometer.setUpdateInterval(350);
        sub = Accelerometer.addListener(({ x, y, z }) => {
          // Calculate angle relative to horizontal plane
          // Propped upright / standing: tilt >= 55 degrees
          // Lying flat on bed/mattress: tilt < 45 degrees
          const rad = Math.atan2(Math.abs(y), Math.abs(z || 0.001));
          const deg = Math.round((rad * 180) / Math.PI);
          const upright = deg >= 52;
          setIsStandingDetected(upright);
        });
      } catch {
        setIsStandingDetected(true);
      }
    }

    return () => {
      if (sub) {
        try {
          sub.remove();
        } catch {}
      }
    };
  }, [visible, phase]);

  // Anti-Cheat: If user is not standing / phone is flat in bed, re-sound alarm after 1 minute!
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (visible && phase === 'standing_camera') {
      interval = setInterval(() => {
        totalElapsedInCameraRef.current += 1;

        // If 60 seconds have elapsed in camera and user hasn't finished standing
        if (totalElapsedInCameraRef.current >= INACTIVITY_TIMEOUT_SECONDS && !isStandingDetected) {
          if (!isReAlarmRinging) {
            setIsReAlarmRinging(true);
            playSoundPreview(alarmSound, true);
            if (vibrationEnabled && Platform.OS !== 'web') {
              try {
                Vibration.vibrate([0, 700, 300, 700], true);
              } catch {}
            }
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, phase, isStandingDetected, isReAlarmRinging, alarmSound, vibrationEnabled]);

  // When standing is detected again, silence the re-alarm!
  useEffect(() => {
    if (isStandingDetected && isReAlarmRinging) {
      setIsReAlarmRinging(false);
      totalElapsedInCameraRef.current = 0; // Reset grace window
      stopSoundPreview();
      try {
        Vibration.cancel();
      } catch {}
    }
  }, [isStandingDetected, isReAlarmRinging]);

  // 60-Second Countdown: Only counts down when standing straight
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (visible && phase === 'standing_camera' && isStandingDetected && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // 60 seconds verified! Stop everything, celebrate
            stopSoundPreview();
            NativeBridge.stopAlarm().catch(() => {});
            try {
              Vibration.cancel();
            } catch {}
            setPhase('celebration');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [visible, phase, isStandingDetected, secondsRemaining]);

  // Handle celebration auto-exit
  useEffect(() => {
    if (phase === 'celebration') {
      const exitTimer = setTimeout(() => {
        onSuccess();
      }, 2200);
      return () => clearTimeout(exitTimer);
    }
  }, [phase, onSuccess]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      {/* PHASE 1: CLEAN CAMERA STANDING VERIFICATION */}
      {phase === 'standing_camera' && (
        <View style={styles.cameraContainer}>
          {permission?.granted ? (
            <CameraView style={styles.cameraPreview} facing="front">
              <View style={styles.overlayContainer}>
                {/* Silhouette guide (Green when upright, Amber when not) */}
                <View
                  style={[
                    styles.silhouetteFrame,
                    isStandingDetected ? styles.silhouetteFrameGreen : styles.silhouetteFrameAmber,
                  ]}
                >
                  <View style={styles.headOutline} />
                  <View style={styles.bodyOutline} />
                </View>

                {/* Top Section: Minimal Countdown & Stand Straight text */}
                <View style={styles.topHud}>
                  <Text style={styles.bigCountdown}>{secondsRemaining}s</Text>
                  <Text
                    style={[
                      styles.standStraightLabel,
                      { color: isStandingDetected ? '#10B981' : '#F59E0B' },
                    ]}
                  >
                    {isStandingDetected ? 'Stand Straight' : 'Stand Up Straight'}
                  </Text>

                  {/* Warning if lying on bed & alarm ringing again */}
                  {isReAlarmRinging && (
                    <Text style={styles.reAlarmWarning}>
                      🚨 Alarm Resumed! Stand up to silence.
                    </Text>
                  )}
                </View>

                {/* Bottom Section: Single Clean Cancel Button */}
                <View style={styles.bottomHud}>
                  <TouchableOpacity
                    onPress={() => {
                      stopSoundPreview();
                      NativeBridge.stopAlarm().catch(() => {});
                      try {
                        Vibration.cancel();
                      } catch {}
                      if (onCancelOrAbandon) onCancelOrAbandon();
                    }}
                    style={styles.btnCancel}
                  >
                    <Text style={styles.btnCancelText}>✕ Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          ) : (
            <View style={styles.noPermissionBox}>
              <Text style={styles.bigCountdown}>30s</Text>
              <Text style={styles.noPermText}>Camera permission needed to verify standing.</Text>
              <TouchableOpacity onPress={() => requestPermission()} style={styles.btnGrant}>
                <Text style={styles.btnGrantText}>Grant Camera Permission</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  stopSoundPreview();
                  NativeBridge.stopAlarm().catch(() => {});
                  if (onCancelOrAbandon) onCancelOrAbandon();
                }}
                style={{ marginTop: 16 }}
              >
                <Text style={styles.btnCancelText}>✕ Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* PHASE 2: CLEAN CELEBRATION */}
      {phase === 'celebration' && (
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebEmoji}>🎉</Text>
          <Text style={styles.celebTitle}>Good Morning!</Text>
          <Text style={styles.celebSub}>
            30 seconds standing verified. Have a great and productive day ahead!
          </Text>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraPreview: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  topHud: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    marginTop: 10,
  },
  bigCountdown: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: -1,
  },
  standStraightLabel: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  reAlarmWarning: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  silhouetteFrame: {
    position: 'absolute',
    top: '28%',
    width: 220,
    height: 270,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteFrameGreen: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  silhouetteFrameAmber: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  headOutline: {
    width: 65,
    height: 75,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: 8,
  },
  bodyOutline: {
    width: 120,
    height: 80,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bottomHud: {
    alignItems: 'center',
    marginBottom: 10,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
  },
  btnCancelText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  noPermissionBox: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noPermText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
  },
  btnGrant: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  btnGrantText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  celebrationContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  celebEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  celebTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  celebSub: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
});
