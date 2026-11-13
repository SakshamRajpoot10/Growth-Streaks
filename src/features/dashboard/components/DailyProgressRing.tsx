import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { ProgressRing } from '../../../components/ui/ProgressRing';
import { Colors } from '../../../constants/colors';

interface DailyProgressRingProps {
  completed: number;
  total: number;
  percentage: number;
}

export const DailyProgressRing: React.FC<DailyProgressRingProps> = ({
  completed,
  total,
  percentage,
}) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Today's Accountability</Text>
      <View style={styles.ringContainer}>
        <ProgressRing
          progress={percentage}
          size={160}
          strokeWidth={14}
          color={percentage >= 70 ? Colors.light.primary : Colors.light.accent}
          label={`${percentage}%`}
          subLabel={`${completed}/${total} Tasks`}
        />
      </View>
      <Text style={styles.statusText}>
        {total === 0
          ? 'No routines scheduled for today.'
          : completed === total
          ? '🎉 All routines crushed today!'
          : `${total - completed} routine(s) remaining.`}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  ringContainer: {
    marginVertical: 8,
  },
  statusText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 14,
    textAlign: 'center',
  },
});

