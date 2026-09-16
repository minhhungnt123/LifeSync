package com.lifesync.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesync.config.GeminiProperties;
import com.lifesync.exception.AiServiceException;
import com.lifesync.service.ai.impl.GeminiAiClientImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class GeminiAiClientTest {

    private MockRestServiceServer mockServer;
    private GeminiProperties geminiProperties;
    private ObjectMapper objectMapper;
    private GeminiAiClient geminiAiClient;

    public record TestResultDto(String foodName, int calories) {}

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        geminiProperties = new GeminiProperties();
        geminiProperties.setApiKey("test-gemini-api-key");
        geminiProperties.setModel("gemini-1.5-flash");
        geminiProperties.setBaseUrl("https://generativelanguage.googleapis.com/v1beta");
        geminiProperties.setMaxRetries(0);
        geminiProperties.setFallbackModel(null);

        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        RestClient restClient = builder.build();

        geminiAiClient = new GeminiAiClientImpl(restClient, geminiProperties, objectMapper);
    }

    @Test
    @DisplayName("generateText: Trả về văn bản thành công khi Gemini phản hồi hợp lệ")
    void generateText_Success() {
        String expectedResponseJson = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          { "text": "Xin chào! Tôi là trợ lý LifeSync." }
                        ],
                        "role": "model"
                      },
                      "finishReason": "STOP",
                      "index": 0
                    }
                  ]
                }
                """;

        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-gemini-api-key"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(expectedResponseJson, MediaType.APPLICATION_JSON));

        String response = geminiAiClient.generateText("Bạn là trợ lý ảo.", "Chào bạn!");

        assertThat(response).isEqualTo("Xin chào! Tôi là trợ lý LifeSync.");
        mockServer.verify();
    }

    @Test
    @DisplayName("generateStructuredJson: Tự động bóc tách JSON và loại bỏ markdown codeblocks thành công")
    void generateStructuredJson_Success() {
        String responseWithMarkdown = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          { "text": "```json\\n{\\"foodName\\":\\"Phở Bò\\",\\"calories\\":450}\\n```" }
                        ],
                        "role": "model"
                      },
                      "finishReason": "STOP",
                      "index": 0
                    }
                  ]
                }
                """;

        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-gemini-api-key"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseWithMarkdown, MediaType.APPLICATION_JSON));

        TestResultDto result = geminiAiClient.generateStructuredJson(
                "Trích xuất thông tin món ăn",
                "Phân tích món này",
                TestResultDto.class
        );

        assertThat(result).isNotNull();
        assertThat(result.foodName()).isEqualTo("Phở Bò");
        assertThat(result.calories()).isEqualTo(450);
        mockServer.verify();
    }

    @Test
    @DisplayName("Ném AiServiceException khi chưa cấu hình API Key")
    void generateText_ThrowsException_WhenApiKeyMissing() {
        geminiProperties.setApiKey(null);

        assertThatThrownBy(() -> geminiAiClient.generateText(null, "Test prompt"))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("Google Gemini API Key chưa được cấu hình");
    }

    @Test
    @DisplayName("generateVision: Ném AiServiceException khi dữ liệu ảnh rỗng")
    void generateVision_ThrowsException_WhenImageEmpty() {
        assertThatThrownBy(() -> geminiAiClient.generateVision("Context", "Prompt", new byte[0], "image/jpeg"))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("Dữ liệu hình ảnh không được để trống");
    }

    @Test
    @DisplayName("Xử lý lỗi 429 Too Many Requests từ Gemini API")
    void generateText_HandlesRateLimiting() {
        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-gemini-api-key"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS).body("Quota exceeded"));

        assertThatThrownBy(() -> geminiAiClient.generateText(null, "Hello"))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("Hạn mức gọi Gemini API đã vượt quá giới hạn");
        mockServer.verify();
    }

    @Test
    @DisplayName("generateText: Thử lại thành công sau khi gặp lỗi tạm thời 503")
    void generateText_RetriesOnTransientError_Success() {
        geminiProperties.setMaxRetries(1);

        String expectedResponseJson = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [{ "text": "Phản hồi sau khi retry!" }],
                        "role": "model"
                      },
                      "finishReason": "STOP",
                      "index": 0
                    }
                  ]
                }
                """;

        // First attempt fails with 503
        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-gemini-api-key"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        // Second attempt succeeds
        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-gemini-api-key"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(expectedResponseJson, MediaType.APPLICATION_JSON));

        String result = geminiAiClient.generateText(null, "Test prompt");

        assertThat(result).isEqualTo("Phản hồi sau khi retry!");
        mockServer.verify();
    }

    @Test
    @DisplayName("generateText: Tự động chuyển sang fallback model khi primary model gặp lỗi server 503")
    void generateText_SwitchesToFallbackModel_WhenServerError() {
        geminiProperties.setMaxRetries(0);
        geminiProperties.setFallbackModel("gemini-2.5-flash");

        String expectedFallbackResponse = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [{ "text": "Phản hồi từ fallback model!" }],
                        "role": "model"
                      },
                      "finishReason": "STOP",
                      "index": 0
                    }
                  ]
                }
                """;

        // Primary model fails with 503
        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-gemini-api-key"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        // Fallback model succeeds
        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=test-gemini-api-key"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(expectedFallbackResponse, MediaType.APPLICATION_JSON));

        String result = geminiAiClient.generateText(null, "Test prompt");

        assertThat(result).isEqualTo("Phản hồi từ fallback model!");
        mockServer.verify();
    }
}
