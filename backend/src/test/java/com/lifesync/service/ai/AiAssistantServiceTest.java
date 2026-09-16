package com.lifesync.service.ai;

import com.lifesync.dto.ai.AiChatRequest;
import com.lifesync.dto.ai.AiChatResponse;
import com.lifesync.dto.ai.FoodScanResponse;
import com.lifesync.dto.ai.NutritionMacrosDto;
import com.lifesync.dto.ai.PromptSuggestionDto;
import com.lifesync.service.ai.impl.AiAssistantServiceImpl;
import com.lifesync.service.ai.prompt.HeartcarePromptTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiAssistantServiceTest {

    @Mock
    private HeartCareContextBuilderService heartCareContextBuilderService;

    @Mock
    private HeartcarePromptTemplate heartcarePromptTemplate;

    @Mock
    private GeminiAiClient geminiAiClient;

    @Mock
    private FoodScanService foodScanService;

    private AiAssistantService aiAssistantService;

    @BeforeEach
    void setUp() {
        aiAssistantService = new AiAssistantServiceImpl(
                heartCareContextBuilderService,
                heartcarePromptTemplate,
                geminiAiClient,
                foodScanService
        );
    }

    @Test
    @DisplayName("chat: Gửi câu hỏi kèm tổng hợp ngữ cảnh sức khỏe thành công")
    void chat_Success() {
        // Given
        String userEmail = "test@lifesync.com";
        AiChatRequest request = new AiChatRequest("Hôm nay tôi nên ăn gì để giảm huyết áp?");
        String mockContext = "### Hồ sơ sức khỏe: BMI 23.5, Huyết áp bình thường";
        String mockCompositePrompt = ">>> CONTEXT <<<\n" + mockContext + "\nCÂU HỎI:\n" + request.getMessage();
        String mockSystemInstruction = "System instruction for Heartcare";
        String expectedAiReply = "Bạn nên bổ sung chuối, rau xanh và hạn chế muối trong bữa tối.";

        when(heartCareContextBuilderService.buildFormattedPromptContext(userEmail)).thenReturn(mockContext);
        when(heartcarePromptTemplate.buildPromptWithContext(request.getMessage(), mockContext)).thenReturn(mockCompositePrompt);
        when(heartcarePromptTemplate.getSystemInstruction()).thenReturn(mockSystemInstruction);
        when(geminiAiClient.generateText(mockSystemInstruction, mockCompositePrompt)).thenReturn(expectedAiReply);

        // When
        AiChatResponse response = aiAssistantService.chat(userEmail, request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getReply()).isEqualTo(expectedAiReply);
        assertThat(response.getDisclaimer()).contains("LƯU Ý Y TẾ QUAN TRỌNG");
        assertThat(response.getTimestamp()).isNotNull();

        verify(heartCareContextBuilderService).buildFormattedPromptContext(userEmail);
        verify(heartcarePromptTemplate).buildPromptWithContext(request.getMessage(), mockContext);
        verify(geminiAiClient).generateText(mockSystemInstruction, mockCompositePrompt);
    }

    @Test
    @DisplayName("scanFood: Ủy quyền quét ảnh món ăn sang FoodScanService")
    void scanFood_Success() {
        // Given
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "salad.jpg",
                "image/jpeg",
                "dummy-image-data".getBytes()
        );

        FoodScanResponse mockScanResponse = FoodScanResponse.builder()
                .foodName("Salad Ức Gà")
                .portion("1 đĩa (250g)")
                .calories(320.0)
                .macros(NutritionMacrosDto.builder()
                        .protein(35.0)
                        .carbs(10.0)
                        .fat(12.0)
                        .sodium(450.0)
                        .build())
                .heartHealthTip("Món ăn rất tốt cho tim mạch với hàm lượng natri thấp.")
                .build();

        when(foodScanService.scanFoodImage(mockFile)).thenReturn(mockScanResponse);

        // When
        FoodScanResponse response = aiAssistantService.scanFood(mockFile);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getFoodName()).isEqualTo("Salad Ức Gà");
        assertThat(response.getCalories()).isEqualTo(320.0);
        verify(foodScanService).scanFoodImage(mockFile);
    }

    @Test
    @DisplayName("getSuggestedPrompts: Trả về danh sách prompt gợi ý từ template")
    void getSuggestedPrompts_Success() {
        // Given
        List<PromptSuggestionDto> mockSuggestions = List.of(
                PromptSuggestionDto.builder()
                        .id("test-prompt")
                        .title("Kiểm tra nhịp tim")
                        .prompt("Nhịp tim của tôi có ổn không?")
                        .category("HEART_HEALTH")
                        .icon("Heart")
                        .build()
        );

        when(heartcarePromptTemplate.getSuggestedPrompts()).thenReturn(mockSuggestions);

        // When
        List<PromptSuggestionDto> result = aiAssistantService.getSuggestedPrompts();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("test-prompt");
        verify(heartcarePromptTemplate).getSuggestedPrompts();
    }
}
