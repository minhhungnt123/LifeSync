import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { localNotificationService } from '../services/localNotificationService';

/**
 * Custom Hook quản lý hệ thống Local Notifications trong ứng dụng
 * Tự động đăng ký Deep Link Listener và khởi tạo Notification Channels
 */
export const useLocalNotifications = () => {
  const navigate = useNavigate();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoadingPermission, setIsLoadingPermission] = useState<boolean>(true);

  // Khởi tạo kênh thông báo và lắng nghe sự kiện bấm vào thông báo
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await localNotificationService.initChannels();
        const permitted = await localNotificationService.checkPermissions();
        if (isMounted) {
          setHasPermission(permitted);
          setIsLoadingPermission(false);
        }

        await localNotificationService.setupNotificationActionListener((route: string) => {
          navigate(route);
        });
      } catch (error) {
        console.warn('[useLocalNotifications] Khởi tạo thất bại:', error);
        if (isMounted) setIsLoadingPermission(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Hàm xin cấp quyền thông báo
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsLoadingPermission(true);
    try {
      const granted = await localNotificationService.requestPermissions();
      setHasPermission(granted);
      return granted;
    } finally {
      setIsLoadingPermission(false);
    }
  }, []);

  // Hàm gửi thông báo thử nghiệm
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    return await localNotificationService.sendTestNotification();
  }, []);

  return {
    hasPermission,
    isLoadingPermission,
    requestPermission,
    sendTestNotification,
    localNotificationService,
  };
};
