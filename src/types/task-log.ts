export type TaskLogStatus = 'pending' | 'yes' | 'no' | 'missed';

export interface TaskLog {
  id: string;
  taskId: string;
  date: string; // "YYYY-MM-DD"
  status: TaskLogStatus;
  triggerCount: number;
  respondedAt: string | null;
  createdAt: number;
}

export interface DailyStats {
  total: number;
  completed: number;
  declined: number;
  missed: number;
  pending: number;
  rate: number; // 0-100
}

export interface WeeklyStats {
  total: number;
  completed: number;
  declined: number;
  missed: number;
  pending: number;
  rate: number; // 0-100
  startDate: string;
  endDate: string;
}

export interface HeatmapDay {
  date: string;
  total: number;
  completed: number;
  rate: number; // 0-100
  intensity: 0 | 1 | 2 | 3 | 4; // for heatmap coloring
}
