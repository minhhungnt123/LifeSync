package com.lifesync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDataExportResponse {
    private UserProfileResponse profile;
    private UserPreferenceResponse preference;
    private List<ScheduleResponse> schedules;
    private List<NotificationResponse> notifications;
    private LocalDateTime exportedAt;
}
