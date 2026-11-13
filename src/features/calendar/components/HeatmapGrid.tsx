import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/colors';
import { HeatmapDay } from '../../../types/task-log';

interface HeatmapGridProps {
  days: HeatmapDay[];
  onSelectDay: (day: HeatmapDay) => void;
  selectedDate?: string;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  days,
  onSelectDay,
  selectedDate,
}) => {
  const getCellColor = (intensity: number) => {
    switch (intensity) {
      case 1:
        return Colors.heatmap.level1;
      case 2:
        return Colors.heatmap.level2;
      case 3:
        return Colors.heatmap.level3;
      case 4:
        return Colors.heatmap.level4;
      case 0:
      default:
        return Colors.heatmap.empty;
    }
  };

  const weekHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={styles.container}>
      {/* Day of week headers */}
      <View style={styles.headerRow}>
        {weekHeaders.map((header, index) => (
          <Text key={index} style={styles.headerText}>
            {header}
          </Text>
        ))}
      </View>

      {/* Grid cells */}
      <View style={styles.grid}>
        {days.map((day) => {
          const isSelected = selectedDate === day.date;
          return (
            <TouchableOpacity
              key={day.date}
              activeOpacity={0.7}
              onPress={() => onSelectDay(day)}
              style={[
                styles.cell,
                { backgroundColor: getCellColor(day.intensity) },
                isSelected && styles.selectedCell,
              ]}
            >
              <Text
                style={[
                  styles.cellText,
                  day.intensity >= 3 ? styles.whiteText : styles.darkText,
                ]}
              >
                {new Date(day.date).getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Heatmap Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendLabel}>Less</Text>
        <View style={[styles.legendBox, { backgroundColor: Colors.heatmap.empty }]} />
        <View style={[styles.legendBox, { backgroundColor: Colors.heatmap.level1 }]} />
        <View style={[styles.legendBox, { backgroundColor: Colors.heatmap.level2 }]} />
        <View style={[styles.legendBox, { backgroundColor: Colors.heatmap.level3 }]} />
        <View style={[styles.legendBox, { backgroundColor: Colors.heatmap.level4 }]} />
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    width: 38,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  cell: {
    width: 38,
    height: 38,
    margin: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  cellText: {
    fontSize: 12,
    fontWeight: '600',
  },
  whiteText: {
    color: '#FFFFFF',
  },
  darkText: {
    color: Colors.light.text,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  legendLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginHorizontal: 4,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginHorizontal: 2,
  },
});

