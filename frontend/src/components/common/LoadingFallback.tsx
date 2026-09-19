import React from 'react';
import { Sparkles } from 'lucide-react';

export const LoadingFallback: React.FC = () => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[50vh] w-full p-8"
      role="status"
      aria-live="polite"
      aria-label="Đang tải dữ liệu"
    >
      <div className="relative flex items-center justify-center">
        {/* Pulsing glow effect */}
        <div className="absolute h-14 w-14 rounded-2xl bg-indigo-500/20 animate-ping" />
        
        {/* Brand Icon Box */}
        <div
          className="relative flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg shadow-indigo-500/30 transition-transform duration-300"
          style={{
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          }}
        >
          <Sparkles className="h-6 w-6 text-white animate-pulse" />
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <p className="text-sm font-semibold text-slate-700 tracking-wide">
          LifeSync AI
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" />
        </div>
      </div>
    </div>
  );
};
