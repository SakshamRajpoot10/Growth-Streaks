import { differenceInCalendarDays, parseISO, subDays, format } from 'date-fns';

export function calculateCurrentStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const dateSet = new Set(completedDates);

  if (!dateSet.has(today) && !dateSet.has(yesterday)) return 0;

  let streak = 0;
  let checkDate = dateSet.has(today) ? new Date() : subDays(new Date(), 1);

  while (dateSet.has(format(checkDate, 'yyyy-MM-dd'))) {
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  return streak;
}

export function calculateLongestStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sorted = [...new Set(completedDates)].sort();
  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(parseISO(sorted[i]), parseISO(sorted[i - 1]));
    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diff > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

export function getIntensityLevel(rate: number): 0 | 1 | 2 | 3 | 4 {
  if (rate === 0) return 0;
  if (rate < 25) return 1;
  if (rate < 50) return 2;
  if (rate < 80) return 3;
  return 4;
}

