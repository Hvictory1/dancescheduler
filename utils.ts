import { ClassSession, Studio, WeeklyStats } from './types';

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const calculateDuration = (start: string, end: string): number => {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  return Math.max(0, (endMinutes - startMinutes) / 60); // returns hours
};

export const calculateWeeklyStats = (classes: ClassSession[], studios: Studio[]): WeeklyStats => {
  let totalIncome = 0;
  let totalHours = 0;

  classes.forEach(cls => {
    const studio = studios.find(s => s.id === cls.studioId);
    if (studio) {
      const duration = calculateDuration(cls.startTime, cls.endTime);
      totalHours += duration;
      totalIncome += duration * studio.rate;
    }
  });

  return {
    totalIncome,
    totalHours,
    classCount: classes.length
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
};

// Date Helpers

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatWeekRange = (startDate: Date): string => {
  const end = addDays(startDate, 6);
  const format = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${format(startDate)} - ${format(end)}`;
};