package com.lifesync.controller;

import com.lifesync.dto.ApiResponse;
import com.lifesync.dto.DailyNutritionSummaryResponse;
import com.lifesync.dto.MealLogRequest;
import com.lifesync.dto.MealLogResponse;
import com.lifesync.service.MealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @PostMapping
    public ResponseEntity<ApiResponse<MealLogResponse>> createMealLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MealLogRequest request) {
        MealLogResponse response = mealService.createMealLog(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Ghi nhận bữa ăn thành công!"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MealLogResponse>>> getUserMealLogs(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<MealLogResponse> responses = mealService.getUserMealLogs(userDetails.getUsername(), date, start, end);
        return ResponseEntity.ok(ApiResponse.success(responses, "Lấy danh sách bữa ăn thành công!"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MealLogResponse>> getMealLogById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        MealLogResponse response = mealService.getMealLogById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy chi tiết bữa ăn thành công!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MealLogResponse>> updateMealLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody MealLogRequest request) {
        MealLogResponse response = mealService.updateMealLog(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật bữa ăn thành công!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMealLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        mealService.deleteMealLog(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa nhật ký bữa ăn thành công!"));
    }

    @GetMapping("/summary/daily")
    public ResponseEntity<ApiResponse<DailyNutritionSummaryResponse>> getDailyNutritionSummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DailyNutritionSummaryResponse response = mealService.getDailyNutritionSummary(userDetails.getUsername(), date);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy tổng hợp dinh dưỡng trong ngày thành công!"));
    }
}
