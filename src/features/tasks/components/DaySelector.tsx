import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/colors';

interface DaySelectorProps {
  selectedDays: number[]; // 1=Mon..7=Sun
  onToggleDay: (day: number) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onToggleDay,
}) => {
  const days = [
    { label: 'M', value: 1 },
    { label: 'T', value: 2 },
    { label: 'W', value: 3 },
    { label: 'T', value: 4 },
    { label: 'F', value: 5 },
    { label: 'S', value: 6 },
    { label: 'S', value: 7 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Repeat On</Text>
      <View style={styles.row}>
        {days.map((day, idx) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <TouchableOpacity
              key={`${day.value}-${idx}`}
              activeOpacity={0.7}
              onPress={() => onToggleDay(day.value)}
              style={[
                styles.dayButton,
                isSelected ? styles.selectedButton : styles.unselectedButton,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected ? styles.selectedText : styles.unselectedText,
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: Colors.light.primary,
  },
  unselectedButton: {
    backgroundColor: Colors.light.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  unselectedText: {
    color: Colors.light.textSecondary,
  },
});
