import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { ProgressRing } from '../../../components/ui/ProgressRing';
import { useTheme } from '../../../utils/theme';

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
  const { colors } = useTheme();

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>Today's Accountability</Text>
      <View style={styles.ringContainer}>
        <ProgressRing
          progress={percentage}
          size={160}
          strokeWidth={14}
          color={percentage >= 70 ? colors.primary : colors.accent}
          label={`${percentage}%`}
          subLabel={`${completed}/${total} Tasks`}
        />
      </View>
      <Text style={[styles.statusText, { color: colors.textSecondary }]}>
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
    marginBottom: 16,
  },
  ringContainer: {
    marginVertical: 8,
  },
  statusText: {
    fontSize: 14,
    marginTop: 14,
    textAlign: 'center',
  },
});
