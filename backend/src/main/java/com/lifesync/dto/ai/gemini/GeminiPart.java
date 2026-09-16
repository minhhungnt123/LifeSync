package com.lifesync.dto.ai.gemini;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object representing a part of content in Gemini API request or response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeminiPart {

    @JsonProperty("text")
    private String text;

    @JsonProperty("inlineData")
    private GeminiInlineData inlineData;

    public static GeminiPart ofText(String text) {
        return GeminiPart.builder().text(text).build();
    }

    public static GeminiPart ofInlineData(String mimeType, String base64Data) {
        return GeminiPart.builder()
                .inlineData(GeminiInlineData.builder()
                        .mimeType(mimeType)
                        .data(base64Data)
                        .build())
                .build();
    }
}
