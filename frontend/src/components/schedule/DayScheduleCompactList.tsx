import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, Circle, XCircle, Plus, Edit3 } from 'lucide-react';
import type { Schedule, ScheduleCategory } from '../../types/schedule';
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from '../../constants/scheduleConstants';

export interface DayScheduleCompactListProps {
  schedules: Schedule[];
  onSelectSchedule: (schedule: Schedule) => void;
  onAddNew: () => void;
}

export const DayScheduleCompactList: React.FC<DayScheduleCompactListProps> = ({
  schedules,
  onSelectSchedule,
  onAddNew,
}) => {
  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-xl shadow-sm">
          📭
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-700">Chưa có lịch trình trong ngày này</h4>
          <p className="text-xs text-slate-600 mt-0.5">Bạn rảnh cả ngày hoặc chưa thêm sự kiện nào vào đây.</p>
        </div>
        <button
          onClick={onAddNew}
          className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Thêm lịch mới ngay
        </button>
      </div>
    );
  }

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Đã xong
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
            <XCircle className="w-3 h-3" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            <Circle className="w-3 h-3" /> Đang chờ
          </span>
        );
    }
  };

  const getCategoryLabel = (category: ScheduleCategory) => {
    switch (category) {
      case 'WORK': return 'Công việc';
      case 'STUDY': return 'Học tập';
      case 'HEALTH': return 'Sức khỏe';
      case 'PERSONAL': return 'Cá nhân';
      default: return category;
    }
  };

  return (
    <div className="space-y-2.5">
      {schedules.map((schedule) => {
        const catConfig = CATEGORY_COLORS[schedule.category] || CATEGORY_COLORS.WORK;
        const emoji = CATEGORY_EMOJIS[schedule.category] || '📅';
        const startTimeStr = formatTime(schedule.startTime);
        const endTimeStr = formatTime(schedule.endTime);

        return (
          <div
            key={schedule.id}
            onClick={() => onSelectSchedule(schedule)}
            className="group relative flex items-start justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer select-none"
          >
            {/* Left Category Color Stripe */}
            <div
              className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full transition-all group-hover:w-2"
              style={{ backgroundColor: catConfig.dot }}
            />

            <div className="pl-3 flex-1 min-w-0 space-y-1">
              {/* Title & Emoji */}
              <div className="flex items-center gap-2">
                <span className="text-sm">{emoji}</span>
                <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                  {schedule.title}
                </h4>
                {getStatusBadge(schedule.status)}
              </div>

              {/* Description if present */}
              {schedule.description && (
                <p className="text-xs text-slate-600 line-clamp-1 pl-6">
                  {schedule.description}
                </p>
              )}

              {/* Time & Badges row */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 pl-6">
                <div className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{startTimeStr} — {endTimeStr}</span>
                </div>

                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: catConfig.bg + '15',
                    color: catConfig.border,
                    border: `1px solid ${catConfig.border}30`,
                  }}
                >
                  {getCategoryLabel(schedule.category)}
                </span>

                {schedule.hasOverlap && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Trùng lịch
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Icon */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
              <Edit3 className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
