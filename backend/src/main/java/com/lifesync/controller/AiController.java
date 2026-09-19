package com.lifesync.controller;

import com.lifesync.dto.ApiResponse;
import com.lifesync.dto.ai.AiChatRequest;
import com.lifesync.dto.ai.AiChatResponse;
import com.lifesync.dto.ai.FoodScanResponse;
import com.lifesync.dto.ai.PromptSuggestionDto;
import com.lifesync.service.ai.AiAssistantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "AI Assistant", description = "Tính năng AI thông minh: Phân tích ảnh món ăn Gemini Vision và Trợ lý sức khỏe tim mạch & lối sống")
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAssistantService aiAssistantService;

    /**
     * Scans an uploaded meal image and returns nutritional estimations and heart-health advice.
     */
    @Operation(summary = "Quét ảnh bữa ăn và ước tính dinh dưỡng", description = "Sử dụng Google Gemini Multimodal Vision phân tích hình ảnh món ăn, ước tính Calo, phân bổ Macros và lời khuyên tim mạch")
    @PostMapping(value = "/scan-food", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FoodScanResponse>> scanFood(
            @RequestParam("file") MultipartFile file) {
        FoodScanResponse response = aiAssistantService.scanFood(file);
        return ResponseEntity.ok(ApiResponse.success(response, "Phân tích món ăn thành công!"));
    }

    /**
     * Chats with the Heartcare AI Assistant with personal health and schedule context injection.
     */
    @Operation(summary = "Trò chuyện với Trợ lý AI Chăm sóc Tim mạch & Lối sống", description = "Chat tương tác đồng hành với trợ lý AI, nạp sẵn ngữ cảnh hồ sơ sức khỏe BMI, lịch trình và bữa ăn gần nhất", security = @SecurityRequirement(name = "Bearer Authentication"))
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
    @Operation(summary = "Lấy danh sách câu hỏi gợi ý nhanh", description = "Trả về danh sách câu hỏi mẫu tiện ích phục vụ hiển thị quick prompt chips trên giao diện Chatbot")
    @GetMapping("/suggested-prompts")
    public ResponseEntity<ApiResponse<List<PromptSuggestionDto>>> getSuggestedPrompts() {
        List<PromptSuggestionDto> response = aiAssistantService.getSuggestedPrompts();
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách gợi ý câu hỏi thành công!"));
    }
}
