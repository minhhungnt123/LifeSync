package com.lifesync.service;

import com.lifesync.dto.DashboardSummaryResponse;
import com.lifesync.entity.*;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.MealLogRepository;
import com.lifesync.repository.ScheduleRepository;
import com.lifesync.repository.UserProfileRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.impl.DashboardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private MealLogRepository mealLogRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @org.mockito.Spy
    private com.lifesync.service.calculator.BodyMetricsCalculator bodyMetricsCalculator = new com.lifesync.service.calculator.BodyMetricsCalculator();

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("test.dashboard@lifesync.com")
                .fullName("Dashboard Tester")
                .role(Role.USER)
                .build();
    }

    @Test
    @DisplayName("TC-501: getDashboardSummary returns default zero metrics when user has no schedules or meals")
    void getDashboardSummary_ShouldReturnZeroMetrics_WhenUserHasNoData() {
        // Arrange
        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(scheduleRepository.findSchedulesByFilter(eq(mockUser.getId()), any(), any(), any()))
                .willReturn(Collections.emptyList());
        given(mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(eq(mockUser.getId()), any(), any()))
                .willReturn(Collections.emptyList());
        given(scheduleRepository.findByUserIdOrderByStartTimeAsc(mockUser.getId()))
                .willReturn(Collections.emptyList());
        given(userProfileRepository.findByUserId(mockUser.getId()))
                .willReturn(Optional.empty());

        // Act
        DashboardSummaryResponse response = dashboardService.getDashboardSummary(mockUser.getEmail());

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getTodayScheduleCount()).isEqualTo(0);
        assertThat(response.getCompletedScheduleCount()).isEqualTo(0);
        assertThat(response.getCompletionRate()).isEqualTo(0.0);
        assertThat(response.getTotalWorkHoursToday()).isEqualTo(0.0);
        assertThat(response.getTodayCalories()).isEqualTo(0.0);
        assertThat(response.getTargetCalories()).isEqualTo(2000.0);
        assertThat(response.getCategoryDistribution()).isEmpty();
        assertThat(response.getNutritionTrends()).hasSize(7);
        assertThat(response.getScheduleTrends()).hasSize(7);
    }

    @Test
    @DisplayName("TC-502: getDashboardSummary correctly aggregates today schedules, meals, and 7-day trends")
    void getDashboardSummary_ShouldAggregateDataCorrectly_WhenUserHasData() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();

        Schedule workSchedule = Schedule.builder()
                .id(10L)
                .user(mockUser)
                .title("Lập trình Feature Dashboard")
                .startTime(now.minusHours(2))
                .endTime(now)
                .category(ScheduleCategory.WORK)
                .status(ScheduleStatus.COMPLETED)
                .priority(SchedulePriority.HIGH)
                .build();

        Schedule studySchedule = Schedule.builder()
                .id(11L)
                .user(mockUser)
                .title("Đọc sách Java 21")
                .startTime(now.plusHours(1))
                .endTime(now.plusHours(2))
                .category(ScheduleCategory.STUDY)
                .status(ScheduleStatus.PENDING)
                .priority(SchedulePriority.MEDIUM)
                .build();

        MealLog breakfast = MealLog.builder()
                .id(20L)
                .user(mockUser)
                .mealType(MealType.BREAKFAST)
                .foodName("Phở gà")
                .calories(500.0)
                .protein(30.0)
                .carbs(60.0)
                .fat(15.0)
                .loggedAt(now.minusHours(4))
                .build();

        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(scheduleRepository.findSchedulesByFilter(eq(mockUser.getId()), any(), any(), any()))
                .willReturn(List.of(workSchedule, studySchedule));
        given(mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(eq(mockUser.getId()), any(), any()))
                .willReturn(List.of(breakfast));
        given(scheduleRepository.findByUserIdOrderByStartTimeAsc(mockUser.getId()))
                .willReturn(List.of(workSchedule, studySchedule));
        given(userProfileRepository.findByUserId(mockUser.getId()))
                .willReturn(Optional.empty());

        // Act
        DashboardSummaryResponse response = dashboardService.getDashboardSummary(mockUser.getEmail());

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getTodayScheduleCount()).isEqualTo(2);
        assertThat(response.getCompletedScheduleCount()).isEqualTo(1);
        assertThat(response.getCompletionRate()).isEqualTo(50.0);
        assertThat(response.getTotalWorkHoursToday()).isEqualTo(3.0); // 2 hours + 1 hour
        assertThat(response.getTodayCalories()).isEqualTo(500.0);
        assertThat(response.getTodayProtein()).isEqualTo(30.0);
        assertThat(response.getTodayCarbs()).isEqualTo(60.0);
        assertThat(response.getTodayFat()).isEqualTo(15.0);
        assertThat(response.getCategoryDistribution()).isNotEmpty();
        assertThat(response.getNutritionTrends()).hasSize(7);
        assertThat(response.getScheduleTrends()).hasSize(7);
    }

    @Test
    @DisplayName("TC-503: getDashboardSummary calculates target calories based on UserProfile TDEE")
    void getDashboardSummary_ShouldCalculateTargetCalories_WhenUserProfileExists() {
        // Arrange
        UserProfile profile = UserProfile.builder()
                .id(100L)
                .user(mockUser)
                .gender("MALE")
                .heightCm(175.0)
                .weightKg(70.0)
                .dateOfBirth(LocalDate.of(1998, 5, 20))
                .activityLevel("MODERATE")
                .build();

        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(scheduleRepository.findSchedulesByFilter(eq(mockUser.getId()), any(), any(), any()))
                .willReturn(Collections.emptyList());
        given(mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(eq(mockUser.getId()), any(), any()))
                .willReturn(Collections.emptyList());
        given(scheduleRepository.findByUserIdOrderByStartTimeAsc(mockUser.getId()))
                .willReturn(Collections.emptyList());
        given(userProfileRepository.findByUserId(mockUser.getId()))
                .willReturn(Optional.of(profile));

        // Act
        DashboardSummaryResponse response = dashboardService.getDashboardSummary(mockUser.getEmail());

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getTargetCalories()).isGreaterThan(2000.0);
    }

    @Test
    @DisplayName("TC-504: getDashboardSummary throws ResourceNotFoundException when user email does not exist")
    void getDashboardSummary_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        given(userRepository.findByEmail("nonexistent@lifesync.com")).willReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> dashboardService.getDashboardSummary("nonexistent@lifesync.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Không tìm thấy thông tin người dùng!");
    }
}
