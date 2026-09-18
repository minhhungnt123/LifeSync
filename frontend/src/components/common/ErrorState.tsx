import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
  isNetworkError?: boolean;
}

/**
 * Modern, user-friendly error display card with retry capability.
 * Follows Clean Code and design standards.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Không thể tải dữ liệu',
  message = 'Đã xảy ra lỗi khi giao tiếp với hệ thống. Vui lòng kiểm tra lại kết nối.',
  onRetry,
  isRetrying = false,
  className = '',
  isNetworkError = false,
}) => {
  return (
    <div
      className={`p-6 rounded-3xl bg-rose-50/70 border border-rose-200/80 text-center flex flex-col items-center justify-center space-y-3 shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100/80 text-rose-600 flex items-center justify-center shadow-xs">
        {isNetworkError ? <WifiOff className="w-6 h-6 animate-pulse" /> : <AlertCircle className="w-6 h-6" />}
      </div>

      <div className="max-w-md space-y-1">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Đang thử lại...' : 'Thử lại ngay'}</span>
        </button>
      )}
    </div>
  );
};
