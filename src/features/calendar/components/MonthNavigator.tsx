import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/colors';

interface MonthNavigatorProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
}) => {
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrevMonth} style={styles.arrowButton}>
        <Text style={styles.arrowText}>◀</Text>
      </TouchableOpacity>
      <Text style={styles.monthTitle}>{monthName}</Text>
      <TouchableOpacity onPress={onNextMonth} style={styles.arrowButton}>
        <Text style={styles.arrowText}>▶</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  arrowButton: {
    padding: 8,
  },
  arrowText: {
    fontSize: 18,
    color: Colors.light.primary,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
});

