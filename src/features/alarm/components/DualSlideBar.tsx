import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface DualSlideBarProps {
  onSlideRight: () => void; // Confirm / Doing it (Green)
  onSlideLeft: () => void;  // Skip / Decline (Red)
  confirmLabel?: string;
  skipLabel?: string;
  disabled?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRACK_WIDTH = Math.min(SCREEN_WIDTH - 48, 360);
const THUMB_SIZE = 58;
const MAX_SLIDE = (TRACK_WIDTH - THUMB_SIZE) / 2 - 4; // Max distance left or right from center

export const DualSlideBar: React.FC<DualSlideBarProps> = ({
  onSlideRight,
  onSlideLeft,
  confirmLabel = "I'm Doing It",
  skipLabel = 'Skip Routine',
  disabled = false,
}) => {
  const pan = useRef(new Animated.Value(0)).current;
  const [slideDirection, setSlideDirection] = useState<'neutral' | 'right' | 'left'>('neutral');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onPanResponderMove: (_, gesture) => {
        // Clamp between -MAX_SLIDE and +MAX_SLIDE
        const clampedX = Math.max(-MAX_SLIDE, Math.min(MAX_SLIDE, gesture.dx));
        pan.setValue(clampedX);

        if (clampedX > 25) {
          setSlideDirection('right');
        } else if (clampedX < -25) {
          setSlideDirection('left');
        } else {
          setSlideDirection('neutral');
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const threshold = MAX_SLIDE * 0.72;

        if (gesture.dx >= threshold) {
          // Trigger Slide Right (Confirm)
          if (Platform.OS !== 'web') {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
          }
          Animated.timing(pan, {
            toValue: MAX_SLIDE,
            duration: 120,
            useNativeDriver: true,
          }).start(() => {
            onSlideRight();
            Animated.timing(pan, { toValue: 0, duration: 200, useNativeDriver: true }).start();
            setSlideDirection('neutral');
          });
        } else if (gesture.dx <= -threshold) {
          // Trigger Slide Left (Skip)
          if (Platform.OS !== 'web') {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}
          }
          Animated.timing(pan, {
            toValue: -MAX_SLIDE,
            duration: 120,
            useNativeDriver: true,
          }).start(() => {
            onSlideLeft();
            Animated.timing(pan, { toValue: 0, duration: 200, useNativeDriver: true }).start();
            setSlideDirection('neutral');
          });
        } else {
          // Spring back to center
          Animated.spring(pan, {
            toValue: 0,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }).start(() => {
            setSlideDirection('neutral');
          });
        }
      },
    })
  ).current;

  // Background color interpolation based on pan
  const trackBgColor =
    slideDirection === 'right'
      ? 'rgba(16, 185, 129, 0.22)'
      : slideDirection === 'left'
      ? 'rgba(239, 68, 68, 0.22)'
      : 'rgba(255, 255, 255, 0.08)';

  const trackBorderColor =
    slideDirection === 'right'
      ? '#10B981'
      : slideDirection === 'left'
      ? '#EF4444'
      : 'rgba(255, 255, 255, 0.16)';

  return (
    <View style={styles.container}>
      {/* Visual Instruction Labels */}
      <View style={styles.guidanceRow}>
        <Text style={[styles.guidanceLeft, slideDirection === 'left' && styles.guidanceActiveRed]}>
          ◀ Slide Left to Skip
        </Text>
        <Text style={[styles.guidanceRight, slideDirection === 'right' && styles.guidanceActiveGreen]}>
          Slide Right to Confirm ▶
        </Text>
      </View>

      {/* Slider Track */}
      <View
        style={[
          styles.track,
          {
            backgroundColor: trackBgColor,
            borderColor: trackBorderColor,
          },
        ]}
      >
        {/* Left Side Prompt (Red) */}
        <View style={styles.trackSideLeft}>
          <Text
            style={[
              styles.sideText,
              { color: slideDirection === 'left' ? '#EF4444' : 'rgba(255,255,255,0.4)' },
            ]}
          >
            ✕ {skipLabel}
          </Text>
        </View>

        {/* Right Side Prompt (Green) */}
        <View style={styles.trackSideRight}>
          <Text
            style={[
              styles.sideText,
              { color: slideDirection === 'right' ? '#10B981' : 'rgba(255,255,255,0.4)' },
            ]}
          >
            ✓ {confirmLabel}
          </Text>
        </View>

        {/* Interactive Centered Thumb */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.thumb,
            {
              transform: [{ translateX: pan }],
              backgroundColor:
                slideDirection === 'right'
                  ? '#10B981'
                  : slideDirection === 'left'
                  ? '#EF4444'
                  : '#FFFFFF',
            },
          ]}
        >
          <Text style={styles.thumbIcon}>
            {slideDirection === 'right' ? '✓' : slideDirection === 'left' ? '✕' : '◀ ➔'}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: TRACK_WIDTH,
    alignSelf: 'center',
    marginVertical: 14,
  },
  guidanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  guidanceLeft: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  guidanceRight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  guidanceActiveRed: {
    color: '#EF4444',
    fontWeight: '800',
  },
  guidanceActiveGreen: {
    color: '#10B981',
    fontWeight: '800',
  },
  track: {
    width: TRACK_WIDTH,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  trackSideLeft: {
    position: 'absolute',
    left: 14,
  },
  trackSideRight: {
    position: 'absolute',
    right: 14,
  },
  sideText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  thumbIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: '#090D16',
  },
});
