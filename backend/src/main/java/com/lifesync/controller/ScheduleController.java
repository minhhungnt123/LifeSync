package com.lifesync.controller;

import com.lifesync.dto.ApiResponse;
import com.lifesync.dto.ScheduleRequest;
import com.lifesync.dto.ScheduleResponse;
import com.lifesync.entity.ScheduleCategory;
import com.lifesync.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "Schedule Management", description = "Quản lý lịch trình cá nhân, tạo/sửa/xóa sự kiện, lọc theo danh mục và khoảng thời gian")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Operation(summary = "Tạo lịch trình mới", description = "Tạo mới một lịch trình với tiêu đề, thời gian bắt đầu, kết thúc, danh mục và độ ưu tiên")
    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ScheduleRequest request) {
        ScheduleResponse response = scheduleService.createSchedule(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tạo lịch trình thành công!"));
    }

    @Operation(summary = "Lấy danh sách lịch trình", description = "Lấy danh sách lịch trình của người dùng, hỗ trợ lọc theo khoảng thời gian start/end và phân loại danh mục")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getUserSchedules(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) ScheduleCategory category) {
        List<ScheduleResponse> responses = scheduleService.getUserSchedules(userDetails.getUsername(), start, end, category);
        return ResponseEntity.ok(ApiResponse.success(responses, "Lấy danh sách lịch trình thành công!"));
    }

    @Operation(summary = "Lấy chi tiết lịch trình", description = "Lấy thông tin chi tiết một lịch trình theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> getScheduleById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        ScheduleResponse response = scheduleService.getScheduleById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy chi tiết lịch trình thành công!"));
    }

    @Operation(summary = "Cập nhật lịch trình", description = "Cập nhật thông tin, thời gian hoặc danh mục của một lịch trình hiện có")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ScheduleRequest request) {
        ScheduleResponse response = scheduleService.updateSchedule(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật lịch trình thành công!"));
    }

    @Operation(summary = "Xóa lịch trình", description = "Xóa bỏ một lịch trình theo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        scheduleService.deleteSchedule(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa lịch trình thành công!"));
    }
}
