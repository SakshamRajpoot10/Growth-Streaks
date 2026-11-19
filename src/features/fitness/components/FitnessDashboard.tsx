import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useTheme } from '../../../utils/theme';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { FitnessGoalType, FitnessDailyLog } from '../../../db/queries/fitness';
import { MiniTrendBarChart, MiniDayData } from './MiniTrendBarChart';

export type MetricType = 'heart_points' | 'steps' | 'distance' | 'calories';

interface FitnessDashboardProps {
  last7DaysLogs: FitnessDailyLog[];
  onSelectMetric: (metric: MetricType) => void;
  onRefresh: () => void;
}

export const FitnessDashboard: React.FC<FitnessDashboardProps> = ({
  last7DaysLogs,
  onSelectMetric,
  onRefresh,
}) => {
  const { colors, isDark } = useTheme();
  const { log, userGoals, fitnessStreak, updateSpecificGoal } = useFitnessStore();

  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [editingGoals, setEditingGoals] = useState({
    steps: userGoals?.steps ?? null,
    distance_km: userGoals?.distance_km ?? null,
    heart_points: userGoals?.heart_points ?? null,
    calories: userGoals?.calories ?? null,
  });

  const todayDateObj = new Date();
  const dateFormatted = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // 1. Metric values today
  const currentSteps = log.steps;
  const currentDistance = log.distanceKm;
  const currentCalories = Math.round(log.calories);

  // Heart Points calculation (Part 6.4):
  // 1 point per minute of moderate-to-vigorous activity (100+ steps/min cadence).
  // If no cadence/active minutes were recorded, points are 0 or unmeasured (no fake fabrication from total steps).
  const heartPoints = log.activeMinutes > 0 ? log.activeMinutes : 0;
  const hasCadenceData = log.activeMinutes > 0 || log.steps === 0;

  // 2. Active Targets (Strict rule: only configured positive goals are displayed)
  interface ActiveTargetItem {
    key: MetricType;
    title: string;
    actual: number;
    target: number;
    unit: string;
    isCompleted: boolean;
    progress: number;
    remaining: number;
    color: string;
  }

  const activeTargets: ActiveTargetItem[] = [];

  if (userGoals?.steps != null && userGoals.steps > 0) {
    const actual = currentSteps;
    const target = userGoals.steps;
    activeTargets.push({
      key: 'steps',
      title: 'Steps',
      actual,
      target,
      unit: 'steps',
      isCompleted: actual >= target,
      progress: Math.min(1.0, actual / target),
      remaining: Math.max(0, target - actual),
      color: '#3B82F6',
    });
  }

  if (userGoals?.distance_km != null && userGoals.distance_km > 0) {
    const actual = currentDistance;
    const target = userGoals.distance_km;
    activeTargets.push({
      key: 'distance',
      title: 'Distance',
      actual,
      target,
      unit: 'km',
      isCompleted: actual >= target,
      progress: Math.min(1.0, actual / target),
      remaining: Math.max(0, parseFloat((target - actual).toFixed(2))),
      color: '#06B6D4',
    });
  }

  if (userGoals?.heart_points != null && userGoals.heart_points > 0) {
    const actual = heartPoints;
    const target = userGoals.heart_points;
    activeTargets.push({
      key: 'heart_points',
      title: 'Heart Points',
      actual,
      target,
      unit: 'pts',
      isCompleted: actual >= target,
      progress: Math.min(1.0, actual / target),
      remaining: Math.max(0, target - actual),
      color: '#10B981',
    });
  }

  if (userGoals?.calories != null && userGoals.calories > 0) {
    const actual = currentCalories;
    const target = userGoals.calories;
    activeTargets.push({
      key: 'calories',
      title: 'Energy Expended',
      actual,
      target,
      unit: 'Cal',
      isCompleted: actual >= target,
      progress: Math.min(1.0, actual / target),
      remaining: Math.max(0, target - actual),
      color: '#60A5FA',
    });
  }

  // 3. Mini bar chart data formatter for the last 7 days ending today
  const formatMiniData = (
    valueExtractor: (l: FitnessDailyLog) => number,
    goalVal?: number | null
  ): MiniDayData[] => {
    if (!last7DaysLogs || last7DaysLogs.length === 0) {
      return Array.from({ length: 7 }, (_, i) => ({
        dayLabel: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i],
        value: 0,
        isToday: i === 6,
        isGoalMet: false,
      }));
    }

    return last7DaysLogs.slice(-7).map((l, index, arr) => {
      const d = new Date(l.date + 'T12:00:00');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const initial = dayName.charAt(0);
      const isToday = index === arr.length - 1;
      const val = valueExtractor(l);
      const isMet = goalVal && goalVal > 0 ? val >= goalVal : false;

      return {
        dayLabel: initial,
        value: val,
        isToday,
        isGoalMet: isMet,
      };
    });
  };

  const stepsMiniData = formatMiniData((l) => l.steps, userGoals?.steps);
  const heartPointsMiniData = formatMiniData(
    (l) => (l.activeMinutes > 0 ? l.activeMinutes : 0),
    userGoals?.heart_points
  );
  const distanceMiniData = formatMiniData((l) => l.distanceKm, userGoals?.distance_km);
  const caloriesMiniData = formatMiniData((l) => Math.round(l.calories), userGoals?.calories);

  const handleOpenGoalModal = () => {
    setEditingGoals({
      steps: userGoals?.steps ?? null,
      distance_km: userGoals?.distance_km ?? null,
      heart_points: userGoals?.heart_points ?? null,
      calories: userGoals?.calories ?? null,
    });
    setIsGoalModalVisible(true);
  };

  const handleSaveAllGoals = () => {
    updateSpecificGoal('steps', editingGoals.steps);
    updateSpecificGoal('distance_km', editingGoals.distance_km);
    updateSpecificGoal('heart_points', editingGoals.heart_points);
    updateSpecificGoal('calories', editingGoals.calories);
    setIsGoalModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Header: Fitness & Activity with Date (Single instance, Part 4.1) */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Fitness & Activity</Text>
          <Text style={[styles.headerDate, { color: colors.textSecondary }]}>{dateFormatted}</Text>
        </View>

        <TouchableOpacity
          onPress={handleOpenGoalModal}
          style={[styles.btnSettings, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
        >
          <Text style={styles.btnSettingsText}>⚙️ Targets</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Daily Targets Section (Part 4.2) */}
      {activeTargets.length === 0 ? (
        // Prompt when NO targets are configured
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenGoalModal}
          style={[
            styles.emptyTargetCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={styles.emptyTargetEmoji}>🎯</Text>
          <View style={styles.emptyTargetBody}>
            <Text style={[styles.emptyTargetTitle, { color: colors.text }]}>
              No Daily Targets Configured
            </Text>
            <Text style={[styles.emptyTargetSub, { color: colors.textSecondary }]}>
              Tap to set personal targets for Steps, Heart Points, Distance, or Calories.
            </Text>
          </View>
          <View style={[styles.emptyTargetPill, { backgroundColor: colors.primary }]}>
            <Text style={styles.emptyTargetPillText}>+ Set Targets</Text>
          </View>
        </TouchableOpacity>
      ) : (
        // Configured Target Cards Stack
        <View style={styles.targetSection}>
          <View style={styles.targetSectionHeader}>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              DAILY TARGETS ({activeTargets.length})
            </Text>
            <TouchableOpacity onPress={handleOpenGoalModal}>
              <Text style={[styles.linkEdit, { color: colors.primary }]}>Configure</Text>
            </TouchableOpacity>
          </View>

          {activeTargets.map((item) => (
            <View
              key={item.key}
              style={[
                styles.targetCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.targetCardHeader}>
                <Text style={[styles.targetMetricName, { color: colors.textSecondary }]}>
                  {item.title.toUpperCase()}
                </Text>
                {item.isCompleted ? (
                  <View style={styles.badgeAchieved}>
                    <Text style={styles.badgeAchievedText}>🎯 Goal Achieved!</Text>
                  </View>
                ) : (
                  <Text style={[styles.remainingText, { color: item.color }]}>
                    {item.remaining.toLocaleString()} {item.unit} remaining
                  </Text>
                )}
              </View>

              <View style={styles.targetProgressRow}>
                <View style={styles.targetNumbers}>
                  <Text style={[styles.currentStepsBig, { color: colors.text }]}>
                    {item.actual.toLocaleString()}
                  </Text>
                  <Text style={[styles.targetStepsSub, { color: colors.textSecondary }]}>
                    / {item.target.toLocaleString()} {item.unit}
                  </Text>
                </View>

                {item.key === 'steps' && (
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakEmoji}>🔥</Text>
                    <Text style={styles.streakCount}>{fitnessStreak}d</Text>
                  </View>
                )}
              </View>

              {/* Progress Bar */}
              <View
                style={[
                  styles.progressBarTrack,
                  { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.round(item.progress * 100)}%`,
                      backgroundColor: item.isCompleted ? '#10B981' : item.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 3. Section Title: TRENDS (Part 5) */}
      <View style={styles.trendsHeader}>
        <Text style={[styles.trendsTitle, { color: colors.textSecondary }]}>TRENDS</Text>
      </View>

      {/* 4. Four Vertically Stacked Trend Cards (Reference Image 1) */}
      <View style={styles.cardsStack}>
        {/* CARD 1: Heart Points */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectMetric('heart_points')}
          style={[
            styles.trendCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardLeftCol}>
            <Text style={[styles.metricName, { color: colors.text }]}>Heart Points</Text>
            <Text style={[styles.metricSubtitle, { color: colors.textSecondary }]}>
              Last 7 days
            </Text>

            <View style={styles.metricValueBlock}>
              <Text style={[styles.metricValueBig, { color: '#10B981' }]}>
                {heartPoints}{' '}
                <Text style={styles.metricUnit}>pts</Text>
              </Text>
              <Text style={[styles.metricTodayLabel, { color: colors.textSecondary }]}>
                Today
              </Text>
              {!hasCadenceData && (
                <Text style={styles.cadenceNote}>Cadence required</Text>
              )}
            </View>
          </View>

          <View style={styles.cardRightCol}>
            <MiniTrendBarChart
              data={heartPointsMiniData}
              barColor="#10B981"
              goalValue={userGoals?.heart_points}
            />
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* CARD 2: Steps */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectMetric('steps')}
          style={[
            styles.trendCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardLeftCol}>
            <Text style={[styles.metricName, { color: colors.text }]}>Steps</Text>
            <Text style={[styles.metricSubtitle, { color: colors.textSecondary }]}>
              Last 7 days
            </Text>

            <View style={styles.metricValueBlock}>
              <Text style={[styles.metricValueBig, { color: '#3B82F6' }]}>
                {currentSteps.toLocaleString()}
              </Text>
              <Text style={[styles.metricTodayLabel, { color: colors.textSecondary }]}>
                Today
              </Text>
            </View>
          </View>

          <View style={styles.cardRightCol}>
            <MiniTrendBarChart
              data={stepsMiniData}
              barColor="#3B82F6"
              goalValue={userGoals?.steps}
            />
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* CARD 3: Distance */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectMetric('distance')}
          style={[
            styles.trendCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardLeftCol}>
            <Text style={[styles.metricName, { color: colors.text }]}>Distance</Text>
            <Text style={[styles.metricSubtitle, { color: colors.textSecondary }]}>
              Last 7 days
            </Text>

            <View style={styles.metricValueBlock}>
              <Text style={[styles.metricValueBig, { color: '#06B6D4' }]}>
                {currentDistance.toFixed(2)}{' '}
                <Text style={styles.metricUnit}>km</Text>
              </Text>
              <Text style={[styles.metricTodayLabel, { color: colors.textSecondary }]}>
                Today
              </Text>
            </View>
          </View>

          <View style={styles.cardRightCol}>
            <MiniTrendBarChart
              data={distanceMiniData}
              barColor="#06B6D4"
              goalValue={userGoals?.distance_km}
            />
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* CARD 4: Energy Expended (Calories) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectMetric('calories')}
          style={[
            styles.trendCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardLeftCol}>
            <Text style={[styles.metricName, { color: colors.text }]}>Energy expended</Text>
            <Text style={[styles.metricSubtitle, { color: colors.textSecondary }]}>
              Last 7 days
            </Text>

            <View style={styles.metricValueBlock}>
              <Text style={[styles.metricValueBig, { color: '#60A5FA' }]}>
                {currentCalories}{' '}
                <Text style={styles.metricUnit}>Cal</Text>
              </Text>
              <Text style={[styles.metricTodayLabel, { color: colors.textSecondary }]}>
                Today
              </Text>
            </View>
          </View>

          <View style={styles.cardRightCol}>
            <MiniTrendBarChart
              data={caloriesMiniData}
              barColor="#60A5FA"
              goalValue={userGoals?.calories}
            />
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />

      {/* Target Settings Modal (Configure Each Metric Independently) */}
      <Modal
        visible={isGoalModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Configure Daily Targets</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Set targets for metrics you wish to track. Any metric set to "Off" will be hidden from daily targets.
            </Text>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {/* STEPS TARGET */}
              <View style={styles.metricGoalSection}>
                <View style={styles.metricGoalLabelRow}>
                  <Text style={[styles.metricGoalName, { color: '#3B82F6' }]}>👟 Steps</Text>
                  <Text style={[styles.currentGoalDisplay, { color: colors.text }]}>
                    {editingGoals.steps ? `${editingGoals.steps.toLocaleString()} steps` : 'Off'}
                  </Text>
                </View>
                <View style={styles.presetsGrid}>
                  {[null, 5000, 8000, 10000, 12000].map((val) => (
                    <TouchableOpacity
                      key={`step-${val}`}
                      onPress={() => setEditingGoals((prev) => ({ ...prev, steps: val }))}
                      style={[
                        styles.presetPill,
                        {
                          backgroundColor:
                            editingGoals.steps === val ? '#3B82F6' : isDark ? '#1E293B' : '#F1F5F9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetPillText,
                          { color: editingGoals.steps === val ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {val === null ? 'Off' : val.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* DISTANCE TARGET */}
              <View style={styles.metricGoalSection}>
                <View style={styles.metricGoalLabelRow}>
                  <Text style={[styles.metricGoalName, { color: '#06B6D4' }]}>📍 Distance</Text>
                  <Text style={[styles.currentGoalDisplay, { color: colors.text }]}>
                    {editingGoals.distance_km ? `${editingGoals.distance_km} km` : 'Off'}
                  </Text>
                </View>
                <View style={styles.presetsGrid}>
                  {[null, 3.0, 5.0, 8.0, 10.0].map((val) => (
                    <TouchableOpacity
                      key={`dist-${val}`}
                      onPress={() => setEditingGoals((prev) => ({ ...prev, distance_km: val }))}
                      style={[
                        styles.presetPill,
                        {
                          backgroundColor:
                            editingGoals.distance_km === val ? '#06B6D4' : isDark ? '#1E293B' : '#F1F5F9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetPillText,
                          { color: editingGoals.distance_km === val ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {val === null ? 'Off' : `${val} km`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* HEART POINTS TARGET */}
              <View style={styles.metricGoalSection}>
                <View style={styles.metricGoalLabelRow}>
                  <Text style={[styles.metricGoalName, { color: '#10B981' }]}>💚 Heart Points</Text>
                  <Text style={[styles.currentGoalDisplay, { color: colors.text }]}>
                    {editingGoals.heart_points ? `${editingGoals.heart_points} pts` : 'Off'}
                  </Text>
                </View>
                <View style={styles.presetsGrid}>
                  {[null, 20, 30, 45, 60].map((val) => (
                    <TouchableOpacity
                      key={`hp-${val}`}
                      onPress={() => setEditingGoals((prev) => ({ ...prev, heart_points: val }))}
                      style={[
                        styles.presetPill,
                        {
                          backgroundColor:
                            editingGoals.heart_points === val ? '#10B981' : isDark ? '#1E293B' : '#F1F5F9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetPillText,
                          { color: editingGoals.heart_points === val ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {val === null ? 'Off' : `${val} pts`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* CALORIES TARGET */}
              <View style={styles.metricGoalSection}>
                <View style={styles.metricGoalLabelRow}>
                  <Text style={[styles.metricGoalName, { color: '#60A5FA' }]}>🔥 Calories</Text>
                  <Text style={[styles.currentGoalDisplay, { color: colors.text }]}>
                    {editingGoals.calories ? `${editingGoals.calories} Cal` : 'Off'}
                  </Text>
                </View>
                <View style={styles.presetsGrid}>
                  {[null, 250, 400, 600, 800].map((val) => (
                    <TouchableOpacity
                      key={`cal-${val}`}
                      onPress={() => setEditingGoals((prev) => ({ ...prev, calories: val }))}
                      style={[
                        styles.presetPill,
                        {
                          backgroundColor:
                            editingGoals.calories === val ? '#60A5FA' : isDark ? '#1E293B' : '#F1F5F9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetPillText,
                          { color: editingGoals.calories === val ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {val === null ? 'Off' : `${val} Cal`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setIsGoalModalVisible(false)}
                style={[styles.btnModalCancel, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveAllGoals}
                style={[styles.btnModalSave, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Save Targets</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 13,
    marginTop: 2,
  },
  btnSettings: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  btnSettingsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyTargetCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  emptyTargetEmoji: {
    fontSize: 32,
  },
  emptyTargetBody: {
    flex: 1,
  },
  emptyTargetTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyTargetSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  emptyTargetPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  emptyTargetPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  targetSection: {
    marginBottom: 20,
    gap: 12,
  },
  targetSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  linkEdit: {
    fontSize: 12,
    fontWeight: '700',
  },
  targetCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  targetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  targetMetricName: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeAchieved: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  badgeAchievedText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  targetProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  targetNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  currentStepsBig: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  targetStepsSub: {
    fontSize: 13,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 12,
  },
  streakCount: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  trendsHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  trendsTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardsStack: {
    gap: 12,
  },
  trendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  cardLeftCol: {
    flex: 1,
    justifyContent: 'center',
  },
  metricName: {
    fontSize: 15,
    fontWeight: '800',
  },
  metricSubtitle: {
    fontSize: 11,
    marginTop: 1,
    marginBottom: 8,
  },
  metricValueBlock: {
    flexDirection: 'column',
  },
  metricValueBig: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricTodayLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  cadenceNote: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevron: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: '700',
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 17,
  },
  metricGoalSection: {
    marginBottom: 16,
  },
  metricGoalLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricGoalName: {
    fontSize: 14,
    fontWeight: '700',
  },
  currentGoalDisplay: {
    fontSize: 13,
    fontWeight: '700',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetPill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  presetPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  btnModalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnModalSave: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
});
