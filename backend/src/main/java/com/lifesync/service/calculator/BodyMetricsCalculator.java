package com.lifesync.service.calculator;

import com.lifesync.entity.UserProfile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;

/**
 * Domain calculator component for physiological and nutritional metrics.
 * Adheres to Single Responsibility Principle (SRP) by encapsulating all
 * Mifflin-St Jeor formulas, WHO Asian-Pacific BMI criteria, and TDEE calculations.
 */
@Component
public class BodyMetricsCalculator {

    // Default Fallback Values
    public static final double DEFAULT_HEIGHT_CM = 170.0;
    public static final double DEFAULT_WEIGHT_KG = 65.0;
    public static final double DEFAULT_TARGET_CALORIES = 2000.0;
    public static final int DEFAULT_AGE = 25;
    public static final String DEFAULT_ACTIVITY_LEVEL = "SEDENTARY";

    // Mifflin-St Jeor Formula Constants
    private static final double MIFFLIN_WEIGHT_FACTOR = 10.0;
    private static final double MIFFLIN_HEIGHT_FACTOR = 6.25;
    private static final double MIFFLIN_AGE_FACTOR = 5.0;
    private static final double MALE_BMR_OFFSET = 5.0;
    private static final double FEMALE_BMR_OFFSET = -161.0;

    // Activity Multipliers
    public static final double MULTIPLIER_SEDENTARY = 1.2;
    public static final double MULTIPLIER_LIGHT = 1.375;
    public static final double MULTIPLIER_MODERATE = 1.55;
    public static final double MULTIPLIER_VERY_ACTIVE = 1.725;
    public static final double MULTIPLIER_EXTRA_ACTIVE = 1.9;

    // WHO Asian-Pacific BMI Cutoffs
    public static final double BMI_UNDERWEIGHT_UPPER = 18.5;
    public static final double BMI_NORMAL_UPPER = 23.0;
    public static final double BMI_OVERWEIGHT_UPPER = 25.0;

    // Caloric Goal Adjustments
    private static final double WEIGHT_DIFFERENCE_THRESHOLD = 0.5;
    private static final int WEIGHT_LOSS_CALORIC_DEFICIT = 500;
    private static final int WEIGHT_GAIN_CALORIC_SURPLUS = 400;

    /**
     * Calculates Body Mass Index (BMI).
     *
     * @param weightKg body weight in kilograms
     * @param heightCm body height in centimeters
     * @return rounded BMI to 1 decimal place
     */
    public double calculateBmi(double weightKg, double heightCm) {
        if (heightCm <= 0 || weightKg <= 0) {
            return 0.0;
        }
        double heightM = heightCm / 100.0;
        double bmi = weightKg / (heightM * heightM);
        return roundToOneDecimal(bmi);
    }

    /**
     * Returns descriptive health classification based on Asian-Pacific WHO guidelines.
     */
    public String getBmiStatusLabel(double bmi) {
        if (bmi < BMI_UNDERWEIGHT_UPPER) {
            return "Gầy (Underweight)";
        }
        if (bmi < BMI_NORMAL_UPPER) {
            return "Bình thường (Normal)";
        }
        if (bmi < BMI_OVERWEIGHT_UPPER) {
            return "Tiền béo phì (Overweight)";
        }
        return "Béo phì (Obese)";
    }

    /**
     * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation.
     */
    public double calculateBmr(double weightKg, double heightCm, int age, String gender) {
        boolean isFemale = "FEMALE".equalsIgnoreCase(gender) || "Nữ".equalsIgnoreCase(gender);
        double genderOffset = isFemale ? FEMALE_BMR_OFFSET : MALE_BMR_OFFSET;

        double bmr = (MIFFLIN_WEIGHT_FACTOR * weightKg)
                + (MIFFLIN_HEIGHT_FACTOR * heightCm)
                - (MIFFLIN_AGE_FACTOR * age)
                + genderOffset;

        return roundToOneDecimal(Math.max(0.0, bmr));
    }

    /**
     * Resolves physical activity multiplier for Total Daily Energy Expenditure (TDEE).
     */
    public double getActivityMultiplier(String activityLevel) {
        if (activityLevel == null) {
            return MULTIPLIER_SEDENTARY;
        }

        return switch (activityLevel.toUpperCase()) {
            case "LIGHT", "LIGHTLY_ACTIVE" -> MULTIPLIER_LIGHT;
            case "MODERATE", "MODERATELY_ACTIVE" -> MULTIPLIER_MODERATE;
            case "ACTIVE", "VERY_ACTIVE" -> MULTIPLIER_VERY_ACTIVE;
            case "EXTRA_ACTIVE" -> MULTIPLIER_EXTRA_ACTIVE;
            default -> MULTIPLIER_SEDENTARY;
        };
    }

    /**
     * Calculates Total Daily Energy Expenditure (TDEE).
     */
    public double calculateTdee(double bmr, String activityLevel) {
        double multiplier = getActivityMultiplier(activityLevel);
        return roundToOneDecimal(bmr * multiplier);
    }

    /**
     * Calculates recommended daily calorie intake based on current weight and goal target weight.
     */
    public int calculateRecommendedDailyCalories(double tdee, double currentWeightKg, double targetWeightKg) {
        int baseCalories = (int) Math.round(tdee);

        if (targetWeightKg < currentWeightKg - WEIGHT_DIFFERENCE_THRESHOLD) {
            return Math.max(1200, baseCalories - WEIGHT_LOSS_CALORIC_DEFICIT);
        } else if (targetWeightKg > currentWeightKg + WEIGHT_DIFFERENCE_THRESHOLD) {
            return baseCalories + WEIGHT_GAIN_CALORIC_SURPLUS;
        }

        return baseCalories;
    }

    /**
     * Convenience method to calculate target maintenance or goal calories directly from UserProfile.
     */
    public double calculateTargetCalories(UserProfile profile) {
        if (profile == null || profile.getWeightKg() == null || profile.getHeightCm() == null) {
            return DEFAULT_TARGET_CALORIES;
        }

        double weight = profile.getWeightKg();
        double height = profile.getHeightCm();
        int age = calculateAge(profile.getDateOfBirth());
        String gender = profile.getGender();
        String activity = profile.getActivityLevel();

        double bmr = calculateBmr(weight, height, age, gender);
        return calculateTdee(bmr, activity);
    }

    /**
     * Computes age in full years from date of birth.
     */
    public int calculateAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return DEFAULT_AGE;
        }
        return Math.max(1, Period.between(dateOfBirth, LocalDate.now()).getYears());
    }

    private double roundToOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
