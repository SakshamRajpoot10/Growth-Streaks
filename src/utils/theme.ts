import { useSettingsStore } from '../store/useSettingsStore';
import { Colors } from '../constants/colors';

export function useTheme() {
  const theme = useSettingsStore((s) => s.theme);
  // Default is light mode unless user explicitly toggles to dark
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return { isDark, colors, theme };
}
