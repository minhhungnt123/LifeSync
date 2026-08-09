import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Calendar, UtensilsCrossed, Bot } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1E293B' }}>
            Xin chào, {user?.fullName} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            Dưới đây là tổng quan lịch trình &amp; dinh dưỡng của bạn hôm nay.
          </p>
        </div>

        {/* AI Badge */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold"
          style={{
            background: 'rgba(79, 70, 229, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            color: '#4F46E5',
          }}
        >
          <Sparkles className="h-4 w-4" />
          <span>LifeSync AI Active</span>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Lịch trình hôm nay */}
        <div
          className="rounded-2xl p-6 surface-card"
          style={{ borderRadius: '16px' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#64748B' }}>
              Lịch trình hôm nay
            </h3>
            <div
              className="p-2 rounded-lg"
              style={{ background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.15)' }}
            >
              <Calendar className="h-4 w-4" style={{ color: '#4F46E5' }} />
            </div>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#1E293B' }}>
            0 Nhiệm vụ
          </p>
          <span className="text-xs mt-2 block" style={{ color: '#94A3B8' }}>
            Mọi việc đã sẵn sàng
          </span>
        </div>

        {/* Card 2: Calories */}
        <div
          className="rounded-2xl p-6 surface-card"
          style={{ borderRadius: '16px' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#64748B' }}>
              Calories nạp vào
            </h3>
            <div
              className="p-2 rounded-lg"
              style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.15)' }}
            >
              <UtensilsCrossed className="h-4 w-4" style={{ color: '#a855f7' }} />
            </div>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#1E293B' }}>
            0 / 2,000 kcal
          </p>
          <span className="text-xs mt-2 block" style={{ color: '#94A3B8' }}>
            Chưa ghi nhận bữa ăn
          </span>
        </div>

        {/* Card 3: Gợi ý AI */}
        <div
          className="rounded-2xl p-6 surface-card"
          style={{ borderRadius: '16px' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#64748B' }}>
              Gợi ý AI
            </h3>
            <div
              className="p-2 rounded-lg"
              style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.15)' }}
            >
              <Bot className="h-4 w-4" style={{ color: '#059669' }} />
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
            "Tạo lịch làm việc đầu tiên để AI có thể phân tích năng suất của bạn."
          </p>
        </div>

      </div>
    </div>
  );
};
