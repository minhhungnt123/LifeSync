package com.lifesync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyNutritionSummaryResponse {

    private LocalDate date;
    private Double totalCalories;
    private Double totalProtein;
    private Double totalCarbs;
    private Double totalFat;
    private Integer mealCount;
    private List<MealLogResponse> meals;
}
