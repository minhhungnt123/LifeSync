import React, { useState, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';

const THINKING_MESSAGES = [
  'LifeSync AI đang tổng hợp dữ liệu thể trạng...',
  'Đang phân tích dinh dưỡng & chỉ số tim mạch...',
  'Đang kiểm tra tiêu chuẩn thực đơn DASH & lối sống...',
  'Đang hoàn thiện câu trả lời tối ưu cho bạn...',
];

export const TypingThinkingIndicator: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start gap-2.5 sm:gap-3 animate-fade-in">
      {/* AI Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-200">
        <Bot className="w-4 h-4 animate-pulse" />
      </div>

      {/* Bubble with Bouncing Dots & Ticker Message */}
      <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-white text-slate-700 border border-slate-200/80 shadow-2xs space-y-2">
        {/* 3 Bouncing Dots Wave */}
        <div className="flex items-center gap-1.5 h-4">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
          <span className="text-[11px] font-bold text-indigo-700 ml-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
            Đang suy luận
          </span>
        </div>

        {/* Dynamic Thinking Step Message */}
        <p className="text-xs text-slate-500 font-medium tracking-tight animate-fade-in key={messageIndex}">
          {THINKING_MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  );
};
