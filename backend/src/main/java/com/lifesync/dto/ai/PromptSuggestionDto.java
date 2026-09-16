package com.lifesync.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object representing a suggested quick prompt chip for the AI Assistant interface.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromptSuggestionDto {

    /**
     * Unique identifier for the suggestion chip.
     */
    private String id;

    /**
     * Short display title shown on the chip button.
     */
    private String title;

    /**
     * Full user query text sent to the AI when clicked.
     */
    private String prompt;

    /**
     * Category grouping (e.g., NUTRITION, STRESS, SCHEDULE, HEART_HEALTH).
     */
    private String category;

    /**
     * Icon identifier for frontend rendering (e.g., Heart, Utensils, Zap, Clock).
     */
    private String icon;
}
