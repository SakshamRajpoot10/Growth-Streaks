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
import { Colors } from '../../../constants/colors';
import { FOCUS_AREAS } from '../../../constants/focus-areas';
import { ALARM_SOUNDS } from '../../../constants/sounds';
import { DaySelector } from './DaySelector';
import { Button } from '../../../components/ui/Button';

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
  const [activityName, setActivityName] = useState(initialData?.activityName || '');
  const [focusArea, setFocusArea] = useState(initialData?.focusArea || 'health');
  const [scheduledTime, setScheduledTime] = useState(initialData?.scheduledTime || '07:00');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    initialData?.daysOfWeek || [1, 2, 3, 4, 5, 6, 7]
  );
  const [alarmSound, setAlarmSound] = useState(initialData?.alarmSound || 'default_alarm');
  const [preAlarmMinutes, setPreAlarmMinutes] = useState(initialData?.preAlarmMinutes || 5);

  const toggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  const handleSave = () => {
    if (!activityName.trim()) return;
    onSubmit({
      activityName: activityName.trim(),
      focusArea,
      scheduledTime,
      daysOfWeek,
      alarmSound,
      preAlarmMinutes,
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Activity Name */}
      <Text style={styles.label}>Routine / Habit Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Morning Workout, Deep Work, Read"
        value={activityName}
        onChangeText={setActivityName}
        placeholderTextColor={Colors.light.textSecondary}
      />

      {/* Focus Area */}
      <Text style={styles.label}>Focus Area</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {FOCUS_AREAS.map((fa) => {
          const isSelected = focusArea === fa.id;
          return (
            <TouchableOpacity
              key={fa.id}
              activeOpacity={0.7}
              onPress={() => setFocusArea(fa.id)}
              style={[
                styles.focusPill,
                isSelected && { backgroundColor: fa.color, borderColor: fa.color },
              ]}
            >
              <Text style={styles.focusEmoji}>{fa.emoji}</Text>
              <Text
                style={[
                  styles.focusText,
                  isSelected && styles.focusTextSelected,
                ]}
              >
                {fa.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Time Picker */}
      <Text style={styles.label}>Scheduled Time (24h HH:MM)</Text>
      <TextInput
        style={styles.input}
        placeholder="07:00"
        value={scheduledTime}
        onChangeText={setScheduledTime}
        keyboardType="numbers-and-punctuation"
      />

      {/* Days of week */}
      <DaySelector selectedDays={daysOfWeek} onToggleDay={toggleDay} />

      {/* Alarm Sound Picker */}
      <Text style={styles.label}>Alarm Ringtone</Text>
      <View style={styles.soundContainer}>
        {ALARM_SOUNDS.map((snd) => {
          const isSelected = alarmSound === snd.id;
          return (
            <TouchableOpacity
              key={snd.id}
              activeOpacity={0.7}
              onPress={() => setAlarmSound(snd.id)}
              style={[
                styles.soundOption,
                isSelected && styles.soundOptionSelected,
              ]}
            >
              <Text style={styles.soundText}>🔔 {snd.name}</Text>
              {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pre-alarm offset info */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          ⚡ Accountability: The 3-strike alarm sequence will fire 5 minutes prior, 3 minutes prior, and at the scheduled time.
        </Text>
      </View>

      {/* Save Button */}
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
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  horizontalScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surfaceVariant,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  focusEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  focusText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  focusTextSelected: {
    color: '#FFFFFF',
  },
  soundContainer: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  soundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surfaceVariant,
  },
  soundOptionSelected: {
    backgroundColor: '#E8F5E9',
  },
  soundText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  infoBanner: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 18,
  },
  submitBtn: {
    marginTop: 24,
    marginBottom: 36,
  },
});
