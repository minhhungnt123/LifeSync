package com.lifesync.service;

import com.lifesync.dto.NotificationResponse;
import com.lifesync.dto.UnreadNotificationCountResponse;
import com.lifesync.entity.Notification;
import com.lifesync.entity.NotificationType;
import com.lifesync.entity.User;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.NotificationRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User user;
    private Notification notification;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@lifesync.ai")
                .fullName("Nguyễn Minh Hùng")
                .build();

        notification = Notification.builder()
                .id(100L)
                .user(user)
                .title("Nhắc nhở họp")
                .content("Bạn có cuộc họp vào 10:00")
                .type(NotificationType.SCHEDULE_REMINDER)
                .isRead(false)
                .build();
    }

    @Test
    @DisplayName("Lấy danh sách thông báo của người dùng thành công")
    void getUserNotifications_Success() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()))
                .thenReturn(List.of(notification));

        List<NotificationResponse> responses = notificationService.getUserNotifications(user.getEmail(), false, null);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Nhắc nhở họp", responses.get(0).getTitle());
    }

    @Test
    @DisplayName("Lấy số lượng thông báo chưa đọc")
    void getUnreadCount_Success() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(notificationRepository.countByUserIdAndIsReadFalse(user.getId())).thenReturn(3L);

        UnreadNotificationCountResponse response = notificationService.getUnreadCount(user.getEmail());

        assertNotNull(response);
        assertEquals(3L, response.getUnreadCount());
    }

    @Test
    @DisplayName("Đánh dấu thông báo đã đọc")
    void markAsRead_Success() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(notificationRepository.findById(notification.getId())).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        NotificationResponse response = notificationService.markAsRead(user.getEmail(), notification.getId());

        assertNotNull(response);
        assertTrue(response.getIsRead());
    }

    @Test
    @DisplayName("Xóa thông báo thành công")
    void deleteNotification_Success() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(notificationRepository.findById(notification.getId())).thenReturn(Optional.of(notification));

        assertDoesNotThrow(() -> notificationService.deleteNotification(user.getEmail(), notification.getId()));
        verify(notificationRepository, times(1)).delete(notification);
    }
}
