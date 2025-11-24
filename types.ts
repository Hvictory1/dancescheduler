export interface Studio {
  id: string;
  name: string;
  rate: number; // hourly rate in CNY
  color: string;
}

export interface ClassSession {
  id: string;
  studioId: string;
  dayIndex: number; // 0 = Monday, 6 = Sunday
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  notes?: string;
}

export type Tab = 'schedule' | 'studios' | 'stats';

export interface WeeklyStats {
  totalIncome: number;
  totalHours: number;
  classCount: number;
}

export interface WeeklyAdjustment {
  id: string;
  weekStartDate: string; // ISO Date string of the Monday of that week
  amount: number; // Positive for extra income, negative for deductions
  note: string;
  createdAt: number;
}