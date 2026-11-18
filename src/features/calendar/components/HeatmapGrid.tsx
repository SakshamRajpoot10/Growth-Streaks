import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../utils/theme';
import { Task } from '../../../types/task';
import { TaskLog } from '../../../types/task-log';
import { getToday } from '../../../utils/date';

interface HeatmapGridProps {
  year: number;
  month: number;
  tasks: Task[];
  logsByDate: Record<string, TaskLog[]>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export type DayStatus = 'completed' | 'failed' | 'pending' | 'none';

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  year,
  month,
  tasks,
  logsByDate,
  selectedDate,
  onSelectDate,
}) => {
  const { colors, isDark } = useTheme();
  const todayStr = getToday();

  // Days in this month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Day offset for 1st of month (Monday = 0, Sunday = 6)
  const firstDay = new Date(year, month - 1, 1).getDay();
  const leadingOffset = (firstDay + 6) % 7;

  // Active tasks
  const activeTasks = tasks.filter((t) => t.isActive);

  // Compute status for day d
  const getDayStatus = (d: number): DayStatus => {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayLogs = logsByDate[dStr] || [];

    // 1. If any task was completed on this date -> GREEN
    if (dayLogs.some((l) => l.status === 'yes')) {
      return 'completed';
    }

    // 2. If alarms were logged and all were missed/declined -> RED
    if (dayLogs.length > 0 && dayLogs.every((l) => l.status === 'no' || l.status === 'missed')) {
      return 'failed';
    }

    // 3. If no alarms were recorded/answered for this date -> BLANK
    // (Never mark previous or unconfigured days red)
    return 'none';
  };

  const weekHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Weekday column headers */}
      <View style={styles.weekHeaderRow}>
        {weekHeaders.map((hdr, i) => (
          <View key={i} style={styles.weekHeaderCol}>
            <Text
              style={[
                styles.weekHeaderText,
                { color: colors.textSecondary },
                (i === 5 || i === 6) && { color: isDark ? '#64748B' : '#94A3B8' },
              ]}
            >
              {hdr}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid of days with leading spacers */}
      <View style={styles.grid}>
        {/* Empty spacer slots before 1st of month */}
        {Array.from({ length: leadingOffset }).map((_, i) => (
          <View key={`spacer-${i}`} style={styles.dayCellWrapper} />
        ))}

        {/* Days 1 to daysInMonth */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isSelected = selectedDate === dStr;
          const isToday = todayStr === dStr;
          const status = getDayStatus(dayNum);

          let cellBg = isDark ? '#1E293B' : '#F1F5F9';
          let textColor = colors.text;
          let indicatorColor = 'transparent';
          let cellBorder = 'transparent';

          if (status === 'completed') {
            cellBg = isDark ? 'rgba(16, 185, 129, 0.22)' : '#DCFCE7';
            textColor = isDark ? '#34D399' : '#15803D';
            indicatorColor = '#10B981';
            cellBorder = isDark ? 'rgba(16, 185, 129, 0.4)' : '#BBF7D0';
          } else if (status === 'failed') {
            cellBg = isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2';
            textColor = isDark ? '#F87171' : '#B91C1C';
            indicatorColor = '#EF4444';
            cellBorder = isDark ? 'rgba(239, 68, 68, 0.4)' : '#FECACA';
          } else if (status === 'pending') {
            cellBg = isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7';
            textColor = isDark ? '#FBBF24' : '#B45309';
            indicatorColor = '#F59E0B';
            cellBorder = isDark ? 'rgba(245, 158, 11, 0.35)' : '#FDE68A';
          }

          return (
            <View key={dStr} style={styles.dayCellWrapper}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onSelectDate(dStr)}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: cellBg,
                    borderColor: cellBorder !== 'transparent' ? cellBorder : isDark ? '#26334D' : '#E2E8F0',
                    borderWidth: 1,
                  },
                  isSelected && {
                    borderColor: '#10B981',
                    borderWidth: 2,
                    zIndex: 10,
                  },
                  isToday && !isSelected && {
                    borderColor: colors.primary,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayNumText,
                    { color: textColor },
                    (isSelected || status === 'completed') && { fontWeight: '800' },
                  ]}
                >
                  {dayNum}
                </Text>

                {/* Status Mark Dot */}
                {indicatorColor !== 'transparent' && (
                  <View style={[styles.statusDot, { backgroundColor: indicatorColor }]} />
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { borderTopColor: isDark ? '#1F293D' : colors.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Missed / Skipped</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>No Alarms Set</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
    width: '100%',
  },
  weekHeaderCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  dayCellWrapper: {
    width: '14.285%',
    aspectRatio: 1,
    padding: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCell: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayNumText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    bottom: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
