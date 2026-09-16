package com.lifesync.service.ai.prompt;

import com.lifesync.dto.ai.PromptSuggestionDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class HeartcarePromptTemplateTest {

    private HeartcarePromptTemplate promptTemplate;

    @BeforeEach
    void setUp() {
        promptTemplate = new HeartcarePromptTemplate();
    }

    @Test
    @DisplayName("getSystemInstruction: Chứa đầy đủ các nguyên tắc y khoa DASH, Stress relief và Medical Disclaimer")
    void getSystemInstruction_ContainsMandatoryGuidelines() {
        String systemInstruction = promptTemplate.getSystemInstruction();

        assertThat(systemInstruction).isNotBlank();
        assertThat(systemInstruction).contains("LifeSync Heartcare & Lifestyle AI Companion");
        assertThat(systemInstruction).contains("DASH");
        assertThat(systemInstruction).containsIgnoringCase("Mediterranean");
        assertThat(systemInstruction).contains("Natri");
        assertThat(systemInstruction).contains("Box Breathing");
        assertThat(systemInstruction).contains("TUYỆT ĐỐI KHÔNG TỰ BỊA ĐẶT DỮ LIỆU");
        assertThat(systemInstruction).contains("CẤP CỨU");
    }

    @Test
    @DisplayName("buildPromptWithContext: Ghép chính xác câu hỏi của người dùng và ngữ cảnh thực tế")
    void buildPromptWithContext_CombinesQueryAndContextCorrectly() {
        String contextMarkdown = "=== DỮ LIỆU NGƯỜI DÙNG ===\n- BMI: 22.5\n- Hôm nay nạp: 1800 kcal";
        String userQuery = "Tôi có nên ăn thêm bát chè đậu đen không?";

        String compositePrompt = promptTemplate.buildPromptWithContext(userQuery, contextMarkdown);

        assertThat(compositePrompt).contains(">>> DỮ LIỆU THỰC TẾ CỦA TÔI TRÊN HỆ THỐNG LIFESYNC <<<");
        assertThat(compositePrompt).contains("BMI: 22.5");
        assertThat(compositePrompt).contains("Hôm nay nạp: 1800 kcal");
        assertThat(compositePrompt).contains("CÂU HỎI / YÊU CẦU CỦA TÔI:");
        assertThat(compositePrompt).contains("Tôi có nên ăn thêm bát chè đậu đen không?");
    }

    @Test
    @DisplayName("buildPromptWithContext: Xử lý an toàn khi ngữ cảnh trống hoặc null")
    void buildPromptWithContext_HandlesNullOrEmptyContext() {
        String userQuery = "Tư vấn chế độ ăn ít muối";

        String compositePrompt = promptTemplate.buildPromptWithContext(userQuery, null);

        assertThat(compositePrompt).doesNotContain(">>> DỮ LIỆU THỰC TẾ");
        assertThat(compositePrompt).contains("CÂU HỎI / YÊU CẦU CỦA TÔI:");
        assertThat(compositePrompt).contains("Tư vấn chế độ ăn ít muối");
    }

    @Test
    @DisplayName("getSuggestedPrompts: Trả về danh sách thẻ gợi ý hợp lệ với đầy đủ metadata")
    void getSuggestedPrompts_ReturnsValidChips() {
        List<PromptSuggestionDto> suggestions = promptTemplate.getSuggestedPrompts();

        assertThat(suggestions).isNotEmpty();
        assertThat(suggestions).hasSizeGreaterThanOrEqualTo(5);

        for (PromptSuggestionDto chip : suggestions) {
            assertThat(chip.getId()).isNotBlank();
            assertThat(chip.getTitle()).isNotBlank();
            assertThat(chip.getPrompt()).isNotBlank();
            assertThat(chip.getCategory()).isNotBlank();
            assertThat(chip.getIcon()).isNotBlank();
        }
    }
}
