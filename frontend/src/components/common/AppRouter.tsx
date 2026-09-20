import React from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { isNativeOrLocalPlatform } from '../../utils/platform';

export interface AppRouterProps {
  children: React.ReactNode;
}

/**
 * AppRouter Component:
 * Tự động chuyển đổi giữa HashRouter và BrowserRouter dựa trên môi trường thực thi:
 * - Native/Local Assets (Capacitor, Tauri, file://): Sử dụng HashRouter để đảm bảo 100% không bị lỗi 404 khi tải lại trang hay điều hướng deep-link.
 * - Web Server (Docker Nginx, Node.js dev server): Sử dụng BrowserRouter để giữ URL chuẩn SEO và sạch sẽ.
 */
export const AppRouter: React.FC<AppRouterProps> = ({ children }) => {
  const useHashRouting = isNativeOrLocalPlatform();

  if (useHashRouting) {
    return <HashRouter>{children}</HashRouter>;
  }

  return <BrowserRouter>{children}</BrowserRouter>;
};
