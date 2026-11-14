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
        isDark
          ? { backgroundColor: '#2A1E0D', borderColor: '#4A3415' }
          : { backgroundColor: '#FFF8E1', borderColor: '#FFE082' },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.flame}>🔥</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.streakNumber, { color: colors.streak }]}>{streak}</Text>
          <Text style={[styles.streakLabel, isDark && { color: '#FBBF24' }]}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.longestContainer}>
        <Text style={[styles.longestBadge, isDark ? { color: '#FCD34D', backgroundColor: '#3D2A12' } : {}]}>
          🏆 Highest Streak: {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
        </Text>
      </View>

      <Text style={[styles.subtitle, isDark ? { color: '#D4B895' } : { color: '#795548' }]}>
        {streak > 0
          ? 'Consistency is key. Keep the momentum going!'
          : 'Complete at least one routine today to keep your streak alive!'}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flame: {
    fontSize: 40,
    marginRight: 16,
  },
  textContainer: {
    flexDirection: 'column',
  },
  streakNumber: {
    fontSize: 34,
    fontWeight: '800',
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  longestContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  longestBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 8,
  },
});
