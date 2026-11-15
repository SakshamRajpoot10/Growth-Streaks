import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { SOUND_ASSET_MAP, getSoundById } from '../constants/sounds';

let currentPlaybackInstance: Audio.Sound | null = null;

/**
 * Configure audio mode for clean offline playback
 */
async function configureAudio() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
  } catch {
    // Audio configuration fallback
  }
}

/**
 * Stop any currently running sound preview
 */
export async function stopSoundPreview() {
  try {
    if (currentPlaybackInstance) {
      await currentPlaybackInstance.stopAsync();
      await currentPlaybackInstance.unloadAsync();
      currentPlaybackInstance = null;
    }
  } catch {
    currentPlaybackInstance = null;
  }
}

/**
 * Plays real MP3 audio preview for the chosen sound.
 * Supports looping or one-shot preview with tactile haptic feedback.
 */
export async function playSoundPreview(soundId: string, shouldLoop: boolean = false) {
  try {
    // Tactile haptic feedback
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Haptics safety
      }
    }

    await stopSoundPreview();
    await configureAudio();

    const asset = SOUND_ASSET_MAP[soundId] || SOUND_ASSET_MAP['gentle_chime'];
    if (!asset) return;

    const { sound } = await Audio.Sound.createAsync(
      asset,
      { shouldPlay: true, isLooping: shouldLoop, volume: 1.0 },
      (status) => {
        if (status.isLoaded && status.didJustFinish && !shouldLoop) {
          stopSoundPreview();
        }
      }
    );

    currentPlaybackInstance = sound;
  } catch {
    // Fallback if audio hardware is busy
  }
}
