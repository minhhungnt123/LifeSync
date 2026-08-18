package com.lifesync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private Integer todayScheduleCount;
    private Integer completedScheduleCount;
    private Double completionRate;
    private Double totalWorkHoursToday;

    private Double todayCalories;
    private Double targetCalories;
    private Double todayProtein;
    private Double todayCarbs;
    private Double todayFat;

    private List<CategoryDistributionDto> categoryDistribution;
    private List<NutritionTrendDto> nutritionTrends;
    private List<ScheduleTrendDto> scheduleTrends;
}
