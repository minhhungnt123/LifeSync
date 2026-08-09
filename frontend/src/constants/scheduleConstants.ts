import type { ScheduleCategory } from '../types/schedule';

export const CATEGORY_COLORS: Record<ScheduleCategory, { bg: string; border: string; text: string; dot: string }> = {
  WORK:     { bg: '#3b82f6', border: '#2563eb', text: '#ffffff', dot: '#3b82f6' },
  STUDY:    { bg: '#a855f7', border: '#9333ea', text: '#ffffff', dot: '#a855f7' },
  HEALTH:   { bg: '#22c55e', border: '#16a34a', text: '#ffffff', dot: '#22c55e' },
  PERSONAL: { bg: '#f97316', border: '#ea580c', text: '#ffffff', dot: '#f97316' },
};

export const CATEGORY_EMOJIS: Record<ScheduleCategory, string> = {
  WORK:     '💼',
  STUDY:    '📚',
  HEALTH:   '🏃',
  PERSONAL: '🏠',
};

export const MONTH_NAMES_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

export const DAY_NAMES_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
