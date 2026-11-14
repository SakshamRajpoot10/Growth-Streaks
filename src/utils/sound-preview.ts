import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getSoundById } from '../constants/sounds';

let audioCtx: any = null;

function getAudioContext() {
  if (typeof window !== 'undefined') {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      if (!audioCtx) {
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }
  }
  return null;
}

/**
 * Plays an audible sound preview for the chosen alarm sound.
 * Works seamlessly in web (using synthetic Web Audio melodies)
 * and triggers rich haptic feedback on physical mobile devices.
 */
export function playSoundPreview(soundId: string) {
  try {
    // Trigger tactile haptic feedback on mobile devices
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Haptics safety
      }
    }

    const sound = getSoundById(soundId);
    const ctx = getAudioContext();
    if (!ctx) return;

    let startTime = ctx.currentTime + 0.05;
    const freqs = sound.frequencyPattern;
    const durations = sound.durationPattern;

    for (let i = 0; i < freqs.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = soundId.includes('synth') || soundId.includes('beep') ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freqs[i], startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + durations[i]);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + durations[i] + 0.05);

      startTime += durations[i] + 0.04;
    }
  } catch {
    // Audio preview safety
  }
}
