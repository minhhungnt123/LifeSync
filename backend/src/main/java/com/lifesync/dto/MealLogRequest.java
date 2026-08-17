package com.lifesync.dto;

import com.lifesync.entity.MealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealLogRequest {

    @NotNull(message = "Loại bữa ăn không được để trống!")
    private MealType mealType;

    @NotBlank(message = "Tên món ăn không được để trống!")
    private String foodName;

    @NotNull(message = "Lượng Calorie không được để trống!")
    @PositiveOrZero(message = "Lượng Calorie phải lớn hơn hoặc bằng 0!")
    private Double calories;

    @PositiveOrZero(message = "Lượng Protein phải lớn hơn hoặc bằng 0!")
    private Double protein;

    @PositiveOrZero(message = "Lượng Carbs phải lớn hơn hoặc bằng 0!")
    private Double carbs;

    @PositiveOrZero(message = "Lượng Fat phải lớn hơn hoặc bằng 0!")
    private Double fat;

    @NotNull(message = "Thời gian ghi nhận bữa ăn không được để trống!")
    private LocalDateTime loggedAt;
}
