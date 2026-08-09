import React, { useMemo } from 'react';
import type { Schedule } from '../../types/schedule';
import { getWeekDays, toDateOnly } from '../../utils/dateUtils';
import { CATEGORY_COLORS, DAY_NAMES_VI } from '../../constants/scheduleConstants';

export interface WeekMiniPickerProps {
  selectedDate: Date;
  schedules: Schedule[];
  onDayClick: (date: Date) => void;
}

export const WeekMiniPicker: React.FC<WeekMiniPickerProps> = ({ selectedDate, schedules, onDayClick }) => {
  const today    = new Date();
  const todayKey = toDateOnly(today);
  const selKey   = toDateOnly(selectedDate);
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const schedulesByDate = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    for (const s of schedules) {
      const key = toDateOnly(new Date(s.startTime));
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [schedules]);

  return (
    <div className="flex flex-col gap-1.5 px-1">
      {/* Week range label */}
      <div className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest px-1 mb-0.5">
        {weekDays[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
        {' — '}
        {weekDays[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </div>

      {weekDays.map((day) => {
        const dayKey     = toDateOnly(day);
        const isToday    = dayKey === todayKey;
        const isSelected = dayKey === selKey;
        const daySched   = schedulesByDate[dayKey] || [];
        const hasEvents  = daySched.length > 0;
        const dotColors  = [...new Set(daySched.map((s) => CATEGORY_COLORS[s.category]?.dot || '#6b7280'))].slice(0, 4);

        return (
          <button
            key={dayKey}
            onClick={() => onDayClick(day)}
            className="week-day-row w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl"
            style={{
              background: isSelected ? '#EEF2FF' : isToday ? '#F0FDF4' : '#F8FAFF',
              border: isSelected ? '1px solid #C7D2FE' : isToday ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
              boxShadow: isSelected ? '0 2px 8px rgba(79,70,229,0.12)' : 'none',
            }}
          >
            {/* Day name + number */}
            <div className="flex items-center gap-3">
              <span
                className="text-[11px] font-semibold tracking-wide w-5"
                style={{ color: isToday ? '#059669' : isSelected ? '#4F46E5' : '#94A3B8' }}
              >
                {DAY_NAMES_VI[day.getDay()]}
              </span>
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold transition-all"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                    : isToday
                    ? '#D1FAE5'
                    : 'transparent',
                  color: isSelected ? '#fff' : isToday ? '#059669' : '#475569',
                  boxShadow: isSelected ? '0 2px 8px rgba(79,70,229,0.4)' : isToday ? '0 0 0 1.5px #6EE7B7' : 'none',
                }}
              >
                {day.getDate()}
              </span>
            </div>

            {/* Event indicators */}
            <div className="flex items-center gap-2">
              {hasEvents ? (
                <>
                  <div className="flex gap-1">
                    {dotColors.map((color, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}60` }}
                      />
                    ))}
                  </div>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isSelected ? '#E0E7FF' : '#F1F5F9',
                      color: isSelected ? '#4F46E5' : '#64748B',
                    }}
                  >
                    {daySched.length}
                  </span>
                </>
              ) : (
                <span className="text-[10px]" style={{ color: '#CBD5E1' }}>—</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
