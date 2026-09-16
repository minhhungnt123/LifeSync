package com.lifesync.dto.ai.gemini;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Data transfer object representing the payload sent to Google Gemini generateContent API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeminiRequest {

    @JsonProperty("systemInstruction")
    private GeminiContent systemInstruction;

    @JsonProperty("contents")
    @Builder.Default
    private List<GeminiContent> contents = new ArrayList<>();

    @JsonProperty("generationConfig")
    private GeminiGenerationConfig generationConfig;
}
