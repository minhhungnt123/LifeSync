package com.lifesync.service.impl;

import com.lifesync.dto.NotificationResponse;
import com.lifesync.dto.UnreadNotificationCountResponse;
import com.lifesync.entity.Notification;
import com.lifesync.entity.NotificationType;
import com.lifesync.entity.User;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.NotificationRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String userEmail, Boolean unreadOnly, NotificationType type) {
        User user = getUserByEmail(userEmail);
        List<Notification> notifications;

        if (Boolean.TRUE.equals(unreadOnly)) {
            notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        } else if (type != null) {
            notifications = notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(user.getId(), type);
        } else {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }

        return notifications.stream()
                .map(this::mapToNotificationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UnreadNotificationCountResponse getUnreadCount(String userEmail) {
        User user = getUserByEmail(userEmail);
        Long count = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        return UnreadNotificationCountResponse.builder()
                .unreadCount(count)
                .build();
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(String userEmail, Long notificationId) {
        User user = getUserByEmail(userEmail);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo!"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Thông báo không thuộc sở hữu của người dùng này!");
        }

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToNotificationResponse(saved);
    }

    @Override
    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = getUserByEmail(userEmail);
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

    @Override
    @Transactional
    public void deleteNotification(String userEmail, Long notificationId) {
        User user = getUserByEmail(userEmail);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo!"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Thông báo không thuộc sở hữu của người dùng này!");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void createNotification(User user, String title, String content, NotificationType type, String referenceUrl) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .type(type)
                .isRead(false)
                .referenceUrl(referenceUrl)
                .build();
        notificationRepository.save(notification);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng!"));
    }

    private NotificationResponse mapToNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .referenceUrl(notification.getReferenceUrl())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
