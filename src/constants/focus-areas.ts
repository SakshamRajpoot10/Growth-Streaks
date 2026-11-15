export interface FocusArea {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const FOCUS_AREAS: FocusArea[] = [
  { id: 'wake_up', name: 'Wake Up', emoji: '⏰', color: '#F59E0B' },
  { id: 'health', name: 'Health', emoji: '🏃', color: '#4CAF50' },
  { id: 'study', name: 'Study', emoji: '📚', color: '#2196F3' },
  { id: 'work', name: 'Work', emoji: '💼', color: '#FF9800' },
  { id: 'fitness', name: 'Fitness', emoji: '💪', color: '#E91E63' },
  { id: 'mindfulness', name: 'Mindfulness', emoji: '🧘', color: '#9C27B0' },
  { id: 'reading', name: 'Reading', emoji: '📖', color: '#795548' },
  { id: 'creative', name: 'Creative', emoji: '🎨', color: '#FF5722' },
  { id: 'social', name: 'Social', emoji: '👥', color: '#00BCD4' },
  { id: 'finance', name: 'Finance', emoji: '💰', color: '#607D8B' },
  { id: 'general', name: 'General', emoji: '📌', color: '#9E9E9E' },
];

export function getFocusAreaById(id: string): FocusArea {
  return FOCUS_AREAS.find((fa) => fa.id === id) || FOCUS_AREAS[FOCUS_AREAS.length - 1];
}

