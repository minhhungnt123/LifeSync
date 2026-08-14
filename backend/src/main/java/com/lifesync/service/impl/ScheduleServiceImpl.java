package com.lifesync.service.impl;

import com.lifesync.dto.ScheduleRequest;
import com.lifesync.dto.ScheduleResponse;
import com.lifesync.entity.Schedule;
import com.lifesync.entity.ScheduleCategory;
import com.lifesync.entity.SchedulePriority;
import com.lifesync.entity.ScheduleStatus;
import com.lifesync.entity.User;
import com.lifesync.exception.BadRequestException;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.ScheduleRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ScheduleResponse createSchedule(String userEmail, ScheduleRequest request) {
        User user = getUserByEmail(userEmail);
        validateTimeRange(request.getStartTime(), request.getEndTime());

        ScheduleStatus status = request.getStatus() != null ? request.getStatus() : ScheduleStatus.PENDING;
        SchedulePriority priority = request.getPriority() != null ? request.getPriority() : SchedulePriority.MEDIUM;

        Schedule schedule = Schedule.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .category(request.getCategory())
                .status(status)
                .priority(priority)
                .build();

        Schedule savedSchedule = scheduleRepository.save(schedule);
        return mapToScheduleResponse(savedSchedule);
    }

    @Override
    @Transactional
    public ScheduleResponse updateSchedule(String userEmail, Long scheduleId, ScheduleRequest request) {
        User user = getUserByEmail(userEmail);
        Schedule schedule = getScheduleOwnedByUser(scheduleId, user.getId());
        validateTimeRange(request.getStartTime(), request.getEndTime());

        schedule.setTitle(request.getTitle());
        schedule.setDescription(request.getDescription());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setCategory(request.getCategory());

        if (request.getStatus() != null) {
            schedule.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            schedule.setPriority(request.getPriority());
        }

        Schedule updatedSchedule = scheduleRepository.save(schedule);
        return mapToScheduleResponse(updatedSchedule);
    }

    @Override
    @Transactional
    public void deleteSchedule(String userEmail, Long scheduleId) {
        User user = getUserByEmail(userEmail);
        Schedule schedule = getScheduleOwnedByUser(scheduleId, user.getId());
        scheduleRepository.delete(schedule);
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse getScheduleById(String userEmail, Long scheduleId) {
        User user = getUserByEmail(userEmail);
        Schedule schedule = getScheduleOwnedByUser(scheduleId, user.getId());
        return mapToScheduleResponse(schedule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getUserSchedules(String userEmail, LocalDateTime start, LocalDateTime end, ScheduleCategory category) {
        User user = getUserByEmail(userEmail);
        
        List<Schedule> schedules;
        if (start == null && end == null && category == null) {
            schedules = scheduleRepository.findByUserIdOrderByStartTimeAsc(user.getId());
        } else {
            schedules = scheduleRepository.findSchedulesByFilter(user.getId(), start, end, category);
        }

        return schedules.stream()
                .map(schedule -> {
                    long overlapCount = schedules.stream()
                            .filter(other -> other.getId() != null && schedule.getId() != null && !other.getId().equals(schedule.getId()))
                            .filter(other -> schedule.getStartTime() != null && schedule.getEndTime() != null
                                          && other.getStartTime() != null && other.getEndTime() != null
                                          && schedule.getStartTime().isBefore(other.getEndTime()) 
                                          && schedule.getEndTime().isAfter(other.getStartTime()))
                            .count();

                    boolean hasOverlap = overlapCount > 0;
                    String overlapWarning = hasOverlap
                            ? "Lịch trình bị trùng khoảng thời gian với " + overlapCount + " sự kiện khác."
                            : null;

                    return buildScheduleResponse(schedule, hasOverlap, overlapWarning);
                })
                .collect(Collectors.toList());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng!"));
    }

    private Schedule getScheduleOwnedByUser(Long scheduleId, Long userId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch trình!"));

        if (!schedule.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy lịch trình hoặc bạn không có quyền truy cập!");
        }

        return schedule;
    }

    private void validateTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new BadRequestException("Thời gian bắt đầu và kết thúc không được để trống!");
        }
        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!");
        }
    }

    private ScheduleResponse mapToScheduleResponse(Schedule schedule) {
        List<Schedule> overlappingSchedules = scheduleRepository.findOverlappingSchedules(
                schedule.getUser().getId(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getId()
        );

        boolean hasOverlap = !overlappingSchedules.isEmpty();
        String overlapWarning = hasOverlap
                ? "Lịch trình bị trùng khoảng thời gian với " + overlappingSchedules.size() + " sự kiện khác."
                : null;

        return buildScheduleResponse(schedule, hasOverlap, overlapWarning);
    }

    private ScheduleResponse buildScheduleResponse(Schedule schedule, boolean hasOverlap, String overlapWarning) {
        Long userId = (schedule.getUser() != null) ? schedule.getUser().getId() : null;
        ScheduleStatus status = (schedule.getStatus() != null) ? schedule.getStatus() : ScheduleStatus.PENDING;
        SchedulePriority priority = (schedule.getPriority() != null) ? schedule.getPriority() : SchedulePriority.MEDIUM;

        return ScheduleResponse.builder()
                .id(schedule.getId())
                .userId(userId)
                .title(schedule.getTitle())
                .description(schedule.getDescription())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .category(schedule.getCategory())
                .status(status)
                .priority(priority)
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .hasOverlap(hasOverlap)
                .overlapWarning(overlapWarning)
                .build();
    }
}
