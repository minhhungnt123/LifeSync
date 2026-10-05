/**
 * Desktop Update Service (Tauri v2 In-App Auto-Updater)
 * 
 * Đảm nhiệm kiểm tra, tải về và cập nhật ứng dụng tự động trên nền tảng Desktop.
 * Tuân thủ nguyên lý Single Responsibility (SOLID) và Clean Code:
 * - Tự động phát hiện môi trường chạy (Web / Capacitor Android / Tauri Desktop).
 * - Kiểm tra phiên bản mới từ máy chủ hoặc GitHub Releases.
 * - Hỗ trợ tải ngầm (Background download) và khởi động lại để hoàn tất nâng cấp.
 */

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  version?: string;
  date?: string;
  body?: string;
}

export class DesktopUpdateService {
  /**
   * Kiểm tra xem ứng dụng hiện tại có đang chạy trong môi trường Tauri Desktop hay không.
   */
  public static isTauriApp(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  /**
   * Kiểm tra phiên bản mới của ứng dụng Desktop từ endpoint cấu hình trong tauri.conf.json.
   * @returns Thông tin phiên bản mới nếu có, hoặc null nếu đang chạy trên Web/Mobile hoặc không có bản mới.
   */
  public static async checkForUpdates(): Promise<UpdateInfo> {
    if (!this.isTauriApp()) {
      return { available: false, currentVersion: '1.0.0' };
    }

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();

      if (update) {
        return {
          available: true,
          currentVersion: update.currentVersion,
          version: update.version,
          date: update.date,
          body: update.body,
        };
      }

      return {
        available: false,
        currentVersion: '1.0.0',
      };
    } catch (error) {
      console.warn('[DesktopUpdateService] Không thể kiểm tra bản cập nhật:', error);
      return {
        available: false,
        currentVersion: '1.0.0',
      };
    }
  }

  /**
   * Thực hiện tải bản cập nhật và cài đặt, sau đó yêu cầu khởi động lại ứng dụng.
   * @param onProgress Callback thông báo tiến độ tải (bytesDownloaded, contentLength)
   */
  public static async downloadAndInstall(
    onProgress?: (downloaded: number, total: number | null) => void
  ): Promise<boolean> {
    if (!this.isTauriApp()) {
      return false;
    }

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();

      if (!update) {
        return false;
      }

      let downloadedBytes = 0;
      let totalBytes: number | null = null;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            totalBytes = event.data.contentLength ?? null;
            if (onProgress) onProgress(0, totalBytes);
            break;
          case 'Progress':
            downloadedBytes += event.data.chunkLength;
            if (onProgress) onProgress(downloadedBytes, totalBytes);
            break;
          case 'Finished':
            if (onProgress && totalBytes) onProgress(totalBytes, totalBytes);
            break;
        }
      });

      return true;
    } catch (error) {
      console.error('[DesktopUpdateService] Lỗi khi tải hoặc cài đặt bản cập nhật:', error);
      throw error;
    }
  }

  /**
   * Khởi động lại ứng dụng để áp dụng bản cập nhật vừa cài đặt.
   */
  public static async restartApp(): Promise<void> {
    if (!this.isTauriApp()) return;

    try {
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch (error) {
      console.warn('[DesktopUpdateService] Fallback restart qua window reload:', error);
      window.location.reload();
    }
  }
}
