package com.lifesync.service;

import com.lifesync.dto.*;
import com.lifesync.entity.User;
import com.lifesync.entity.UserPreference;
import com.lifesync.entity.UserProfile;
import com.lifesync.exception.BadRequestException;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.UserPreferenceRepository;
import com.lifesync.repository.UserProfileRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserPreferenceRepository userPreferenceRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ScheduleService scheduleService;

    @Mock
    private NotificationService notificationService;

    @org.mockito.Spy
    private com.lifesync.service.calculator.BodyMetricsCalculator bodyMetricsCalculator = new com.lifesync.service.calculator.BodyMetricsCalculator();

    @InjectMocks
    private UserServiceImpl userService;

    private User user;
    private UserProfile userProfile;
    private UserPreference userPreference;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@lifesync.ai")
                .password("encoded_old_password")
                .fullName("Nguyễn Minh Hùng")
                .build();

        userProfile = UserProfile.builder()
                .id(1L)
                .user(user)
                .heightCm(175.0)
                .weightKg(70.0)
                .targetWeightKg(68.0)
                .activityLevel("MODERATELY_ACTIVE")
                .build();

        userPreference = UserPreference.builder()
                .id(1L)
                .user(user)
                .language("vi")
                .timeFormat("24h")
                .build();
    }

    @Test
    @DisplayName("Lấy thông tin Profile thành công")
    void getProfile_Success() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userProfileRepository.findByUserId(user.getId())).thenReturn(Optional.of(userProfile));

        UserProfileResponse response = userService.getProfile(user.getEmail());

        assertNotNull(response);
        assertEquals("Nguyễn Minh Hùng", response.getFullName());
        assertEquals(175.0, response.getHeightCm());
        assertEquals(70.0, response.getWeightKg());
    }

    @Test
    @DisplayName("Cập nhật thông tin Profile thành công")
    void updateProfile_Success() {
        UserProfileUpdateRequest request = UserProfileUpdateRequest.builder()
                .fullName("Hùng Nguyễn Update")
                .weightKg(72.0)
                .build();

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userProfileRepository.findByUserId(user.getId())).thenReturn(Optional.of(userProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(i -> i.getArgument(0));

        UserProfileResponse response = userService.updateProfile(user.getEmail(), request);

        assertNotNull(response);
        assertEquals("Hùng Nguyễn Update", response.getFullName());
        assertEquals(72.0, response.getWeightKg());
    }

    @Test
    @DisplayName("Tính toán chỉ số BMI & TDEE đúng công thức")
    void getBodyMetricsRecommendation_Success() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userProfileRepository.findByUserId(user.getId())).thenReturn(Optional.of(userProfile));

        BodyMetricsRecommendationResponse response = userService.getBodyMetricsRecommendation(user.getEmail());

        assertNotNull(response);
        assertEquals(22.9, response.getBmi());
        assertEquals("Bình thường (Normal)", response.getBmiStatus());
        assertTrue(response.getBmr() > 1500);
        assertTrue(response.getTdee() > response.getBmr());
    }

    @Test
    @DisplayName("Đổi mật khẩu thành công khi thông tin hợp lệ")
    void changePassword_Success() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("old_pass")
                .newPassword("new_pass_123")
                .confirmPassword("new_pass_123")
                .build();

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old_pass", user.getPassword())).thenReturn(true);
        when(passwordEncoder.matches("new_pass_123", user.getPassword())).thenReturn(false);
        when(passwordEncoder.encode("new_pass_123")).thenReturn("encoded_new_password");

        assertDoesNotThrow(() -> userService.changePassword(user.getEmail(), request));
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Đổi mật khẩu thất bại khi mật khẩu hiện tại không đúng")
    void changePassword_WrongCurrentPassword() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("wrong_pass")
                .newPassword("new_pass_123")
                .confirmPassword("new_pass_123")
                .build();

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong_pass", user.getPassword())).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> userService.changePassword(user.getEmail(), request));

        assertEquals("Mật khẩu hiện tại không chính xác!", ex.getMessage());
    }
}
