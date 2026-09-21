import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Cấu hình Capacitor cho LifeSync AI (Mobile App)
 *
 * Thiết lập:
 * - appId: Định danh gói Android Native Package (com.lifesync.app)
 * - appName: Tên hiển thị của ứng dụng trên màn hình điện thoại
 * - webDir: Thư mục chứa tài nguyên Web đã build (dist)
 * - server.cleartext: Cho phép gọi HTTP API đến backend cục bộ trong quá trình phát triển (10.0.2.2 hoặc LAN IP)
 */
const config: CapacitorConfig = {
  appId: 'com.lifesync.app',
  appName: 'LifeSync AI',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
