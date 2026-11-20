import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  withTopInset?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  withTopInset = false,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const topInset = withTopInset
    ? Math.max(insets.top, Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 0)
    : 0;

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: topInset }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.container, style]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
