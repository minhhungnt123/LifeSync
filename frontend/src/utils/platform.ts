/**
 * Platform Detection Utility (LifeSync Multi-Platform)
 *
 * Kiểm tra xem ứng dụng có đang chạy trong môi trường Native / Local Assets hay không:
 * 1. Mở file HTML trực tiếp qua giao thức file://
 * 2. Ứng dụng di động Capacitor Native (Android / iOS)
 * 3. Ứng dụng Desktop Tauri (Windows / macOS / Linux)
 * 4. Cấu hình biến môi trường VITE_ROUTER_MODE=hash
 */
export function isNativeOrLocalPlatform(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 1. Kiểm tra cấu hình tường minh qua biến môi trường
  if (import.meta.env.VITE_ROUTER_MODE === 'hash') {
    return true;
  }

  // 2. Kiểm tra giao thức file cục bộ
  if (window.location.protocol === 'file:') {
    return true;
  }

  // 3. Kiểm tra Capacitor Native Container
  const capacitorWindow = window as unknown as {
    Capacitor?: { isNativePlatform?: () => boolean };
  };
  if (capacitorWindow.Capacitor && typeof capacitorWindow.Capacitor.isNativePlatform === 'function') {
    if (capacitorWindow.Capacitor.isNativePlatform()) {
      return true;
    }
  }

  // 4. Kiểm tra Tauri Desktop Container
  const tauriWindow = window as unknown as {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  };
  if ('__TAURI__' in tauriWindow || '__TAURI_INTERNALS__' in tauriWindow) {
    return true;
  }

  return false;
}
