/**
 * Utility functions for date manipulation in LifeSync Frontend.
 */

export const toDateOnly = (date: Date): string => {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * Preserve day-of-month when navigating months.
 * Clamps to last day if target month is shorter (e.g., Jan 31 → Feb 28).
 */
export const addMonths = (date: Date, months: number): Date => {
  const targetYear  = date.getFullYear();
  const targetMonth = date.getMonth() + months;
  const targetDay   = date.getDate();
  const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  return new Date(targetYear, targetMonth, Math.min(targetDay, lastDayOfMonth));
};

/**
 * Returns 7 dates for the week containing `date`.
 * Week starts on Monday. Sunday belongs to the SAME week (as last day).
 */
export const getWeekDays = (date: Date): Date[] => {
  const jsDay = date.getDay(); // 0=Sun, 1=Mon … 6=Sat
  const mondayIndex = (jsDay + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - mondayIndex);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};
