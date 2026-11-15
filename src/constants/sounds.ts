export interface SoundOption {
  id: string;
  name: string;
  description: string;
  file: string;
}

export const SOUND_ASSET_MAP: Record<string, any> = {
  gentle_chime: require('../../assets/sounds/gentle_chime.mp3'),
  digital_pulse: require('../../assets/sounds/digital_pulse.mp3'),
  morning_bell: require('../../assets/sounds/morning_bell.mp3'),
  cosmic_synth: require('../../assets/sounds/cosmic_synth.mp3'),
  sunrise_acoustic: require('../../assets/sounds/sunrise_acoustic.mp3'),
  energetic_beat: require('../../assets/sounds/energetic_beat.mp3'),
  radar_alert: require('../../assets/sounds/radar_alert.mp3'),
  zen_flute: require('../../assets/sounds/zen_flute.mp3'),
  celestial_harp: require('../../assets/sounds/celestial_harp.mp3'),
  upbeat_wake: require('../../assets/sounds/upbeat_wake.mp3'),
  island_marimba: require('../../assets/sounds/island_marimba.mp3'),
  mountain_echo: require('../../assets/sounds/mountain_echo.mp3'),
  amber_melody: require('../../assets/sounds/amber_melody.mp3'),
  quiet_sunrise: require('../../assets/sounds/quiet_sunrise.mp3'),
  future_clock: require('../../assets/sounds/future_clock.mp3'),
  heroic_rise: require('../../assets/sounds/heroic_rise.mp3'),
  ocean_breeze: require('../../assets/sounds/ocean_breeze.mp3'),
  focus_flow: require('../../assets/sounds/focus_flow.mp3'),
  active_stride: require('../../assets/sounds/active_stride.mp3'),
  crystal_calm: require('../../assets/sounds/crystal_calm.mp3'),
  urgent_call: require('../../assets/sounds/urgent_call.mp3'),
};

export const ALARM_SOUNDS: SoundOption[] = [
  { id: 'gentle_chime', name: 'Gentle Chime', description: 'Soft harmonic wake chimes', file: 'gentle_chime.mp3' },
  { id: 'digital_pulse', name: 'Digital Pulse', description: 'Crisp electronic sequence', file: 'digital_pulse.mp3' },
  { id: 'morning_bell', name: 'Morning Bell', description: 'Resonant temple bell tone', file: 'morning_bell.mp3' },
  { id: 'cosmic_synth', name: 'Cosmic Synth', description: 'Atmospheric progressive chord', file: 'cosmic_synth.mp3' },
  { id: 'sunrise_acoustic', name: 'Sunrise Acoustic', description: 'Warm uplifting guitar notes', file: 'sunrise_acoustic.mp3' },
  { id: 'energetic_beat', name: 'Energetic Beat', description: 'Fast active wake rhythm', file: 'energetic_beat.mp3' },
  { id: 'radar_alert', name: 'Radar Alert', description: 'High-priority sonar alert pulse', file: 'radar_alert.mp3' },
  { id: 'zen_flute', name: 'Zen Flute', description: 'Peaceful mindful meditation', file: 'zen_flute.mp3' },
  { id: 'celestial_harp', name: 'Celestial Harp', description: 'Flowing ambient dream harp', file: 'celestial_harp.mp3' },
  { id: 'upbeat_wake', name: 'Upbeat Wake', description: 'Motivating energetic rhythm', file: 'upbeat_wake.mp3' },
  { id: 'island_marimba', name: 'Island Marimba', description: 'Cheerful wooden marimba', file: 'island_marimba.mp3' },
  { id: 'mountain_echo', name: 'Mountain Echo', description: 'Spacious reverberating melody', file: 'mountain_echo.mp3' },
  { id: 'amber_melody', name: 'Amber Melody', description: 'Rich acoustic chords', file: 'amber_melody.mp3' },
  { id: 'quiet_sunrise', name: 'Quiet Sunrise', description: 'Subtle serene dawn chime', file: 'quiet_sunrise.mp3' },
  { id: 'future_clock', name: 'Future Clock', description: 'Modern digital alarm pulse', file: 'future_clock.mp3' },
  { id: 'heroic_rise', name: 'Heroic Rise', description: 'Inspiring orchestral rise', file: 'heroic_rise.mp3' },
  { id: 'ocean_breeze', name: 'Ocean Breeze', description: 'Calming natural wake harmony', file: 'ocean_breeze.mp3' },
  { id: 'focus_flow', name: 'Focus Flow', description: 'Smooth lofi productivity vibe', file: 'focus_flow.mp3' },
  { id: 'active_stride', name: 'Active Stride', description: 'Brisk cadence motivation tone', file: 'active_stride.mp3' },
  { id: 'crystal_calm', name: 'Crystal Calm', description: 'Pure crystal glass resonance', file: 'crystal_calm.mp3' },
  { id: 'urgent_call', name: 'Urgent Call', description: 'Assertive high-visibility alarm', file: 'urgent_call.mp3' },
];

export function getSoundById(id: string): SoundOption {
  return ALARM_SOUNDS.find((s) => s.id === id) || ALARM_SOUNDS[0];
}
