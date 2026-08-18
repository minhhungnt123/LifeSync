package com.lifesync.controller;

import com.lifesync.dto.ApiResponse;
import com.lifesync.dto.DashboardSummaryResponse;
import com.lifesync.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        DashboardSummaryResponse response = dashboardService.getDashboardSummary(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy dữ liệu tổng quan Dashboard thành công!"));
    }
}
