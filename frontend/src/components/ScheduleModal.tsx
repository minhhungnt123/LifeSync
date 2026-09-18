import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, AlertTriangle, Trash2, Save, Tag, Flag, Timer } from 'lucide-react';
import type { Schedule, ScheduleCategory, SchedulePriority, ScheduleRequest, ScheduleStatus } from '../types/schedule';
import { formatToDateTimeLocal, formatToLocalDateTime } from '../utils/dateUtils';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ScheduleRequest, id?: number) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  initialSchedule?: Schedule | null;
  defaultDates?: { start: string; end: string } | null;
  isLoading?: boolean;
}

const CATEGORY_OPTIONS: { label: string; value: ScheduleCategory; color: string; emoji: string }[] = [
  { label: 'Công việc', value: 'WORK', color: 'bg-blue-50 text-blue-700 border-blue-200', emoji: '💼' },
  { label: 'Học tập', value: 'STUDY', color: 'bg-purple-50 text-purple-700 border-purple-200', emoji: '📚' },
  { label: 'Sức khỏe', value: 'HEALTH', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', emoji: '🏃' },
  { label: 'Cá nhân', value: 'PERSONAL', color: 'bg-orange-50 text-orange-700 border-orange-200', emoji: '🏠' },
];

const PRIORITY_OPTIONS: { label: string; value: SchedulePriority; color: string }[] = [
  { label: 'Thấp', value: 'LOW', color: 'text-slate-500' },
  { label: 'Trung bình', value: 'MEDIUM', color: 'text-blue-600' },
  { label: 'Cao', value: 'HIGH', color: 'text-amber-600' },
  { label: 'Khẩn cấp', value: 'URGENT', color: 'text-rose-600 font-bold' },
];

const STATUS_OPTIONS: { label: string; value: ScheduleStatus }[] = [
  { label: 'Chờ thực hiện', value: 'PENDING' },
  { label: 'Đang làm', value: 'IN_PROGRESS' },
  { label: 'Hoàn thành', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

const formatDuration = (startStr: string, endStr: string): string | null => {
  if (!startStr || !endStr) return null;
  const startD = new Date(startStr);
  const endD = new Date(endStr);
  const diffMs = endD.getTime() - startD.getTime();
  if (diffMs <= 0) return null;
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} phút`;
  if (minutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${minutes} phút`;
};

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialSchedule,
  defaultDates,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState<ScheduleCategory>('WORK');
  const [status, setStatus] = useState<ScheduleStatus>('PENDING');
  const [priority, setPriority] = useState<SchedulePriority>('MEDIUM');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);
  // Inline delete confirmation state
  const [deleteConfirmPending, setDeleteConfirmPending] = useState(false);

  // Real-time duration calculator
  const duration = useMemo(() => formatDuration(startTime, endTime), [startTime, endTime]);

  useEffect(() => {
    if (initialSchedule) {
      setTitle(initialSchedule.title || '');
      setDescription(initialSchedule.description || '');
      setStartTime(formatToDateTimeLocal(initialSchedule.startTime));
      setEndTime(formatToDateTimeLocal(initialSchedule.endTime));
      setCategory(initialSchedule.category || 'WORK');
      setStatus(initialSchedule.status || 'PENDING');
      setPriority(initialSchedule.priority || 'MEDIUM');
      setOverlapWarning(initialSchedule.overlapWarning || null);
    } else if (defaultDates) {
      setTitle('');
      setDescription('');
      setStartTime(formatToDateTimeLocal(defaultDates.start));
      setEndTime(formatToDateTimeLocal(defaultDates.end));
      setCategory('WORK');
      setStatus('PENDING');
      setPriority('MEDIUM');
      setOverlapWarning(null);
    } else {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      setTitle('');
      setDescription('');
      setStartTime(formatToDateTimeLocal(now));
      setEndTime(formatToDateTimeLocal(oneHourLater));
      setCategory('WORK');
      setStatus('PENDING');
      setPriority('MEDIUM');
      setOverlapWarning(null);
    }
    setErrorMessage(null);
    setDeleteConfirmPending(false);
  }, [initialSchedule, defaultDates, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề sự kiện!');
      return;
    }

    if (!startTime || !endTime) {
      setErrorMessage('Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc!');
      return;
    }

    const startD = new Date(startTime);
    const endD = new Date(endTime);

    if (endD <= startD) {
      setErrorMessage('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!');
      return;
    }

    const payload: ScheduleRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: formatToLocalDateTime(startTime),
      endTime: formatToLocalDateTime(endTime),
      category,
      status,
      priority,
    };

    try {
      await onSave(payload, initialSchedule?.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Đã xảy ra lỗi khi lưu lịch trình!');
    }
  };

  const handleDeleteClick = () => {
    if (!deleteConfirmPending) {
      setDeleteConfirmPending(true);
      // Auto-cancel confirmation after 4 seconds
      setTimeout(() => setDeleteConfirmPending(false), 4000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (initialSchedule && onDelete) {
      try {
        await onDelete(initialSchedule.id);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Không thể xóa sự kiện!');
        setDeleteConfirmPending(false);
      }
    }
  };

  const selectedCategoryOption = CATEGORY_OPTIONS.find((c) => c.value === category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-xl border text-sm ${selectedCategoryOption?.color || 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
              <span>{selectedCategoryOption?.emoji || '📅'}</span>
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {initialSchedule ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {overlapWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{overlapWarning}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Tiêu đề sự kiện <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề công việc / lịch hẹn..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
              required
            />
          </div>

          {/* Times + Duration */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Bắt đầu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Kết thúc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>
            {/* Duration Badge */}
            {duration ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <Timer className="w-3.5 h-3.5 text-emerald-500" />
                <span>Thời lượng: <strong>{duration}</strong></span>
              </div>
            ) : startTime && endTime ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Thời gian kết thúc phải sau thời gian bắt đầu</span>
              </div>
            ) : null}
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" /> Phân loại
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORY_OPTIONS.map((opt) => {
                const isSelected = category === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? opt.color + ' ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ScheduleStatus)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-slate-400" /> Độ ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SchedulePriority)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mô tả chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú thêm về nội dung công việc..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {/* Inline Delete Confirmation */}
            {initialSchedule && onDelete ? (
              <div className="flex items-center gap-2">
                {deleteConfirmPending ? (
                  <>
                    <span className="text-xs text-rose-600 font-semibold">Xác nhận xóa?</span>
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Xóa ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmPending(false)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Thôi
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={isLoading}
                    className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa sự kiện
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Save className="w-3.5 h-3.5" /> {isLoading ? 'Đang lưu...' : 'Lưu sự kiện'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
