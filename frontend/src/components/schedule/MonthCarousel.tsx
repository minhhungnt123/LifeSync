import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths } from '../../utils/dateUtils';
import { MONTH_NAMES_VI } from '../../constants/scheduleConstants';

interface MonthItemProps {
  date: Date;
  isSelected: boolean;
  isCurrentMonth: boolean;
  offset: number;
  onClick: () => void;
}

const MonthItem: React.FC<MonthItemProps> = ({ date, isSelected, isCurrentMonth, offset, onClick }) => {
  const absOffset = Math.abs(offset);
  const styleMap: Record<number, { scale: string; opacity: string; zIndex: string }> = {
    0: { scale: 'scale-100', opacity: 'opacity-100', zIndex: 'z-10' },
    1: { scale: 'scale-[0.92]', opacity: 'opacity-80', zIndex: 'z-0' },
    2: { scale: 'scale-[0.82]', opacity: 'opacity-50', zIndex: 'z-0' },
    3: { scale: 'scale-[0.72]', opacity: 'opacity-30', zIndex: 'z-0' },
  };
  const { scale, opacity, zIndex } = styleMap[absOffset] ?? styleMap[3];

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center flex-shrink-0 w-24 sm:w-28 md:w-32 h-20
        rounded-2xl cursor-pointer select-none
        transition-all duration-300 ease-out
        ${scale} ${opacity} ${zIndex}
        ${isSelected ? 'month-card-selected' : 'month-card-neighbor'}
      `}
    >
      {/* Year */}
      <span className="text-[10px] font-medium tracking-wider uppercase mb-0.5"
        style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}
      >
        {date.getFullYear()}
      </span>

      {/* Month name */}
      <span className="text-sm font-bold tracking-tight"
        style={{ color: isSelected ? '#ffffff' : '#1E293B' }}
      >
        {MONTH_NAMES_VI[date.getMonth()]}
      </span>

      {/* Badge */}
      {isCurrentMonth && !isSelected && (
        <span className="mt-1 text-[9px] px-1.5 py-0.5 rounded-full font-semibold tracking-wide"
          style={{ background: '#D1FAE5', color: '#059669', border: '1px solid #A7F3D0' }}
        >
          Hiện tại
        </span>
      )}
      {isSelected && (
        <span className="mt-1 text-[9px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
          ● đang xem
        </span>
      )}
    </button>
  );
};

export interface MonthCarouselProps {
  selectedDate: Date;
  onMonthChange: (date: Date) => void;
}

export const MonthCarousel: React.FC<MonthCarouselProps> = ({ selectedDate, onMonthChange }) => {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;

  const months = useMemo(() =>
    [-3, -2, -1, 0, 1, 2, 3].map((offset) => ({ offset, date: addMonths(selectedDate, offset) })),
    [selectedDate],
  );

  return (
    <div
      className="w-full flex items-center justify-center gap-2 py-4 px-3 sm:px-6 rounded-2xl"
      style={{
        background: '#ffffff',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(99,102,241,0.08), 0 1px 3px rgba(15,23,42,0.06)',
      }}
    >
      {/* Left Arrow */}
      <button
        onClick={() => onMonthChange(addMonths(selectedDate, -1))}
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 z-10"
        style={{ background: '#F8FAFF', border: '1px solid #E2E8F0', color: '#94A3B8' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EEF2FF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#C7D2FE'; (e.currentTarget as HTMLButtonElement).style.color = '#4F46E5'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; }}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Month Items Container - Centered Alignment */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto scrollbar-none flex-1 py-1 px-1 mx-auto">
        {months.map(({ offset, date }) => {
          const key    = `${date.getFullYear()}-${date.getMonth()}`;
          const selKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;
          return (
            <MonthItem
              key={key}
              date={date}
              offset={offset}
              isSelected={key === selKey}
              isCurrentMonth={key === currentMonthKey}
              onClick={() => onMonthChange(date)}
            />
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => onMonthChange(addMonths(selectedDate, 1))}
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 z-10"
        style={{ background: '#F8FAFF', border: '1px solid #E2E8F0', color: '#94A3B8' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EEF2FF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#C7D2FE'; (e.currentTarget as HTMLButtonElement).style.color = '#4F46E5'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; }}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
