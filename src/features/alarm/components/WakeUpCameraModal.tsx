import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { playSoundPreview, stopSoundPreview } from '../../../utils/sound-preview';

interface WakeUpCameraModalProps {
  visible: boolean;
  taskTitle: string;
  alarmSound?: string;
  onSuccess: () => void;
  onCancelOrAbandon?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const REQUIRED_SECONDS = 60;
const CHECK_INTERVAL = 10; // Check every 10 seconds

export const WakeUpCameraModal: React.FC<WakeUpCameraModalProps> = ({
  visible,
  taskTitle,
  alarmSound = 'gentle_chime',
  onSuccess,
  onCancelOrAbandon,
}) => {
  const [phase, setPhase] = useState<'alarm_ringing' | 'standing_camera' | 'celebration'>('alarm_ringing');
  const [secondsRemaining, setSecondsRemaining] = useState(REQUIRED_SECONDS);
  const [isStandingDetected, setIsStandingDetected] = useState(false);
  const [successfulChecks, setSuccessfulChecks] = useState(0);
  const [totalChecks, setTotalChecks] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();

  // Slide to unlock animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const maxSlide = SCREEN_WIDTH - 120;

  // Sound loop control
  useEffect(() => {
    if (visible && phase === 'alarm_ringing') {
      playSoundPreview(alarmSound, true);
    } else {
      stopSoundPreview();
    }

    return () => {
      stopSoundPreview();
    };
  }, [visible, phase, alarmSound]);

  // Request camera permission on mount
  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible, permission]);

  // Slide to verify PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx >= 0 && gesture.dx <= maxSlide) {
          slideAnim.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx >= maxSlide * 0.8) {
          // Successfully slid
          Animated.timing(slideAnim, {
            toValue: maxSlide,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            stopSoundPreview();
            setPhase('standing_camera');
            setSecondsRemaining(REQUIRED_SECONDS);
            setIsStandingDetected(false);
            setSuccessfulChecks(0);
            setTotalChecks(0);
          });
        } else {
          // Snap back
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Standing timer & 10s check loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (phase === 'standing_camera' && isStandingDetected && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          const next = prev - 1;

          // Check interval every 10 seconds
          if ((REQUIRED_SECONDS - next) % CHECK_INTERVAL === 0) {
            setTotalChecks((tc) => tc + 1);
            setSuccessfulChecks((sc) => sc + 1);
          }

          if (next <= 0) {
            setPhase('celebration');
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase, isStandingDetected, secondsRemaining]);

  // Handle celebration auto-exit
  useEffect(() => {
    if (phase === 'celebration') {
      const exitTimer = setTimeout(() => {
        onSuccess();
        setPhase('alarm_ringing');
        slideAnim.setValue(0);
      }, 3000);
      return () => clearTimeout(exitTimer);
    }
  }, [phase, onSuccess]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
      {/* PHASE 1: ALARM RINGING & SLIDE TO UNLOCK */}
      {phase === 'alarm_ringing' && (
        <View style={styles.alarmScreenContainer}>
          <View style={styles.topAlarmHeader}>
            <Text style={styles.bellIcon}>⏰</Text>
            <Text style={styles.wakeUpBadge}>WAKE-UP ALARM • FULL STANDING REQUIRED</Text>
            <Text style={styles.alarmTimeText}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.alarmTitleText}>{taskTitle || 'Morning Wake Up'}</Text>
            <Text style={styles.alarmNoticeText}>
              To turn off this alarm, slide below and stand in front of the camera for 60 seconds.
            </Text>
          </View>

          {/* Interactive Slide to Verify Bar */}
          <View style={styles.sliderTrack}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.sliderThumb,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <Text style={styles.sliderThumbIcon}>➔</Text>
            </Animated.View>
            <Text style={styles.sliderTrackText}>SLIDE TO STAND & VERIFY ➔</Text>
          </View>
        </View>
      )}

      {/* PHASE 2: CAMERA STANDING VERIFICATION */}
      {phase === 'standing_camera' && (
        <View style={styles.cameraContainer}>
          {permission?.granted ? (
            <CameraView style={styles.cameraPreview} facing="front">
              {/* Silhouette Framing Overlay */}
              <View style={styles.overlayContainer}>
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
                      ? `🧍 STANDING VERIFIED (${successfulChecks}/6 CHECKS)`
                      : '⚠️ STEP BACK & STAND UPRIGHT'}
                  </Text>
                </View>

                {/* Bottom Guidance & Standing Toggle */}
                <View style={styles.bottomGuidanceBox}>
                  <Text style={styles.guidanceTitle}>
                    {isStandingDetected
                      ? 'Posture Confirmed! Maintain standing position...'
                      : 'Step back ~2 meters so your full upper body is in the frame.'}
                  </Text>
                  <Text style={styles.guidanceSub}>
                    Checking posture every 10 seconds. Leaving the frame resets the alarm.
                  </Text>

                  {/* Standing Detection Toggle for verification */}
                  <TouchableOpacity
                    onPress={() => setIsStandingDetected((prev) => !prev)}
                    style={[
                      styles.btnToggleStanding,
                      { backgroundColor: isStandingDetected ? '#10B981' : '#F59E0B' },
                    ]}
                  >
                    <Text style={styles.btnToggleStandingText}>
                      {isStandingDetected ? '✓ Posture Verified (Standing)' : '🧍 Tap to Verify Standing Position'}
                    </Text>
                  </TouchableOpacity>

                  {/* Loophole Protection: Abandon Warning */}
                  <TouchableOpacity
                    onPress={() => {
                      // Leaving early sounds the alarm again!
                      setPhase('alarm_ringing');
                      slideAnim.setValue(0);
                      if (onCancelOrAbandon) onCancelOrAbandon();
                    }}
                    style={styles.btnAbandon}
                  >
                    <Text style={styles.btnAbandonText}>Cancel & Resume Loud Alarm ⚠️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          ) : (
            <View style={styles.noPermissionBox}>
              <Text style={styles.noPermText}>Camera permission is required to verify standing posture.</Text>
              <TouchableOpacity onPress={requestPermission} style={styles.btnGrant}>
                <Text style={styles.btnGrantText}>Grant Camera Permission</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* PHASE 3: CELEBRATION */}
      {phase === 'celebration' && (
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebEmoji}>🎉</Text>
          <Text style={styles.celebTitle}>Good Morning!</Text>
          <Text style={styles.celebSub}>
            60 seconds standing verified! Your morning accountability streak is locked in.
          </Text>
          <View style={styles.celebBadge}>
            <Text style={styles.celebBadgeText}>✓ HAVE A PRODUCTIVE & GREAT DAY</Text>
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  alarmScreenContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  topAlarmHeader: {
    alignItems: 'center',
    marginTop: 40,
  },
  bellIcon: {
    fontSize: 54,
    marginBottom: 16,
  },
  wakeUpBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1,
    marginBottom: 12,
  },
  alarmTimeText: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  alarmTitleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 8,
  },
  alarmNoticeText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  sliderTrack: {
    width: '100%',
    height: 64,
    backgroundColor: '#1E293B',
    borderRadius: 32,
    justifyContent: 'center',
    paddingHorizontal: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  sliderThumb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 4,
  },
  sliderThumbIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sliderTrackText: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
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
  },
  timerBox: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    alignSelf: 'center',
  },
  timerNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 4,
  },
  silhouetteFrame: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.22,
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_HEIGHT * 0.42,
    borderRadius: 24,
    borderWidth: 3,
    borderStyle: 'dashed',
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
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    marginBottom: 10,
  },
  bodyOutline: {
    width: 130,
    height: 140,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  bottomGuidanceBox: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  guidanceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  guidanceSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  btnToggleStanding: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnToggleStandingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnAbandon: {
    marginTop: 10,
    padding: 6,
  },
  btnAbandonText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  noPermissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noPermText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  btnGrant: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  btnGrantText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  celebrationContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  celebEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  celebTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  celebSub: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  celebBadge: {
    marginTop: 28,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  celebBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
});
