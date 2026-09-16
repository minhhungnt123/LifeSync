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
 * Data transfer object representing conversation content in Gemini API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeminiContent {

    @JsonProperty("role")
    private String role;

    @JsonProperty("parts")
    @Builder.Default
    private List<GeminiPart> parts = new ArrayList<>();

    public static GeminiContent userContent(List<GeminiPart> parts) {
        return GeminiContent.builder()
                .role("user")
                .parts(parts)
                .build();
    }

    public static GeminiContent userText(String text) {
        return GeminiContent.builder()
                .role("user")
                .parts(List.of(GeminiPart.ofText(text)))
                .build();
    }

    public static GeminiContent systemInstruction(String text) {
        return GeminiContent.builder()
                .parts(List.of(GeminiPart.ofText(text)))
                .build();
    }
}
