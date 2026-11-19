import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TaskFormData, VerificationType } from '../../../types/task';
import { FOCUS_AREAS } from '../../../constants/focus-areas';
import { ALARM_SOUNDS } from '../../../constants/sounds';
import { DaySelector } from './DaySelector';
import { useTheme } from '../../../utils/theme';
import { playSoundPreview } from '../../../utils/sound-preview';

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => void;
  onDelete?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
  creationMode?: 'alarm' | 'routine';
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  onSubmit,
  onDelete,
  onCancel,
  isEditing = false,
  creationMode = 'alarm',
}) => {
  const { colors, isDark } = useTheme();

  const [activityName, setActivityName] = useState(initialData?.activityName || '');
  const [focusArea, setFocusArea] = useState(initialData?.focusArea || 'Health');
  const [isCustomFocus, setIsCustomFocus] = useState(
    initialData?.focusArea
      ? !FOCUS_AREAS.some((fa) => fa.name.toLowerCase() === initialData.focusArea?.toLowerCase())
      : false
  );
  const [customFocusText, setCustomFocusText] = useState(
    initialData?.focusArea &&
      !FOCUS_AREAS.some((fa) => fa.name.toLowerCase() === initialData.focusArea?.toLowerCase())
      ? initialData.focusArea
      : ''
  );

  // Parse initial 24h time into 12h + AM/PM
  const parseInitialTime = (timeStr?: string) => {
    if (!timeStr) return { hour: 7, minute: 0, period: 'AM' as 'AM' | 'PM' };
    const [h, m] = timeStr.split(':').map(Number);
    const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    let hour = h % 12;
    if (hour === 0) hour = 12;
    return { hour, minute: m || 0, period };
  };

  const initialParsed = parseInitialTime(initialData?.scheduledTime);
  const [selectedHour, setSelectedHour] = useState<number>(initialParsed.hour);
  const [selectedMinute, setSelectedMinute] = useState<number>(initialParsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(initialParsed.period);

  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    initialData?.daysOfWeek || [1, 2, 3, 4, 5, 6, 7]
  );
  const [alarmSound, setAlarmSound] = useState(initialData?.alarmSound || 'default_alarm');
  const [preAlarmMinutes] = useState(initialData?.preAlarmMinutes || 5);

  const isWakeUpSelected = focusArea.toLowerCase() === 'wake up';

  const toggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  const handleSelectSound = (soundId: string) => {
    setAlarmSound(soundId);
    playSoundPreview(soundId);
  };

  const handleSave = () => {
    if (!activityName.trim()) {
      Alert.alert('Required', 'Please enter a routine or habit name.');
      return;
    }

    let h = selectedHour % 12;
    if (selectedPeriod === 'PM') h += 12;
    const hourStr = String(h).padStart(2, '0');
    const minStr = String(selectedMinute).padStart(2, '0');
    const finalTime = `${hourStr}:${minStr}`;

    const finalFocus =
      isCustomFocus && customFocusText.trim() ? customFocusText.trim() : focusArea;

    // Single Source of Truth: Wake Up category maps directly to WAKE_UP_VERIFICATION, all others to STANDARD
    const verificationType: VerificationType =
      finalFocus.toLowerCase() === 'wake up' ? 'WAKE_UP_VERIFICATION' : 'STANDARD';

    onSubmit({
      activityName: activityName.trim(),
      focusArea: finalFocus,
      verificationType,
      scheduledTime: finalTime,
      daysOfWeek,
      alarmSound,
      preAlarmMinutes,
    });
  };

  return (
    <View style={styles.wrapper}>
      {/* Scrollable Form Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Routine Name */}
        <Text style={[styles.label, { color: colors.text }]}>Routine / Habit Name</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="e.g. Morning Workout, Deep Coding, Book Reading"
          value={activityName}
          onChangeText={setActivityName}
          placeholderTextColor={colors.textSecondary}
        />

        {/* Focus Area Category (Single Source of Truth for Wake Up vs Standard) */}
        <Text style={[styles.label, { color: colors.text }]}>Focus Area (Category)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {FOCUS_AREAS.map((fa) => {
            const isSelected =
              !isCustomFocus && focusArea.toLowerCase() === fa.name.toLowerCase();
            return (
              <TouchableOpacity
                key={fa.id}
                activeOpacity={0.7}
                onPress={() => {
                  setIsCustomFocus(false);
                  setFocusArea(fa.name);
                }}
                style={[
                  styles.focusPill,
                  {
                    backgroundColor: isSelected ? fa.color : colors.surface,
                    borderColor: isSelected ? fa.color : colors.border,
                  },
                ]}
              >
                <Text style={styles.focusEmoji}>{fa.emoji}</Text>
                <Text
                  style={[
                    styles.focusText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {fa.name}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsCustomFocus(true)}
            style={[
              styles.focusPill,
              {
                backgroundColor: isCustomFocus ? '#6366F1' : colors.surface,
                borderColor: isCustomFocus ? '#6366F1' : colors.border,
              },
            ]}
          >
            <Text style={styles.focusEmoji}>✏️</Text>
            <Text
              style={[
                styles.focusText,
                { color: isCustomFocus ? '#FFFFFF' : colors.text },
              ]}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Informative Wake Up verification banner */}
        {isWakeUpSelected && (
          <View style={styles.wakeUpHintBanner}>
            <Text style={styles.wakeUpHintText}>
              📸 Wake Up Selected: Genuine 30-second camera posture verification will activate to dismiss this alarm.
            </Text>
          </View>
        )}

        {isCustomFocus && (
          <View style={styles.customFocusBox}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: '#6366F1',
                  color: colors.text,
                },
              ]}
              placeholder="Type custom category (e.g. Language, Chess, Guitar)"
              value={customFocusText}
              onChangeText={setCustomFocusText}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        )}

        {/* 12-Hour AM/PM Time Picker */}
        <Text style={[styles.label, { color: colors.text }]}>
          Schedule Time (12-Hour AM / PM)
        </Text>
        <View
          style={[
            styles.timePickerContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.timeDisplayRow}>
            <Text style={[styles.timeBigDisplay, { color: colors.text }]}>
              {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')}{' '}
              {selectedPeriod}
            </Text>
          </View>

          <View style={styles.pickerRow}>
            {/* Hour Selectors */}
            <View style={styles.selectorCol}>
              <Text style={[styles.colHeader, { color: colors.textSecondary }]}>Hour</Text>
              <View style={styles.pillGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                  <TouchableOpacity
                    key={`h-${h}`}
                    onPress={() => setSelectedHour(h)}
                    style={[
                      styles.timePill,
                      {
                        backgroundColor:
                          selectedHour === h
                            ? colors.primary
                            : isDark
                            ? '#1E293B'
                            : '#F1F5F9',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timePillText,
                        selectedHour === h && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Minute Selectors */}
            <View style={styles.selectorCol}>
              <Text style={[styles.colHeader, { color: colors.textSecondary }]}>Minute</Text>
              <View style={styles.pillGrid}>
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <TouchableOpacity
                    key={`m-${m}`}
                    onPress={() => setSelectedMinute(m)}
                    style={[
                      styles.timePill,
                      {
                        backgroundColor:
                          selectedMinute === m
                            ? colors.primary
                            : isDark
                            ? '#1E293B'
                            : '#F1F5F9',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timePillText,
                        selectedMinute === m && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      {String(m).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* AM / PM Toggle */}
            <View style={styles.periodCol}>
              <Text style={[styles.colHeader, { color: colors.textSecondary }]}>Period</Text>
              <TouchableOpacity
                onPress={() => setSelectedPeriod('AM')}
                style={[
                  styles.periodBtn,
                  {
                    backgroundColor:
                      selectedPeriod === 'AM'
                        ? '#10B981'
                        : isDark
                        ? '#1E293B'
                        : '#F1F5F9',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    selectedPeriod === 'AM' && { color: '#FFFFFF', fontWeight: '800' },
                  ]}
                >
                  AM
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedPeriod('PM')}
                style={[
                  styles.periodBtn,
                  {
                    backgroundColor:
                      selectedPeriod === 'PM'
                        ? '#10B981'
                        : isDark
                        ? '#1E293B'
                        : '#F1F5F9',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    selectedPeriod === 'PM' && { color: '#FFFFFF', fontWeight: '800' },
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Repeat on Days of Week */}
        <Text style={[styles.label, { color: colors.text }]}>Repeat Routine</Text>
        <DaySelector selectedDays={daysOfWeek} onToggleDay={toggleDay} />

        {/* Alarm Ringtone (Preview on Tap) */}
        <Text style={[styles.label, { color: colors.text }]}>
          Alarm Ringtone (Tap to preview sound)
        </Text>
        <View style={styles.soundContainer}>
          {ALARM_SOUNDS.map((snd) => {
            const isSelected = alarmSound === snd.id;
            return (
              <TouchableOpacity
                key={snd.id}
                activeOpacity={0.7}
                onPress={() => handleSelectSound(snd.id)}
                style={[
                  styles.soundOption,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? 'rgba(16, 185, 129, 0.16)'
                        : '#ECFDF5'
                      : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={styles.soundMeta}>
                  <Text
                    style={[
                      styles.soundText,
                      { color: colors.text },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    🔔 {snd.name}
                  </Text>
                  <Text style={[styles.soundDesc, { color: colors.textSecondary }]}>
                    {snd.description}
                  </Text>
                </View>
                {isSelected ? (
                  <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                ) : (
                  <Text style={[styles.previewHint, { color: colors.textSecondary }]}>
                    ▶ Play
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3-Strike Accountability Note */}
        <View
          style={[
            styles.infoBanner,
            {
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#EFF6FF',
              borderColor: isDark ? 'rgba(56, 189, 248, 0.25)' : '#BFDBFE',
            },
          ]}
        >
          <Text style={[styles.infoText, { color: isDark ? '#38BDF8' : '#1E40AF' }]}>
            ⚡ Active Accountability: Alarms fire 5 mins before, 3 mins before, and at routine
            time with high-priority lock-screen notification & audio.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ─── FIXED / STICKY BOTTOM ACTION FOOTER (Visible without scrolling) ─── */}
      <View
        style={[
          styles.stickyFooter,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        {isEditing ? (
          // 4.3 EDITING AN EXISTING ROUTINE: Balanced Triangular Layout (Update Routine top/center, Delete bottom-left, Cancel bottom-right)
          <View style={styles.triangularContainer}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!activityName.trim()}
              style={[
                styles.btnPrimaryTop,
                { backgroundColor: colors.primary, opacity: activityName.trim() ? 1 : 0.5 },
              ]}
            >
              <Text style={styles.btnPrimaryTopText}>Update Routine</Text>
            </TouchableOpacity>

            <View style={styles.bottomRow}>
              <TouchableOpacity
                onPress={onDelete}
                style={[
                  styles.btnDeleteBottom,
                  {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                    borderColor: '#EF4444',
                  },
                ]}
              >
                <Text style={styles.btnDeleteText}>🗑️ Delete Routine</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onCancel}
                style={[
                  styles.btnCancelBottom,
                  {
                    backgroundColor: isDark ? '#334155' : '#F1F5F9',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.btnCancelText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // 4.1 & 4.2 CREATION FLOW: Exactly Primary Action + Cancel
          <View style={styles.creationContainer}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!activityName.trim()}
              style={[
                styles.btnPrimaryTop,
                { backgroundColor: colors.primary, opacity: activityName.trim() ? 1 : 0.5 },
              ]}
            >
              <Text style={styles.btnPrimaryTopText}>
                {creationMode === 'alarm' ? 'Set Alarm' : 'Add Routine'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancel}
              style={[
                styles.btnCancelFull,
                {
                  backgroundColor: isDark ? '#334155' : '#F1F5F9',
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.btnCancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  horizontalScroll: {
    marginBottom: 6,
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  focusEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  focusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  wakeUpHintBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  wakeUpHintText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  customFocusBox: {
    marginTop: 10,
  },
  timePickerContainer: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  timeDisplayRow: {
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  timeBigDisplay: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectorCol: {
    flex: 1,
    marginRight: 8,
  },
  periodCol: {
    width: 60,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    textAlign: 'center',
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  timePill: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  periodBtn: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  periodBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  soundContainer: {
    marginTop: 4,
  },
  soundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  soundMeta: {
    flex: 1,
  },
  soundText: {
    fontSize: 14,
    fontWeight: '600',
  },
  soundDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  previewHint: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  stickyFooter: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  triangularContainer: {
    gap: 8,
  },
  creationContainer: {
    gap: 8,
  },
  btnPrimaryTop: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryTopText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnDeleteBottom: {
    flex: 1.1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnDeleteText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  btnCancelBottom: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnCancelFull: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
