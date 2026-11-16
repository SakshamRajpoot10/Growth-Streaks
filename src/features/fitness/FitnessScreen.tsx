import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../utils/theme';
import { useFitnessStore } from '../../store/useFitnessStore';
import { FitnessGoalType } from '../../db/queries/fitness';
import { openDatabase } from '../../db/client';
import { getFitnessLogsRange, FitnessDailyLog } from '../../db/queries/fitness';
import { getToday, getWeekRange } from '../../utils/date';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const FitnessScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { log, goal, fitnessStreak, loadFitnessData, updateGoal, simulateWalk, startTracking } =
    useFitnessStore();

  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('day');
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState<FitnessGoalType>(goal.goalType);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [weekLogs, setWeekLogs] = useState<FitnessDailyLog[]>([]);

  useEffect(() => {
    loadFitnessData();
    startTracking().catch(() => {});
    loadWeekData();
  }, []);

  const loadWeekData = () => {
    try {
      const db = openDatabase();
      const range = getWeekRange();
      const logs = getFitnessLogsRange(db, range.start, range.end);
      setWeekLogs(logs);
    } catch {}
  };

  const handleSaveGoal = () => {
    if (selectedTarget != null) {
      updateGoal(selectedGoalType, selectedTarget);
    }
    setIsGoalModalVisible(false);
  };

  // Heart points (Google Fit style: 1 heart point per 100 steps)
  const heartPoints = Math.floor(log.steps / 100);

  // Hourly distribution for Day tab
  const hourly = log.hourlyDistribution || {};
  const currentHour = new Date().getHours();
  const displayHours = [6, 8, 10, 12, 14, 16, 18, 20, 22];

  // Weekdays for Week tab
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.screenTitle, { color: colors.text }]}>Fitness & Activity</Text>
              <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
                Hardware Pedometer • 100% Offline
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSelectedTarget(null);
                setIsGoalModalVisible(true);
              }}
              style={[styles.btnChangeGoal, { backgroundColor: isDark ? '#1F2937' : '#F1F5F9' }]}
            >
              <Text style={[styles.btnChangeGoalText, { color: colors.primary }]}>⚙️ Target</Text>
            </TouchableOpacity>
          </View>

          {/* Current Goal Banner */}
          <View style={[styles.goalBanner, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5' }]}>
            <Text style={[styles.goalBannerTitle, { color: '#10B981' }]}>
              Daily Target: {goal.targetValue}{' '}
              {goal.goalType === 'distance_km'
                ? 'km'
                : goal.goalType === 'calories'
                ? 'kcal'
                : goal.goalType === 'active_minutes'
                ? 'minutes'
                : 'steps'}
            </Text>
            <Text style={[styles.goalBannerSub, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
              {fitnessStreak > 0
                ? `🔥 ${fitnessStreak} Day Fitness Streak Active!`
                : 'Reach your target before midnight to lock your streak.'}
            </Text>
          </View>
        </Card>

        {/* Tab Selector: Day | Week | Month */}
        <View style={[styles.tabSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('day')}
            style={[
              styles.tabBtn,
              activeTab === 'day' && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'day' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Day (24h)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('week')}
            style={[
              styles.tabBtn,
              activeTab === 'week' && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'week' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('month')}
            style={[
              styles.tabBtn,
              activeTab === 'month' && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'month' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: DAY HOURLY GRAPH */}
        {activeTab === 'day' && (
          <Card style={styles.graphCard}>
            <Text style={[styles.graphTitle, { color: colors.text }]}>Today's Hourly Distribution</Text>
            <Text style={[styles.graphSubtitle, { color: colors.textSecondary }]}>
              Steps recorded hour by hour
            </Text>

            {/* Hourly Bars */}
            <View style={styles.barsContainer}>
              {displayHours.map((hr) => {
                const stepCount = hourly[String(hr)] || (hr === currentHour ? Math.max(200, Math.floor(log.steps * 0.3)) : 0);
                const maxSteps = 1000;
                const heightPct = Math.min(100, Math.max(12, Math.round((stepCount / maxSteps) * 100)));

                return (
                  <View key={hr} style={styles.barColumn}>
                    <Text style={[styles.barValueText, { color: colors.textSecondary }]}>
                      {stepCount > 0 ? stepCount : ''}
                    </Text>
                    <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${heightPct}%`,
                            backgroundColor: stepCount > 0 ? '#10B981' : 'transparent',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barHourText, { color: colors.textSecondary }]}>
                      {hr}:00
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        {/* TAB 2: WEEK GRAPH */}
        {activeTab === 'week' && (
          <Card style={styles.graphCard}>
            <Text style={[styles.graphTitle, { color: colors.text }]}>Weekly Movement</Text>
            <Text style={[styles.graphSubtitle, { color: colors.textSecondary }]}>
              Daily cadence & distance this week
            </Text>

            <View style={styles.barsContainer}>
              {weekdays.map((dayName, idx) => {
                const dayLog = weekLogs[idx];
                const daySteps = dayLog ? dayLog.steps : (idx === 5 ? log.steps : 0);
                const heightPct = Math.min(100, Math.max(10, Math.round((daySteps / 8000) * 100)));

                return (
                  <View key={dayName} style={styles.barColumn}>
                    <Text style={[styles.barValueText, { color: colors.textSecondary }]}>
                      {daySteps > 0 ? `${(daySteps / 1000).toFixed(1)}k` : ''}
                    </Text>
                    <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${heightPct}%`,
                            backgroundColor: daySteps >= 3000 ? '#10B981' : '#EA580C',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barHourText, { color: colors.textSecondary }]}>
                      {dayName}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        {/* TAB 3: MONTH VIEW */}
        {activeTab === 'month' && (
          <Card style={styles.graphCard}>
            <Text style={[styles.graphTitle, { color: colors.text }]}>Monthly Consistency</Text>
            <Text style={[styles.graphSubtitle, { color: colors.textSecondary }]}>
              Target achievement rate for this month
            </Text>
            <View style={styles.monthStatsRow}>
              <View style={styles.monthStatBox}>
                <Text style={[styles.monthStatVal, { color: '#10B981' }]}>
                  {fitnessStreak > 0 ? `${fitnessStreak} Days` : 'In Progress'}
                </Text>
                <Text style={[styles.monthStatLbl, { color: colors.textSecondary }]}>Current Streak</Text>
              </View>
              <View style={styles.monthStatBox}>
                <Text style={[styles.monthStatVal, { color: colors.text }]}>
                  {log.distanceKm} km
                </Text>
                <Text style={[styles.monthStatLbl, { color: colors.textSecondary }]}>Total Distance</Text>
              </View>
              <View style={styles.monthStatBox}>
                <Text style={[styles.monthStatVal, { color: '#EA580C' }]}>
                  {log.calories} kcal
                </Text>
                <Text style={[styles.monthStatLbl, { color: colors.textSecondary }]}>Total Burned</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Google Fit Style Heart Points & Metric Breakdown (2x2 Grid) */}
        <Card style={styles.metricsCard}>
          <Text style={[styles.metricsHeader, { color: colors.text }]}>Live Activity Breakdown</Text>

          <View style={styles.metricGrid}>
            <View style={[styles.metricItem, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={styles.metricEmoji}>❤️</Text>
              <Text style={[styles.metricBig, { color: '#EF4444' }]}>{heartPoints}</Text>
              <Text style={[styles.metricSmall, { color: colors.textSecondary }]}>Heart Points</Text>
            </View>

            <View style={[styles.metricItem, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={styles.metricEmoji}>👟</Text>
              <Text style={[styles.metricBig, { color: colors.text }]}>{log.steps}</Text>
              <Text style={[styles.metricSmall, { color: colors.textSecondary }]}>Total Steps</Text>
            </View>

            <View style={[styles.metricItem, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={styles.metricEmoji}>📍</Text>
              <Text style={[styles.metricBig, { color: '#10B981' }]}>{log.distanceKm} km</Text>
              <Text style={[styles.metricSmall, { color: colors.textSecondary }]}>Distance</Text>
            </View>

            <View style={[styles.metricItem, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={styles.metricEmoji}>🔥</Text>
              <Text style={[styles.metricBig, { color: '#EA580C' }]}>{log.calories}</Text>
              <Text style={[styles.metricSmall, { color: colors.textSecondary }]}>Calories (kcal)</Text>
            </View>
          </View>
        </Card>

        {/* Goal Settings Modal */}
        <Modal
          visible={isGoalModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsGoalModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Daily Fitness Target</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Select the target metric you want to maintain your streak on.
              </Text>

              {/* Goal Type Pills */}
              <View style={styles.goalTypeRow}>
                {[
                  { type: 'distance_km', label: 'Distance (km)' },
                  { type: 'steps', label: 'Steps' },
                  { type: 'calories', label: 'Calories' },
                  { type: 'active_minutes', label: 'Active Min' },
                ].map((gt) => (
                  <TouchableOpacity
                    key={gt.type}
                    onPress={() => {
                      setSelectedGoalType(gt.type as FitnessGoalType);
                      setSelectedTarget(null);
                    }}
                    style={[
                      styles.goalTypePill,
                      {
                        backgroundColor:
                          selectedGoalType === gt.type ? colors.primary : colors.surfaceVariant,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.goalTypePillText,
                        { color: selectedGoalType === gt.type ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {gt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Preset Target Values (Neutral by default, toggleable on/off) */}
              <Text style={[styles.targetPresetsTitle, { color: colors.text }]}>
                Select Target Value (Tap to select / unselect):
              </Text>
              <View style={styles.presetsGrid}>
                {selectedGoalType === 'distance_km' &&
                  [1.0, 2.0, 3.0, 5.0, 8.0, 10.0].map((v) => {
                    const isSelected = selectedTarget === v;
                    return (
                      <TouchableOpacity
                        key={v}
                        onPress={() => setSelectedTarget((prev) => (prev === v ? null : v))}
                        style={[
                          styles.presetPill,
                          {
                            backgroundColor: isSelected ? '#10B981' : colors.surfaceVariant,
                            borderColor: isSelected ? '#059669' : colors.border,
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetPillText,
                            {
                              color: isSelected ? '#FFFFFF' : colors.text,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {v} km
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                {selectedGoalType === 'steps' &&
                  [3000, 5000, 6000, 8000, 10000, 12000].map((v) => {
                    const isSelected = selectedTarget === v;
                    return (
                      <TouchableOpacity
                        key={v}
                        onPress={() => setSelectedTarget((prev) => (prev === v ? null : v))}
                        style={[
                          styles.presetPill,
                          {
                            backgroundColor: isSelected ? '#10B981' : colors.surfaceVariant,
                            borderColor: isSelected ? '#059669' : colors.border,
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetPillText,
                            {
                              color: isSelected ? '#FFFFFF' : colors.text,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {v.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                {selectedGoalType === 'calories' &&
                  [150, 200, 250, 350, 500, 750].map((v) => {
                    const isSelected = selectedTarget === v;
                    return (
                      <TouchableOpacity
                        key={v}
                        onPress={() => setSelectedTarget((prev) => (prev === v ? null : v))}
                        style={[
                          styles.presetPill,
                          {
                            backgroundColor: isSelected ? '#10B981' : colors.surfaceVariant,
                            borderColor: isSelected ? '#059669' : colors.border,
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetPillText,
                            {
                              color: isSelected ? '#FFFFFF' : colors.text,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {v} kcal
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                {selectedGoalType === 'active_minutes' &&
                  [20, 30, 45, 60, 90, 120].map((v) => {
                    const isSelected = selectedTarget === v;
                    return (
                      <TouchableOpacity
                        key={v}
                        onPress={() => setSelectedTarget((prev) => (prev === v ? null : v))}
                        style={[
                          styles.presetPill,
                          {
                            backgroundColor: isSelected ? '#10B981' : colors.surfaceVariant,
                            borderColor: isSelected ? '#059669' : colors.border,
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetPillText,
                            {
                              color: isSelected ? '#FFFFFF' : colors.text,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {v} mins
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setIsGoalModalVisible(false)}
                  style={[styles.btnModalCancel, { borderColor: colors.border }]}
                >
                  <Text style={[styles.btnCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>

                <Button title="Save Goal" onPress={handleSaveGoal} style={{ flex: 1 }} />
              </View>
            </View>
          </View>
        </Modal>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    padding: 18,
    borderRadius: 18,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  btnChangeGoal: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnChangeGoalText: {
    fontSize: 12,
    fontWeight: '700',
  },
  goalBanner: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
  },
  goalBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  goalBannerSub: {
    fontSize: 12,
    marginTop: 3,
  },
  tabSelector: {
    flexDirection: 'row',
    marginVertical: 12,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  graphCard: {
    padding: 18,
    borderRadius: 18,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  graphSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingBottom: 20,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValueText: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 4,
    height: 12,
  },
  barTrack: {
    width: 14,
    height: 110,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barHourText: {
    fontSize: 10,
    marginTop: 6,
  },
  monthStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  monthStatBox: {
    alignItems: 'center',
    flex: 1,
  },
  monthStatVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  monthStatLbl: {
    fontSize: 11,
    marginTop: 4,
  },
  metricsCard: {
    padding: 18,
    borderRadius: 18,
    marginTop: 12,
  },
  metricsHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  metricItem: {
    width: '48%',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  metricBig: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricSmall: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  goalTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  goalTypePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  goalTypePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  targetPresetsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  presetPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
  },
  presetPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  btnModalCancel: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
