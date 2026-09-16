package com.lifesync.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Data transfer object representing the scanned meal analysis result from Google Gemini Flash.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FoodScanResponse {

    /**
     * Whether the scanned image actually contains recognized food/meal items.
     */
    @JsonProperty("isFood")
    @Builder.Default
    private Boolean isFood = true;

    /**
     * Detected name of the dish or food item.
     */
    @JsonProperty("foodName")
    private String foodName;

    /**
     * Estimated portion size (e.g., "1 bát vừa ~350g", "1 đĩa tiêu chuẩn ~400g").
     */
    @JsonProperty("portion")
    private String portion;

    /**
     * Estimated total energy in Calories (kcal).
     */
    @JsonProperty("calories")
    @Builder.Default
    private Double calories = 0.0;

    /**
     * Confidence score of the detection (0.0 to 1.0).
     */
    @JsonProperty("confidence")
    @Builder.Default
    private Double confidence = 0.0;

    /**
     * Macronutrients breakdown (Protein, Carbs, Fat, Sodium).
     */
    @JsonProperty("macros")
    @Builder.Default
    private NutritionMacrosDto macros = new NutritionMacrosDto();

    /**
     * Primary detected ingredients.
     */
    @JsonProperty("ingredients")
    @Builder.Default
    private List<String> ingredients = new ArrayList<>();

    /**
     * Actionable cardiovascular & lifestyle health tip tailored to this meal.
     */
    @JsonProperty("heartHealthTip")
    private String heartHealthTip;

    /**
     * Heart-health compatibility score (1 to 100).
     */
    @JsonProperty("healthScore")
    @Builder.Default
    private Integer healthScore = 70;
}
