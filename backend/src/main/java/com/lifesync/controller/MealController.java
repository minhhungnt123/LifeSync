package com.lifesync.controller;

import com.lifesync.dto.ApiResponse;
import com.lifesync.dto.DailyNutritionSummaryResponse;
import com.lifesync.dto.MealLogRequest;
import com.lifesync.dto.MealLogResponse;
import com.lifesync.service.MealService;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "Meal Management", description = "Quản lý nhật ký ăn uống, thành phần Calo, phân bổ Macros (Protein/Carbs/Fat) và tổng hợp dinh dưỡng ngày")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/api/v1/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @Operation(summary = "Ghi nhận bữa ăn mới", description = "Lưu thông tin món ăn, loại bữa (Sáng/Trưa/Tối/Phụ), lượng Calo và các chỉ số dinh dưỡng")
    @PostMapping
    public ResponseEntity<ApiResponse<MealLogResponse>> createMealLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MealLogRequest request) {
        MealLogResponse response = mealService.createMealLog(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Ghi nhận bữa ăn thành công!"));
    }

    @Operation(summary = "Lấy danh sách bữa ăn", description = "Lấy lịch sử bữa ăn của người dùng, lọc theo ngày cụ thể hoặc khoảng thời gian")
    @GetMapping
    public ResponseEntity<ApiResponse<List<MealLogResponse>>> getUserMealLogs(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<MealLogResponse> responses = mealService.getUserMealLogs(userDetails.getUsername(), date, start, end);
        return ResponseEntity.ok(ApiResponse.success(responses, "Lấy danh sách bữa ăn thành công!"));
    }

    @Operation(summary = "Lấy chi tiết bữa ăn", description = "Lấy thông tin chi tiết một món ăn / bữa ăn đã ghi theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MealLogResponse>> getMealLogById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        MealLogResponse response = mealService.getMealLogById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy chi tiết bữa ăn thành công!"));
    }

    @Operation(summary = "Cập nhật bữa ăn", description = "Chỉnh sửa món ăn, khẩu phần, Calo hoặc chỉ số dinh dưỡng của bữa ăn theo ID")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MealLogResponse>> updateMealLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody MealLogRequest request) {
        MealLogResponse response = mealService.updateMealLog(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật bữa ăn thành công!"));
    }

    @Operation(summary = "Xóa nhật ký bữa ăn", description = "Xóa một bản ghi bữa ăn khỏi hệ thống theo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMealLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        mealService.deleteMealLog(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa nhật ký bữa ăn thành công!"));
    }

    @Operation(summary = "Lấy tổng hợp dinh dưỡng trong ngày", description = "Tính tổng Calo, Protein, Carbs, Fat đã nạp trong ngày và so sánh với chỉ số TDEE mục tiêu")
    @GetMapping("/summary/daily")
    public ResponseEntity<ApiResponse<DailyNutritionSummaryResponse>> getDailyNutritionSummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DailyNutritionSummaryResponse response = mealService.getDailyNutritionSummary(userDetails.getUsername(), date);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy tổng hợp dinh dưỡng trong ngày thành công!"));
    }
}
