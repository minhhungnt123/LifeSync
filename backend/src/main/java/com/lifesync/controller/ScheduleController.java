package com.lifesync.controller;

import com.lifesync.dto.ApiResponse;
import com.lifesync.dto.ScheduleRequest;
import com.lifesync.dto.ScheduleResponse;
import com.lifesync.entity.ScheduleCategory;
import com.lifesync.service.ScheduleService;
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

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ScheduleRequest request) {
        ScheduleResponse response = scheduleService.createSchedule(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tạo lịch trình thành công!"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getUserSchedules(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) ScheduleCategory category) {
        List<ScheduleResponse> responses = scheduleService.getUserSchedules(userDetails.getUsername(), start, end, category);
        return ResponseEntity.ok(ApiResponse.success(responses, "Lấy danh sách lịch trình thành công!"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> getScheduleById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        ScheduleResponse response = scheduleService.getScheduleById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy chi tiết lịch trình thành công!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ScheduleRequest request) {
        ScheduleResponse response = scheduleService.updateSchedule(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật lịch trình thành công!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        scheduleService.deleteSchedule(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa lịch trình thành công!"));
    }
}
