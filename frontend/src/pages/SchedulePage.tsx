import React, { useState, useMemo, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw, Layers, Clock } from 'lucide-react';

import toast from 'react-hot-toast';

import { scheduleApi } from '../api/scheduleApi';
import type { Schedule, ScheduleCategory, ScheduleRequest } from '../types/schedule';
import { ScheduleModal } from '../components/ScheduleModal';
import { RoutineTimePickerModal } from '../components/schedule/RoutineTimePickerModal';
import { MonthCarousel } from '../components/schedule/MonthCarousel';
import { WeekMiniPicker } from '../components/schedule/WeekMiniPicker';
import { DayScheduleCompactList } from '../components/schedule/DayScheduleCompactList';
import { QuickRoutineDock } from '../components/schedule/QuickRoutineDock';
import { toDateOnly, formatToLocalDateTime } from '../utils/dateUtils';
import { CATEGORY_COLORS, CATEGORY_EMOJIS, MONTH_NAMES_VI } from '../constants/scheduleConstants';
import { ErrorState } from '../components/common/ErrorState';
import { parseApiError } from '../utils/errorUtils';

const EMPTY_SCHEDULES: Schedule[] = [];

export const SchedulePage: React.FC = () => {
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [defaultDates, setDefaultDates] = useState<{ start: string; end: string } | null>(null);
  const [isDayViewCollapsed, setIsDayViewCollapsed] = useState<boolean>(true);

  // States for Quick Routine Time Picker Modal
  const [activeRoutine, setActiveRoutine] = useState<{
    title: string;
    durationMinutes: number;
    category: ScheduleCategory;
  } | null>(null);
  const [isRoutineTimeModalOpen, setIsRoutineTimeModalOpen] = useState<boolean>(false);

  const dayCalRef = useRef<any>(null);

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: apiResponse, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => scheduleApi.getSchedules(),
  });

  const schedules = apiResponse?.data ?? EMPTY_SCHEDULES;
  const parsedQueryError = isError ? parseApiError(error) : null;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: ScheduleRequest) => scheduleApi.createSchedule(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['schedules'] }); },
    onError: (err: any) => {
      const p = parseApiError(err);
      toast.error(p.message || 'Tạo lịch trình thất bại!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ScheduleRequest }) => scheduleApi.updateSchedule(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['schedules'] }); toast.success('Đã cập nhật lịch trình!'); },
    onError: (err: any) => {
      const p = parseApiError(err);
      toast.error(p.message || 'Cập nhật lịch trình thất bại!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => scheduleApi.deleteSchedule(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['schedules'] }); toast.success('Đã xóa sự kiện thành công!'); },
    onError: (err: any) => {
      const p = parseApiError(err);
      toast.error(p.message || 'Không thể xóa sự kiện!');
    },
  });


  // ── Calendar Events ───────────────────────────────────────────────────────
  const calendarEvents = useMemo(() =>
    schedules.map((schedule) => {
      const cs = CATEGORY_COLORS[schedule.category] || CATEGORY_COLORS.WORK;
      const emoji = CATEGORY_EMOJIS[schedule.category] || '📅';
      const faded = schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED';
      return {
        id: schedule.id.toString(),
        title: `${emoji} ${schedule.title}`,
        start: schedule.startTime,
        end: schedule.endTime,
        backgroundColor: faded ? cs.bg + '66' : cs.bg,
        borderColor:     faded ? cs.border + '66' : cs.border,
        textColor:       cs.text,
        classNames:      schedule.status === 'COMPLETED' ? ['event-completed'] : schedule.status === 'CANCELLED' ? ['event-cancelled'] : [],
        extendedProps:   schedule,
      };
    }),
    [schedules],
  );

  // ── Date sync ─────────────────────────────────────────────────────────────
  const syncToDate = useCallback((date: Date) => {
    setSelectedDate(date);
    dayCalRef.current?.getApi()?.gotoDate(date);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMonthChange = useCallback((date: Date) => syncToDate(date), [syncToDate]);
  const handleWeekDayClick = useCallback((date: Date) => syncToDate(date), [syncToDate]);

  const handleOpenAddModal = useCallback(() => {
    setSelectedSchedule(null);
    const now = new Date();
    const base = new Date(selectedDate);
    base.setHours(now.getHours(), 0, 0, 0);
    const end = new Date(base);
    end.setHours(base.getHours() + 1);
    setDefaultDates({ start: formatToLocalDateTime(base), end: formatToLocalDateTime(end) });
    setIsModalOpen(true);
  }, [selectedDate]);

  const handleApplyRoutine = useCallback((title: string, durationMinutes: number, category: ScheduleCategory) => {
    setActiveRoutine({ title, durationMinutes, category });
    setIsRoutineTimeModalOpen(true);
  }, []);

  const handleConfirmRoutine = useCallback(async (data: {
    title: string;
    startTimeISO: string;
    endTimeISO: string;
    category: ScheduleCategory;
  }) => {
    try {
      await createMutation.mutateAsync({
        title: data.title,
        startTime: data.startTimeISO,
        endTime: data.endTimeISO,
        category: data.category,
        status: 'PENDING',
        priority: 'MEDIUM',
      });
      toast.success(`⚡ Đã thêm nhanh thói quen "${data.title}" vào lịch trình!`);
    } catch {
      toast.error('Không thể thêm thói quen!');
    }
  }, [createMutation]);

  const handleSelectSchedule = useCallback((schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDefaultDates(null);
    setIsModalOpen(true);
  }, []);

  const handleEventClick = (info: any) => {
    const schedule = info.event.extendedProps as unknown as Schedule;
    handleSelectSchedule(schedule);
  };

  const handleDaySelect = (selectInfo: any) => {
    setSelectedSchedule(null);
    setDefaultDates({ start: selectInfo.startStr, end: selectInfo.endStr });
    setIsModalOpen(true);
  };

  const handleEventDrop = async (dropInfo: any) => {
    const s = dropInfo.event.extendedProps as unknown as Schedule;
    const newStart = dropInfo.event.start ? formatToLocalDateTime(dropInfo.event.start) : null;
    const newEnd   = dropInfo.event.end ? formatToLocalDateTime(dropInfo.event.end) : null;
    if (!newStart || !newEnd) return;
    try {
      await updateMutation.mutateAsync({ id: s.id, data: { title: s.title, description: s.description, startTime: newStart, endTime: newEnd, category: s.category, status: s.status, priority: s.priority } });
    } catch { dropInfo.revert(); }
  };

  const handleEventResize = async (resizeInfo: any) => {
    const s = resizeInfo.event.extendedProps as unknown as Schedule;
    const newStart = resizeInfo.event.start ? formatToLocalDateTime(resizeInfo.event.start) : null;
    const newEnd   = resizeInfo.event.end ? formatToLocalDateTime(resizeInfo.event.end) : null;
    if (!newStart || !newEnd) return;
    try {
      await updateMutation.mutateAsync({ id: s.id, data: { title: s.title, description: s.description, startTime: newStart, endTime: newEnd, category: s.category, status: s.status, priority: s.priority } });
    } catch { resizeInfo.revert(); }
  };

  const handleSaveModal   = async (data: ScheduleRequest, id?: number): Promise<void> => {
    if (id) {
      await updateMutation.mutateAsync({ id, data });
    } else {
      await createMutation.mutateAsync(data);
      toast.success('Đã tạo lịch trình mới!');
    }
    meHideModal();
  };
  const handleDeleteModal = async (id: number): Promise<void> => { await deleteMutation.mutateAsync(id); meHideModal(); };
  const meHideModal = () => setIsModalOpen(false);

  // ── Display helpers ───────────────────────────────────────────────────────
  const isToday = toDateOnly(selectedDate) === toDateOnly(today);

  const selectedDateLabel = selectedDate.toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const selectedDaySchedules = useMemo(() => {
    const selKey = toDateOnly(selectedDate);
    return schedules.filter((s) => toDateOnly(new Date(s.startTime)) === selKey);
  }, [schedules, selectedDate]);

  return (
    <div className="w-full space-y-4">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Quản lý Lịch trình</h1>
            <p className="text-xs text-slate-500 mt-0.5">Theo dõi và sắp xếp thời gian công việc, học tập & sức khỏe</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isToday && (
            <button
              onClick={() => syncToDate(today)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 transition-all active:scale-95"
            >
              ⬅ Hôm nay
            </button>
          )}
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center gap-2 text-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Thêm lịch mới
          </button>
        </div>
      </div>

      {/* ── Month Carousel ─────────────────────────────────────────────── */}
      <MonthCarousel selectedDate={selectedDate} onMonthChange={handleMonthChange} />

      {/* ── Quick Routine Dock ─────────────────────────────────────────── */}
      <QuickRoutineDock selectedDate={selectedDate} onApplyRoutine={handleApplyRoutine} />

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {isError && parsedQueryError && (
        <ErrorState
          title="Không thể tải danh sách lịch trình"
          message={parsedQueryError.message}
          isNetworkError={parsedQueryError.isNetworkError}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )}


      {/* ── Bottom Split ───────────────────────────────────────────────── */}
      {isLoading ? (
        <div
          className="flex flex-col items-center justify-center py-32 space-y-4 rounded-2xl"
          style={{ background: '#ffffff', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(99,102,241,0.06)' }}
        >
          <div className="relative">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#4F46E5' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: '#64748B' }}>Đang tải lịch trình...</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 items-start w-full min-w-0">

          {/* ── Day View — 60% ─────────────────────────────────────────── */}
          <div
            className="w-full lg:w-[60%] min-w-0 gradient-border-blue rounded-2xl overflow-hidden calendar-light-theme flex flex-col transition-all duration-300"
            style={{ background: '#ffffff', boxShadow: '0 4px 24px rgba(99,102,241,0.10), 0 1px 4px rgba(15,23,42,0.06)' }}
          >
            {/* Day panel header */}
            <div
              className="px-5 py-3.5 flex items-center justify-between gap-2 flex-wrap"
              style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFF' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #4F46E5, #7C3AED)' }} />
                <span className="text-sm font-bold tracking-tight" style={{ color: '#1E293B' }}>Lịch Ngày</span>
                {selectedDaySchedules.length > 0 && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#E0E7FF', color: '#4F46E5', border: '1px solid #C7D2FE' }}
                  >
                    {selectedDaySchedules.length} sự kiện
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mode Switcher Toggle: Thu gọn vs Khung giờ */}
                {selectedDaySchedules.length > 0 && (
                  <button
                    onClick={() => setIsDayViewCollapsed(!isDayViewCollapsed)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all shadow-sm"
                    style={isDayViewCollapsed
                      ? { background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }
                      : { background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' }
                    }
                  >
                    {isDayViewCollapsed ? (
                      <>
                        <Layers className="w-3.5 h-3.5" /> Thu gọn
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" /> Khung giờ (Phóng to)
                      </>
                    )}
                  </button>
                )}

                <span className="text-xs font-medium text-slate-500 hidden sm:inline">{selectedDateLabel}</span>
              </div>
            </div>

            {/* Day nav */}
            <div className="px-4 pt-3 flex items-center justify-between">
              <button
                onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); syncToDate(d); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-indigo-50 hover:text-indigo-600"
                style={{ background: '#F8FAFF', border: '1px solid #E2E8F0', color: '#94A3B8' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => syncToDate(today)}
                className="text-xs font-medium px-3 py-1 rounded-lg transition-all"
                style={isToday
                  ? { background: '#D1FAE5', color: '#059669', border: '1px solid #A7F3D0' }
                  : { background: '#F8FAFF', color: '#64748B', border: '1px solid #E2E8F0' }
                }
              >
                {isToday ? '✓ Hôm nay' : 'Về hôm nay'}
              </button>
              <button
                onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); syncToDate(d); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-indigo-50 hover:text-indigo-600"
                style={{ background: '#F8FAFF', border: '1px solid #E2E8F0', color: '#94A3B8' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-4 flex-1">
              {selectedDaySchedules.length === 0 ? (
                <DayScheduleCompactList
                  schedules={[]}
                  onSelectSchedule={handleSelectSchedule}
                  onAddNew={handleOpenAddModal}
                />
              ) : isDayViewCollapsed ? (
                <DayScheduleCompactList
                  schedules={selectedDaySchedules}
                  onSelectSchedule={handleSelectSchedule}
                  onAddNew={handleOpenAddModal}
                />
              ) : (
                <div className="rounded-xl overflow-hidden border border-slate-100 shadow-inner">
                  <FullCalendar
                    ref={dayCalRef}
                    plugins={[timeGridPlugin as any, interactionPlugin as any]}
                    initialView="timeGridDay"
                    initialDate={selectedDate}
                    headerToolbar={false}
                    editable
                    selectable
                    selectMirror
                    events={calendarEvents}
                    select={handleDaySelect}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    height="500px"
                    locale="vi"
                    slotMinTime="06:00:00"
                    slotMaxTime="23:00:00"
                    allDaySlot={false}
                    nowIndicator
                    eventContent={(eventInfo) => {
                      const schedule = eventInfo.event.extendedProps as unknown as Schedule;
                      return (
                        <div className="px-1.5 py-1 text-xs overflow-hidden leading-tight">
                          <div className="font-semibold truncate">{eventInfo.event.title}</div>
                          {schedule?.description && (
                            <div className="text-white/70 truncate text-[10px] mt-0.5">{schedule.description}</div>
                          )}
                          {schedule?.hasOverlap && <span className="text-amber-300 text-[10px]">⚠️ Trùng lịch</span>}
                        </div>
                      );
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Week View — 40% ─────────────────────────────────────────── */}
          <div
            className="w-full lg:w-[40%] min-w-0 gradient-border-green rounded-2xl overflow-hidden flex flex-col"
            style={{ background: '#ffffff', boxShadow: '0 4px 24px rgba(5,150,105,0.08), 0 1px 4px rgba(15,23,42,0.06)' }}
          >
            {/* Week panel header */}
            <div
              className="px-5 py-3.5 flex items-center justify-between"
              style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFF' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #059669, #0891B2)' }} />
                <span className="text-sm font-bold tracking-tight" style={{ color: '#1E293B' }}>Lịch Tuần</span>
              </div>
              <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>
                {MONTH_NAMES_VI[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </span>
            </div>

            {/* Week navigation */}
            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
              <button
                onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); syncToDate(d); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-emerald-50 hover:text-emerald-600"
                style={{ background: '#F8FAFF', border: '1px solid #E2E8F0', color: '#94A3B8' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-medium" style={{ color: '#94A3B8' }}>Click ngày → xem chi tiết</span>
              <button
                onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); syncToDate(d); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-emerald-50 hover:text-emerald-600"
                style={{ background: '#F8FAFF', border: '1px solid #E2E8F0', color: '#94A3B8' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Week mini day list */}
            <div className="p-4">
              <WeekMiniPicker
                selectedDate={selectedDate}
                schedules={schedules}
                onDayClick={handleWeekDayClick}
              />
            </div>

            {/* Legend */}
            <div className="px-4 pb-4">
              <div className="pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#CBD5E1' }}>Phân loại</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(CATEGORY_COLORS).map(([cat, cs]) => (
                    <div key={cat} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cs.dot, boxShadow: `0 0 4px ${cs.dot}60` }}
                      />
                      <span className="text-[11px]" style={{ color: '#64748B' }}>
                        {CATEGORY_EMOJIS[cat as ScheduleCategory]} {cat === 'WORK' ? 'Công việc' : cat === 'STUDY' ? 'Học tập' : cat === 'HEALTH' ? 'Sức khỏe' : 'Cá nhân'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        onDelete={handleDeleteModal}
        initialSchedule={selectedSchedule}
        defaultDates={defaultDates}
        isLoading={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
      />

      {/* 2-Column Routine Time Picker Modal */}
      <RoutineTimePickerModal
        isOpen={isRoutineTimeModalOpen}
        onClose={() => setIsRoutineTimeModalOpen(false)}
        routine={activeRoutine}
        selectedDate={selectedDate}
        daySchedules={selectedDaySchedules}
        onConfirm={handleConfirmRoutine}
      />
    </div>
  );
};
