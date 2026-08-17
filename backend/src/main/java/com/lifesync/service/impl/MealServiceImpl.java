package com.lifesync.service.impl;

import com.lifesync.dto.DailyNutritionSummaryResponse;
import com.lifesync.dto.MealLogRequest;
import com.lifesync.dto.MealLogResponse;
import com.lifesync.entity.MealLog;
import com.lifesync.entity.User;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.MealLogRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealServiceImpl implements MealService {

    private final MealLogRepository mealLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public MealLogResponse createMealLog(String userEmail, MealLogRequest request) {
        User user = getUserByEmail(userEmail);

        MealLog mealLog = MealLog.builder()
                .user(user)
                .mealType(request.getMealType())
                .foodName(request.getFoodName())
                .calories(request.getCalories())
                .protein(request.getProtein() != null ? request.getProtein() : 0.0)
                .carbs(request.getCarbs() != null ? request.getCarbs() : 0.0)
                .fat(request.getFat() != null ? request.getFat() : 0.0)
                .loggedAt(request.getLoggedAt())
                .build();

        MealLog savedMealLog = mealLogRepository.save(mealLog);
        return mapToMealLogResponse(savedMealLog);
    }

    @Override
    @Transactional
    public MealLogResponse updateMealLog(String userEmail, Long mealLogId, MealLogRequest request) {
        User user = getUserByEmail(userEmail);
        MealLog mealLog = getMealLogOwnedByUser(mealLogId, user.getId());

        mealLog.setMealType(request.getMealType());
        mealLog.setFoodName(request.getFoodName());
        mealLog.setCalories(request.getCalories());
        mealLog.setProtein(request.getProtein() != null ? request.getProtein() : 0.0);
        mealLog.setCarbs(request.getCarbs() != null ? request.getCarbs() : 0.0);
        mealLog.setFat(request.getFat() != null ? request.getFat() : 0.0);
        mealLog.setLoggedAt(request.getLoggedAt());

        MealLog updatedMealLog = mealLogRepository.save(mealLog);
        return mapToMealLogResponse(updatedMealLog);
    }

    @Override
    @Transactional
    public void deleteMealLog(String userEmail, Long mealLogId) {
        User user = getUserByEmail(userEmail);
        MealLog mealLog = getMealLogOwnedByUser(mealLogId, user.getId());
        mealLogRepository.delete(mealLog);
    }

    @Override
    @Transactional(readOnly = true)
    public MealLogResponse getMealLogById(String userEmail, Long mealLogId) {
        User user = getUserByEmail(userEmail);
        MealLog mealLog = getMealLogOwnedByUser(mealLogId, user.getId());
        return mapToMealLogResponse(mealLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MealLogResponse> getUserMealLogs(String userEmail, LocalDate date, LocalDateTime start, LocalDateTime end) {
        User user = getUserByEmail(userEmail);

        List<MealLog> mealLogs;
        if (date != null) {
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
            mealLogs = mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(user.getId(), startOfDay, endOfDay);
        } else if (start != null && end != null) {
            mealLogs = mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(user.getId(), start, end);
        } else {
            mealLogs = mealLogRepository.findByUserIdOrderByLoggedAtDesc(user.getId());
        }

        return mealLogs.stream()
                .map(this::mapToMealLogResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DailyNutritionSummaryResponse getDailyNutritionSummary(String userEmail, LocalDate date) {
        User user = getUserByEmail(userEmail);
        LocalDate targetDate = (date != null) ? date : LocalDate.now();

        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay = targetDate.atTime(LocalTime.MAX);

        List<MealLog> dailyLogs = mealLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(user.getId(), startOfDay, endOfDay);

        double totalCalories = dailyLogs.stream().mapToDouble(MealLog::getCalories).sum();
        double totalProtein = dailyLogs.stream().mapToDouble(MealLog::getProtein).sum();
        double totalCarbs = dailyLogs.stream().mapToDouble(MealLog::getCarbs).sum();
        double totalFat = dailyLogs.stream().mapToDouble(MealLog::getFat).sum();

        List<MealLogResponse> mealResponses = dailyLogs.stream()
                .map(this::mapToMealLogResponse)
                .collect(Collectors.toList());

        return DailyNutritionSummaryResponse.builder()
                .date(targetDate)
                .totalCalories(totalCalories)
                .totalProtein(totalProtein)
                .totalCarbs(totalCarbs)
                .totalFat(totalFat)
                .mealCount(dailyLogs.size())
                .meals(mealResponses)
                .build();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng!"));
    }

    private MealLog getMealLogOwnedByUser(Long mealLogId, Long userId) {
        MealLog mealLog = mealLogRepository.findById(mealLogId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhật ký bữa ăn!"));

        if (!mealLog.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy nhật ký bữa ăn hoặc bạn không có quyền truy cập!");
        }

        return mealLog;
    }

    private MealLogResponse mapToMealLogResponse(MealLog mealLog) {
        Long userId = (mealLog.getUser() != null) ? mealLog.getUser().getId() : null;

        return MealLogResponse.builder()
                .id(mealLog.getId())
                .userId(userId)
                .mealType(mealLog.getMealType())
                .foodName(mealLog.getFoodName())
                .calories(mealLog.getCalories())
                .protein(mealLog.getProtein())
                .carbs(mealLog.getCarbs())
                .fat(mealLog.getFat())
                .loggedAt(mealLog.getLoggedAt())
                .createdAt(mealLog.getCreatedAt())
                .updatedAt(mealLog.getUpdatedAt())
                .build();
    }
}
