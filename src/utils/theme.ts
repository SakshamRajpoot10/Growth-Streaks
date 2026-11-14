import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { Colors } from '../constants/colors';

export function useTheme() {
  const theme = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemScheme === 'dark');
  const colors = isDark ? Colors.dark : Colors.light;

  return { isDark, colors, theme };
}
