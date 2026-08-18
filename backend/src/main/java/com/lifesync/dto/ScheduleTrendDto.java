package com.lifesync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleTrendDto {

    private LocalDate date;
    private Long totalTasks;
    private Long completedTasks;
    private Double totalHours;
}
