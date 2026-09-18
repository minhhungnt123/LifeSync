import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

/**
 * Real-time network connectivity monitor banner.
 * Alerts the user immediately when their Internet or LAN connection drops.
 */
export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md transition-all animate-slide-down sticky top-0 z-50">
      <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>Bạn đang ở chế độ ngoại tuyến. Một số tính năng và dữ liệu đồng bộ có thể bị gián đoạn.</span>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-2.5 py-1 bg-amber-700/80 hover:bg-amber-800 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Kiểm tra lại</span>
        </button>
      </div>
    </div>
  );
};
