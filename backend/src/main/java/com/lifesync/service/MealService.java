package com.lifesync.service;

import com.lifesync.dto.DailyNutritionSummaryResponse;
import com.lifesync.dto.MealLogRequest;
import com.lifesync.dto.MealLogResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface MealService {

    MealLogResponse createMealLog(String userEmail, MealLogRequest request);

    MealLogResponse updateMealLog(String userEmail, Long mealLogId, MealLogRequest request);

    void deleteMealLog(String userEmail, Long mealLogId);

    MealLogResponse getMealLogById(String userEmail, Long mealLogId);

    List<MealLogResponse> getUserMealLogs(String userEmail, LocalDate date, LocalDateTime start, LocalDateTime end);

    DailyNutritionSummaryResponse getDailyNutritionSummary(String userEmail, LocalDate date);
}
