package com.lifesync.controller;

import com.lifesync.dto.ApiResponse;
import com.lifesync.dto.NotificationResponse;
import com.lifesync.dto.UnreadNotificationCountResponse;
import com.lifesync.entity.NotificationType;
import com.lifesync.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Notifications", description = "Trung tâm thông báo người dùng, cảnh báo lịch trình, nhắc nhở bữa ăn và đếm số lượng chưa đọc")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Lấy danh sách thông báo", description = "Lấy toàn bộ thông báo của người dùng, hỗ trợ lọc theo trạng thái chưa đọc hoặc loại thông báo")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Boolean unreadOnly,
            @RequestParam(required = false) NotificationType type) {
        List<NotificationResponse> responses = notificationService.getUserNotifications(
                userDetails.getUsername(), unreadOnly, type);
        return ResponseEntity.ok(ApiResponse.success(responses, "Lấy danh sách thông báo thành công!"));
    }

    @Operation(summary = "Lấy số lượng thông báo chưa đọc", description = "Đếm tổng số thông báo chưa đọc để hiển thị badge trên thanh điều hướng")
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadNotificationCountResponse>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        UnreadNotificationCountResponse response = notificationService.getUnreadCount(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy số lượng thông báo chưa đọc thành công!"));
    }

    @Operation(summary = "Đánh dấu một thông báo đã đọc", description = "Cập nhật trạng thái đã đọc cho thông báo theo ID")
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        NotificationResponse response = notificationService.markAsRead(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(response, "Đánh dấu thông báo đã đọc!"));
    }

    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc", description = "Chuyển tất cả thông báo của người dùng sang trạng thái đã đọc")
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Đánh dấu tất cả thông báo là đã đọc!"));
    }

    @Operation(summary = "Xóa thông báo", description = "Xóa một thông báo theo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        notificationService.deleteNotification(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa thông báo thành công!"));
    }
}
