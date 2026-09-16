package com.lifesync.service.ai.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesync.config.GeminiProperties;
import com.lifesync.dto.ai.gemini.GeminiContent;
import com.lifesync.dto.ai.gemini.GeminiGenerationConfig;
import com.lifesync.dto.ai.gemini.GeminiPart;
import com.lifesync.dto.ai.gemini.GeminiRequest;
import com.lifesync.dto.ai.gemini.GeminiResponse;
import com.lifesync.exception.AiServiceException;
import com.lifesync.service.ai.GeminiAiClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

/**
 * Implementation of GeminiAiClient using Spring RestClient.
 * Provides resilient communication with Google Gemini API models.
 */
@Slf4j
@Service
public class GeminiAiClientImpl implements GeminiAiClient {

    private final RestClient restClient;
    private final GeminiProperties geminiProperties;
    private final ObjectMapper objectMapper;

    @org.springframework.beans.factory.annotation.Autowired
    public GeminiAiClientImpl(GeminiProperties geminiProperties, ObjectMapper objectMapper) {
        this.geminiProperties = geminiProperties;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        int timeoutMs = (geminiProperties.getTimeoutSeconds() > 0 ? geminiProperties.getTimeoutSeconds() : 30) * 1000;
        requestFactory.setConnectTimeout(Duration.ofMillis(timeoutMs));
        requestFactory.setReadTimeout(Duration.ofMillis(timeoutMs));

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    // Secondary constructor for testing purposes
    public GeminiAiClientImpl(RestClient restClient, GeminiProperties geminiProperties, ObjectMapper objectMapper) {
        this.restClient = restClient;
        this.geminiProperties = geminiProperties;
        this.objectMapper = objectMapper;
    }

    @Override
    public String generateText(String systemInstruction, String userPrompt) {
        validateApiKey();

        GeminiRequest request = buildRequest(
                systemInstruction,
                List.of(GeminiPart.ofText(userPrompt)),
                GeminiGenerationConfig.textConfig(0.7)
        );

        GeminiResponse response = executeCall(request);
        return response.getFirstCandidateText();
    }

    @Override
    public String generateVision(String systemInstruction, String userPrompt, byte[] imageBytes, String mimeType) {
        validateApiKey();
        validateImage(imageBytes, mimeType);

        List<GeminiPart> parts = new ArrayList<>();
        parts.add(GeminiPart.ofInlineData(mimeType, Base64.getEncoder().encodeToString(imageBytes)));
        if (userPrompt != null && !userPrompt.isBlank()) {
            parts.add(GeminiPart.ofText(userPrompt));
        }

        GeminiRequest request = buildRequest(
                systemInstruction,
                parts,
                GeminiGenerationConfig.textConfig(0.4)
        );

        GeminiResponse response = executeCall(request);
        return response.getFirstCandidateText();
    }

    @Override
    public <T> T generateStructuredJson(String systemInstruction, String userPrompt, byte[] imageBytes, String mimeType, Class<T> responseClass) {
        validateApiKey();

        List<GeminiPart> parts = new ArrayList<>();
        if (imageBytes != null && imageBytes.length > 0) {
            validateImage(imageBytes, mimeType);
            parts.add(GeminiPart.ofInlineData(mimeType, Base64.getEncoder().encodeToString(imageBytes)));
        }
        if (userPrompt != null && !userPrompt.isBlank()) {
            parts.add(GeminiPart.ofText(userPrompt));
        }

        GeminiRequest request = buildRequest(
                systemInstruction,
                parts,
                GeminiGenerationConfig.jsonConfig(0.2)
        );

        GeminiResponse response = executeCall(request);
        String rawText = response.getFirstCandidateText();

        return parseJsonResponse(rawText, responseClass);
    }

    @Override
    public <T> T generateStructuredJson(String systemInstruction, String userPrompt, Class<T> responseClass) {
        return generateStructuredJson(systemInstruction, userPrompt, null, null, responseClass);
    }

    private void validateApiKey() {
        if (geminiProperties.getApiKey() == null || geminiProperties.getApiKey().isBlank()) {
            throw new AiServiceException("Google Gemini API Key chưa được cấu hình. Vui lòng kiểm tra biến môi trường GEMINI_API_KEY.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateImage(byte[] imageBytes, String mimeType) {
        if (imageBytes == null || imageBytes.length == 0) {
            throw new AiServiceException("Dữ liệu hình ảnh không được để trống.", HttpStatus.BAD_REQUEST);
        }
        if (mimeType == null || mimeType.isBlank()) {
            throw new AiServiceException("Định dạng MIME type của hình ảnh không hợp lệ.", HttpStatus.BAD_REQUEST);
        }
    }

    private GeminiRequest buildRequest(String systemInstruction, List<GeminiPart> userParts, GeminiGenerationConfig generationConfig) {
        GeminiRequest.GeminiRequestBuilder builder = GeminiRequest.builder()
                .contents(List.of(GeminiContent.userContent(userParts)))
                .generationConfig(generationConfig);

        if (systemInstruction != null && !systemInstruction.isBlank()) {
            builder.systemInstruction(GeminiContent.systemInstruction(systemInstruction));
        }

        return builder.build();
    }

    private GeminiResponse executeCall(GeminiRequest request) {
        String url = String.format(
                "%s/models/%s:generateContent?key=%s",
                geminiProperties.getBaseUrl(),
                geminiProperties.getModel(),
                geminiProperties.getApiKey()
        );

        try {
            log.debug("Sending request to Gemini API (Model: {})", geminiProperties.getModel());
            GeminiResponse response = restClient.post()
                    .uri(url)
                    .body(request)
                    .retrieve()
                    .body(GeminiResponse.class);

            if (response == null) {
                throw new AiServiceException("Phản hồi rỗng từ Google Gemini API.", HttpStatus.BAD_GATEWAY);
            }

            return response;
        } catch (HttpClientErrorException ex) {
            log.error("Gemini API Client Error (Status: {}): {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            if (ex.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                throw new AiServiceException("Hạn mức gọi Gemini API đã vượt quá giới hạn (Rate limit). Vui lòng thử lại sau giây lát.", HttpStatus.TOO_MANY_REQUESTS);
            }
            if (ex.getStatusCode() == HttpStatus.FORBIDDEN || ex.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new AiServiceException("API Key của Google Gemini không hợp lệ hoặc không có quyền truy cập.", HttpStatus.UNAUTHORIZED);
            }
            throw new AiServiceException("Lỗi cú pháp yêu cầu khi gọi Gemini API: " + ex.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (HttpServerErrorException ex) {
            log.error("Gemini API Server Error (Status: {}): {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new AiServiceException("Máy chủ Google Gemini đang gặp sự cố. Vui lòng thử lại sau.", HttpStatus.BAD_GATEWAY);
        } catch (ResourceAccessException ex) {
            log.error("Gemini API Connection / Timeout Error: {}", ex.getMessage());
            throw new AiServiceException("Kết nối tới Gemini API quá thời gian chờ (Timeout).", HttpStatus.GATEWAY_TIMEOUT);
        } catch (Exception ex) {
            if (ex instanceof AiServiceException aiServiceException) {
                throw aiServiceException;
            }
            log.error("Unexpected error during Gemini API execution: {}", ex.getMessage(), ex);
            throw new AiServiceException("Đã xảy ra lỗi không xác định khi giao tiếp với AI: " + ex.getMessage(), ex);
        }
    }

    private <T> T parseJsonResponse(String rawJson, Class<T> responseClass) {
        if (rawJson == null || rawJson.isBlank()) {
            throw new AiServiceException("Mô hình AI trả về nội dung rỗng, không thể bóc tách JSON.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Clean markdown code blocks if the model wrapped it (e.g. ```json ... ```)
        String cleanJson = rawJson.trim();
        if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.substring(7);
        } else if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.substring(3);
        }
        if (cleanJson.endsWith("```")) {
            cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
        }
        cleanJson = cleanJson.trim();

        try {
            return objectMapper.readValue(cleanJson, responseClass);
        } catch (JsonProcessingException ex) {
            log.error("Failed to parse Gemini JSON output: {}\nRaw output: {}", ex.getMessage(), rawJson);
            throw new AiServiceException("Không thể bóc tách cấu trúc JSON từ phản hồi của mô hình AI: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
