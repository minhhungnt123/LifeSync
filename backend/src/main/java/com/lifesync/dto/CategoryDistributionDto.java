package com.lifesync.dto;

import com.lifesync.entity.ScheduleCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDistributionDto {

    private ScheduleCategory category;
    private Double totalHours;
    private Long taskCount;
    private Double percentage;
}
