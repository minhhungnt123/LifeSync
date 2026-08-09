package com.lifesync.service;

import com.lifesync.dto.ScheduleRequest;
import com.lifesync.dto.ScheduleResponse;
import com.lifesync.entity.ScheduleCategory;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleService {

    ScheduleResponse createSchedule(String userEmail, ScheduleRequest request);

    ScheduleResponse updateSchedule(String userEmail, Long scheduleId, ScheduleRequest request);

    void deleteSchedule(String userEmail, Long scheduleId);

    ScheduleResponse getScheduleById(String userEmail, Long scheduleId);

    List<ScheduleResponse> getUserSchedules(String userEmail, LocalDateTime start, LocalDateTime end, ScheduleCategory category);
}
