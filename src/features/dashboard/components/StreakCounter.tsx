import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../utils/theme';

interface StreakCounterProps {
  streak: number;
  longestStreak?: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ streak, longestStreak = 0 }) => {
  const { colors, isDark } = useTheme();
  const bestStreak = Math.max(streak, longestStreak);

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: colors.streakBg,
          borderColor: colors.streakBorder,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.content}>
          <Text style={styles.flame}>🔥</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.streakNumber, { color: isDark ? '#FBBF24' : '#EA580C' }]}>{streak}</Text>
            <Text style={[styles.streakLabel, { color: isDark ? '#FBBF24' : '#C2410C' }]}>DAY STREAK</Text>
          </View>
        </View>
        {bestStreak > 0 && (
          <View style={[styles.bestPill, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#FEF3C7' }]}>
            <Text style={[styles.bestText, { color: isDark ? '#FDE68A' : '#B45309' }]}>★ BEST: {bestStreak}D</Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.subtitle,
          { color: isDark ? '#CBD5E1' : '#475569' },
        ]}
      >
        {streak > 0
          ? 'Consistency is key. Keep your momentum going!'
          : 'Complete at least one task today to start your streak!'}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flame: {
    fontSize: 44,
    marginRight: 16,
  },
  textContainer: {
    flexDirection: 'column',
  },
  streakNumber: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  bestPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  bestText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
});
