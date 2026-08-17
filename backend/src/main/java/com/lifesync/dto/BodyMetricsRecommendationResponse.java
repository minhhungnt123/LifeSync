package com.lifesync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BodyMetricsRecommendationResponse {
    private Double heightCm;
    private Double weightKg;
    private Double targetWeightKg;
    private Double bmi;
    private String bmiStatus;
    private Double bmr;
    private Double tdee;
    private Integer recommendedDailyCalories;
    private String activityLevel;
}
