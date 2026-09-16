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

    @Override
    public AiChatResponse chat(String userEmail, AiChatRequest request) {
        log.info("Processing AI Heartcare Chat request for user: {}", userEmail);

        String contextMarkdown = heartCareContextBuilderService.buildFormattedPromptContext(userEmail);
        String compositePrompt = heartcarePromptTemplate.buildPromptWithContext(request.getMessage(), contextMarkdown);
        String systemInstruction = heartcarePromptTemplate.getSystemInstruction();

        String reply = geminiAiClient.generateText(systemInstruction, compositePrompt);

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
