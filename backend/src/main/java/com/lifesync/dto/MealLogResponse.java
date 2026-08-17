package com.lifesync.dto;

import com.lifesync.entity.MealType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealLogResponse {

    private Long id;
    private Long userId;
    private MealType mealType;
    private String foodName;
    private Double calories;
    private Double protein;
    private Double carbs;
    private Double fat;
    private LocalDateTime loggedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
