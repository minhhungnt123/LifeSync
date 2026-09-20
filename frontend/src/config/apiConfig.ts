/**
 * API Configuration Module (LifeSync Multi-Platform)
 *
 * Tuân thủ nguyên lý Single Responsibility Principle (SRP):
 * Quản lý tập trung việc xác định và cung cấp Base URL cho toàn bộ các cuộc gọi API,
 * đảm bảo tương thích đa nền tảng giữa:
 * 1. Web Localhost (http://localhost:8080/api/v1)
 * 2. Android Emulator (http://10.0.2.2:8080/api/v1)
 * 3. Android Physical Device (LAN IP e.g. http://192.168.1.x:8080/api/v1)
 * 4. Desktop Tauri & Web Production (/api/v1 hoặc Reverse Proxy)
 */

export const STORAGE_KEY_API_OVERRIDE = 'lifesync_api_base_url_override';
export const DEFAULT_API_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Lấy API Base URL mặc định được cấu hình từ biến môi trường Vite (.env)
 * Ưu tiên:
 * 1. VITE_API_BASE_URL (Chuẩn mới cho Milestone 8)
 * 2. VITE_API_URL (Tương thích ngược với Docker / Milestone 7)
 * 3. DEFAULT_API_BASE_URL (http://localhost:8080/api/v1)
 */
export function getDefaultApiBaseUrl(): string {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envBaseUrl && typeof envBaseUrl === 'string' && envBaseUrl.trim().length > 0) {
    return envBaseUrl.trim();
  }
  return DEFAULT_API_BASE_URL;
}

/**
 * Lấy Base URL đang có hiệu lực.
 * Cho phép ghi đè (Override) tại thời điểm runtime (lưu trong localStorage)
 * để tiện cho việc kiểm thử trên thiết bị di động thật hoặc môi trường dev.
 */
export function getApiBaseUrl(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const customOverride = window.localStorage.getItem(STORAGE_KEY_API_OVERRIDE);
      if (customOverride && customOverride.trim().length > 0) {
        return customOverride.trim();
      }
    }
  } catch (error) {
    console.warn('[apiConfig] Không thể truy cập localStorage để đọc URL override:', error);
  }

  return getDefaultApiBaseUrl();
}

/**
 * Thiết lập URL ghi đè khi runtime (phục vụ tester/developer trên di động)
 */
export function setApiBaseUrlOverride(url: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY_API_OVERRIDE, url.trim());
    }
  } catch (error) {
    console.error('[apiConfig] Không thể lưu API Base URL override:', error);
  }
}

/**
 * Xóa URL ghi đè runtime để quay về mặc định của hệ thống
 */
export function clearApiBaseUrlOverride(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY_API_OVERRIDE);
    }
  } catch (error) {
    console.error('[apiConfig] Không thể xóa API Base URL override:', error);
  }
}

/**
 * Kiểm tra xem hiện tại có đang sử dụng URL ghi đè runtime hay không
 */
export function isApiOverridden(): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const customOverride = window.localStorage.getItem(STORAGE_KEY_API_OVERRIDE);
      return Boolean(customOverride && customOverride.trim().length > 0);
    }
  } catch {
    return false;
  }
  return false;
}
