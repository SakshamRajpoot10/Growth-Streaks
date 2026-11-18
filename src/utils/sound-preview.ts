import { Platform } from 'react-native';
import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { SOUND_ASSET_MAP, getSoundById } from '../constants/sounds';

let currentPlayerInstance: AudioPlayer | null = null;
let isAudioModeConfigured = false;

async function configureAudioForAlarm() {
  if (isAudioModeConfigured) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
      shouldPlayInBackground: true,
      shouldRouteThroughEarpiece: false,
    });
    isAudioModeConfigured = true;
  } catch {
    // Audio mode fallback
  }
}

/**
 * Stop any currently running sound preview
 */
export async function stopSoundPreview() {
  try {
    if (currentPlayerInstance) {
      currentPlayerInstance.pause();
      currentPlayerInstance.remove();
      currentPlayerInstance = null;
    }
  } catch {
    currentPlayerInstance = null;
  }
}

/**
 * Plays real MP3 audio preview for the chosen sound.
 * Plays in silent mode, interrupts background media, and loops for alarms.
 */
export async function playSoundPreview(soundId: string, shouldLoop: boolean = false) {
  try {
    await configureAudioForAlarm();

    // Tactile haptic feedback
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {
        // Haptics safety
      }
    }

    await stopSoundPreview();

    const asset = SOUND_ASSET_MAP[soundId] || SOUND_ASSET_MAP['gentle_chime'];
    if (!asset) return;

    currentPlayerInstance = createAudioPlayer(asset);
    if (currentPlayerInstance) {
      currentPlayerInstance.loop = shouldLoop;
      currentPlayerInstance.volume = 1.0;
      currentPlayerInstance.play();
    }
  } catch (error) {
    // Fallback safely to haptic feedback if audio output device is unavailable
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Handled silently
      }
    }
  }
}
