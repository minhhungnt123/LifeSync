import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Utensils,
  Heart,
  Clock,
  Moon,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { aiApi } from '../../api/aiApi';
import type { PromptSuggestion } from '../../types/ai';

interface HeartcarePromptChipsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

type PromptCategory = 'ALL' | 'NUTRITION' | 'STRESS' | 'HEART_HEALTH' | 'SLEEP';

interface CategoryTab {
  id: PromptCategory;
  label: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'ALL', label: 'Tất cả', icon: Sparkles },
  { id: 'NUTRITION', label: 'Dinh dưỡng DASH', icon: Utensils },
  { id: 'STRESS', label: 'Lịch trình & Stress', icon: Clock },
  { id: 'HEART_HEALTH', label: 'Tim mạch & TDEE', icon: Heart },
  { id: 'SLEEP', label: 'Giấc ngủ sâu', icon: Moon },
];

const FALLBACK_PROMPTS: PromptSuggestion[] = [
  {
    id: 'eval-nutrition',
    title: 'Đánh giá thực đơn hôm nay',
    prompt: 'Dựa trên các bữa ăn tôi đã ghi nhận hôm nay, thực đơn này có an toàn và phù hợp cho tim mạch không?',
    category: 'NUTRITION',
  },
  {
    id: 'low-sodium-snack',
    title: 'Gợi ý bữa phụ ít muối',
    prompt: 'Gợi ý cho tôi 3 món ăn nhẹ (snack) lành mạnh, giàu kali và ít natri theo chế độ ăn DASH.',
    category: 'NUTRITION',
  },
  {
    id: 'tdee-balance',
    title: 'Cân đối Calo và TDEE',
    prompt: 'So sánh mức năng lượng Calorie tôi đã nạp hôm nay với chỉ số TDEE cá nhân. Tôi cần điều chỉnh gì cho bữa tối?',
    category: 'HEART_HEALTH',
  },
  {
    id: 'check-stress',
    title: 'Lịch trình có gây quá tải không?',
    prompt: 'Phân tích lịch trình công việc tuần này của tôi. Cường độ làm việc như vậy có gây căng thẳng tim mạch không?',
    category: 'STRESS',
  },
  {
    id: 'breathing-exercise',
    title: 'Bài tập thở hạ nhịp tim',
    prompt: 'Tôi đang cảm thấy khá căng thẳng vì áp lực công việc. Hãy hướng dẫn tôi một bài tập thở 3 phút để điều hòa nhịp tim.',
    category: 'STRESS',
  },
  {
    id: 'sleep-hygiene',
    title: 'Thói quen ngủ hạ huyết áp',
    prompt: 'Chia sẻ các thói quen trước giờ ngủ giúp hạ huyết áp tự nhiên và tăng cường giấc ngủ sâu hồi phục tim mạch.',
    category: 'SLEEP',
  },
  {
    id: 'potassium-rich',
    title: 'Thực phẩm giàu Kali & Magie',
    prompt: 'Những loại rau củ và trái cây nào giàu Kali và Magie nhất mà tôi nên bổ sung vào thực đơn hàng ngày?',
    category: 'NUTRITION',
  },
  {
    id: 'work-break-tips',
    title: 'Khoảng nghỉ giảm áp lực',
    prompt: 'Khi làm việc liên tục trước máy tính, tôi nên nghỉ ngơi ngắt quãng thế nào để hạn chế nguy cơ tăng huyết áp?',
    category: 'STRESS',
  },
];

export const HeartcarePromptChips: React.FC<HeartcarePromptChipsProps> = ({
  onSelectPrompt,
  disabled = false,
  compact = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>('ALL');

  // Fetch prompts from backend with fallback
  const { data: promptsResponse } = useQuery({
    queryKey: ['heartcarePromptSuggestions'],
    queryFn: () => aiApi.getSuggestedPrompts(),
    staleTime: 1000 * 60 * 15, // 15 mins
  });

  const allPrompts: PromptSuggestion[] =
    promptsResponse?.data && promptsResponse.data.length > 0
      ? promptsResponse.data
      : FALLBACK_PROMPTS;

  const filteredPrompts = allPrompts.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    return p.category.toUpperCase() === selectedCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case 'NUTRITION':
        return <Utensils className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'STRESS':
        return <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
      case 'HEART_HEALTH':
        return <Heart className="w-3.5 h-3.5 text-rose-600 shrink-0 fill-current" />;
      case 'SLEEP':
        return <Moon className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
  };

  /* ── Compact Mode (for Mini Floating Widget) ────────────────────── */
  if (compact) {
    return (
      <div className="space-y-1.5">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.slice(0, 4).map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all shrink-0 cursor-pointer ${
                  isCatActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {filteredPrompts.map((chip) => (
            <button
              key={chip.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPrompt(chip.prompt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50/80 border border-slate-200/90 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 text-xs font-semibold shadow-2xs transition-all hover:scale-[1.02] shrink-0 cursor-pointer disabled:opacity-50"
            >
              {getCategoryIcon(chip.category)}
              <span>{chip.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Full Mode (for AiChatPage) ─────────────────────────────────── */
  return (
    <div className="space-y-2.5">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          const count =
            cat.id === 'ALL'
              ? allPrompts.length
              : allPrompts.filter((p) => p.category.toUpperCase() === cat.id).length;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs scale-[1.02]'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredPrompts.map((chip) => (
          <button
            key={chip.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(chip.prompt)}
            className="group flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 text-left transition-all hover:shadow-sm cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-100/70 transition-colors shrink-0">
                {getCategoryIcon(chip.category)}
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-800 group-hover:text-indigo-950 truncate">
                  {chip.title}
                </h5>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-600 truncate">
                  {chip.prompt}
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
};
