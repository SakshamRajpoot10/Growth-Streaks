import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../../utils/theme';
import {
  FitnessDailyLog,
  UserFitnessGoals,
  getTodayFitnessLog,
  get5DaysEndingAt,
  getCalendarWeekLogs,
  getCalendarMonthLogs,
} from '../../../db/queries/fitness';
import { openDatabase } from '../../../db/client';
import { getToday } from '../../../utils/date';
import { calculateNiceScale } from '../utils/chart-scaling';
import { MetricType } from './FitnessDashboard';

interface FitnessMetricDetailScreenProps {
  metric: MetricType;
  onBack: () => void;
  userGoals: UserFitnessGoals;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = Math.min(SCREEN_WIDTH - 48, 380);
const CHART_HEIGHT = 160;

export const FitnessMetricDetailScreen: React.FC<FitnessMetricDetailScreenProps> = ({
  metric,
  onBack,
  userGoals,
}) => {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('week');

  // Navigation states
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [weekOffset, setWeekOffset] = useState<number>(0); // 0 = current week, -1 = last week, etc.
  const [monthOffset, setMonthOffset] = useState<number>(0); // 0 = current month, -1 = last month, etc.
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(new Date().getDay()); // 0 = Sun

  // Metric configuration
  const goalValue = useMemo(() => {
    switch (metric) {
      case 'steps':
        return userGoals?.steps ?? null;
      case 'distance':
        return userGoals?.distance_km ?? null;
      case 'heart_points':
        return userGoals?.heart_points ?? null;
      case 'calories':
        return userGoals?.calories ?? null;
      default:
        return null;
    }
  }, [metric, userGoals]);

  const config = useMemo(() => {
    switch (metric) {
      case 'steps':
        return {
          title: 'Steps',
          unit: 'steps',
          accentColor: '#3B82F6',
          hasValidGoal: goalValue != null && goalValue > 0,
          goalVal: goalValue ?? 0,
          infoText:
            "Steps are a useful measure of how much you're moving around, and can help you spot changes in your activity levels.",
          valueExtractor: (l: FitnessDailyLog) => l.steps,
          formatter: (v: number) => v.toLocaleString(),
          isEstimated: false,
        };
      case 'heart_points':
        return {
          title: 'Heart Points',
          unit: 'pts',
          accentColor: '#10B981',
          hasValidGoal: goalValue != null && goalValue > 0,
          goalVal: goalValue ?? 0,
          infoText:
            'Heart Points are earned for moderate activity like brisk walking (100+ steps/min). Cadence timestamps are required to measure sustained intensity.',
          valueExtractor: (l: FitnessDailyLog) => (l.activeMinutes > 0 ? l.activeMinutes : 0),
          formatter: (v: number) => String(v),
          isEstimated: false,
        };
      case 'distance':
        return {
          title: 'Distance',
          unit: 'km',
          accentColor: '#06B6D4',
          hasValidGoal: goalValue != null && goalValue > 0,
          goalVal: goalValue ?? 0,
          infoText:
            'Distance is calculated based on step cadence and average stride length (~0.762 m). It provides insight into outdoor walks, commutes and runs.',
          valueExtractor: (l: FitnessDailyLog) => l.distanceKm,
          formatter: (v: number) => v.toFixed(2),
          isEstimated: true,
        };
      case 'calories':
        return {
          title: 'Energy expended',
          unit: 'Cal',
          accentColor: '#60A5FA',
          hasValidGoal: goalValue != null && goalValue > 0,
          goalVal: goalValue ?? 0,
          infoText:
            'Energy expended estimates active calories burned through physical movement and discipline habits (~0.04 kcal per step).',
          valueExtractor: (l: FitnessDailyLog) => Math.round(l.calories),
          formatter: (v: number) => v.toLocaleString(),
          isEstimated: true,
        };
    }
  }, [metric, goalValue]);

  // ─── 1. DAY VIEW DATA ───
  const [dayLog, setDayLog] = useState<FitnessDailyLog | null>(null);
  const [recent5Days, setRecent5Days] = useState<
    Array<{ date: string; log: FitnessDailyLog | null }>
  >([]);

  const loadDayData = useCallback(() => {
    try {
      const db = openDatabase();
      const log = getTodayFitnessLog(db, selectedDate);
      setDayLog(log);

      // Part 7.2: Exactly 5 days ending at selectedDate
      const five = get5DaysEndingAt(db, selectedDate);
      setRecent5Days(five);
    } catch {}
  }, [selectedDate]);

  useEffect(() => {
    loadDayData();
  }, [loadDayData]);

  // Hourly delta computation
  const hourlyDeltas = useMemo(() => {
    const hourly = dayLog?.hourlyDistribution || {};
    const raw = Array.from({ length: 24 }, (_, h) => hourly[String(h)] || 0);

    let isCumulative = false;
    for (let i = 1; i < 24; i++) {
      if (raw[i] > raw[i - 1] && raw[i - 1] > 0) {
        isCumulative = true;
        break;
      }
    }

    if (isCumulative) {
      return raw.map((val, idx) => {
        if (idx === 0) return val;
        return Math.max(0, val - raw[idx - 1]);
      });
    }
    return raw;
  }, [dayLog]);

  // Dynamic Day Scaling (Part 8)
  const maxDayVal = Math.max(...hourlyDeltas, 0);
  const dayScale = useMemo(() => calculateNiceScale(maxDayVal, null), [maxDayVal]);

  // ─── 2. WEEK VIEW DATA ───
  const [weekData, setWeekData] = useState<{
    logs: FitnessDailyLog[];
    rangeLabel: string;
  }>({ logs: [], rangeLabel: '' });

  const loadWeekData = useCallback(() => {
    try {
      const db = openDatabase();
      const now = new Date();
      // Apply week offset
      const targetDate = new Date(now.getTime() + weekOffset * 7 * 86400000);
      const res = getCalendarWeekLogs(db, targetDate);
      setWeekData({ logs: res.logs, rangeLabel: res.rangeLabel });
    } catch {}
  }, [weekOffset]);

  useEffect(() => {
    loadWeekData();
  }, [loadWeekData]);

  const weekValues = useMemo(
    () => weekData.logs.map(config.valueExtractor),
    [weekData.logs, config]
  );
  const weekTotal = useMemo(
    () => weekValues.reduce((sum, v) => sum + v, 0),
    [weekValues]
  );

  // Dynamic Week Scaling (Part 8)
  const maxWeekVal = Math.max(...weekValues, 0);
  const weekScale = useMemo(
    () => calculateNiceScale(maxWeekVal, config.hasValidGoal ? config.goalVal : null),
    [maxWeekVal, config.hasValidGoal, config.goalVal]
  );

  // ─── 3. MONTH VIEW DATA ───
  const [monthData, setMonthData] = useState<{
    logs: FitnessDailyLog[];
    monthName: string;
    year: number;
  }>({ logs: [], monthName: '', year: new Date().getFullYear() });

  const loadMonthData = useCallback(() => {
    try {
      const db = openDatabase();
      const now = new Date();
      // Target month offset
      let targetMonth = now.getMonth() + 1 + monthOffset;
      let targetYear = now.getFullYear();
      while (targetMonth < 1) {
        targetMonth += 12;
        targetYear -= 1;
      }
      while (targetMonth > 12) {
        targetMonth -= 12;
        targetYear += 1;
      }

      const res = getCalendarMonthLogs(db, targetYear, targetMonth);
      setMonthData(res);
    } catch {}
  }, [monthOffset]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData]);

  const monthValues = useMemo(
    () => monthData.logs.map(config.valueExtractor),
    [monthData.logs, config]
  );
  const monthTotal = useMemo(
    () => monthValues.reduce((sum, v) => sum + v, 0),
    [monthValues]
  );

  // Dynamic Month Scaling (Part 8)
  const maxMonthVal = Math.max(...monthValues, 0);
  const monthScale = useMemo(
    () => calculateNiceScale(maxMonthVal, config.hasValidGoal ? config.goalVal : null),
    [maxMonthVal, config.hasValidGoal, config.goalVal]
  );

  // ─── DATE NAVIGATION HELPERS ───
  const isSelectedDateToday = selectedDate === getToday();

  const handlePrevDay = () => {
    const parts = selectedDate.split('-');
    const cur = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
    cur.setDate(cur.getDate() - 1);
    const prevStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    setSelectedDate(prevStr);
  };

  const handleNextDay = () => {
    if (isSelectedDateToday) return; // Future dates disabled (Part 7.1)
    const parts = selectedDate.split('-');
    const cur = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
    cur.setDate(cur.getDate() + 1);
    const nextStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    if (nextStr <= getToday()) {
      setSelectedDate(nextStr);
    }
  };

  const dayDateFormatted = useMemo(() => {
    const parts = selectedDate.split('-');
    const cur = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
    return cur.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      {/* ─── Top Header Bar ─── */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: colors.text }]}>{config.title}</Text>
          {config.isEstimated && (
            <View style={styles.badgeEst}>
              <Text style={styles.badgeEstText}>Estimated</Text>
            </View>
          )}
        </View>

        <View style={styles.topRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={[styles.topIcon, { color: colors.text }]}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={[styles.topIcon, { color: colors.text }]}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Day | Week | Month Tabs ─── */}
      <View style={styles.tabsRow}>
        {(['day', 'week', 'month'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  { color: isActive ? colors.text : colors.textSecondary },
                  isActive && styles.tabButtonTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {isActive && <View style={[styles.tabUnderline, { backgroundColor: colors.text }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* ─── Date Range & Total Summary Banner ─── */}
        <View style={styles.rangeBanner}>
          <View style={styles.dateSelectorRow}>
            {/* Left Nav Arrow */}
            <TouchableOpacity
              onPress={() => {
                if (activeTab === 'day') handlePrevDay();
                if (activeTab === 'week') setWeekOffset((p) => p - 1);
                if (activeTab === 'month') setMonthOffset((p) => p - 1);
              }}
              style={styles.arrowBtn}
            >
              <Text style={[styles.arrowText, { color: colors.textSecondary }]}>‹</Text>
            </TouchableOpacity>

            <Text style={[styles.rangeLabel, { color: colors.text }]}>
              {activeTab === 'day'
                ? dayDateFormatted
                : activeTab === 'week'
                ? weekData.rangeLabel
                : `${monthData.monthName} ${monthData.year}`}
            </Text>

            {/* Right Nav Arrow (Disabled for future dates/periods) */}
            <TouchableOpacity
              disabled={
                (activeTab === 'day' && isSelectedDateToday) ||
                (activeTab === 'week' && weekOffset >= 0) ||
                (activeTab === 'month' && monthOffset >= 0)
              }
              onPress={() => {
                if (activeTab === 'day') handleNextDay();
                if (activeTab === 'week') setWeekOffset((p) => Math.min(0, p + 1));
                if (activeTab === 'month') setMonthOffset((p) => Math.min(0, p + 1));
              }}
              style={[
                styles.arrowBtn,
                ((activeTab === 'day' && isSelectedDateToday) ||
                  (activeTab === 'week' && weekOffset >= 0) ||
                  (activeTab === 'month' && monthOffset >= 0)) && { opacity: 0.25 },
              ]}
            >
              <Text style={[styles.arrowText, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Metric Total for Period */}
          <View style={styles.totalRow}>
            <Text style={styles.metricEmoji}>
              {metric === 'steps' ? '👟' : metric === 'distance' ? '📍' : metric === 'heart_points' ? '💚' : '🔥'}
            </Text>
            <Text style={[styles.totalValueText, { color: colors.textSecondary }]}>
              {activeTab === 'day'
                ? dayLog
                  ? `${config.formatter(config.valueExtractor(dayLog))} ${config.unit}`
                  : `0 ${config.unit}`
                : activeTab === 'week'
                ? `${config.formatter(weekTotal)} ${config.unit}`
                : `${config.formatter(monthTotal)} ${config.unit}`}
            </Text>
          </View>
        </View>

        {/* ─── GRAPH CONTAINER ─── */}
        <View style={[styles.graphCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* TAB 1: DAILY GRAPH (Reference Image 4) */}
          {activeTab === 'day' && (
            <View style={styles.chartWrapper}>
              {/* Dynamic Y-Axis Labels on Right */}
              <View style={styles.yAxisRight}>
                <Text style={styles.yAxisText}>{dayScale.ticks[0].toLocaleString()}</Text>
                <Text style={styles.yAxisText}>{dayScale.ticks[1].toLocaleString()}</Text>
                <Text style={styles.yAxisText}>{dayScale.ticks[2].toLocaleString()}</Text>
              </View>

              {/* Grid Lines */}
              <View style={styles.gridLinesContainer}>
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
              </View>

              {/* 24-Hour Activity Bars */}
              <View style={styles.hourlyBarsArea}>
                {hourlyDeltas.map((val, h) => {
                  const barHeight =
                    val > 0
                      ? Math.max(4, Math.min(CHART_HEIGHT, (val / dayScale.top) * CHART_HEIGHT))
                      : 0;
                  return (
                    <View key={`hour-${h}`} style={styles.hourBarCol}>
                      {barHeight > 0 && (
                        <View
                          style={[
                            styles.hourBarFill,
                            {
                              height: barHeight,
                              backgroundColor: config.accentColor,
                            },
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>

              {/* 4-Hour Time Labels with 2-Hour Tick Dots (Reference Image 4) */}
              <View style={styles.hourlyTimeLabelsRow}>
                {[
                  { hour: '12', ampm: 'am' },
                  { hour: '4', ampm: 'am' },
                  { hour: '8', ampm: 'am' },
                  { hour: '12', ampm: 'pm' },
                  { hour: '4', ampm: 'pm' },
                  { hour: '8', ampm: 'pm' },
                  { hour: '12', ampm: 'am' },
                ].map((item, idx) => (
                  <View key={`lbl-${idx}`} style={styles.timeLabelSlot}>
                    <Text style={styles.timeLabelHour}>{item.hour}</Text>
                    <Text style={styles.timeLabelAmPm}>{item.ampm}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 2: WEEKLY GRAPH (Reference Images 2 & 3) */}
          {activeTab === 'week' && (
            <View style={styles.chartWrapper}>
              {/* Dynamic Y-Axis Labels on Right */}
              <View style={styles.yAxisRight}>
                <Text style={styles.yAxisText}>{weekScale.ticks[0].toLocaleString()}</Text>
                <Text style={styles.yAxisText}>{weekScale.ticks[1].toLocaleString()}</Text>
                <Text style={styles.yAxisText}>{weekScale.ticks[2].toLocaleString()}</Text>
              </View>

              {/* Horizontal Gridlines */}
              <View style={styles.gridLinesContainer}>
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
              </View>

              {/* Dashed Target Line (Only if Goal is configured!) */}
              {config.hasValidGoal && (
                <View
                  style={[
                    styles.goalDashedLine,
                    {
                      bottom: (config.goalVal / weekScale.top) * CHART_HEIGHT,
                    },
                  ]}
                >
                  <Text style={[styles.goalLineLabel, { color: config.accentColor }]}>
                    {config.goalVal.toLocaleString()}
                  </Text>
                </View>
              )}

              {/* 7 Daily Bars (Sun..Sat) */}
              <View style={styles.weekBarsArea}>
                {weekData.logs.map((logItem, idx) => {
                  const val = config.valueExtractor(logItem);
                  const barHeight =
                    val > 0
                      ? Math.max(6, Math.min(CHART_HEIGHT, (val / weekScale.top) * CHART_HEIGHT))
                      : 2;
                  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const isSelected = selectedDayIndex === idx;
                  const isGoalReached = config.hasValidGoal && val >= config.goalVal;

                  return (
                    <TouchableOpacity
                      key={`week-bar-${idx}`}
                      activeOpacity={0.8}
                      onPress={() => setSelectedDayIndex(idx)}
                      style={styles.weekBarCol}
                    >
                      {/* Checkmark above bar only if goal met */}
                      <View style={styles.barTopSlot}>
                        {isGoalReached ? (
                          <Text style={[styles.barCheckmark, { color: config.accentColor }]}>✓</Text>
                        ) : null}
                      </View>

                      {/* Bar Pillar */}
                      <View style={styles.weekBarTrack}>
                        <View
                          style={[
                            styles.weekBarFill,
                            {
                              height: barHeight,
                              backgroundColor:
                                val > 0 ? config.accentColor : 'rgba(148, 163, 184, 0.25)',
                              opacity: isSelected ? 1.0 : 0.85,
                            },
                          ]}
                        />
                      </View>

                      {/* Day Label */}
                      <Text
                        style={[
                          styles.weekDayLabel,
                          isSelected && styles.weekDayLabelSelected,
                        ]}
                      >
                        {dayNames[idx]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* TAB 3: MONTHLY GRAPH */}
          {activeTab === 'month' && (
            <View style={styles.chartWrapper}>
              <View style={styles.yAxisRight}>
                <Text style={styles.yAxisText}>{monthScale.ticks[0].toLocaleString()}</Text>
                <Text style={styles.yAxisText}>{monthScale.ticks[1].toLocaleString()}</Text>
                <Text style={styles.yAxisText}>{monthScale.ticks[2].toLocaleString()}</Text>
              </View>

              <View style={styles.gridLinesContainer}>
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
              </View>

              <View style={styles.monthBarsArea}>
                {monthData.logs.map((logItem, idx) => {
                  const val = config.valueExtractor(logItem);
                  const barHeight =
                    val > 0
                      ? Math.max(4, Math.min(CHART_HEIGHT, (val / monthScale.top) * CHART_HEIGHT))
                      : 2;
                  return (
                    <View key={`month-bar-${idx}`} style={styles.monthBarCol}>
                      <View
                        style={[
                          styles.monthBarFill,
                          {
                            height: barHeight,
                            backgroundColor:
                              val > 0 ? config.accentColor : 'rgba(148, 163, 184, 0.2)',
                          },
                        ]}
                      />
                    </View>
                  );
                })}
              </View>

              <View style={styles.monthXAxisRow}>
                <Text style={styles.monthXLabel}>Day 1</Text>
                <Text style={styles.monthXLabel}>Day 15</Text>
                <Text style={styles.monthXLabel}>Day {monthData.logs.length}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ─── Informational Text Banner (Reference Images 2, 3, 4) ─── */}
        <View style={styles.infoTextContainer}>
          <Text style={[styles.infoTextBody, { color: colors.textSecondary }]}>
            {config.infoText}
          </Text>
        </View>

        {/* ─── TAB 1 DETAIL: RECENT FIVE-DAY ACTIVITY LIST (Part 7.2) ─── */}
        {activeTab === 'day' && (
          <View style={styles.breakdownSection}>
            <Text style={[styles.breakdownHeaderTitle, { color: colors.textSecondary }]}>
              RECENT 5 DAYS (ENDING {selectedDate === getToday() ? 'TODAY' : selectedDate})
            </Text>

            {recent5Days.map((item, idx) => {
              const parts = item.date.split('-');
              const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
              const fullFormatted = d.toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              });

              const isDaySelected = item.date === selectedDate;
              const hasRecord = item.log !== null;
              const val = hasRecord ? config.valueExtractor(item.log!) : 0;
              const isGoalReached = config.hasValidGoal && val >= config.goalVal;

              return (
                <TouchableOpacity
                  key={`5day-${item.date}`}
                  activeOpacity={0.7}
                  onPress={() => setSelectedDate(item.date)}
                  style={[
                    styles.breakdownRow,
                    isDaySelected && {
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#EFF6FF',
                      borderRadius: 14,
                      paddingHorizontal: 12,
                    },
                  ]}
                >
                  <View style={styles.breakdownLeft}>
                    <Text style={[styles.breakdownDate, { color: colors.textSecondary }]}>
                      {fullFormatted}
                    </Text>
                    {hasRecord ? (
                      <Text style={[styles.breakdownValue, { color: colors.text }]}>
                        {config.formatter(val)} {config.unit}
                      </Text>
                    ) : (
                      <Text style={[styles.breakdownValueNoData, { color: colors.textSecondary }]}>
                        No data recorded
                      </Text>
                    )}
                  </View>

                  {/* Goal Achieved Circular Checkmark Badge */}
                  {isGoalReached && (
                    <View style={[styles.circleBadge, { backgroundColor: 'rgba(59, 130, 246, 0.18)' }]}>
                      <Text style={[styles.circleCheckmark, { color: config.accentColor }]}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ─── TAB 2 DETAIL: DAILY BREAKDOWN LIST (Reference Images 2 & 3) ─── */}
        {activeTab === 'week' && (
          <View style={styles.breakdownSection}>
            {weekData.logs.map((logItem, idx) => {
              const parts = logItem.date.split('-');
              const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
              const fullDayFormatted = d.toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              });
              const val = config.valueExtractor(logItem);
              const isGoalReached = config.hasValidGoal && val >= config.goalVal;

              return (
                <View key={`week-day-item-${idx}`} style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <Text style={[styles.breakdownDate, { color: colors.textSecondary }]}>
                      {fullDayFormatted}
                    </Text>
                    <Text style={[styles.breakdownValue, { color: colors.text }]}>
                      {config.formatter(val)} {config.unit}
                    </Text>
                  </View>

                  {/* Goal Achieved Circular Checkmark Badge */}
                  {isGoalReached && (
                    <View style={[styles.circleBadge, { backgroundColor: 'rgba(59, 130, 246, 0.18)' }]}>
                      <Text style={[styles.circleCheckmark, { color: config.accentColor }]}>✓</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 6,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: '700',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  badgeEst: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  badgeEstText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 6,
  },
  topIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    position: 'relative',
    alignItems: 'center',
  },
  tabButtonActive: {},
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    fontWeight: '800',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    height: 3,
    width: '100%',
    borderRadius: 2,
  },
  scrollArea: {
    flex: 1,
  },
  rangeBanner: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 4,
  },
  arrowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: '300',
  },
  rangeLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metricEmoji: {
    fontSize: 14,
  },
  totalValueText: {
    fontSize: 14,
    fontWeight: '700',
  },
  graphCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  chartWrapper: {
    height: CHART_HEIGHT + 36,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  yAxisRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 24,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 60,
    zIndex: 1,
  },
  yAxisText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  gridLinesContainer: {
    position: 'absolute',
    left: 0,
    right: 64,
    top: 6,
    bottom: 24,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    width: '100%',
  },
  goalDashedLine: {
    position: 'absolute',
    left: 0,
    right: 64,
    borderTopWidth: 1,
    borderTopColor: '#3B82F6',
    borderStyle: 'dashed',
    zIndex: 2,
    alignItems: 'flex-start',
  },
  goalLineLabel: {
    position: 'absolute',
    right: -58,
    top: -8,
    fontSize: 11,
    fontWeight: '700',
  },
  hourlyBarsArea: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
    right: 64,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  hourBarCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  hourBarFill: {
    width: 3.5,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  hourlyTimeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    right: 64,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  timeLabelSlot: {
    alignItems: 'center',
    width: 28,
  },
  timeLabelHour: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  timeLabelAmPm: {
    fontSize: 9,
    color: '#64748B',
  },
  weekBarsArea: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
    right: 64,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  weekBarCol: {
    alignItems: 'center',
    width: 24,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTopSlot: {
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barCheckmark: {
    fontSize: 13,
    fontWeight: '900',
  },
  weekBarTrack: {
    height: CHART_HEIGHT - 38,
    width: 14,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  weekBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  weekDayLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 6,
  },
  weekDayLabelSelected: {
    color: '#3B82F6',
    fontWeight: '800',
  },
  monthBarsArea: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
    right: 64,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  monthBarCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  monthBarFill: {
    width: 2,
    borderRadius: 1,
  },
  monthXAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    right: 64,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  monthXLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  infoTextContainer: {
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  infoTextBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  breakdownSection: {
    gap: 16,
    paddingHorizontal: 4,
  },
  breakdownHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  breakdownLeft: {
    gap: 2,
  },
  breakdownDate: {
    fontSize: 12,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  breakdownValueNoData: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  circleBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCheckmark: {
    fontSize: 16,
    fontWeight: '900',
  },
});
