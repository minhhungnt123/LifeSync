package com.lifesync.dto;

import com.lifesync.entity.ScheduleCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineTemplateResponse {

    private Long id;
    private String title;
    private Integer durationMinutes;
    private ScheduleCategory category;
    private LocalDateTime createdAt;
}
