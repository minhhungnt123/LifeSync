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
     * Fallback fields in case AI returns macros at the root level.
     */
    @JsonProperty("protein")
    @com.fasterxml.jackson.annotation.JsonAlias({"protein_g", "proteins", "proteinGrams"})
    private Double rootProtein;

    @JsonProperty("carbs")
    @com.fasterxml.jackson.annotation.JsonAlias({"carbohydrates", "carb", "carbs_g", "carbohydrate"})
    private Double rootCarbs;

    @JsonProperty("fat")
    @com.fasterxml.jackson.annotation.JsonAlias({"fats", "fat_g", "total_fat", "lipids"})
    private Double rootFat;

    @JsonProperty("sodium")
    @com.fasterxml.jackson.annotation.JsonAlias({"sodium_mg", "salt", "natri"})
    private Double rootSodium;

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

    /**
     * Merges root-level nutrients into the nested macros object if present.
     */
    public void consolidateMacros() {
        if (this.macros == null) {
            this.macros = new NutritionMacrosDto();
        }
        if ((this.macros.getProtein() == null || this.macros.getProtein() == 0.0) && this.rootProtein != null) {
            this.macros.setProtein(this.rootProtein);
        }
        if ((this.macros.getCarbs() == null || this.macros.getCarbs() == 0.0) && this.rootCarbs != null) {
            this.macros.setCarbs(this.rootCarbs);
        }
        if ((this.macros.getFat() == null || this.macros.getFat() == 0.0) && this.rootFat != null) {
            this.macros.setFat(this.rootFat);
        }
        if ((this.macros.getSodium() == null || this.macros.getSodium() == 0.0) && this.rootSodium != null) {
            this.macros.setSodium(this.rootSodium);
        }
    }
}
