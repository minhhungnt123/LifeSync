package com.lifesync.controller;

import com.lifesync.dto.ApiResponse;
import com.lifesync.dto.ai.AiChatRequest;
import com.lifesync.dto.ai.AiChatResponse;
import com.lifesync.dto.ai.FoodScanResponse;
import com.lifesync.dto.ai.PromptSuggestionDto;
import com.lifesync.service.ai.AiAssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST Controller exposing AI endpoints for LifeSync:
 * - AI Multimodal Food Scanner
 * - Personalized Heartcare & Lifestyle Assistant Chat
 * - Prompt Suggestions for UI Quick Actions
 */
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAssistantService aiAssistantService;

    /**
     * Scans an uploaded meal image and returns nutritional estimations and heart-health advice.
     */
    @PostMapping(value = "/scan-food", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FoodScanResponse>> scanFood(
            @RequestParam("file") MultipartFile file) {
        FoodScanResponse response = aiAssistantService.scanFood(file);
        return ResponseEntity.ok(ApiResponse.success(response, "Phân tích món ăn thành công!"));
    }

    /**
     * Chats with the Heartcare AI Assistant with personal health and schedule context injection.
     */
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiAssistantService.chat(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Trợ lý AI đã phản hồi thành công!"));
    }

    /**
     * Retrieves pre-built prompt suggestions for quick actions on the chat interface.
     */
    @GetMapping("/suggested-prompts")
    public ResponseEntity<ApiResponse<List<PromptSuggestionDto>>> getSuggestedPrompts() {
        List<PromptSuggestionDto> response = aiAssistantService.getSuggestedPrompts();
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách gợi ý câu hỏi thành công!"));
    }
}
