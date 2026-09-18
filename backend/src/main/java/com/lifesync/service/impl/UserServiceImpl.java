package com.lifesync.service.impl;

import com.lifesync.dto.*;
import com.lifesync.entity.User;
import com.lifesync.entity.UserPreference;
import com.lifesync.entity.UserProfile;
import com.lifesync.exception.BadRequestException;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.UserPreferenceRepository;
import com.lifesync.repository.UserProfileRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.UserService;
import com.lifesync.service.ScheduleService;
import com.lifesync.service.NotificationService;
import com.lifesync.service.calculator.BodyMetricsCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final PasswordEncoder passwordEncoder;
    private final ScheduleService scheduleService;
    private final NotificationService notificationService;
    private final BodyMetricsCalculator bodyMetricsCalculator;

    @Override
    @Transactional(readOnly = true)
    public UserDataExportResponse exportUserData(String userEmail) {
        UserProfileResponse profile = getProfile(userEmail);
        UserPreferenceResponse preference = getPreference(userEmail);
        List<ScheduleResponse> schedules = scheduleService.getUserSchedules(userEmail, null, null, null);
        List<NotificationResponse> notifications = notificationService.getUserNotifications(userEmail, false, null);

        return UserDataExportResponse.builder()
                .profile(profile)
                .preference(preference)
                .schedules(schedules)
                .notifications(notifications)
                .exportedAt(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String userEmail) {
        User user = getUserByEmail(userEmail);
        UserProfile profile = getOrCreateProfile(user);
        return mapToProfileResponse(user, profile);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(String userEmail, UserProfileUpdateRequest request) {
        User user = getUserByEmail(userEmail);
        UserProfile profile = getOrCreateProfile(user);

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
            userRepository.save(user);
        }

        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getGender() != null) profile.setGender(request.getGender());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getHeightCm() != null) profile.setHeightCm(request.getHeightCm());
        if (request.getWeightKg() != null) profile.setWeightKg(request.getWeightKg());
        if (request.getTargetWeightKg() != null) profile.setTargetWeightKg(request.getTargetWeightKg());
        if (request.getActivityLevel() != null) profile.setActivityLevel(request.getActivityLevel());

        UserProfile updatedProfile = userProfileRepository.save(profile);
        return mapToProfileResponse(user, updatedProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public UserPreferenceResponse getPreference(String userEmail) {
        User user = getUserByEmail(userEmail);
        UserPreference preference = getOrCreatePreference(user);
        return mapToPreferenceResponse(preference);
    }

    @Override
    @Transactional
    public UserPreferenceResponse updatePreference(String userEmail, UserPreferenceUpdateRequest request) {
        User user = getUserByEmail(userEmail);
        UserPreference preference = getOrCreatePreference(user);

        if (request.getLanguage() != null) preference.setLanguage(request.getLanguage());
        if (request.getTimeFormat() != null) preference.setTimeFormat(request.getTimeFormat());
        if (request.getWeekStartDay() != null) preference.setWeekStartDay(request.getWeekStartDay());
        if (request.getScheduleReminderEnabled() != null) preference.setScheduleReminderEnabled(request.getScheduleReminderEnabled());
        if (request.getScheduleReminderMinutes() != null) preference.setScheduleReminderMinutes(request.getScheduleReminderMinutes());
        if (request.getMealReminderEnabled() != null) preference.setMealReminderEnabled(request.getMealReminderEnabled());

        UserPreference updatedPreference = userPreferenceRepository.save(preference);
        return mapToPreferenceResponse(updatedPreference);
    }

    @Override
    @Transactional(readOnly = true)
    public BodyMetricsRecommendationResponse getBodyMetricsRecommendation(String userEmail) {
        User user = getUserByEmail(userEmail);
        UserProfile profile = getOrCreateProfile(user);

        Double heightCm = profile.getHeightCm() != null ? profile.getHeightCm() : BodyMetricsCalculator.DEFAULT_HEIGHT_CM;
        Double weightKg = profile.getWeightKg() != null ? profile.getWeightKg() : BodyMetricsCalculator.DEFAULT_WEIGHT_KG;
        Double targetWeightKg = profile.getTargetWeightKg() != null ? profile.getTargetWeightKg() : weightKg;
        String activityLevel = profile.getActivityLevel() != null ? profile.getActivityLevel() : BodyMetricsCalculator.DEFAULT_ACTIVITY_LEVEL;

        double bmi = bodyMetricsCalculator.calculateBmi(weightKg, heightCm);
        String bmiStatus = bodyMetricsCalculator.getBmiStatusLabel(bmi);

        int age = bodyMetricsCalculator.calculateAge(profile.getDateOfBirth());
        double bmr = bodyMetricsCalculator.calculateBmr(weightKg, heightCm, age, profile.getGender());
        double tdee = bodyMetricsCalculator.calculateTdee(bmr, activityLevel);
        int recommendedCalories = bodyMetricsCalculator.calculateRecommendedDailyCalories(tdee, weightKg, targetWeightKg);

        return BodyMetricsRecommendationResponse.builder()
                .heightCm(heightCm)
                .weightKg(weightKg)
                .targetWeightKg(targetWeightKg)
                .bmi(bmi)
                .bmiStatus(bmiStatus)
                .bmr(bmr)
                .tdee(tdee)
                .recommendedDailyCalories(recommendedCalories)
                .activityLevel(activityLevel)
                .build();
    }

    @Override
    @Transactional
    public void changePassword(String userEmail, ChangePasswordRequest request) {
        User user = getUserByEmail(userEmail);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác!");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Xác nhận mật khẩu mới không khớp!");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu mới không được giống mật khẩu cũ!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng!"));
    }

    private UserProfile getOrCreateProfile(User user) {
        return userProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> userProfileRepository.save(UserProfile.builder()
                        .user(user)
                        .heightCm(170.0)
                        .weightKg(65.0)
                        .targetWeightKg(65.0)
                        .activityLevel("SEDENTARY")
                        .build()));
    }

    private UserPreference getOrCreatePreference(User user) {
        return userPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> userPreferenceRepository.save(UserPreference.builder()
                        .user(user)
                        .language("vi")
                        .timeFormat("24h")
                        .weekStartDay("MONDAY")
                        .scheduleReminderEnabled(true)
                        .scheduleReminderMinutes(15)
                        .mealReminderEnabled(true)
                        .build()));
    }

    private UserProfileResponse mapToProfileResponse(User user, UserProfile profile) {
        return UserProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(profile.getAvatarUrl())
                .phoneNumber(profile.getPhoneNumber())
                .bio(profile.getBio())
                .gender(profile.getGender())
                .dateOfBirth(profile.getDateOfBirth())
                .heightCm(profile.getHeightCm())
                .weightKg(profile.getWeightKg())
                .targetWeightKg(profile.getTargetWeightKg())
                .activityLevel(profile.getActivityLevel())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private UserPreferenceResponse mapToPreferenceResponse(UserPreference preference) {
        return UserPreferenceResponse.builder()
                .id(preference.getId())
                .userId(preference.getUser().getId())
                .language(preference.getLanguage())
                .timeFormat(preference.getTimeFormat())
                .weekStartDay(preference.getWeekStartDay())
                .scheduleReminderEnabled(preference.getScheduleReminderEnabled())
                .scheduleReminderMinutes(preference.getScheduleReminderMinutes())
                .mealReminderEnabled(preference.getMealReminderEnabled())
                .build();
    }
}
