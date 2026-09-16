package com.lifesync.service.ai.impl;

import com.lifesync.dto.BodyMetricsRecommendationResponse;
import com.lifesync.dto.ai.HeartCareUserContext;
import com.lifesync.entity.MealLog;
import com.lifesync.entity.Schedule;
import com.lifesync.entity.SchedulePriority;
import com.lifesync.entity.User;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.MealLogRepository;
import com.lifesync.repository.ScheduleRepository;
import com.lifesync.repository.UserProfileRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.UserService;
import com.lifesync.service.ai.HeartCareContextBuilderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementation of HeartCareContextBuilderService.
 * Aggregates user biometrics, meals, and schedules into a contextualized structure and markdown prompt.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HeartCareContextBuilderServiceImpl implements HeartCareContextBuilderService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm dd/MM");
    private static final DateTimeFormatter HOUR_MINUTE_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final MealLogRepository mealLogRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserService userService;

    @Override
    @Transactional(readOnly = true)
    public HeartCareUserContext buildContext(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        return buildContextForUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public HeartCareUserContext buildContext(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + userEmail));
        return buildContextForUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public String buildFormattedPromptContext(Long userId) {
        HeartCareUserContext context = buildContext(userId);
        return context.getFormattedPromptContext();
    }

    @Override
    @Transactional(readOnly = true)
    public String buildFormattedPromptContext(String userEmail) {
        HeartCareUserContext context = buildContext(userEmail);
        return context.getFormattedPromptContext();
    }

    private HeartCareUserContext buildContextForUser(User user) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime sevenDaysAgo = now.minusDays(7);

        // 1. Biometrics & Recommendations
        BodyMetricsRecommendationResponse metrics = userService.getBodyMetricsRecommendation(user.getEmail());
        com.lifesync.entity.UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        String gender = profile != null && profile.getGender() != null ? profile.getGender() : "Chưa xác định";
        int age = 25;
        if (profile != null && profile.getDateOfBirth() != null) {
            age = java.time.Period.between(profile.getDateOfBirth(), LocalDate.now()).getYears();
        }

        // 2. Meal & Nutrition Aggregation
        List<MealLog> sevenDayMeals = mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(
                user.getId(), sevenDaysAgo, now
        );

        double todayCalories = 0.0;
        double totalSevenDayCalories = 0.0;
        List<HeartCareUserContext.MealItemSummary> recentMealSummaries = new ArrayList<>();

        for (MealLog meal : sevenDayMeals) {
            double cal = meal.getCalories() != null ? meal.getCalories() : 0.0;
            totalSevenDayCalories += cal;

            if (!meal.getLoggedAt().isBefore(todayStart)) {
                todayCalories += cal;
            }

            recentMealSummaries.add(HeartCareUserContext.MealItemSummary.builder()
                    .foodName(meal.getFoodName())
                    .mealType(meal.getMealType() != null ? meal.getMealType().name() : "SNACK")
                    .calories(cal)
                    .protein(meal.getProtein() != null ? meal.getProtein() : 0.0)
                    .carbs(meal.getCarbs() != null ? meal.getCarbs() : 0.0)
                    .fat(meal.getFat() != null ? meal.getFat() : 0.0)
                    .loggedAt(meal.getLoggedAt())
                    .build());
        }

        double sevenDayAvgCalories = Math.round((totalSevenDayCalories / 7.0) * 10.0) / 10.0;
        double calorieBalance = Math.round((todayCalories - metrics.getTdee()) * 10.0) / 10.0;

        // 3. Schedule & Workload Aggregation
        List<Schedule> sevenDaySchedules = scheduleRepository.findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(
                user.getId(), sevenDaysAgo, now.plusDays(1)
        );

        long todayWorkMinutes = 0L;
        long totalSevenDayWorkMinutes = 0L;
        int urgentHighTasks = 0;
        List<HeartCareUserContext.ScheduleItemSummary> upcomingSummaries = new ArrayList<>();

        for (Schedule s : sevenDaySchedules) {
            if (s.getStartTime() != null && s.getEndTime() != null && s.getEndTime().isAfter(s.getStartTime())) {
                long durationMins = Duration.between(s.getStartTime(), s.getEndTime()).toMinutes();
                totalSevenDayWorkMinutes += durationMins;

                if (!s.getStartTime().isBefore(todayStart) && s.getStartTime().isBefore(todayStart.plusDays(1))) {
                    todayWorkMinutes += durationMins;
                }
            }

            boolean isHighPriority = s.getPriority() == SchedulePriority.HIGH || s.getPriority() == SchedulePriority.URGENT;
            if (isHighPriority && s.getStartTime().isAfter(todayStart)) {
                urgentHighTasks++;
            }

            if (s.getStartTime().isAfter(now.minusHours(2))) {
                upcomingSummaries.add(HeartCareUserContext.ScheduleItemSummary.builder()
                        .title(s.getTitle())
                        .category(s.getCategory() != null ? s.getCategory().name() : "TASK")
                        .priority(s.getPriority() != null ? s.getPriority().name() : "MEDIUM")
                        .startTime(s.getStartTime())
                        .endTime(s.getEndTime())
                        .build());
            }
        }

        long sevenDayAvgWorkload = totalSevenDayWorkMinutes / 7;
        String stressLevel = calculateStressLevel(todayWorkMinutes, urgentHighTasks);

        // 4. Construct DTO
        HeartCareUserContext context = HeartCareUserContext.builder()
                .fullName(user.getFullName())
                .gender(gender)
                .age(age)
                .heightCm(metrics.getHeightCm())
                .weightKg(metrics.getWeightKg())
                .targetWeightKg(metrics.getTargetWeightKg())
                .bmi(metrics.getBmi())
                .bmiStatus(metrics.getBmiStatus())
                .bmr(metrics.getBmr())
                .tdee(metrics.getTdee())
                .activityLevel(metrics.getActivityLevel())
                .todayCalories(todayCalories)
                .sevenDayAvgCalories(sevenDayAvgCalories)
                .calorieBalanceVsTdee(calorieBalance)
                .recentMeals(recentMealSummaries)
                .todayWorkloadMinutes(todayWorkMinutes)
                .sevenDayAvgWorkloadMinutes(sevenDayAvgWorkload)
                .urgentOrHighTaskCount(urgentHighTasks)
                .stressLevel(stressLevel)
                .upcomingSchedules(upcomingSummaries)
                .build();

        // 5. Generate Markdown String
        context.setFormattedPromptContext(formatMarkdownContext(context));

        return context;
    }

    private String calculateStressLevel(long todayMinutes, int urgentHighCount) {
        if (todayMinutes >= 600 || urgentHighCount >= 4) {
            return "OVERLOAD"; // Quá tải
        } else if (todayMinutes >= 480 || urgentHighCount >= 2) {
            return "HIGH"; // Cao
        } else if (todayMinutes >= 240) {
            return "MEDIUM"; // Trung bình
        }
        return "LOW"; // Thấp
    }

    private String formatMarkdownContext(HeartCareUserContext c) {
        StringBuilder sb = new StringBuilder();

        sb.append("=== THÔNG TIN NGƯỜI DÙNG & HỒ SƠ THỂ CHẤT ===\n");
        sb.append(String.format("- Họ và tên: %s\n", c.getFullName() != null ? c.getFullName() : "Người dùng"));
        sb.append(String.format("- Tuổi: %d | Giới tính: %s | Hoạt động: %s\n",
                c.getAge() != null ? c.getAge() : 25,
                c.getGender() != null ? c.getGender() : "Chưa xác định",
                c.getActivityLevel() != null ? c.getActivityLevel() : "Bình thường"));
        sb.append(String.format("- Thể trạng: Chiều cao %.1f cm | Cân nặng %.1f kg (Mục tiêu: %.1f kg)\n",
                c.getHeightCm(), c.getWeightKg(), c.getTargetWeightKg()));
        sb.append(String.format("- Chỉ số BMI: %.1f (%s)\n", c.getBmi(), c.getBmiStatus()));
        sb.append(String.format("- Nhu cầu năng lượng: BMR = %.0f kcal/ngày | TDEE (Duy trì cân nặng) = %.0f kcal/ngày\n\n",
                c.getBmr(), c.getTdee()));

        sb.append("=== THỰC TRẠNG DINH DƯỠNG (DỮ LIỆU THỰC TẾ) ===\n");
        sb.append(String.format("- Tổng Calo đã nạp hôm nay: %.0f kcal (So với TDEE: %s%.0f kcal)\n",
                c.getTodayCalories(),
                c.getCalorieBalanceVsTdee() >= 0 ? "+" : "",
                c.getCalorieBalanceVsTdee()));
        sb.append(String.format("- Calo trung bình 7 ngày qua: %.0f kcal/ngày\n", c.getSevenDayAvgCalories()));

        if (c.getRecentMeals().isEmpty()) {
            sb.append("- Nhật ký bữa ăn: Chưa có bữa ăn nào được ghi nhận gần đây.\n");
        } else {
            sb.append("- Các bữa ăn gần nhất:\n");
            int count = 0;
            // Show up to 5 most recent meals
            List<HeartCareUserContext.MealItemSummary> meals = c.getRecentMeals();
            for (int i = meals.size() - 1; i >= 0 && count < 5; i--, count++) {
                HeartCareUserContext.MealItemSummary m = meals.get(i);
                sb.append(String.format("  * [%s] %s (%s): %.0f kcal (Đạm: %.1fg, Tinh bột: %.1fg, Béo: %.1fg)\n",
                        m.getLoggedAt().format(TIME_FORMATTER),
                        m.getFoodName(),
                        m.getMealType(),
                        m.getCalories(),
                        m.getProtein(),
                        m.getCarbs(),
                        m.getFat()));
            }
        }
        sb.append("\n");

        sb.append("=== ÁP LỰC LỊCH TRÌNH & NGUY CƠ CĂNG THẲNG (STRESS) ===\n");
        double todayHours = Math.round((c.getTodayWorkloadMinutes() / 60.0) * 10.0) / 10.0;
        double avgHours = Math.round((c.getSevenDayAvgWorkloadMinutes() / 60.0) * 10.0) / 10.0;
        sb.append(String.format("- Tổng thời lượng làm việc/học tập hôm nay: %.1f giờ (%d phút)\n", todayHours, c.getTodayWorkloadMinutes()));
        sb.append(String.format("- Mức độ làm việc trung bình 7 ngày: %.1f giờ/ngày\n", avgHours));
        sb.append(String.format("- Số lượng đầu việc gấp / ưu tiên cao: %d việc\n", c.getUrgentOrHighTaskCount()));
        sb.append(String.format("- Đánh giá mức độ áp lực hệ thống: %s\n", c.getStressLevel()));

        if (c.getUpcomingSchedules().isEmpty()) {
            sb.append("- Lịch trình sắp tới: Hiện không có lịch trình nào sắp diễn ra.\n");
        } else {
            sb.append("- Lịch trình sắp tới:\n");
            int count = 0;
            for (HeartCareUserContext.ScheduleItemSummary s : c.getUpcomingSchedules()) {
                if (count++ >= 4) break;
                sb.append(String.format("  * [%s - %s] %s (%s) [Ưu tiên: %s]\n",
                        s.getStartTime().format(HOUR_MINUTE_FORMATTER),
                        s.getEndTime().format(HOUR_MINUTE_FORMATTER),
                        s.getTitle(),
                        s.getCategory(),
                        s.getPriority()));
            }
        }
        sb.append("\n=======================================================\n");

        return sb.toString();
    }
}
