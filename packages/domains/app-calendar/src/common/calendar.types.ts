export const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const TOTAL_GRID_CELLS = 42;
export const MS_PER_DAY = 86_400_000;
export const MAX_MEMO_LENGTH = 80;

export interface CalendarCell {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasMemo: boolean;
  dayOfWeek: number;
}

export interface DDayMeta {
  label: string;
  variant: 'accent' | 'secondary' | 'neutral';
}
