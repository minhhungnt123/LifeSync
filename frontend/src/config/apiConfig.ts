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

import { storage } from '../utils/storage';

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
 * Cho phép ghi đè (Override) tại thời điểm runtime (lưu qua storage)
 * để tiện cho việc kiểm thử trên thiết bị di động thật hoặc môi trường dev.
 */
export function getApiBaseUrl(): string {
  const customOverride = storage.getItem(STORAGE_KEY_API_OVERRIDE);
  if (customOverride && customOverride.trim().length > 0) {
    return customOverride.trim();
  }

  return getDefaultApiBaseUrl();
}

/**
 * Thiết lập URL ghi đè khi runtime (phục vụ tester/developer trên di động)
 */
export function setApiBaseUrlOverride(url: string): void {
  storage.setItem(STORAGE_KEY_API_OVERRIDE, url.trim());
}

/**
 * Xóa URL ghi đè runtime để quay về mặc định của hệ thống
 */
export function clearApiBaseUrlOverride(): void {
  storage.removeItem(STORAGE_KEY_API_OVERRIDE);
}

/**
 * Kiểm tra xem hiện tại có đang sử dụng URL ghi đè runtime hay không
 */
export function isApiOverridden(): boolean {
  const customOverride = storage.getItem(STORAGE_KEY_API_OVERRIDE);
  return Boolean(customOverride && customOverride.trim().length > 0);
}
