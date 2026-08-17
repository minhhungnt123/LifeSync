import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  UtensilsCrossed,
  Bot,
  Info,
  Loader2,
  Inbox,
} from 'lucide-react';
import { notificationApi } from '../api/notificationApi';
import type { NotificationItem, NotificationType } from '../types/user';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | NotificationType>('ALL');

  const { data: notificationsRes, isLoading } = useQuery({
    queryKey: ['notifications', activeTab],
    queryFn: async () => {
      const params: { unreadOnly?: boolean; type?: NotificationType } = {};
      if (activeTab === 'UNREAD') params.unreadOnly = true;
      else if (activeTab !== 'ALL') params.type = activeTab;

      const res = await notificationApi.getNotifications(params);
      return res.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc!');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      toast.success('Xóa thông báo thành công!');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'SCHEDULE_REMINDER':
        return <Calendar className="w-5 h-5 text-indigo-600" />;
      case 'MEAL_REMINDER':
        return <UtensilsCrossed className="w-5 h-5 text-emerald-600" />;
      case 'AI_SUGGESTION':
        return <Bot className="w-5 h-5 text-purple-600" />;
      case 'SYSTEM':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const notifications = notificationsRes || [];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ── Header Banner ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs">
            <Bell className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Trung tâm thông báo</h1>
            <p className="text-xs text-slate-500 mt-0.5">Theo dõi nhắc nhở lịch trình, bữa ăn và lời khuyên từ Trợ lý AI</p>
          </div>
        </div>
        <div>
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || notifications.length === 0}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" /> Đánh dấu tất cả là đã đọc
          </button>
        </div>
      </div>

      {/* ── Filter Tabs & Main Feed Card ─────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap border-b border-slate-100 pb-4">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('UNREAD')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'UNREAD'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chưa đọc
          </button>
          <button
            onClick={() => setActiveTab('SCHEDULE_REMINDER')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'SCHEDULE_REMINDER'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            📅 Lịch trình
          </button>
          <button
            onClick={() => setActiveTab('MEAL_REMINDER')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'MEAL_REMINDER'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            🥗 Bữa ăn
          </button>
          <button
            onClick={() => setActiveTab('AI_SUGGESTION')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'AI_SUGGESTION'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            🤖 Gợi ý AI
          </button>
        </div>

        {/* Feed List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="p-4 rounded-full bg-slate-50 text-slate-300">
              <Inbox className="w-10 h-10" />
            </div>
            <p className="text-sm font-bold text-slate-700">Không có thông báo nào</p>
            <p className="text-xs text-slate-400">Bạn đã cập nhật hoàn toàn danh sách thông báo!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item: NotificationItem) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  !item.isRead
                    ? 'bg-indigo-50/40 border-indigo-200/80 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200/60 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-start gap-3.5 overflow-hidden">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-800">{item.title}</h3>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!item.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(item.id)}
                      title="Đánh dấu là đã đọc"
                      className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    title="Xóa thông báo"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
