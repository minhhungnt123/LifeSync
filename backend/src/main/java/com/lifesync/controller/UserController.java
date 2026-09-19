package com.lifesync.controller;

import com.lifesync.dto.*;
import com.lifesync.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User Profile & Settings", description = "Quản lý thông tin cá nhân, hồ sơ sức khỏe (BMI/TDEE), cài đặt tài khoản, đổi mật khẩu và xuất dữ liệu")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Lấy thông tin hồ sơ cá nhân", description = "Trả về chi tiết hồ sơ cá nhân, ngày sinh, giới tính, chiều cao, cân nặng, mục tiêu hoạt động")
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponse response = userService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy thông tin hồ sơ thành công!"));
    }

    @Operation(summary = "Cập nhật thông tin hồ sơ cá nhân", description = "Cập nhật chiều cao, cân nặng, giới tính, mức độ hoạt động và tính toán lại BMI/TDEE")
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        UserProfileResponse response = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật thông tin hồ sơ thành công!"));
    }

    @Operation(summary = "Lấy thông tin cài đặt người dùng", description = "Lấy các tùy chọn giao diện Theme, thông báo và quyền riêng tư")
    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferenceResponse>> getPreference(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserPreferenceResponse response = userService.getPreference(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy thông tin cài đặt thành công!"));
    }

    @Operation(summary = "Cập nhật cài đặt người dùng", description = "Thay đổi cấu hình Theme sáng/tối, bật/tắt thông báo và chế độ riêng tư")
    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferenceResponse>> updatePreference(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserPreferenceUpdateRequest request) {
        UserPreferenceResponse response = userService.updatePreference(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật cài đặt thành công!"));
    }

    @Operation(summary = "Lấy khuyến nghị chỉ số thể chất (BMI/TDEE)", description = "Tính toán chỉ số khối cơ thể BMI, mức tiêu hao năng lượng TDEE và đề xuất mức calo mục tiêu mỗi ngày")
    @GetMapping("/body-metrics/recommendation")
    public ResponseEntity<ApiResponse<BodyMetricsRecommendationResponse>> getBodyMetricsRecommendation(
            @AuthenticationPrincipal UserDetails userDetails) {
        BodyMetricsRecommendationResponse response = userService.getBodyMetricsRecommendation(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy khuyến nghị chỉ số thể chất thành công!"));
    }

    @Operation(summary = "Đổi mật khẩu tài khoản", description = "Xác nhận mật khẩu cũ và cập nhật mật khẩu mới")
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Đổi mật khẩu thành công!"));
    }

    @Operation(summary = "Trích xuất toàn bộ dữ liệu cá nhân", description = "Xuất trọn bộ lịch trình, nhật ký ăn uống và cài đặt cá nhân của người dùng")
    @GetMapping("/export-data")
    public ResponseEntity<ApiResponse<UserDataExportResponse>> exportUserData(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserDataExportResponse response = userService.exportUserData(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Trích xuất dữ liệu cá nhân thành công!"));
    }
}
