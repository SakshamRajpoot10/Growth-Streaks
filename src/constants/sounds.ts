export interface SoundOption {
  id: string;
  name: string;
  description: string;
  frequencyPattern: number[];
  durationPattern: number[];
  file: string;
}

export const ALARM_SOUNDS: SoundOption[] = [
  {
    id: 'default_alarm',
    name: 'Default Alarm',
    description: 'Classic steady pulse',
    frequencyPattern: [587.33, 880, 587.33, 880],
    durationPattern: [0.15, 0.15, 0.15, 0.25],
    file: 'default_alarm.mp3',
  },
  {
    id: 'gentle_chime',
    name: 'Gentle Chime',
    description: 'Soft harmonic wake chime',
    frequencyPattern: [523.25, 659.25, 783.99, 1046.5],
    durationPattern: [0.2, 0.2, 0.2, 0.4],
    file: 'gentle_chime.mp3',
  },
  {
    id: 'digital_beep',
    name: 'Digital Beep',
    description: 'Crisp electronic sequence',
    frequencyPattern: [1000, 1000, 1200, 1200],
    durationPattern: [0.1, 0.1, 0.1, 0.2],
    file: 'digital_beep.mp3',
  },
  {
    id: 'morning_bell',
    name: 'Morning Bell',
    description: 'Resonant temple bell tone',
    frequencyPattern: [440, 554.37, 659.25],
    durationPattern: [0.25, 0.25, 0.5],
    file: 'morning_bell.mp3',
  },
  {
    id: 'sunrise_acoustic',
    name: 'Sunrise Acoustic',
    description: 'Uplifting ascending notes',
    frequencyPattern: [329.63, 392, 493.88, 587.33],
    durationPattern: [0.18, 0.18, 0.18, 0.35],
    file: 'sunrise_acoustic.mp3',
  },
  {
    id: 'energetic_beat',
    name: 'Energetic Beat',
    description: 'Fast active wake tempo',
    frequencyPattern: [700, 900, 1100, 1300],
    durationPattern: [0.12, 0.12, 0.12, 0.2],
    file: 'energetic_beat.mp3',
  },
  {
    id: 'radar_alert',
    name: 'Radar Alert',
    description: 'Sonar ping alert tone',
    frequencyPattern: [1200, 1500, 1200, 1500],
    durationPattern: [0.08, 0.12, 0.08, 0.25],
    file: 'radar_alert.mp3',
  },
  {
    id: 'cosmic_synth',
    name: 'Cosmic Synth',
    description: 'Futuristic atmospheric chord',
    frequencyPattern: [432, 540, 648, 864],
    durationPattern: [0.2, 0.2, 0.25, 0.4],
    file: 'cosmic_synth.mp3',
  },
  {
    id: 'rooster',
    name: 'Rooster Call',
    description: 'Traditional morning wake',
    frequencyPattern: [600, 750, 950, 1100],
    durationPattern: [0.15, 0.15, 0.2, 0.3],
    file: 'rooster.mp3',
  },
  {
    id: 'zen_flute',
    name: 'Zen Flute',
    description: 'Peaceful mindful meditation',
    frequencyPattern: [392, 440, 523.25, 659.25],
    durationPattern: [0.25, 0.25, 0.25, 0.5],
    file: 'zen_flute.mp3',
  },
];

export function getSoundById(id: string): SoundOption {
  return ALARM_SOUNDS.find((s) => s.id === id) || ALARM_SOUNDS[0];
}
