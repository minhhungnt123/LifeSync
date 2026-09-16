package com.lifesync.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object representing nutritional macronutrients and micronutrients.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class NutritionMacrosDto {

    /**
     * Estimated protein in grams.
     */
    @JsonProperty("protein")
    @Builder.Default
    private Double protein = 0.0;

    /**
     * Estimated carbohydrates in grams.
     */
    @JsonProperty("carbs")
    @Builder.Default
    private Double carbs = 0.0;

    /**
     * Estimated fat in grams.
     */
    @JsonProperty("fat")
    @Builder.Default
    private Double fat = 0.0;

    /**
     * Estimated sodium in milligrams (critical for DASH diet & cardiovascular health).
     */
    @JsonProperty("sodium")
    @Builder.Default
    private Double sodium = 0.0;
}
