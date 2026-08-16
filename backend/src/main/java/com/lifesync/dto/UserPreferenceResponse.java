package com.lifesync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferenceResponse {
    private Long id;
    private Long userId;
    private String language;
    private String timeFormat;
    private String weekStartDay;
    private Boolean scheduleReminderEnabled;
    private Integer scheduleReminderMinutes;
    private Boolean mealReminderEnabled;
}
