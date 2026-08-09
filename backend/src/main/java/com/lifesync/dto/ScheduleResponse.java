package com.lifesync.dto;

import com.lifesync.entity.ScheduleCategory;
import com.lifesync.entity.SchedulePriority;
import com.lifesync.entity.ScheduleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {

    private Long id;
    private Long userId;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ScheduleCategory category;
    private ScheduleStatus status;
    private SchedulePriority priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private boolean hasOverlap;
    private String overlapWarning;
}
