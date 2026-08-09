import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, AlertTriangle, Trash2, Save, Tag, Flag, Timer } from 'lucide-react';
import type { Schedule, ScheduleCategory, SchedulePriority, ScheduleRequest, ScheduleStatus } from '../types/schedule';

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
  { label: 'Công việc', value: 'WORK', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', emoji: '💼' },
  { label: 'Học tập', value: 'STUDY', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', emoji: '📚' },
  { label: 'Sức khỏe', value: 'HEALTH', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', emoji: '🏃' },
  { label: 'Cá nhân', value: 'PERSONAL', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', emoji: '🏠' },
];

const PRIORITY_OPTIONS: { label: string; value: SchedulePriority; color: string }[] = [
  { label: 'Thấp', value: 'LOW', color: 'text-gray-400' },
  { label: 'Trung bình', value: 'MEDIUM', color: 'text-blue-400' },
  { label: 'Cao', value: 'HIGH', color: 'text-amber-400' },
  { label: 'Khẩn cấp', value: 'URGENT', color: 'text-rose-400 font-bold' },
];

const STATUS_OPTIONS: { label: string; value: ScheduleStatus }[] = [
  { label: 'Chờ thực hiện', value: 'PENDING' },
  { label: 'Đang làm', value: 'IN_PROGRESS' },
  { label: 'Hoàn thành', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

const formatDateTimeLocal = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

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
      setStartTime(formatDateTimeLocal(initialSchedule.startTime));
      setEndTime(formatDateTimeLocal(initialSchedule.endTime));
      setCategory(initialSchedule.category || 'WORK');
      setStatus(initialSchedule.status || 'PENDING');
      setPriority(initialSchedule.priority || 'MEDIUM');
      setOverlapWarning(initialSchedule.overlapWarning || null);
    } else if (defaultDates) {
      setTitle('');
      setDescription('');
      setStartTime(formatDateTimeLocal(defaultDates.start));
      setEndTime(formatDateTimeLocal(defaultDates.end));
      setCategory('WORK');
      setStatus('PENDING');
      setPriority('MEDIUM');
      setOverlapWarning(null);
    } else {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      setTitle('');
      setDescription('');
      setStartTime(formatDateTimeLocal(now.toISOString()));
      setEndTime(formatDateTimeLocal(oneHourLater.toISOString()));
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
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gray-900/95 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-gray-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-gray-900/50">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg border text-sm ${selectedCategoryOption?.color || 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
              <span>{selectedCategoryOption?.emoji || '📅'}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">
              {initialSchedule ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {overlapWarning && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{overlapWarning}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Tiêu đề sự kiện <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề công việc / lịch hẹn..."
              className="w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              required
            />
          </div>

          {/* Times + Duration */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Bắt đầu <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-800/60 border border-gray-700/60 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Kết thúc <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-800/60 border border-gray-700/60 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>
            {/* Duration Badge */}
            {duration ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <Timer className="w-3.5 h-3.5" />
                <span>Thời lượng: <strong>{duration}</strong></span>
              </div>
            ) : startTime && endTime ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Thời gian kết thúc phải sau thời gian bắt đầu</span>
              </div>
            ) : null}
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Phân loại
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORY_OPTIONS.map((opt) => {
                const isSelected = category === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? opt.color + ' ring-2 ring-white/10 font-semibold shadow-md'
                        : 'bg-gray-800/40 border-gray-700/40 text-gray-400 hover:bg-gray-800'
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
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ScheduleStatus)}
                className="w-full px-3.5 py-2 bg-gray-800/60 border border-gray-700/60 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5" /> Độ ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SchedulePriority)}
                className="w-full px-3.5 py-2 bg-gray-800/60 border border-gray-700/60 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Mô tả chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú thêm về nội dung công việc..."
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-800/80">
            {/* Inline Delete Confirmation */}
            {initialSchedule && onDelete ? (
              <div className="flex items-center gap-2">
                {deleteConfirmPending ? (
                  <>
                    <span className="text-xs text-rose-400 font-medium">Xác nhận xóa?</span>
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Xóa ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmPending(false)}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      Thôi
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={isLoading}
                    className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
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
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5"
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
