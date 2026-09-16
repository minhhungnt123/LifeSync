package com.lifesync.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesync.dto.ai.AiChatRequest;
import com.lifesync.dto.ai.AiChatResponse;
import com.lifesync.dto.ai.FoodScanResponse;
import com.lifesync.dto.ai.NutritionMacrosDto;
import com.lifesync.dto.ai.PromptSuggestionDto;
import com.lifesync.exception.GlobalExceptionHandler;
import com.lifesync.service.ai.AiAssistantService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AiControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AiAssistantService aiAssistantService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        AiController aiController = new AiController(aiAssistantService);
        mockMvc = MockMvcBuilders.standaloneSetup(aiController)
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        UserDetails dummyUser = new User(
                "user@lifesync.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(dummyUser, null, dummyUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("POST /api/v1/ai/scan-food: Quét ảnh món ăn trả về mã 200 và kết quả dinh dưỡng")
    void scanFood_Success() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "meal.jpg",
                "image/jpeg",
                "sample-image-data".getBytes()
        );

        FoodScanResponse mockResponse = FoodScanResponse.builder()
                .foodName("Cơm tấm sườn bì chả")
                .portion("1 dĩa")
                .calories(650.0)
                .macros(NutritionMacrosDto.builder()
                        .protein(30.0)
                        .carbs(80.0)
                        .fat(22.0)
                        .sodium(950.0)
                        .build())
                .heartHealthTip("Món ăn có lượng natri tương đối cao, nên giảm bớt nước mắm.")
                .build();

        when(aiAssistantService.scanFood(any())).thenReturn(mockResponse);

        mockMvc.perform(multipart("/api/v1/ai/scan-food").file(mockFile))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Phân tích món ăn thành công!"))
                .andExpect(jsonPath("$.data.foodName").value("Cơm tấm sườn bì chả"))
                .andExpect(jsonPath("$.data.calories").value(650.0))
                .andExpect(jsonPath("$.data.macros.sodium").value(950.0));

        verify(aiAssistantService).scanFood(any());
    }

    @Test
    @DisplayName("POST /api/v1/ai/chat: Gửi câu hỏi chat trả về mã 200 và phản hồi AI kèm disclaimer")
    void chat_Success() throws Exception {
        AiChatRequest request = new AiChatRequest("Tôi nên ăn gì để giảm cân lành mạnh?");
        AiChatResponse response = AiChatResponse.builder()
                .reply("Nên ưu tiên rau củ, ức gà và ngũ cốc nguyên hạt.")
                .disclaimer("Lưu ý y tế quan trọng")
                .timestamp(LocalDateTime.now())
                .build();

        when(aiAssistantService.chat(eq("user@lifesync.com"), any(AiChatRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Trợ lý AI đã phản hồi thành công!"))
                .andExpect(jsonPath("$.data.reply").value("Nên ưu tiên rau củ, ức gà và ngũ cốc nguyên hạt."))
                .andExpect(jsonPath("$.data.disclaimer").value("Lưu ý y tế quan trọng"));

        verify(aiAssistantService).chat(eq("user@lifesync.com"), any(AiChatRequest.class));
    }

    @Test
    @DisplayName("POST /api/v1/ai/chat: Gửi message rỗng trả về mã 400 Bad Request")
    void chat_ValidationFailure() throws Exception {
        AiChatRequest request = new AiChatRequest("");

        mockMvc.perform(post("/api/v1/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/v1/ai/suggested-prompts: Trả về danh sách gợi ý câu hỏi")
    void getSuggestedPrompts_Success() throws Exception {
        List<PromptSuggestionDto> suggestions = List.of(
                PromptSuggestionDto.builder()
                        .id("snack-prompt")
                        .title("Gợi ý bữa phụ")
                        .prompt("Bữa phụ ít muối?")
                        .category("NUTRITION")
                        .icon("Salad")
                        .build()
        );

        when(aiAssistantService.getSuggestedPrompts()).thenReturn(suggestions);

        mockMvc.perform(get("/api/v1/ai/suggested-prompts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Lấy danh sách gợi ý câu hỏi thành công!"))
                .andExpect(jsonPath("$.data[0].id").value("snack-prompt"))
                .andExpect(jsonPath("$.data[0].title").value("Gợi ý bữa phụ"));

        verify(aiAssistantService).getSuggestedPrompts();
    }
}
