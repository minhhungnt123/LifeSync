package com.lifesync.dto.ai.gemini;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object representing generation parameters in Gemini API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeminiGenerationConfig {

    @JsonProperty("temperature")
    private Double temperature;

    @JsonProperty("topP")
    private Double topP;

    @JsonProperty("topK")
    private Integer topK;

    @JsonProperty("maxOutputTokens")
    private Integer maxOutputTokens;

    @JsonProperty("responseMimeType")
    private String responseMimeType;

    public static GeminiGenerationConfig jsonConfig(Double temperature) {
        return GeminiGenerationConfig.builder()
                .temperature(temperature != null ? temperature : 0.2)
                .responseMimeType("application/json")
                .build();
    }

    public static GeminiGenerationConfig textConfig(Double temperature) {
        return GeminiGenerationConfig.builder()
                .temperature(temperature != null ? temperature : 0.7)
                .build();
    }
}
