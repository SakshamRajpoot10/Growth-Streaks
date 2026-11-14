import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { TaskFormData } from '../../../types/task';
import { FOCUS_AREAS } from '../../../constants/focus-areas';
import { ALARM_SOUNDS } from '../../../constants/sounds';
import { DaySelector } from './DaySelector';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../utils/theme';
import { playSoundPreview } from '../../../utils/sound-preview';

interface TaskFormProps {
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
  submitLabel?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  onSubmit,
  submitLabel = 'Save Routine',
}) => {
  const { colors, isDark } = useTheme();

  const [activityName, setActivityName] = useState(initialData?.activityName || '');
  const [focusArea, setFocusArea] = useState(initialData?.focusArea || 'Health');
  const [isCustomFocus, setIsCustomFocus] = useState(
    initialData?.focusArea ? !FOCUS_AREAS.some((fa) => fa.name.toLowerCase() === initialData.focusArea.toLowerCase()) : false
  );
  const [customFocusText, setCustomFocusText] = useState(
    initialData?.focusArea && !FOCUS_AREAS.some((fa) => fa.name.toLowerCase() === initialData.focusArea.toLowerCase())
      ? initialData.focusArea
      : ''
  );

  // Parse initial 24h time (e.g. "07:30" or "19:45") into 12h + AM/PM
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
    if (!activityName.trim()) return;

    // Convert 12h + AM/PM back to 24h format "HH:MM"
    let h = selectedHour % 12;
    if (selectedPeriod === 'PM') h += 12;
    const hourStr = String(h).padStart(2, '0');
    const minStr = String(selectedMinute).padStart(2, '0');
    const finalTime = `${hourStr}:${minStr}`;

    const finalFocus = isCustomFocus && customFocusText.trim()
      ? customFocusText.trim()
      : focusArea;

    onSubmit({
      activityName: activityName.trim(),
      focusArea: finalFocus,
      scheduledTime: finalTime,
      daysOfWeek,
      alarmSound,
      preAlarmMinutes,
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Activity / Routine Name */}
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

      {/* Focus Area with Custom Option */}
      <Text style={[styles.label, { color: colors.text }]}>Focus Area</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {FOCUS_AREAS.map((fa) => {
          const isSelected = !isCustomFocus && focusArea.toLowerCase() === fa.name.toLowerCase();
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

        {/* Custom Focus Area Pill */}
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

      {/* Custom Focus Area Input Field */}
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
            placeholder="Type custom focus area (e.g. Language, Chess, Guitar)"
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
      <View style={[styles.timePickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.timeDisplayRow}>
          <Text style={[styles.timeBigDisplay, { color: colors.text }]}>
            {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')} {selectedPeriod}
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
                      backgroundColor: selectedHour === h ? colors.primary : isDark ? '#1E293B' : '#F1F5F9',
                    },
                  ]}
                >
                  <Text style={[styles.timePillText, selectedHour === h && { color: '#FFFFFF', fontWeight: '800' }]}>
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
                      backgroundColor: selectedMinute === m ? colors.primary : isDark ? '#1E293B' : '#F1F5F9',
                    },
                  ]}
                >
                  <Text style={[styles.timePillText, selectedMinute === m && { color: '#FFFFFF', fontWeight: '800' }]}>
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
                  backgroundColor: selectedPeriod === 'AM' ? '#10B981' : isDark ? '#1E293B' : '#F1F5F9',
                },
              ]}
            >
              <Text style={[styles.periodBtnText, selectedPeriod === 'AM' && { color: '#FFFFFF', fontWeight: '800' }]}>
                AM
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedPeriod('PM')}
              style={[
                styles.periodBtn,
                {
                  backgroundColor: selectedPeriod === 'PM' ? '#10B981' : isDark ? '#1E293B' : '#F1F5F9',
                },
              ]}
            >
              <Text style={[styles.periodBtnText, selectedPeriod === 'PM' && { color: '#FFFFFF', fontWeight: '800' }]}>
                PM
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Repeat on Days of Week */}
      <Text style={[styles.label, { color: colors.text }]}>Repeat Routine</Text>
      <DaySelector selectedDays={daysOfWeek} onToggleDay={toggleDay} />

      {/* 10 Alarm Sounds with Sound Preview */}
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
                  backgroundColor: isSelected ? (isDark ? '#064E3B' : '#DCFCE7') : colors.surface,
                  borderColor: isSelected ? '#10B981' : colors.border,
                },
              ]}
            >
              <View style={styles.soundMeta}>
                <Text style={[styles.soundText, { color: colors.text }, isSelected && { fontWeight: '700' }]}>
                  🔔 {snd.name}
                </Text>
                <Text style={[styles.soundDesc, { color: colors.textSecondary }]}>
                  {snd.description}
                </Text>
              </View>
              {isSelected ? (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              ) : (
                <Text style={[styles.previewHint, { color: colors.textSecondary }]}>▶ Play</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3-Strike Accountability Note */}
      <View style={[styles.infoBanner, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <Text style={[styles.infoText, isDark && { color: '#38BDF8' }]}>
          ⚡ Active Accountability: Alarms fire 5 mins before, 3 mins before, and at routine time with lock-screen YES / NO confirmation.
        </Text>
      </View>

      {/* Submit Button */}
      <Button
        title={submitLabel}
        onPress={handleSave}
        disabled={!activityName.trim()}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
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
    marginBottom: 4,
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
    backgroundColor: '#10B981',
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
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 18,
  },
  submitBtn: {
    marginTop: 10,
    marginBottom: 36,
  },
});
