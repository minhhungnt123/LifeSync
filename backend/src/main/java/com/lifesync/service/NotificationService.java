package com.lifesync.service;

import com.lifesync.dto.NotificationResponse;
import com.lifesync.dto.UnreadNotificationCountResponse;
import com.lifesync.entity.NotificationType;
import com.lifesync.entity.User;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getUserNotifications(String userEmail, Boolean unreadOnly, NotificationType type);
    UnreadNotificationCountResponse getUnreadCount(String userEmail);
    NotificationResponse markAsRead(String userEmail, Long notificationId);
    void markAllAsRead(String userEmail);
    void deleteNotification(String userEmail, Long notificationId);
    void createNotification(User user, String title, String content, NotificationType type, String referenceUrl);
}
