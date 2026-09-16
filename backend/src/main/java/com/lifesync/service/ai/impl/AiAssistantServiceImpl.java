package com.lifesync.service.ai.impl;

import com.lifesync.dto.ai.AiChatRequest;
import com.lifesync.dto.ai.AiChatResponse;
import com.lifesync.dto.ai.FoodScanResponse;
import com.lifesync.dto.ai.PromptSuggestionDto;
import com.lifesync.service.ai.AiAssistantService;
import com.lifesync.service.ai.FoodScanService;
import com.lifesync.service.ai.GeminiAiClient;
import com.lifesync.service.ai.HeartCareContextBuilderService;
import com.lifesync.service.ai.prompt.HeartcarePromptTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Implementation of {@link AiAssistantService} orchestrating health context aggregation,
 * clinical prompt generation, multimodal vision processing, and Gemini AI interaction.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiAssistantServiceImpl implements AiAssistantService {

    private final HeartCareContextBuilderService heartCareContextBuilderService;
    private final HeartcarePromptTemplate heartcarePromptTemplate;
    private final GeminiAiClient geminiAiClient;
    private final FoodScanService foodScanService;
    private final com.lifesync.service.ai.AiRateLimiterService aiRateLimiterService;

    @Override
    public AiChatResponse chat(String userEmail, AiChatRequest request) {
        log.info("Processing AI Heartcare Chat request for user: {}", userEmail);

        // 1. Enforce user-level rate limiting
        aiRateLimiterService.checkRateLimit(userEmail);

        // 2. Build personalized clinical prompt
        String contextMarkdown = heartCareContextBuilderService.buildFormattedPromptContext(userEmail);
        String compositePrompt = heartcarePromptTemplate.buildPromptWithContext(request.getMessage(), contextMarkdown);
        String systemInstruction = heartcarePromptTemplate.getSystemInstruction();

        String reply;
        try {
            reply = geminiAiClient.generateText(systemInstruction, compositePrompt);
        } catch (com.lifesync.exception.AiServiceException ex) {
            // Rethrow client/rate limit issues
            if (ex.getStatus() == org.springframework.http.HttpStatus.TOO_MANY_REQUESTS
                    || ex.getStatus() == org.springframework.http.HttpStatus.BAD_REQUEST) {
                throw ex;
            }

            // Graceful fallback for server/gateway/timeout issues
            log.error("AI Assistant backend connection interrupted: {}. Returning safety lifestyle fallback.", ex.getMessage());
            reply = """
                    ⚠️ **Thông báo kết nối AI**:
                    Hệ thống Trợ lý Tim mạch LifeSync AI tạm thời gặp gián đoạn kết nối tới máy chủ mô hình.
                    
                    Trong thời gian này, xin bạn lưu ý các nguyên tắc vàng chăm sóc sức khỏe tim mạch:
                    - **Dinh dưỡng**: Giảm muối (< 2.300mg/ngày), tăng cường rau xanh giàu kali và chất xơ.
                    - **Điều hòa nhịp tim**: Thực hiện bài tập thở Box Breathing (4 giây hít - 4 giây giữ - 4 giây thở - 4 giây nghỉ) để hạ áp lực.
                    - **Nghỉ ngơi**: Đảm bảo ngủ đủ 7-8 tiếng mỗi đêm để tim được phục hồi.
                    
                    Vui lòng thử gửi lại câu hỏi sau ít phút.
                    """;
        }

        return AiChatResponse.builder()
                .reply(reply)
                .disclaimer(HeartcarePromptTemplate.MEDICAL_DISCLAIMER)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public FoodScanResponse scanFood(MultipartFile file) {
        log.info("Delegating food scan request for file: {}", file != null ? file.getOriginalFilename() : "null");
        return foodScanService.scanFoodImage(file);
    }

    @Override
    public List<PromptSuggestionDto> getSuggestedPrompts() {
        return heartcarePromptTemplate.getSuggestedPrompts();
    }
}
