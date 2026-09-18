package com.lifesync.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferenceUpdateRequest {

    @Pattern(regexp = "^(vi|en)$", message = "Ngôn ngữ được hỗ trợ là 'vi' hoặc 'en'!")
    private String language;

    @Pattern(regexp = "^(12h|24h)$", message = "Định dạng thời gian phải là '12h' hoặc '24h'!")
    private String timeFormat;

    @Pattern(regexp = "^(MONDAY|SUNDAY)$", message = "Ngày bắt đầu tuần phải là 'MONDAY' hoặc 'SUNDAY'!")
    private String weekStartDay;

    private Boolean scheduleReminderEnabled;

    @Min(value = 1, message = "Thời gian nhắc nhở tối thiểu là 1 phút!")
    @Max(value = 1440, message = "Thời gian nhắc nhở tối đa là 1440 phút (24 giờ)!")
    private Integer scheduleReminderMinutes;

    private Boolean mealReminderEnabled;
}

