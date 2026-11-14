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
      <View style={styles.content}>
        <Text style={styles.flame}>🔥</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.streakNumber, { color: colors.streak }]}>{streak}</Text>
          <Text style={[styles.streakLabel, { color: isDark ? '#FBBF24' : '#D97706' }]}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.longestContainer}>
        <Text
          style={[
            styles.longestBadge,
            {
              color: colors.streakText,
              backgroundColor: isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(217, 119, 6, 0.12)',
            },
          ]}
        >
          🏆 Highest Streak: {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
        </Text>
      </View>

      <Text
        style={[
          styles.subtitle,
          { color: isDark ? '#CBD5E1' : '#475569' },
        ]}
      >
        {streak > 0
          ? 'Consistency is key. Keep your momentum going!'
          : 'Complete at least one routine today to keep your streak alive!'}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flame: {
    fontSize: 42,
    marginRight: 16,
  },
  textContainer: {
    flexDirection: 'column',
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  longestContainer: {
    marginTop: 10,
    flexDirection: 'row',
  },
  longestBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
});
