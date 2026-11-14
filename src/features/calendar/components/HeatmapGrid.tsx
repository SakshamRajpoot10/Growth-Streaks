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

    // If there is any completed log
    if (dayLogs.some((l) => l.status === 'yes')) {
      return 'completed';
    }

    // If there are explicit missed/skipped logs
    if (dayLogs.length > 0 && dayLogs.every((l) => l.status === 'no' || l.status === 'missed')) {
      return 'failed';
    }

    // Check if tasks were scheduled for this day of the week
    const jsDay = new Date(year, month - 1, d).getDay();
    const isoDay = jsDay === 0 ? 7 : jsDay;
    const hasScheduledTask = activeTasks.some((t) => t.daysOfWeek.includes(isoDay));

    if (!hasScheduledTask) {
      return 'none'; // Blank / normal default
    }

    // If scheduled:
    if (dStr < todayStr) {
      return 'failed'; // In the past with no completed log -> Red
    }
    if (dStr === todayStr) {
      return 'pending'; // Today pending
    }
    return 'none'; // Future scheduled day
  };

  const weekHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Weekday column headers */}
      <View style={styles.weekHeaderRow}>
        {weekHeaders.map((hdr, i) => (
          <Text
            key={i}
            style={[
              styles.weekHeaderText,
              { color: colors.textSecondary },
              (i === 5 || i === 6) && { color: isDark ? '#64748B' : '#94A3B8' },
            ]}
          >
            {hdr}
          </Text>
        ))}
      </View>

      {/* Grid of days with leading spacers */}
      <View style={styles.grid}>
        {/* Empty spacer slots before 1st of month */}
        {Array.from({ length: leadingOffset }).map((_, i) => (
          <View key={`spacer-${i}`} style={styles.dayCellSpacer} />
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
            <TouchableOpacity
              key={dStr}
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
                  borderWidth: 2.5,
                  transform: [{ scale: 1.06 }],
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
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  weekHeaderText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCellSpacer: {
    width: '14.28%',
    height: 46,
  },
  dayCell: {
    width: '13.28%',
    height: 44,
    margin: '0.5%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayNumText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
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
