import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getISODay } from 'date-fns';

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: formatDate(startOfWeek(now, { weekStartsOn: 1 })),
    end: formatDate(endOfWeek(now, { weekStartsOn: 1 })),
  };
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const date = new Date(year, month - 1, 1);
  return {
    start: formatDate(startOfMonth(date)),
    end: formatDate(endOfMonth(date)),
  };
}

export function getTodayDayOfWeek(): number {
  return getISODay(new Date()); // 1=Monday..7=Sunday
}

export function getDayName(day: number): string {
  const names = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return names[day] || '';
}

export function getDayFullName(day: number): string {
  const names = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return names[day] || '';
}

