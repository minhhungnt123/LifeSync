package com.lifesync.controller;

import com.lifesync.dto.ApiResponse;
import com.lifesync.dto.DashboardSummaryResponse;
import com.lifesync.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard & Analytics", description = "Trực quan hóa và tổng hợp dữ liệu hiệu suất thời gian, hoàn thành công việc và dinh dưỡng")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Lấy dữ liệu tổng quan Dashboard", description = "Tổng hợp tổng số giờ làm việc, calo tiêu thụ, tỷ lệ hoàn thành lịch trình và biểu đồ dinh dưỡng 7 ngày gần nhất")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        DashboardSummaryResponse response = dashboardService.getDashboardSummary(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy dữ liệu tổng quan Dashboard thành công!"));
    }
}
