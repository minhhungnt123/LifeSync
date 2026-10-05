import React, { useEffect, useState } from 'react';
import { DesktopUpdateService, type UpdateInfo } from '../../services/desktopUpdateService';
import { ArrowDownCircle, RefreshCw, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const DesktopUpdateNotification: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Chỉ chạy ngầm kiểm tra trên môi trường Tauri Desktop
    if (!DesktopUpdateService.isTauriApp()) return;

    const timer = setTimeout(async () => {
      try {
        const info = await DesktopUpdateService.checkForUpdates();
        if (info.available) {
          setUpdateInfo(info);
        }
      } catch (err) {
        console.error('Lỗi khi tự động kiểm tra bản cập nhật:', err);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!updateInfo || !updateInfo.available || isDismissed) {
    return null;
  }

  const handleStartUpdate = async () => {
    try {
      setIsDownloading(true);
      toast.loading('Đang tải bản cập nhật LifeSync mới...', { id: 'desktop-update' });

      await DesktopUpdateService.downloadAndInstall((downloaded, total) => {
        if (total && total > 0) {
          const percent = Math.round((downloaded / total) * 100);
          setDownloadProgress(percent);
        }
      });

      toast.success('Tải hoàn tất! Đang khởi động lại ứng dụng...', { id: 'desktop-update' });
      setTimeout(async () => {
        await DesktopUpdateService.restartApp();
      }, 1500);
    } catch (error) {
      setIsDownloading(false);
      toast.error('Cập nhật thất bại. Vui lòng thử lại sau!', { id: 'desktop-update' });
      console.error(error);
    }
  };

  return (
    <aside aria-label="Desktop App Update Banner" className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-fade-in-up">
      <div className="bg-slate-900/95 border border-indigo-500/30 backdrop-blur-xl rounded-2xl p-5 shadow-2xl shadow-indigo-950/40 text-slate-100 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                Phiên bản mới: v{updateInfo.version}
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                  Mới
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Bản cập nhật chứa các cải tiến hiệu năng và tính năng mới.
              </p>
            </div>
          </div>
          {!isDownloading && (
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {updateInfo.body && (
          <div className="text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300 max-h-24 overflow-y-auto font-sans leading-relaxed">
            {updateInfo.body}
          </div>
        )}

        {isDownloading && (
          <div className="space-y-1.5 mt-1">
            <div className="flex justify-between text-xs text-indigo-300 font-medium">
              <span>Đang tải gói cập nhật...</span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 mt-1">
          {!isDownloading && (
            <button
              onClick={() => setIsDismissed(true)}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
            >
              Để sau
            </button>
          )}
          <button
            onClick={handleStartUpdate}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <ArrowDownCircle className="w-3.5 h-3.5" />
                Cập nhật ngay
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
