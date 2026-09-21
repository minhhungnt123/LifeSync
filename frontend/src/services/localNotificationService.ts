import { Capacitor } from '@capacitor/core';
import {
  LocalNotifications,
  type PermissionStatus,
  type LocalNotificationSchema,
  type ActionPerformed,
} from '@capacitor/local-notifications';
import type { Schedule } from '../types/schedule';

/**
 * Định danh kênh thông báo Android (Notification Channels)
 */
export const NOTIFICATION_CHANNELS = {
  SCHEDULES: {
    id: 'lifesync_schedules',
    name: 'Nhắc nhở Lịch trình',
    description: 'Thông báo trước khi bắt đầu nhiệm vụ hoặc sự kiện trong lịch',
    importance: 4, // High importance (hiển thị popup trên màn hình & phát âm thanh)
    sound: 'res_custom_notification',
    vibration: true,
  },
  MEALS: {
    id: 'lifesync_meals',
    name: 'Nhắc nhở Bữa ăn',
    description: 'Thông báo nhắc nhở dùng bữa và ghi nhật ký dinh dưỡng đúng giờ',
    importance: 4,
    vibration: true,
  },
  WATER: {
    id: 'lifesync_health_water',
    name: 'Nhắc nhở Uống nước (2L/ngày)',
    description: 'Thông báo nhắc nhở uống đủ 2 lít nước mỗi ngày để duy trì sức khỏe',
    importance: 3, // Default importance
    vibration: true,
  },
} as const;

/**
 * Offset ID thông báo để tránh trùng lặp giữa các loại thông báo (32-bit integer)
 */
const ID_OFFSET = {
  SCHEDULE_BASE: 100_000,
  MEAL_BREAKFAST: 200_001,
  MEAL_LUNCH: 200_002,
  MEAL_DINNER: 200_003,
  WATER_SLOT_BASE: 300_000,
  TEST_NOTIFICATION: 999_999,
} as const;

/**
 * Các khung giờ vàng nhắc uống nước trong ngày (Mục tiêu 2 Lít: 5 lần x 400ml)
 */
export const WATER_REMINDER_TIMES = [
  { hour: 9, minute: 0, title: 'Bắt đầu ngày mới đầy năng lượng!', amount: '400ml' },
  { hour: 11, minute: 0, title: 'Cấp nước trước bữa trưa!', amount: '400ml' },
  { hour: 14, minute: 0, title: 'Tỉnh táo đầu giờ chiều!', amount: '400ml' },
  { hour: 16, minute: 0, title: 'Giải tỏa mệt mỏi cuối ngày làm việc!', amount: '400ml' },
  { hour: 20, minute: 0, title: 'Thư giãn buổi tối!', amount: '400ml' },
];

/**
 * Interface cho Local Notification Service
 * Tuân thủ Dependency Inversion Principle (DIP)
 */
export interface ILocalNotificationService {
  checkPermissions(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  initChannels(): Promise<void>;
  scheduleTaskReminder(schedule: Schedule, reminderMinutes?: number): Promise<boolean>;
  cancelScheduleReminder(scheduleId: number): Promise<void>;
  syncAllScheduleReminders(schedules: Schedule[], reminderMinutes: number, enabled: boolean): Promise<void>;
  syncMealDailyReminders(enabled: boolean): Promise<void>;
  syncWaterIntakeReminders(enabled: boolean): Promise<void>;
  sendTestNotification(): Promise<boolean>;
  setupNotificationActionListener(onNavigate: (route: string) => void): Promise<void>;
}

class LocalNotificationService implements ILocalNotificationService {
  private isInitialized = false;
  private isNative = Capacitor.isNativePlatform();

  /**
   * Khởi tạo kênh thông báo Android (Notification Channels)
   */
  public async initChannels(): Promise<void> {
    if (this.isInitialized) return;

    if (this.isNative) {
      try {
        await LocalNotifications.createChannel({
          id: NOTIFICATION_CHANNELS.SCHEDULES.id,
          name: NOTIFICATION_CHANNELS.SCHEDULES.name,
          description: NOTIFICATION_CHANNELS.SCHEDULES.description,
          importance: NOTIFICATION_CHANNELS.SCHEDULES.importance,
          vibration: NOTIFICATION_CHANNELS.SCHEDULES.vibration,
        });

        await LocalNotifications.createChannel({
          id: NOTIFICATION_CHANNELS.MEALS.id,
          name: NOTIFICATION_CHANNELS.MEALS.name,
          description: NOTIFICATION_CHANNELS.MEALS.description,
          importance: NOTIFICATION_CHANNELS.MEALS.importance,
          vibration: NOTIFICATION_CHANNELS.MEALS.vibration,
        });

        await LocalNotifications.createChannel({
          id: NOTIFICATION_CHANNELS.WATER.id,
          name: NOTIFICATION_CHANNELS.WATER.name,
          description: NOTIFICATION_CHANNELS.WATER.description,
          importance: NOTIFICATION_CHANNELS.WATER.importance,
          vibration: NOTIFICATION_CHANNELS.WATER.vibration,
        });
      } catch (error) {
        console.warn('[LocalNotificationService] Lỗi tạo Notification Channels:', error);
      }
    }

    this.isInitialized = true;
  }

  /**
   * Kiểm tra quyền hiển thị thông báo
   */
  public async checkPermissions(): Promise<boolean> {
    if (this.isNative) {
      try {
        const status: PermissionStatus = await LocalNotifications.checkPermissions();
        return status.display === 'granted';
      } catch (error) {
        console.warn('[LocalNotificationService] Lỗi kiểm tra quyền native:', error);
        return false;
      }
    }

    // Web Fallback
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }

    return false;
  }

  /**
   * Yêu cầu người dùng cấp quyền thông báo
   */
  public async requestPermissions(): Promise<boolean> {
    if (this.isNative) {
      try {
        const status: PermissionStatus = await LocalNotifications.requestPermissions();
        return status.display === 'granted';
      } catch (error) {
        console.warn('[LocalNotificationService] Lỗi xin cấp quyền native:', error);
        return false;
      }
    }

    // Web Fallback
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Đặt thông báo nhắc nhở cho một lịch trình cụ thể
   */
  public async scheduleTaskReminder(schedule: Schedule, reminderMinutes = 15): Promise<boolean> {
    if (!schedule.startTime) return false;

    const startDate = new Date(schedule.startTime);
    const triggerDate = new Date(startDate.getTime() - reminderMinutes * 60 * 1000);
    const now = new Date();

    // Không lập lịch cho các sự kiện đã qua trong quá khứ
    if (triggerDate <= now) {
      return false;
    }

    const notificationId = ID_OFFSET.SCHEDULE_BASE + (schedule.id % 90_000);

    if (this.isNative) {
      try {
        await this.initChannels();
        const notification: LocalNotificationSchema = {
          id: notificationId,
          title: `⏰ Nhắc nhở lịch: ${schedule.title}`,
          body: `Sắp diễn ra sau ${reminderMinutes} phút (${startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`,
          schedule: { at: triggerDate, allowWhileIdle: true },
          channelId: NOTIFICATION_CHANNELS.SCHEDULES.id,
          extra: {
            route: '/schedule',
            scheduleId: schedule.id,
          },
        };

        await LocalNotifications.schedule({ notifications: [notification] });
        return true;
      } catch (error) {
        console.warn('[LocalNotificationService] Không thể lên lịch thông báo native:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * Hủy thông báo của một lịch trình
   */
  public async cancelScheduleReminder(scheduleId: number): Promise<void> {
    const notificationId = ID_OFFSET.SCHEDULE_BASE + (scheduleId % 90_000);
    if (this.isNative) {
      try {
        await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
      } catch (error) {
        console.warn('[LocalNotificationService] Lỗi hủy thông báo schedule:', error);
      }
    }
  }

  /**
   * Quét và đồng bộ toàn bộ lịch trình sắp diễn ra (trong 7 ngày tới)
   */
  public async syncAllScheduleReminders(
    schedules: Schedule[],
    reminderMinutes = 15,
    enabled = true
  ): Promise<void> {
    if (!this.isNative) return;

    try {
      await this.initChannels();

      // Nếu người dùng tắt tính năng thông báo lịch, hủy toàn bộ thông báo lịch hiện có
      if (!enabled) {
        const pending = await LocalNotifications.getPending();
        const scheduleNotifications = pending.notifications.filter(
          (n) => n.id >= ID_OFFSET.SCHEDULE_BASE && n.id < ID_OFFSET.MEAL_BREAKFAST
        );
        if (scheduleNotifications.length > 0) {
          await LocalNotifications.cancel({ notifications: scheduleNotifications });
        }
        return;
      }

      const now = new Date();
      const maxFutureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 ngày tới

      const notificationsToSchedule: LocalNotificationSchema[] = [];

      for (const schedule of schedules) {
        // Bỏ qua lịch đã hoàn thành hoặc hủy
        if (schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED') {
          continue;
        }

        const startDate = new Date(schedule.startTime);
        const triggerDate = new Date(startDate.getTime() - reminderMinutes * 60 * 1000);

        // Chỉ lập lịch cho các sự kiện sắp tới trong vòng 7 ngày
        if (triggerDate > now && triggerDate <= maxFutureDate) {
          notificationsToSchedule.push({
            id: ID_OFFSET.SCHEDULE_BASE + (schedule.id % 90_000),
            title: `⏰ Sắp diễn ra: ${schedule.title}`,
            body: `Bắt đầu lúc ${startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} (sau ${reminderMinutes} phút)`,
            schedule: { at: triggerDate, allowWhileIdle: true },
            channelId: NOTIFICATION_CHANNELS.SCHEDULES.id,
            extra: {
              route: '/schedule',
              scheduleId: schedule.id,
            },
          });
        }
      }

      if (notificationsToSchedule.length > 0) {
        // Giới hạn tối đa 40 thông báo để đảm bảo an toàn với quota hệ điều hành Android
        const batch = notificationsToSchedule.slice(0, 40);
        await LocalNotifications.schedule({ notifications: batch });
      }
    } catch (error) {
      console.warn('[LocalNotificationService] Lỗi đồng bộ toàn bộ lịch trình:', error);
    }
  }

  /**
   * Đặt lịch thông báo nhắc nhở 3 bữa ăn hàng ngày (Sáng, Trưa, Tối)
   */
  public async syncMealDailyReminders(enabled: boolean): Promise<void> {
    if (!this.isNative) return;

    try {
      await this.initChannels();

      // Hủy thông báo bữa ăn cũ
      await LocalNotifications.cancel({
        notifications: [
          { id: ID_OFFSET.MEAL_BREAKFAST },
          { id: ID_OFFSET.MEAL_LUNCH },
          { id: ID_OFFSET.MEAL_DINNER },
        ],
      });

      if (!enabled) return;

      const mealSchedules: LocalNotificationSchema[] = [
        {
          id: ID_OFFSET.MEAL_BREAKFAST,
          title: '🍳 Đã đến giờ ăn sáng!',
          body: 'Hãy nạp đủ năng lượng cho một ngày mới hiệu quả và ghi lại món ăn nhé!',
          schedule: {
            on: { hour: 7, minute: 30 },
            allowWhileIdle: true,
          },
          channelId: NOTIFICATION_CHANNELS.MEALS.id,
          extra: { route: '/meals' },
        },
        {
          id: ID_OFFSET.MEAL_LUNCH,
          title: '🥗 Giờ nghỉ trưa và dùng bữa!',
          body: 'Bổ sung dinh dưỡng cân bằng và kiểm tra mức calo cùng LifeSync AI.',
          schedule: {
            on: { hour: 12, minute: 0 },
            allowWhileIdle: true,
          },
          channelId: NOTIFICATION_CHANNELS.MEALS.id,
          extra: { route: '/meals' },
        },
        {
          id: ID_OFFSET.MEAL_DINNER,
          title: '🍲 Bữa tối nhẹ nhàng!',
          body: 'Đã đến giờ ăn tối. Hãy quét ảnh món ăn với AI Food Scanner để ghi nhật ký nhanh!',
          schedule: {
            on: { hour: 18, minute: 30 },
            allowWhileIdle: true,
          },
          channelId: NOTIFICATION_CHANNELS.MEALS.id,
          extra: { route: '/meals' },
        },
      ];

      await LocalNotifications.schedule({ notifications: mealSchedules });
    } catch (error) {
      console.warn('[LocalNotificationService] Lỗi đồng bộ thông báo bữa ăn:', error);
    }
  }

  /**
   * Đặt lịch nhắc nhở uống đủ 2 lít nước mỗi ngày (5 khung giờ x 400ml)
   */
  public async syncWaterIntakeReminders(enabled: boolean): Promise<void> {
    if (!this.isNative) return;

    try {
      await this.initChannels();

      // Hủy thông báo uống nước cũ
      const cancelIds = WATER_REMINDER_TIMES.map((_, index) => ({
        id: ID_OFFSET.WATER_SLOT_BASE + index + 1,
      }));
      await LocalNotifications.cancel({ notifications: cancelIds });

      if (!enabled) return;

      const waterNotifications: LocalNotificationSchema[] = WATER_REMINDER_TIMES.map((slot, index) => ({
        id: ID_OFFSET.WATER_SLOT_BASE + index + 1,
        title: `💧 Uống nước thôi! (${slot.amount})`,
        body: `${slot.title} Mục tiêu hôm nay là 2L để luôn khỏe mạnh và tỉnh táo.`,
        schedule: {
          on: { hour: slot.hour, minute: slot.minute },
          allowWhileIdle: true,
        },
        channelId: NOTIFICATION_CHANNELS.WATER.id,
        extra: { route: '/dashboard' },
      }));

      await LocalNotifications.schedule({ notifications: waterNotifications });
    } catch (error) {
      console.warn('[LocalNotificationService] Lỗi đồng bộ thông báo uống nước:', error);
    }
  }

  /**
   * Gửi thông báo kiểm thử tức thì (kích hoạt sau 3 giây)
   */
  public async sendTestNotification(): Promise<boolean> {
    const hasPerm = await this.checkPermissions();
    if (!hasPerm) {
      const granted = await this.requestPermissions();
      if (!granted) return false;
    }

    if (this.isNative) {
      try {
        await this.initChannels();
        const testDate = new Date(Date.now() + 3000); // 3 giây nữa
        await LocalNotifications.schedule({
          notifications: [
            {
              id: ID_OFFSET.TEST_NOTIFICATION,
              title: '🔔 Thông báo thử nghiệm LifeSync',
              body: 'Hệ thống thông báo cục bộ native trên thiết bị hoạt động hoàn hảo! Chạm vào để kiểm tra.',
              schedule: { at: testDate, allowWhileIdle: true },
              channelId: NOTIFICATION_CHANNELS.SCHEDULES.id,
              extra: { route: '/settings' },
            },
          ],
        });
        return true;
      } catch (error) {
        console.warn('[LocalNotificationService] Lỗi gửi thông báo test native:', error);
        return false;
      }
    }

    // Web Fallback
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          new Notification('🔔 Thông báo thử nghiệm LifeSync (Web)', {
            body: 'Hệ thống thông báo hoạt động tốt trên trình duyệt!',
            icon: '/favicon.ico',
          });
          return true;
        }
      } catch (err) {
        console.warn('[LocalNotificationService] Web notification error:', err);
      }
    }

    return false;
  }

  /**
   * Lắng nghe sự kiện người dùng nhấn vào thông báo (Action Performed) để Deep Link
   */
  public async setupNotificationActionListener(onNavigate: (route: string) => void): Promise<void> {
    if (!this.isNative) return;

    try {
      await LocalNotifications.addListener(
        'localNotificationActionPerformed',
        (action: ActionPerformed) => {
          const route = action.notification?.extra?.route;
          if (route && typeof route === 'string') {
            onNavigate(route);
          }
        }
      );
    } catch (error) {
      console.warn('[LocalNotificationService] Lỗi đăng ký notification action listener:', error);
    }
  }
}

export const localNotificationService: ILocalNotificationService = new LocalNotificationService();
