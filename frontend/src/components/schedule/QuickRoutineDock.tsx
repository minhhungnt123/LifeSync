import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Plus, X, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ScheduleCategory } from '../../types/schedule';
import { routineTemplateApi, type RoutineTemplateRequest } from '../../api/routineTemplateApi';
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from '../../constants/scheduleConstants';

export interface QuickRoutineDockProps {
  selectedDate: Date;
  onApplyRoutine: (title: string, durationMinutes: number, category: ScheduleCategory) => void;
}

export const QuickRoutineDock: React.FC<QuickRoutineDockProps> = ({
  onApplyRoutine,
}) => {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newCategory, setNewCategory] = useState<ScheduleCategory>('WORK');

  // Fetch templates from Backend Database via REST API
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['routineTemplates'],
    queryFn: () => routineTemplateApi.getTemplates(),
  });

  const templates = apiResponse?.data || [];

  // Mutation to create new template in Database
  const createTemplateMutation = useMutation({
    mutationFn: (data: RoutineTemplateRequest) => routineTemplateApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routineTemplates'] });
      toast.success('Đã lưu mẫu thói quen mới vào Database!');
      setNewTitle('');
      setNewDuration(30);
      setIsAddModalOpen(false);
    },
    onError: () => toast.error('Không thể tạo mẫu thói quen!'),
  });

  // Mutation to delete template from Database
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => routineTemplateApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routineTemplates'] });
      toast.success('Đã xóa mẫu thói quen!');
    },
    onError: () => toast.error('Không thể xóa mẫu thói quen!'),
  });

  const handleAddCustomRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTemplateMutation.mutate({
      title: newTitle.trim(),
      durationMinutes: Number(newDuration) || 30,
      category: newCategory,
    });
  };

  const handleDeleteCustomRoutine = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTemplateMutation.mutate(id);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-sm space-y-2">
      {/* Header Label */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>Thói Quen Nhanh (Đồng bộ Database 🗄️)</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
          ⚡ Click 1-phát để tự động thêm sự kiện vào ngày đang xem
        </span>
      </div>

      {/* Routine Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 min-h-[44px]">
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-1 px-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            <span>Đang tải danh sách mẫu thói quen từ Database...</span>
          </div>
        ) : (
          templates.map((routine) => {
            const catConfig = CATEGORY_COLORS[routine.category] || CATEGORY_COLORS.WORK;
            const emoji = CATEGORY_EMOJIS[routine.category] || '📅';

            return (
              <button
                key={routine.id}
                onClick={() => onApplyRoutine(routine.title, routine.durationMinutes, routine.category)}
                className="group relative flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-300 transition-all duration-200 shadow-2xs cursor-pointer select-none text-xs font-semibold text-slate-700 active:scale-95"
              >
                <span>{emoji}</span>
                <span>{routine.title}</span>
                <span className="text-[10px] font-normal text-slate-600 bg-slate-200/60 px-1.5 py-0.2 rounded-md">
                  {routine.durationMinutes}p
                </span>

                <span
                  onClick={(e) => handleDeleteCustomRoutine(routine.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-rose-100 text-rose-500 ml-1"
                  title="Xóa mẫu thói quen khỏi Database"
                >
                  <X className="w-3 h-3" />
                </span>
              </button>
            );
          })
        )}

        {/* Add custom routine pill */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/40 hover:bg-indigo-100/60 text-indigo-600 text-xs font-semibold transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm thói quen</span>
        </button>
      </div>

      {/* Add Custom Routine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm p-5 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800">Tạo Thói Quen Mới (Lưu DB)</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomRoutine} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên thói quen *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Chạy bộ, Đi chợ, Học bài..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phân loại
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ScheduleCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="WORK">💼 Công việc</option>
                    <option value="STUDY">📚 Học tập</option>
                    <option value="HEALTH">🏃 Sức khỏe</option>
                    <option value="PERSONAL">🏠 Cá nhân</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createTemplateMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {createTemplateMutation.isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Lưu vào Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
