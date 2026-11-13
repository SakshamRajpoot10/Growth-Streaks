export interface SoundOption {
  id: string;
  name: string;
  file: string;
}

export const ALARM_SOUNDS: SoundOption[] = [
  { id: 'default_alarm', name: 'Default Alarm', file: 'default_alarm.mp3' },
  { id: 'gentle_chime', name: 'Gentle Chime', file: 'gentle_chime.mp3' },
  { id: 'rooster', name: 'Rooster', file: 'rooster.mp3' },
  { id: 'digital_beep', name: 'Digital Beep', file: 'digital_beep.mp3' },
];

export function getSoundById(id: string): SoundOption {
  return ALARM_SOUNDS.find((s) => s.id === id) || ALARM_SOUNDS[0];
}

