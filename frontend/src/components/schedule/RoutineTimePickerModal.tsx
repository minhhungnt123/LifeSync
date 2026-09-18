import React, { useState, useMemo, useEffect } from 'react';
import { Clock, Calendar, AlertTriangle, CheckCircle2, Zap, X, Sparkles } from 'lucide-react';
import type { Schedule, ScheduleCategory } from '../../types/schedule';
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from '../../constants/scheduleConstants';
import { formatToLocalDateTime } from '../../utils/dateUtils';

export interface RoutineTimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: {
    title: string;
    durationMinutes: number;
    category: ScheduleCategory;
  } | null;
  selectedDate: Date;
  daySchedules: Schedule[];
  onConfirm: (data: {
    title: string;
    startTimeISO: string;
    endTimeISO: string;
    category: ScheduleCategory;
  }) => Promise<void>;
}

export const RoutineTimePickerModal: React.FC<RoutineTimePickerModalProps> = ({
  isOpen,
  onClose,
  routine,
  selectedDate,
  daySchedules,
  onConfirm,
}) => {
  const [startTimeStr, setStartTimeStr] = useState<string>('08:00');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize start time when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const isToday =
        selectedDate.getFullYear() === now.getFullYear() &&
        selectedDate.getMonth() === now.getMonth() &&
        selectedDate.getDate() === now.getDate();

      if (isToday) {
        const nextHour = new Date();
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
        const hours = String(nextHour.getHours()).padStart(2, '0');
        const minutes = String(nextHour.getMinutes()).padStart(2, '0');
        setStartTimeStr(`${hours}:${minutes}`);
      } else {
        setStartTimeStr('08:00');
      }
    }
  }, [isOpen, selectedDate]);

  // Calculate start & end Date objects based on startTimeStr and routine duration
  const { startDateTime, endDateTime, endTimeStr } = useMemo(() => {
    if (!routine) return { startDateTime: new Date(), endDateTime: new Date(), endTimeStr: '08:30' };

    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const start = new Date(selectedDate);
    start.setHours(hours || 0, minutes || 0, 0, 0);

    const end = new Date(start.getTime() + routine.durationMinutes * 60 * 1000);
    const endH = String(end.getHours()).padStart(2, '0');
    const endM = String(end.getMinutes()).padStart(2, '0');

    return {
      startDateTime: start,
      endDateTime: end,
      endTimeStr: `${endH}:${endM}`,
    };
  }, [selectedDate, startTimeStr, routine]);

  // Real-time overlap check against existing schedules in the day
  const overlappingSchedules = useMemo(() => {
    if (!routine) return [];
    return daySchedules.filter((schedule) => {
      const existingStart = new Date(schedule.startTime).getTime();
      const existingEnd = new Date(schedule.endTime).getTime();
      const proposedStart = startDateTime.getTime();
      const proposedEnd = endDateTime.getTime();

      return proposedStart < existingEnd && proposedEnd > existingStart;
    });
  }, [daySchedules, startDateTime, endDateTime, routine]);

  if (!isOpen || !routine) return null;

  const emoji = CATEGORY_EMOJIS[routine.category] || '📅';
  const catConfig = CATEGORY_COLORS[routine.category] || CATEGORY_COLORS.WORK;

  const selectedDateLabel = selectedDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleQuickSlotClick = (timeStr: string) => {
    setStartTimeStr(timeStr);
  };

  const handleNowClick = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    setStartTimeStr(`${h}:${m}`);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm({
        title: routine.title,
        startTimeISO: formatToLocalDateTime(startDateTime),
        endTimeISO: formatToLocalDateTime(endDateTime),
        category: routine.category,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatScheduleTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* ── Modal Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs"
              style={{ backgroundColor: catConfig.bg, border: `1px solid ${catConfig.border}` }}
            >
              {emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">{routine.title}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                  ⏱️ {routine.durationMinutes} phút
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Thêm thói quen cho: </span>
                <span className="font-semibold text-slate-700 capitalize">{selectedDateLabel}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Content: 2 Columns ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          {/* 👈 Column 1: Time Picker & Configurations (md:col-span-5) */}
          <div className="md:col-span-5 p-6 flex flex-col justify-between space-y-5 overflow-y-auto bg-white">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Chọn thời gian thực hiện</span>
              </div>

              {/* Time inputs card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                      Giờ bắt đầu
                    </label>
                    <input
                      type="time"
                      value={startTimeStr}
                      onChange={(e) => setStartTimeStr(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                      Giờ kết thúc
                    </label>
                    <div className="w-full px-3 py-2 text-sm font-bold text-indigo-600 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between">
                      <span>{endTimeStr}</span>
                      <span className="text-[10px] text-indigo-400 font-normal">Tự động</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span>Khung giờ dự kiến:</span>
                  <span className="font-semibold text-slate-800">
                    {startTimeStr} — {endTimeStr}
                  </span>
                </div>
              </div>

              {/* Quick Time Slots */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">
                  Gợi ý chọn nhanh khung giờ
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleNowClick}
                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold transition-all active:scale-95"
                  >
                    <Zap className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>Bây giờ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSlotClick('08:00')}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all active:scale-95"
                  >
                    🌅 08:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSlotClick('12:00')}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all active:scale-95"
                  >
                    ☀️ 12:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSlotClick('15:00')}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all active:scale-95"
                  >
                    🌆 15:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSlotClick('18:00')}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all active:scale-95"
                  >
                    🌆 18:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSlotClick('20:00')}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all active:scale-95"
                  >
                    🌙 20:00
                  </button>
                </div>
              </div>

              {/* Overlap Status Warning Box */}
              {overlappingSchedules.length > 0 ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Chú ý: Trùng lịch với {overlappingSchedules.length} sự kiện!</span>
                  </div>
                  <ul className="pl-5 list-disc space-y-0.5 text-[11px] text-amber-700">
                    {overlappingSchedules.map((s) => (
                      <li key={s.id}>
                        <span className="font-semibold">{s.title}</span> ({formatScheduleTime(s.startTime)} — {formatScheduleTime(s.endTime)})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Khung giờ hoàn toàn trống! Không bị trùng sự kiện khác.</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Đang lưu...' : 'Thêm vào lịch trình'}</span>
              </button>
            </div>
          </div>

          {/* 👉 Column 2: Day Schedule Timeline & Interactive Preview (md:col-span-7) */}
          <div className="md:col-span-7 p-6 bg-slate-50/50 flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Lịch trình hiện có trong ngày ({daySchedules.length})
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  👀 Xem trực quan vị trí thêm thói quen
                </span>
              </div>

              {/* Day Timeline List with Highlights */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                {daySchedules.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-1">
                    <p className="text-sm font-semibold text-slate-600">Ngày này chưa có sự kiện nào</p>
                    <p className="text-xs text-slate-400">Bạn có thể tự do chọn bất kỳ khung giờ nào trong ngày.</p>
                  </div>
                ) : (
                  daySchedules.map((s) => {
                    const isOverlappedWithThis = overlappingSchedules.some((item) => item.id === s.id);
                    const catCfg = CATEGORY_COLORS[s.category] || CATEGORY_COLORS.WORK;
                    const itemEmoji = CATEGORY_EMOJIS[s.category] || '📅';

                    return (
                      <div
                        key={s.id}
                        className={`p-3 rounded-2xl bg-white border transition-all text-xs flex items-center justify-between ${
                          isOverlappedWithThis
                            ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                            : 'border-slate-200/80 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base">{itemEmoji}</span>
                          <div className="min-w-0">
                            <h5 className="font-bold text-slate-800 truncate">{s.title}</h5>
                            <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{formatScheduleTime(s.startTime)} — {formatScheduleTime(s.endTime)}</span>
                            </p>
                          </div>
                        </div>

                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: catCfg.bg + '20',
                            color: catCfg.border,
                            border: `1px solid ${catCfg.border}30`,
                          }}
                        >
                          {s.category}
                        </span>
                      </div>
                    );
                  })
                )}

                {/* Proposed Routine Preview Card */}
                <div className="p-3.5 rounded-2xl border-2 border-dashed border-indigo-500 bg-indigo-50/70 shadow-sm text-xs space-y-1 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-indigo-900">
                      <span className="text-base">{emoji}</span>
                      <span>[DỰ KIẾN THÊM] {routine.title}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      Mới
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-700 font-semibold pl-6 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{startTimeStr} — {endTimeStr} ({routine.durationMinutes} phút)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-indigo-50/40 p-3 rounded-2xl border border-indigo-100">
              💡 <span className="font-semibold">Mẹo:</span> Bạn có thể đổi giờ ở cột bên trái hoặc bấm nút chọn nhanh để xem vị trí thói quen dự kiến tự động cập nhật bên dòng thời gian.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
