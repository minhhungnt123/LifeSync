package com.lifesync.controller;

import com.lifesync.dto.*;
import com.lifesync.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponse response = userService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy thông tin hồ sơ thành công!"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        UserProfileResponse response = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật thông tin hồ sơ thành công!"));
    }

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferenceResponse>> getPreference(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserPreferenceResponse response = userService.getPreference(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy thông tin cài đặt thành công!"));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferenceResponse>> updatePreference(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserPreferenceUpdateRequest request) {
        UserPreferenceResponse response = userService.updatePreference(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật cài đặt thành công!"));
    }

    @GetMapping("/body-metrics/recommendation")
    public ResponseEntity<ApiResponse<BodyMetricsRecommendationResponse>> getBodyMetricsRecommendation(
            @AuthenticationPrincipal UserDetails userDetails) {
        BodyMetricsRecommendationResponse response = userService.getBodyMetricsRecommendation(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy khuyến nghị chỉ số thể chất thành công!"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Đổi mật khẩu thành công!"));
    }

    @GetMapping("/export-data")
    public ResponseEntity<ApiResponse<UserDataExportResponse>> exportUserData(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserDataExportResponse response = userService.exportUserData(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Trích xuất dữ liệu cá nhân thành công!"));
    }
}
