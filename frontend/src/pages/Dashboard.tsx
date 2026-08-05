import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Calendar, UtensilsCrossed, Bot } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Xin chào, {user?.fullName} 👋</h1>
          <p className="text-sm text-slate-400">Dưới đây là tổng quan lịch trình & dinh dưỡng của bạn hôm nay.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 text-xs font-semibold text-indigo-300">
          <Sparkles className="h-4 w-4" />
          <span>LifeSync AI Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Lịch trình hôm nay</h3>
            <Calendar className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-white">0 Nhiệm vụ</p>
          <span className="text-xs text-slate-500 mt-2 block">Mọi việc đã sẵn sàng</span>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Calories nạp vào</h3>
            <UtensilsCrossed className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">0 / 2,000 kcal</p>
          <span className="text-xs text-slate-500 mt-2 block">Chưa ghi nhận bữa ăn</span>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Gợi ý AI</h3>
            <Bot className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-sm text-slate-300">"Tạo lịch làm việc đầu tiên để AI có thể phân tích năng suất của bạn."</p>
        </div>
      </div>
    </div>
  );
};
