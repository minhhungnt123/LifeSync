package com.lifesync.service.calculator;

import com.lifesync.entity.UserProfile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class BodyMetricsCalculatorTest {

    private BodyMetricsCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new BodyMetricsCalculator();
    }

    @Test
    @DisplayName("Should correctly calculate BMI and classification")
    void testCalculateBmi() {
        // Height 170cm, Weight 65kg -> 65 / (1.7^2) = 22.49 -> 22.5
        double bmi = calculator.calculateBmi(65.0, 170.0);
        assertThat(bmi).isEqualTo(22.5);
        assertThat(calculator.getBmiStatusLabel(bmi)).isEqualTo("Bình thường (Normal)");

        // Underweight
        double underBmi = calculator.calculateBmi(45.0, 170.0);
        assertThat(calculator.getBmiStatusLabel(underBmi)).isEqualTo("Gầy (Underweight)");

        // Overweight
        double overBmi = calculator.calculateBmi(70.0, 170.0);
        assertThat(calculator.getBmiStatusLabel(overBmi)).isEqualTo("Tiền béo phì (Overweight)");

        // Obese
        double obeseBmi = calculator.calculateBmi(85.0, 170.0);
        assertThat(calculator.getBmiStatusLabel(obeseBmi)).isEqualTo("Béo phì (Obese)");
    }

    @Test
    @DisplayName("Should correctly calculate BMR for male and female using Mifflin-St Jeor")
    void testCalculateBmr() {
        // Male: 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1673.8
        double maleBmr = calculator.calculateBmr(70.0, 175.0, 25, "MALE");
        assertThat(maleBmr).isEqualTo(1673.8);

        // Female: 10*50 + 6.25*160 - 5*25 - 161 = 500 + 1000 - 125 - 161 = 1214.0
        double femaleBmr = calculator.calculateBmr(50.0, 160.0, 25, "FEMALE");
        assertThat(femaleBmr).isEqualTo(1214.0);
    }

    @Test
    @DisplayName("Should resolve correct physical activity multiplier and TDEE")
    void testActivityMultiplierAndTdee() {
        assertThat(calculator.getActivityMultiplier("SEDENTARY")).isEqualTo(1.2);
        assertThat(calculator.getActivityMultiplier("LIGHTLY_ACTIVE")).isEqualTo(1.375);
        assertThat(calculator.getActivityMultiplier("MODERATE")).isEqualTo(1.55);
        assertThat(calculator.getActivityMultiplier("MODERATELY_ACTIVE")).isEqualTo(1.55);
        assertThat(calculator.getActivityMultiplier("VERY_ACTIVE")).isEqualTo(1.725);
        assertThat(calculator.getActivityMultiplier("EXTRA_ACTIVE")).isEqualTo(1.9);

        // BMR 1500 * 1.55 = 2325.0
        double tdee = calculator.calculateTdee(1500.0, "MODERATELY_ACTIVE");
        assertThat(tdee).isEqualTo(2325.0);
    }

    @Test
    @DisplayName("Should calculate recommended calories for weight maintenance, loss, and gain")
    void testCalculateRecommendedDailyCalories() {
        double tdee = 2000.0;

        // Maintain weight
        int maintain = calculator.calculateRecommendedDailyCalories(tdee, 65.0, 65.0);
        assertThat(maintain).isEqualTo(2000);

        // Weight loss target (-500 kcal)
        int loss = calculator.calculateRecommendedDailyCalories(tdee, 70.0, 65.0);
        assertThat(loss).isEqualTo(1500);

        // Weight gain target (+400 kcal)
        int gain = calculator.calculateRecommendedDailyCalories(tdee, 60.0, 65.0);
        assertThat(gain).isEqualTo(2400);
    }

    @Test
    @DisplayName("Should calculate target calories from UserProfile entity")
    void testCalculateTargetCaloriesFromProfile() {
        UserProfile profile = UserProfile.builder()
                .weightKg(65.0)
                .heightCm(170.0)
                .gender("MALE")
                .dateOfBirth(LocalDate.now().minusYears(25))
                .activityLevel("SEDENTARY")
                .build();

        double calories = calculator.calculateTargetCalories(profile);
        assertThat(calories).isGreaterThan(1500.0);
    }
}
