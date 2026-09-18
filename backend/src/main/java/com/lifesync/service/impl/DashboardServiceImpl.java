package com.lifesync.service.impl;

import com.lifesync.dto.*;
import com.lifesync.entity.*;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.MealLogRepository;
import com.lifesync.repository.ScheduleRepository;
import com.lifesync.repository.UserProfileRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.DashboardService;
import com.lifesync.service.calculator.BodyMetricsCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final MealLogRepository mealLogRepository;
    private final UserProfileRepository userProfileRepository;
    private final BodyMetricsCalculator bodyMetricsCalculator;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng!"));

        Long userId = user.getId();
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(LocalTime.MAX);

        // 1. Today's Schedules
        List<Schedule> todaySchedules = scheduleRepository.findSchedulesByFilter(userId, startOfToday, endOfToday, null);
        int todayScheduleCount = todaySchedules.size();
        int completedScheduleCount = (int) todaySchedules.stream()
                .filter(s -> s.getStatus() == ScheduleStatus.COMPLETED)
                .count();
        double completionRate = todayScheduleCount > 0
                ? Math.round((double) completedScheduleCount / todayScheduleCount * 100.0 * 10.0) / 10.0
                : 0.0;
        double totalWorkHoursToday = calculateTotalHours(todaySchedules);

        // 2. Today's Meals
        List<MealLog> todayMeals = mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(userId, startOfToday, endOfToday);
        double todayCalories = todayMeals.stream().mapToDouble(MealLog::getCalories).sum();
        double todayProtein = todayMeals.stream().mapToDouble(MealLog::getProtein).sum();
        double todayCarbs = todayMeals.stream().mapToDouble(MealLog::getCarbs).sum();
        double todayFat = todayMeals.stream().mapToDouble(MealLog::getFat).sum();

        double targetCalories = userProfileRepository.findByUserId(userId)
                .map(bodyMetricsCalculator::calculateTargetCalories)
                .orElse(BodyMetricsCalculator.DEFAULT_TARGET_CALORIES);

        // 3. Category Distribution (All Schedules of User)
        List<Schedule> allSchedules = scheduleRepository.findByUserIdOrderByStartTimeAsc(userId);
        List<CategoryDistributionDto> categoryDistribution = calculateCategoryDistribution(allSchedules);

        // 4. 7-Day Nutrition Trends
        LocalDate startDate7Days = today.minusDays(6);
        LocalDateTime start7Days = startDate7Days.atStartOfDay();
        List<MealLog> logs7Days = mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(userId, start7Days, endOfToday);
        List<NutritionTrendDto> nutritionTrends = calculateNutritionTrends(startDate7Days, today, logs7Days);

        // 5. 7-Day Schedule Trends
        List<Schedule> schedules7Days = scheduleRepository.findSchedulesByFilter(userId, start7Days, endOfToday, null);
        List<ScheduleTrendDto> scheduleTrends = calculateScheduleTrends(startDate7Days, today, schedules7Days);

        return DashboardSummaryResponse.builder()
                .todayScheduleCount(todayScheduleCount)
                .completedScheduleCount(completedScheduleCount)
                .completionRate(completionRate)
                .totalWorkHoursToday(Math.round(totalWorkHoursToday * 10.0) / 10.0)
                .todayCalories(Math.round(todayCalories * 10.0) / 10.0)
                .targetCalories(Math.round(targetCalories * 10.0) / 10.0)
                .todayProtein(Math.round(todayProtein * 10.0) / 10.0)
                .todayCarbs(Math.round(todayCarbs * 10.0) / 10.0)
                .todayFat(Math.round(todayFat * 10.0) / 10.0)
                .categoryDistribution(categoryDistribution)
                .nutritionTrends(nutritionTrends)
                .scheduleTrends(scheduleTrends)
                .build();
    }

    private double calculateTotalHours(List<Schedule> schedules) {
        return schedules.stream()
                .mapToDouble(s -> Duration.between(s.getStartTime(), s.getEndTime()).toMinutes() / 60.0)
                .sum();
    }

    private List<CategoryDistributionDto> calculateCategoryDistribution(List<Schedule> schedules) {
        if (schedules.isEmpty()) {
            return Collections.emptyList();
        }

        Map<ScheduleCategory, List<Schedule>> grouped = schedules.stream()
                .collect(Collectors.groupingBy(Schedule::getCategory));

        double grandTotalHours = calculateTotalHours(schedules);

        return Arrays.stream(ScheduleCategory.values())
                .map(category -> {
                    List<Schedule> categorySchedules = grouped.getOrDefault(category, Collections.emptyList());
                    double categoryHours = calculateTotalHours(categorySchedules);
                    double percentage = grandTotalHours > 0
                            ? Math.round((categoryHours / grandTotalHours) * 100.0 * 10.0) / 10.0
                            : 0.0;

                    return CategoryDistributionDto.builder()
                            .category(category)
                            .totalHours(Math.round(categoryHours * 10.0) / 10.0)
                            .taskCount((long) categorySchedules.size())
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<NutritionTrendDto> calculateNutritionTrends(LocalDate startDate, LocalDate endDate, List<MealLog> logs) {
        Map<LocalDate, List<MealLog>> logsByDate = logs.stream()
                .collect(Collectors.groupingBy(log -> log.getLoggedAt().toLocalDate()));

        List<NutritionTrendDto> result = new ArrayList<>();
        LocalDate curr = startDate;

        while (!curr.isAfter(endDate)) {
            List<MealLog> dayLogs = logsByDate.getOrDefault(curr, Collections.emptyList());
            double cals = dayLogs.stream().mapToDouble(MealLog::getCalories).sum();
            double protein = dayLogs.stream().mapToDouble(MealLog::getProtein).sum();
            double carbs = dayLogs.stream().mapToDouble(MealLog::getCarbs).sum();
            double fat = dayLogs.stream().mapToDouble(MealLog::getFat).sum();

            result.add(NutritionTrendDto.builder()
                    .date(curr)
                    .totalCalories(Math.round(cals * 10.0) / 10.0)
                    .totalProtein(Math.round(protein * 10.0) / 10.0)
                    .totalCarbs(Math.round(carbs * 10.0) / 10.0)
                    .totalFat(Math.round(fat * 10.0) / 10.0)
                    .mealCount(dayLogs.size())
                    .build());

            curr = curr.plusDays(1);
        }

        return result;
    }

    private List<ScheduleTrendDto> calculateScheduleTrends(LocalDate startDate, LocalDate endDate, List<Schedule> schedules) {
        Map<LocalDate, List<Schedule>> schedulesByDate = schedules.stream()
                .collect(Collectors.groupingBy(s -> s.getStartTime().toLocalDate()));

        List<ScheduleTrendDto> result = new ArrayList<>();
        LocalDate curr = startDate;

        while (!curr.isAfter(endDate)) {
            List<Schedule> daySchedules = schedulesByDate.getOrDefault(curr, Collections.emptyList());
            long completed = daySchedules.stream().filter(s -> s.getStatus() == ScheduleStatus.COMPLETED).count();
            double hours = calculateTotalHours(daySchedules);

            result.add(ScheduleTrendDto.builder()
                    .date(curr)
                    .totalTasks((long) daySchedules.size())
                    .completedTasks(completed)
                    .totalHours(Math.round(hours * 10.0) / 10.0)
                    .build());

            curr = curr.plusDays(1);
        }

        return result;
    }
}
