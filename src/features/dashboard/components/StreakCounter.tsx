import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { Colors } from '../../../constants/colors';

interface StreakCounterProps {
  streak: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.flame}>🔥</Text>
        <View style={styles.textContainer}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>
        {streak > 0
          ? 'Consistency is key. Keep the momentum going!'
          : 'Complete at least one task today to start your streak!'}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE082',
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
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.streak,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#795548',
    marginTop: 8,
  },
});
