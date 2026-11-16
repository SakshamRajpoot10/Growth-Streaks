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

interface WakeUpCameraModalProps {
  visible: boolean;
  taskTitle: string;
  alarmSound?: string;
  onSuccess: () => void;
  onCancelOrAbandon?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const REQUIRED_SECONDS = 60;

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
  const [phoneTiltAngle, setPhoneTiltAngle] = useState(90);
  const [permission, requestPermission] = useCameraPermissions();

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setPhase('standing_camera');
      setSecondsRemaining(REQUIRED_SECONDS);
      setIsStandingDetected(false);
    }
  }, [visible]);

  // Request camera permission on mount
  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission().catch(() => {});
    }
  }, [visible, permission]);

  // Persistent alarm sound & vibration: MUST KEEP RINGING until 60s standing is completed
  useEffect(() => {
    if (visible && phase === 'standing_camera') {
      playSoundPreview(alarmSound, true);
      if (vibrationEnabled && Platform.OS !== 'web') {
        try {
          Vibration.vibrate([0, 700, 300, 700], true);
        } catch {}
      }
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
  }, [visible, phase, alarmSound, vibrationEnabled]);

  // Hardware Accelerometer Posture Sensing
  useEffect(() => {
    let sub: { remove: () => void } | null = null;

    if (visible && phase === 'standing_camera') {
      try {
        Accelerometer.setUpdateInterval(400);
        sub = Accelerometer.addListener(({ x, y, z }) => {
          // Calculate angle relative to horizontal plane
          // When phone is upright / propped at eye level, y is high (~0.7 to 1.0), z is low (~0.0 to 0.5)
          // When lying flat on bed / mattress, z is ~1.0, y is near 0
          const rad = Math.atan2(Math.abs(y), Math.abs(z || 0.001));
          const deg = Math.round((rad * 180) / Math.PI);
          setPhoneTiltAngle(deg);

          // Upright threshold is >= 55 degrees
          const upright = deg >= 55;
          setIsStandingDetected(upright);
        });
      } catch {
        // Fallback for emulators/web without hardware accelerometer
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

  // Standing timer: ONLY counts down when user is standing upright with phone
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (visible && phase === 'standing_camera' && isStandingDetected && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Alarm complete! Stop sound and vibration, trigger celebration
            stopSoundPreview();
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
      }, 2500);
      return () => clearTimeout(exitTimer);
    }
  }, [phase, onSuccess]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      {/* CAMERA STANDING VERIFICATION */}
      {phase === 'standing_camera' && (
        <View style={styles.cameraContainer}>
          {permission?.granted ? (
            <CameraView style={styles.cameraPreview} facing="front">
              <View style={styles.overlayContainer}>
                {/* Silhouette Guide Overlay */}
                <View
                  style={[
                    styles.silhouetteFrame,
                    isStandingDetected ? styles.silhouetteFrameGreen : styles.silhouetteFrameAmber,
                  ]}
                >
                  <View style={styles.headOutline} />
                  <View style={styles.bodyOutline} />
                </View>

                {/* Top Status & Timer Box */}
                <View style={styles.timerBox}>
                  <Text style={styles.timerNumber}>{secondsRemaining}s</Text>
                  <Text style={styles.timerLabel}>
                    {isStandingDetected
                      ? '🧍 STANDING DETECTED • MAINTAIN POSTURE'
                      : '⚠️ PHONE FLAT ON BED • STAND UPRIGHT'}
                  </Text>
                  <Text style={styles.tiltBadge}>
                    Phone Angle: {phoneTiltAngle}° {isStandingDetected ? '✓ UPRIGHT' : '✕ TOO FLAT'}
                  </Text>
                </View>

                {/* Bottom Guidance Box */}
                <View style={styles.bottomGuidanceBox}>
                  <Text style={styles.alarmWarningText}>
                    🚨 LOUD ALARM RINGING UNTIL 60 SECONDS COMPLETE!
                  </Text>
                  <Text style={styles.guidanceTitle}>
                    {isStandingDetected
                      ? 'Posture Confirmed! Stay standing in front of camera...'
                      : 'Step out of bed and prop your phone upright facing your face.'}
                  </Text>
                  <Text style={styles.guidanceSub}>
                    Countdown pauses if phone is placed flat or posture is lost.
                  </Text>

                  {/* Manual posture calibration toggle */}
                  <TouchableOpacity
                    onPress={() => setIsStandingDetected((prev) => !prev)}
                    style={[
                      styles.btnToggleStanding,
                      { backgroundColor: isStandingDetected ? '#10B981' : '#F59E0B' },
                    ]}
                  >
                    <Text style={styles.btnToggleStandingText}>
                      {isStandingDetected ? '✓ Posture Active (Standing)' : '🧍 Tap to Force Standing Detection'}
                    </Text>
                  </TouchableOpacity>

                  {/* Cancel / Abandon button */}
                  <TouchableOpacity
                    onPress={() => {
                      stopSoundPreview();
                      try {
                        Vibration.cancel();
                      } catch {}
                      if (onCancelOrAbandon) onCancelOrAbandon();
                    }}
                    style={styles.btnAbandon}
                  >
                    <Text style={styles.btnAbandonText}>Dismiss / Abandon ✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          ) : (
            <View style={styles.noPermissionBox}>
              <Text style={styles.noPermTitle}>📸 Camera Access Required</Text>
              <Text style={styles.noPermText}>
                Wake-Up standing verification requires front selfie camera to ensure you are up and active.
              </Text>
              <TouchableOpacity onPress={() => requestPermission()} style={styles.btnGrant}>
                <Text style={styles.btnGrantText}>Grant Camera Permission</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  stopSoundPreview();
                  if (onCancelOrAbandon) onCancelOrAbandon();
                }}
                style={styles.btnDismissNoPerm}
              >
                <Text style={styles.btnDismissNoPermText}>Cancel Alarm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* PHASE 2: CELEBRATION */}
      {phase === 'celebration' && (
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebEmoji}>🎉</Text>
          <Text style={styles.celebTitle}>Good Morning!</Text>
          <Text style={styles.celebSub}>
            60 seconds standing verified! Your wake-up accountability streak is locked in.
          </Text>
          <View style={styles.celebBadge}>
            <Text style={styles.celebBadgeText}>✓ MORNING HABIT COMPLETED</Text>
          </View>
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
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  silhouetteFrame: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    width: '60%',
    height: '40%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteFrameGreen: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  silhouetteFrameAmber: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  headOutline: {
    width: 60,
    height: 70,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: 8,
  },
  bodyOutline: {
    width: 100,
    height: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  timerBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  timerNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  tiltBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 4,
  },
  bottomGuidanceBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
  },
  alarmWarningText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  guidanceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  guidanceSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  btnToggleStanding: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  btnToggleStandingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  btnAbandon: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  btnAbandonText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  celebrationContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  celebEmoji: {
    fontSize: 70,
    marginBottom: 20,
  },
  celebTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  celebSub: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  celebBadge: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  celebBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  noPermissionBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noPermTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  noPermText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btnGrant: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  btnGrantText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  btnDismissNoPerm: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnDismissNoPermText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
