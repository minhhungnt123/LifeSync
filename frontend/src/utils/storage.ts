/**
 * Storage Service Module (LifeSync Multi-Platform)
 *
 * Tuân thủ nguyên lý:
 * - Single Responsibility Principle (SRP): Quản lý tập trung toàn bộ hoạt động đọc/ghi dữ liệu cục bộ.
 * - Dependency Inversion Principle (DIP): Cung cấp interface IStorageService giúp các components không bị phụ thuộc trực tiếp vào localStorage của trình duyệt.
 *
 * Tính năng chống lỗi (Fault Tolerance):
 * Tự động chuyển sang bộ nhớ đệm tạm thời (In-Memory Fallback) nếu môi trường WebView bị hạn chế quyền truy cập (DOMException / SecurityError).
 */

export interface IStorageService {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

class StorageService implements IStorageService {
  private static readonly TOKEN_KEY: string = 'token';
  private inMemoryStore: Map<string, string> = new Map<string, string>();
  private isLocalStorageAvailable: boolean = true;

  constructor() {
    this.checkLocalStorageAvailability();
  }

  /**
   * Kiểm tra khả năng tương tác của localStorage trong môi trường hiện tại
   */
  private checkLocalStorageAvailability(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        this.isLocalStorageAvailable = false;
        return;
      }
      const testKey = '__lifesync_storage_test__';
      window.localStorage.setItem(testKey, 'ok');
      window.localStorage.removeItem(testKey);
      this.isLocalStorageAvailable = true;
    } catch {
      this.isLocalStorageAvailable = false;
      console.warn('[StorageService] localStorage không khả dụng, tự động chuyển sang In-Memory Store.');
    }
  }

  /**
   * Lấy giá trị token xác thực người dùng
   */
  public getToken(): string | null {
    return this.getItem(StorageService.TOKEN_KEY);
  }

  /**
   * Lưu token xác thực người dùng
   */
  public setToken(token: string): void {
    this.setItem(StorageService.TOKEN_KEY, token);
  }

  /**
   * Xóa token xác thực người dùng
   */
  public removeToken(): void {
    this.removeItem(StorageService.TOKEN_KEY);
  }

  /**
   * Đọc giá trị theo key
   */
  public getItem(key: string): string | null {
    if (this.isLocalStorageAvailable) {
      try {
        const value = window.localStorage.getItem(key);
        return value !== null ? value : (this.inMemoryStore.get(key) ?? null);
      } catch (error) {
        console.warn(`[StorageService] Lỗi khi đọc key "${key}" từ localStorage:`, error);
      }
    }
    return this.inMemoryStore.get(key) ?? null;
  }

  /**
   * Lưu giá trị theo key
   */
  public setItem(key: string, value: string): void {
    this.inMemoryStore.set(key, value);
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        console.warn(`[StorageService] Lỗi khi ghi key "${key}" vào localStorage:`, error);
      }
    }
  }

  /**
   * Xóa một key cụ thể
   */
  public removeItem(key: string): void {
    this.inMemoryStore.delete(key);
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.warn(`[StorageService] Lỗi khi xóa key "${key}" khỏi localStorage:`, error);
      }
    }
  }

  /**
   * Xóa toàn bộ bộ nhớ lưu trữ
   */
  public clear(): void {
    this.inMemoryStore.clear();
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.clear();
      } catch (error) {
        console.warn('[StorageService] Lỗi khi xóa toàn bộ localStorage:', error);
      }
    }
  }
}

export const storage = new StorageService();
