package com.lifesync.service.ai;

import com.lifesync.dto.BodyMetricsRecommendationResponse;
import com.lifesync.dto.ai.HeartCareUserContext;
import com.lifesync.entity.*;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.MealLogRepository;
import com.lifesync.repository.ScheduleRepository;
import com.lifesync.repository.UserProfileRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.UserService;
import com.lifesync.service.ai.impl.HeartCareContextBuilderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HeartCareContextBuilderServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private MealLogRepository mealLogRepository;

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private HeartCareContextBuilderServiceImpl contextBuilderService;

    private User testUser;
    private UserProfile testProfile;
    private BodyMetricsRecommendationResponse testMetrics;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@lifesync.com")
                .fullName("Nguyen Van A")
                .build();

        testProfile = UserProfile.builder()
                .user(testUser)
                .gender("MALE")
                .dateOfBirth(java.time.LocalDate.now().minusYears(28))
                .build();

        testMetrics = BodyMetricsRecommendationResponse.builder()
                .heightCm(175.0)
                .weightKg(70.0)
                .targetWeightKg(68.0)
                .bmi(22.9)
                .bmiStatus("Bình thường")
                .bmr(1650.0)
                .tdee(2200.0)
                .activityLevel("MODERATELY_ACTIVE")
                .build();
    }

    @Test
    @DisplayName("buildContext: Tổng hợp thành công đầy đủ dữ liệu thể chất, dinh dưỡng và lịch trình")
    void buildContext_Success() {
        LocalDateTime now = LocalDateTime.now();

        MealLog meal1 = MealLog.builder()
                .id(101L)
                .user(testUser)
                .foodName("Phở Bò Tái")
                .mealType(MealType.BREAKFAST)
                .calories(480.0)
                .protein(25.0)
                .carbs(60.0)
                .fat(12.0)
                .loggedAt(now.minusHours(3))
                .build();

        Schedule task1 = Schedule.builder()
                .id(201L)
                .user(testUser)
                .title("Họp dự án Sprint Planning")
                .category(ScheduleCategory.WORK)
                .priority(SchedulePriority.HIGH)
                .startTime(now.minusHours(1))
                .endTime(now.plusHours(2)) // 3 hours = 180 mins
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userProfileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(userService.getBodyMetricsRecommendation("test@lifesync.com")).thenReturn(testMetrics);
        when(mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(eq(1L), any(), any()))
                .thenReturn(List.of(meal1));
        when(scheduleRepository.findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(eq(1L), any(), any()))
                .thenReturn(List.of(task1));

        // When
        HeartCareUserContext context = contextBuilderService.buildContext(1L);

        // Then
        assertThat(context).isNotNull();
        assertThat(context.getFullName()).isEqualTo("Nguyen Van A");
        assertThat(context.getBmi()).isEqualTo(22.9);
        assertThat(context.getTdee()).isEqualTo(2200.0);
        assertThat(context.getTodayCalories()).isEqualTo(480.0);
        assertThat(context.getRecentMeals()).hasSize(1);
        assertThat(context.getRecentMeals().get(0).getFoodName()).isEqualTo("Phở Bò Tái");
        assertThat(context.getTodayWorkloadMinutes()).isEqualTo(180L);
        assertThat(context.getUrgentOrHighTaskCount()).isEqualTo(1);
        assertThat(context.getFormattedPromptContext()).contains("=== THÔNG TIN NGƯỜI DÙNG & HỒ SƠ THỂ CHẤT ===");
        assertThat(context.getFormattedPromptContext()).contains("Phở Bò Tái");
        assertThat(context.getFormattedPromptContext()).contains("Họp dự án Sprint Planning");
    }

    @Test
    @DisplayName("buildContext: Xử lý an toàn khi người dùng chưa có bữa ăn và lịch trình nào")
    void buildContext_HandlesEmptyData() {
        when(userRepository.findByEmail("test@lifesync.com")).thenReturn(Optional.of(testUser));
        when(userProfileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(userService.getBodyMetricsRecommendation("test@lifesync.com")).thenReturn(testMetrics);
        when(mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(eq(1L), any(), any()))
                .thenReturn(List.of());
        when(scheduleRepository.findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(eq(1L), any(), any()))
                .thenReturn(List.of());

        // When
        HeartCareUserContext context = contextBuilderService.buildContext("test@lifesync.com");

        // Then
        assertThat(context).isNotNull();
        assertThat(context.getTodayCalories()).isEqualTo(0.0);
        assertThat(context.getRecentMeals()).isEmpty();
        assertThat(context.getTodayWorkloadMinutes()).isEqualTo(0L);
        assertThat(context.getStressLevel()).isEqualTo("LOW");
        assertThat(context.getFormattedPromptContext()).contains("Chưa có bữa ăn nào được ghi nhận gần đây");
        assertThat(context.getFormattedPromptContext()).contains("Hiện không có lịch trình nào sắp diễn ra");
    }

    @Test
    @DisplayName("buildContext: Ném ResourceNotFoundException khi không tìm thấy User")
    void buildContext_ThrowsResourceNotFound_WhenUserMissing() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contextBuilderService.buildContext(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Không tìm thấy người dùng");
    }
}
