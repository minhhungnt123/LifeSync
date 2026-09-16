package com.lifesync.service.ai;

import com.lifesync.dto.ai.AiChatRequest;
import com.lifesync.dto.ai.AiChatResponse;
import com.lifesync.dto.ai.FoodScanResponse;
import com.lifesync.dto.ai.PromptSuggestionDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * High-level service interface coordinating AI capabilities across LifeSync,
 * including multimodal Food Scanning and Personalized Heartcare Chat.
 */
public interface AiAssistantService {

    /**
     * Conducts a personalized conversation with the AI Heartcare Assistant by combining
     * the user's inquiry with their real-time health profile, nutritional logs, and schedule context.
     *
     * @param userEmail Email of the authenticated user.
     * @param request   Inbound chat message request.
     * @return AI response containing actionable guidance, markdown text, and clinical disclaimer.
     */
    AiChatResponse chat(String userEmail, AiChatRequest request);

    /**
     * Scans an uploaded meal image and returns nutritional breakdown and heart health advice.
     *
     * @param file Uploaded food image file.
     * @return Parsed food nutrition metrics.
     */
    FoodScanResponse scanFood(MultipartFile file);

    /**
     * Retrieves pre-configured prompt suggestions tailored for quick interactions.
     *
     * @return List of suggested prompt chips.
     */
    List<PromptSuggestionDto> getSuggestedPrompts();
}
