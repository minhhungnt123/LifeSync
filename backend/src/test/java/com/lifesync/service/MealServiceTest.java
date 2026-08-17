package com.lifesync.service;

import com.lifesync.dto.DailyNutritionSummaryResponse;
import com.lifesync.dto.MealLogRequest;
import com.lifesync.dto.MealLogResponse;
import com.lifesync.entity.MealLog;
import com.lifesync.entity.MealType;
import com.lifesync.entity.Role;
import com.lifesync.entity.User;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.MealLogRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.impl.MealServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MealServiceTest {

    @Mock
    private MealLogRepository mealLogRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MealServiceImpl mealService;

    private User mockUser;
    private MealLog mockMealLog;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("test.user@lifesync.com")
                .fullName("Test User")
                .role(Role.USER)
                .build();

        mockMealLog = MealLog.builder()
                .id(50L)
                .user(mockUser)
                .mealType(MealType.LUNCH)
                .foodName("Cơm gà xối mỡ")
                .calories(650.0)
                .protein(35.0)
                .carbs(70.0)
                .fat(20.0)
                .loggedAt(LocalDateTime.of(2026, 8, 16, 12, 30))
                .build();
    }

    @Test
    @DisplayName("TC-M4-UNIT-001: Create meal log successfully when request is valid")
    void createMealLog_ShouldSaveAndReturnResponse_WhenRequestIsValid() {
        // Arrange
        MealLogRequest request = MealLogRequest.builder()
                .mealType(MealType.LUNCH)
                .foodName("Cơm gà xối mỡ")
                .calories(650.0)
                .protein(35.0)
                .carbs(70.0)
                .fat(20.0)
                .loggedAt(LocalDateTime.of(2026, 8, 16, 12, 30))
                .build();

        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(mealLogRepository.save(any(MealLog.class))).willReturn(mockMealLog);

        // Act
        MealLogResponse response = mealService.createMealLog(mockUser.getEmail(), request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(50L);
        assertThat(response.getFoodName()).isEqualTo("Cơm gà xối mỡ");
        assertThat(response.getCalories()).isEqualTo(650.0);
        assertThat(response.getMealType()).isEqualTo(MealType.LUNCH);

        verify(mealLogRepository).save(any(MealLog.class));
    }

    @Test
    @DisplayName("TC-M4-UNIT-002: Update meal log successfully when user owns the meal log")
    void updateMealLog_ShouldUpdateAndReturnResponse_WhenUserOwnsMealLog() {
        // Arrange
        MealLogRequest request = MealLogRequest.builder()
                .mealType(MealType.LUNCH)
                .foodName("Cơm gà xối mỡ (Thêm Trứng)")
                .calories(750.0)
                .protein(42.0)
                .carbs(70.0)
                .fat(25.0)
                .loggedAt(LocalDateTime.of(2026, 8, 16, 12, 30))
                .build();

        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(mealLogRepository.findById(50L)).willReturn(Optional.of(mockMealLog));
        given(mealLogRepository.save(any(MealLog.class))).willReturn(mockMealLog);

        // Act
        MealLogResponse response = mealService.updateMealLog(mockUser.getEmail(), 50L, request);

        // Assert
        assertThat(response).isNotNull();
        verify(mealLogRepository).save(mockMealLog);
    }

    @Test
    @DisplayName("TC-M4-UNIT-003: Update meal log should throw ResourceNotFoundException when user does not own meal log")
    void updateMealLog_ShouldThrowResourceNotFoundException_WhenUserDoesNotOwnMealLog() {
        // Arrange
        User anotherUser = User.builder().id(2L).email("other@lifesync.com").build();
        MealLog anotherMealLog = MealLog.builder().id(99L).user(anotherUser).build();

        MealLogRequest request = MealLogRequest.builder()
                .mealType(MealType.DINNER)
                .foodName("Bún bò")
                .calories(500.0)
                .loggedAt(LocalDateTime.now())
                .build();

        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(mealLogRepository.findById(99L)).willReturn(Optional.of(anotherMealLog));

        // Act & Assert
        assertThatThrownBy(() -> mealService.updateMealLog(mockUser.getEmail(), 99L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Không tìm thấy nhật ký bữa ăn hoặc bạn không có quyền truy cập!");

        verify(mealLogRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-M4-UNIT-004: Delete meal log successfully when user owns the meal log")
    void deleteMealLog_ShouldDelete_WhenUserOwnsMealLog() {
        // Arrange
        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(mealLogRepository.findById(50L)).willReturn(Optional.of(mockMealLog));

        // Act
        mealService.deleteMealLog(mockUser.getEmail(), 50L);

        // Assert
        verify(mealLogRepository).delete(mockMealLog);
    }

    @Test
    @DisplayName("TC-M4-UNIT-005: Get meal log by ID returns meal log details when user owns it")
    void getMealLogById_ShouldReturnMealLogResponse_WhenUserOwnsIt() {
        // Arrange
        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(mealLogRepository.findById(50L)).willReturn(Optional.of(mockMealLog));

        // Act
        MealLogResponse response = mealService.getMealLogById(mockUser.getEmail(), 50L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(50L);
        assertThat(response.getFoodName()).isEqualTo("Cơm gà xối mỡ");
    }

    @Test
    @DisplayName("TC-M4-UNIT-006: Get user meal logs returns list filtered by date")
    void getUserMealLogs_ShouldReturnFilteredMealLogsByDate() {
        // Arrange
        LocalDate targetDate = LocalDate.of(2026, 8, 16);
        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(
                mockUser.getId(), targetDate.atStartOfDay(), targetDate.atTime(LocalTime.MAX)))
                .willReturn(List.of(mockMealLog));

        // Act
        List<MealLogResponse> responses = mealService.getUserMealLogs(mockUser.getEmail(), targetDate, null, null);

        // Assert
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getFoodName()).isEqualTo("Cơm gà xối mỡ");
    }

    @Test
    @DisplayName("TC-M4-UNIT-007: Get daily nutrition summary calculates totals correctly")
    void getDailyNutritionSummary_ShouldCalculateTotalsAndReturnSummary() {
        // Arrange
        LocalDate targetDate = LocalDate.of(2026, 8, 16);
        MealLog breakfast = MealLog.builder()
                .id(51L)
                .user(mockUser)
                .mealType(MealType.BREAKFAST)
                .foodName("Phở bò")
                .calories(450.0)
                .protein(25.0)
                .carbs(55.0)
                .fat(12.0)
                .loggedAt(LocalDateTime.of(2026, 8, 16, 7, 30))
                .build();

        given(userRepository.findByEmail(mockUser.getEmail())).willReturn(Optional.of(mockUser));
        given(mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(
                mockUser.getId(), targetDate.atStartOfDay(), targetDate.atTime(LocalTime.MAX)))
                .willReturn(List.of(breakfast, mockMealLog));

        // Act
        DailyNutritionSummaryResponse summary = mealService.getDailyNutritionSummary(mockUser.getEmail(), targetDate);

        // Assert
        assertThat(summary).isNotNull();
        assertThat(summary.getDate()).isEqualTo(targetDate);
        assertThat(summary.getMealCount()).isEqualTo(2);
        assertThat(summary.getTotalCalories()).isEqualTo(1100.0); // 450 + 650
        assertThat(summary.getTotalProtein()).isEqualTo(60.0);    // 25 + 35
        assertThat(summary.getTotalCarbs()).isEqualTo(125.0);    // 55 + 70
        assertThat(summary.getTotalFat()).isEqualTo(32.0);        // 12 + 20
        assertThat(summary.getMeals()).hasSize(2);
    }
}
