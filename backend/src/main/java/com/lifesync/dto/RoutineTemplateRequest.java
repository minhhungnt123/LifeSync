package com.lifesync.dto;

import com.lifesync.entity.ScheduleCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineTemplateRequest {

    @NotBlank(message = "Tên thói quen không được để trống!")
    private String title;

    @NotNull(message = "Thời lượng không được để trống!")
    @Min(value = 5, message = "Thời lượng tối thiểu là 5 phút!")
    private Integer durationMinutes;

    @NotNull(message = "Danh mục không được để trống!")
    private ScheduleCategory category;
}
