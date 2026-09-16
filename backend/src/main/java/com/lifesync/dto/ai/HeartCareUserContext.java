package com.lifesync.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Data transfer object encapsulating all aggregated user context for the Heartcare AI Assistant.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeartCareUserContext {

    // 1. User Profile & Biometrics
    private String fullName;
    private String gender;
    private Integer age;
    private Double heightCm;
    private Double weightKg;
    private Double targetWeightKg;
    private Double bmi;
    private String bmiStatus;
    private Double bmr;
    private Double tdee;
    private String activityLevel;

    // 2. Nutrition Context
    @Builder.Default
    private Double todayCalories = 0.0;
    @Builder.Default
    private Double sevenDayAvgCalories = 0.0;
    @Builder.Default
    private Double calorieBalanceVsTdee = 0.0;
    @Builder.Default
    private List<MealItemSummary> recentMeals = new ArrayList<>();

    // 3. Workload & Stress Context
    @Builder.Default
    private Long todayWorkloadMinutes = 0L;
    @Builder.Default
    private Long sevenDayAvgWorkloadMinutes = 0L;
    @Builder.Default
    private Integer urgentOrHighTaskCount = 0;
    @Builder.Default
    private String stressLevel = "LOW"; // LOW, MEDIUM, HIGH, OVERLOAD
    @Builder.Default
    private List<ScheduleItemSummary> upcomingSchedules = new ArrayList<>();

    // 4. Formatted Markdown Context String for Prompt Injection
    private String formattedPromptContext;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealItemSummary {
        private String foodName;
        private String mealType;
        private Double calories;
        private Double protein;
        private Double carbs;
        private Double fat;
        private LocalDateTime loggedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleItemSummary {
        private String title;
        private String category;
        private String priority;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
    }
}
