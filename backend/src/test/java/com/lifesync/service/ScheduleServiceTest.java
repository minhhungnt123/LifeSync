package com.lifesync.service;

import com.lifesync.dto.ScheduleRequest;
import com.lifesync.dto.ScheduleResponse;
import com.lifesync.entity.*;
import com.lifesync.exception.BadRequestException;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.ScheduleRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.impl.ScheduleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ScheduleServiceImpl scheduleService;

    private User mockUser;
    private Schedule mockSchedule;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("test.user@lifesync.com")
                .fullName("Test User")
                .role(Role.USER)
                .build();

        mockSchedule = Schedule.builder()
                .id(100L)
                .user(mockUser)
                .title("Họp dự án LifeSync")
                .description("Báo cáo tiến độ Milestone 3")
                .startTime(LocalDateTime.of(2026, 8, 10, 9, 0))
                .endTime(LocalDateTime.of(2026, 8, 10, 10, 30))
                .category(ScheduleCategory.WORK)
                .status(ScheduleStatus.PENDING)
                .priority(SchedulePriority.HIGH)
                .build();
    }

    @Test
    @DisplayName("TC-M3-UNIT-001: Create schedule successfully when request is valid and no overlap exists")
    void createSchedule_ShouldSaveAndReturnResponse_WhenRequestIsValidAndNoOverlap() {
        // Arrange
        ScheduleRequest request = ScheduleRequest.builder()
                .title("Họp dự án LifeSync")
                .description("Báo cáo tiến độ Milestone 3")
                .startTime(LocalDateTime.of(2026, 8, 10, 9, 0))
                .endTime(LocalDateTime.of(2026, 8, 10, 10, 30))
                .category(ScheduleCategory.WORK)
                .priority(SchedulePriority.HIGH)
                .build();

        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(scheduleRepository.save(any(Schedule.class))).willReturn(mockSchedule);
        given(scheduleRepository.findOverlappingSchedules(mockUser.getId(), request.getStartTime(), request.getEndTime(), mockSchedule.getId()))
                .willReturn(Collections.emptyList());

        // Act
        ScheduleResponse response = scheduleService.createSchedule(mockUser.getEmail(), request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("Họp dự án LifeSync");
        assertThat(response.isHasOverlap()).isFalse();
        assertThat(response.getOverlapWarning()).isNull();

        verify(scheduleRepository).save(any(Schedule.class));
    }

    @Test
    @DisplayName("TC-M3-UNIT-002: Create schedule with overlap warning when overlapping schedule exists")
    void createSchedule_ShouldReturnResponseWithOverlapWarning_WhenOverlapDetected() {
        // Arrange
        ScheduleRequest request = ScheduleRequest.builder()
                .title("Họp dự án LifeSync")
                .startTime(LocalDateTime.of(2026, 8, 10, 9, 0))
                .endTime(LocalDateTime.of(2026, 8, 10, 10, 30))
                .category(ScheduleCategory.WORK)
                .build();

        Schedule existingOverlapSchedule = Schedule.builder()
                .id(99L)
                .user(mockUser)
                .title("Họp với Khách hàng")
                .startTime(LocalDateTime.of(2026, 8, 10, 9, 30))
                .endTime(LocalDateTime.of(2026, 8, 10, 11, 0))
                .build();

        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(scheduleRepository.save(any(Schedule.class))).willReturn(mockSchedule);
        given(scheduleRepository.findOverlappingSchedules(mockUser.getId(), request.getStartTime(), request.getEndTime(), mockSchedule.getId()))
                .willReturn(List.of(existingOverlapSchedule));

        // Act
        ScheduleResponse response = scheduleService.createSchedule(mockUser.getEmail(), request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.isHasOverlap()).isTrue();
        assertThat(response.getOverlapWarning()).contains("Lịch trình bị trùng khoảng thời gian với 1 sự kiện khác.");
    }

    @Test
    @DisplayName("TC-M3-UNIT-003: Create schedule should throw BadRequestException when endTime is before or equal to startTime")
    void createSchedule_ShouldThrowBadRequestException_WhenEndTimeIsBeforeOrEqualToStartTime() {
        // Arrange
        ScheduleRequest request = ScheduleRequest.builder()
                .title("Lịch vô lý")
                .startTime(LocalDateTime.of(2026, 8, 10, 10, 0))
                .endTime(LocalDateTime.of(2026, 8, 10, 9, 0))
                .category(ScheduleCategory.PERSONAL)
                .build();

        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));

        // Act & Assert
        assertThatThrownBy(() -> scheduleService.createSchedule(mockUser.getEmail(), request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!");

        verify(scheduleRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-M3-UNIT-004: Update schedule successfully when user owns the schedule")
    void updateSchedule_ShouldUpdateAndReturnResponse_WhenUserOwnsSchedule() {
        // Arrange
        ScheduleRequest request = ScheduleRequest.builder()
                .title("Họp dự án LifeSync (Đã đổi tên)")
                .startTime(LocalDateTime.of(2026, 8, 10, 10, 0))
                .endTime(LocalDateTime.of(2026, 8, 10, 11, 30))
                .category(ScheduleCategory.WORK)
                .status(ScheduleStatus.IN_PROGRESS)
                .priority(SchedulePriority.URGENT)
                .build();

        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(scheduleRepository.findById(100L)).willReturn(Optional.of(mockSchedule));
        given(scheduleRepository.save(any(Schedule.class))).willReturn(mockSchedule);

        // Act
        ScheduleResponse response = scheduleService.updateSchedule(mockUser.getEmail(), 100L, request);

        // Assert
        assertThat(response).isNotNull();
        verify(scheduleRepository).save(mockSchedule);
    }

    @Test
    @DisplayName("TC-M3-UNIT-005: Update schedule should throw ResourceNotFoundException when user does not own schedule")
    void updateSchedule_ShouldThrowResourceNotFoundException_WhenUserDoesNotOwnSchedule() {
        // Arrange
        User anotherUser = User.builder().id(2L).email("other@lifesync.com").build();
        Schedule anotherSchedule = Schedule.builder().id(200L).user(anotherUser).build();

        ScheduleRequest request = ScheduleRequest.builder()
                .title("Cố gắng sửa lịch người khác")
                .startTime(LocalDateTime.of(2026, 8, 10, 10, 0))
                .endTime(LocalDateTime.of(2026, 8, 10, 11, 30))
                .category(ScheduleCategory.WORK)
                .build();

        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(scheduleRepository.findById(200L)).willReturn(Optional.of(anotherSchedule));

        // Act & Assert
        assertThatThrownBy(() -> scheduleService.updateSchedule(mockUser.getEmail(), 200L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Không tìm thấy lịch trình hoặc bạn không có quyền truy cập!");

        verify(scheduleRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-M3-UNIT-006: Delete schedule successfully when user owns the schedule")
    void deleteSchedule_ShouldDelete_WhenUserOwnsSchedule() {
        // Arrange
        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(scheduleRepository.findById(100L)).willReturn(Optional.of(mockSchedule));

        // Act
        scheduleService.deleteSchedule(mockUser.getEmail(), 100L);

        // Assert
        verify(scheduleRepository).delete(mockSchedule);
    }

    @Test
    @DisplayName("TC-M3-UNIT-007: Get schedule by ID returns schedule details when user owns it")
    void getScheduleById_ShouldReturnScheduleResponse_WhenUserOwnsSchedule() {
        // Arrange
        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(scheduleRepository.findById(100L)).willReturn(Optional.of(mockSchedule));
        given(scheduleRepository.findOverlappingSchedules(mockUser.getId(), mockSchedule.getStartTime(), mockSchedule.getEndTime(), 100L))
                .willReturn(Collections.emptyList());

        // Act
        ScheduleResponse response = scheduleService.getScheduleById(mockUser.getEmail(), 100L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("Họp dự án LifeSync");
    }

    @Test
    @DisplayName("TC-M3-UNIT-008: Get user schedules returns list of schedules matching filters")
    void getUserSchedules_ShouldReturnFilteredSchedules() {
        // Arrange
        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(scheduleRepository.findSchedulesByFilter(mockUser.getId(), null, null, ScheduleCategory.WORK))
                .willReturn(List.of(mockSchedule));

        // Act
        List<ScheduleResponse> responses = scheduleService.getUserSchedules(mockUser.getEmail(), null, null, ScheduleCategory.WORK);

        // Assert
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getCategory()).isEqualTo(ScheduleCategory.WORK);
    }
}
