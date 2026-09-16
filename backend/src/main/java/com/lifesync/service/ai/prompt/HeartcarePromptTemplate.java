package com.lifesync.service.ai.prompt;

import com.lifesync.dto.ai.PromptSuggestionDto;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Component holding the core system prompts, clinical guidelines, and suggested prompt chips
 * for the LifeSync Heartcare & Lifestyle AI Companion.
 */
@Component
public class HeartcarePromptTemplate {

    public static final String MEDICAL_DISCLAIMER = """
            ⚠️ LƯU Ý Y TẾ QUAN TRỌNG:
            LifeSync AI là trợ lý kỹ thuật số hỗ trợ quản lý lối sống, thói quen sinh hoạt và dinh dưỡng phòng ngừa.
            LifeSync AI KHÔNG PHẢI LÀ BÁC SĨ và KHÔNG ĐƯA RA CHẨN ĐOÁN, KÊ ĐƠN HOẶC THAY THẾ ĐIỀU TRỊ Y KHOA CHUYÊN NGHIỆP.
            Nếu bạn xuất hiện các triệu chứng nguy hiểm như: đau thắt ngực, khó thở dữ dội, đau lan ra vai/hàm/cánh tay, hoặc chóng mặt đột ngột, hãy gọi ngay Cấp cứu (115) hoặc đến cơ sở y tế gần nhất.
            """;

    public static final String BASE_SYSTEM_INSTRUCTION = """
            Bạn là LifeSync Heartcare & Lifestyle AI Companion — Trợ lý đồng hành thông minh chuyên sâu về sức khỏe tim mạch, dinh dưỡng và quản lý lối sống của nền tảng LifeSync.
            
            1. VAI TRÒ VÀ PHONG CÁCH ỨNG XỬ:
            - Giọng văn: Thấu cảm, ân cần, khoa học, truyền cảm hứng và luôn tôn trọng người dùng.
            - Phân tích đa chiều: Luôn kết nối mối liên hệ giữa [Dinh dưỡng], [Cường độ công việc/Stress] và [Sức khỏe tim mạch].
            - Trả lời bằng tiếng Việt chuẩn mực, định dạng Markdown rõ ràng (sử dụng bullet points, in đậm các chỉ số quan trọng, emoji nhẹ nhàng, dễ đọc).
            
            2. NGUYÊN TẮC DINH DƯỠNG TIM MẠCH (DASH & MEDITERRANEAN DIET):
            - Chế độ ăn DASH (Dietary Approaches to Stop Hypertension) và Địa Trung Hải (Mediterranean Diet) là kim chỉ nam.
            - Hướng dẫn kiểm soát Natri/Muối: Dưới 2300mg/ngày (lý tưởng là dưới 1500mg/ngày đối với người cần kiểm soát huyết áp).
            - Khuyến khích thực phẩm giàu Kali, Magie, Chất xơ (rau xanh đậm, đậu, ngũ cốc nguyên hạt) và chất béo lành mạnh Omega-3 (cá béo, quả bơ, dầu ô-liu, các loại hạt).
            - Cảnh báo về chất béo chuyển hóa (trans fat), chất béo bão hòa và đường tinh luyện.
            
            3. QUẢN LÝ ÁP LỰC & ĐIỀU HÒA NHỊP TIM (WORKLOAD & STRESS RELIEF):
            - Quan sát mức độ áp lực (Stress Level: LOW, MEDIUM, HIGH, OVERLOAD) từ lịch trình công việc.
            - Nếu lịch trình quá tải hoặc có nhiều task gấp (URGENT/HIGH): Khuyên người dùng tạm dừng nghỉ ngơi ngắn (Micro-breaks 5 phút), hướng dẫn bài tập thở hạ nhịp tim (Box Breathing 4-4-4-4 hoặc thở 4-7-8) để giảm hormone cortisol.
            - Nhắc nhở tầm quan trọng của giấc ngủ 7-8 tiếng để phục hồi hệ thống mạch máu.
            
            4. NGUYÊN TẮC RÀNG BUỘC DỮ LIỆU (STRICT AI GROUNDING):
            - Bạn được cung cấp dữ liệu thực tế của người dùng từ hệ thống LifeSync (chỉ số BMI, TDEE, lượng Calo hôm nay, các bữa ăn gần đây, lịch trình sắp tới).
            - TUYỆT ĐỐI KHÔNG TỰ BỊA ĐẶT DỮ LIỆU: Chỉ phân tích và đưa ra lời khuyên dựa trên những gì có trong ngữ cảnh người dùng. Nếu người dùng chưa ghi nhận dữ liệu, hãy nhẹ nhàng nhắc họ ghi nhận nhật ký để AI phân tích chuẩn xác hơn.
            
            5. NGUYÊN TẮC AN TOÀN Y TẾ & TRIAGE CẤP CỨU:
            - Luôn ghi nhớ tuyên bố miễn trừ y tế.
            - CẢNH BÁO ĐỎ (EMERGENCY): Nếu người dùng phàn nàn về đau thắt ngực cấp tính, tức ngực như bị đè nặng, khó thở, vã mồ hôi lạnh, hãy LẬP TỨC yêu cầu họ gọi 115 hoặc đi cấp cứu ngay, không tư vấn thêm về ăn uống hay tập luyện.
            """;

    private static final List<PromptSuggestionDto> SUGGESTED_PROMPTS = List.of(
            PromptSuggestionDto.builder()
                    .id("eval-today-nutrition")
                    .title("Đánh giá thực đơn hôm nay")
                    .prompt("Dựa trên các bữa ăn tôi đã ghi nhận hôm nay, thực đơn này có phù hợp với người muốn bảo vệ tim mạch không?")
                    .category("NUTRITION")
                    .icon("Utensils")
                    .build(),
            PromptSuggestionDto.builder()
                    .id("low-sodium-snack")
                    .title("Gợi ý bữa phụ ít muối")
                    .prompt("Gợi ý cho tôi 3 món ăn nhẹ (snack) lành mạnh, giàu kali và ít natri theo chế độ ăn DASH.")
                    .category("NUTRITION")
                    .icon("Salad")
                    .build(),
            PromptSuggestionDto.builder()
                    .id("check-workload-stress")
                    .title("Lịch trình có gây quá tải không?")
                    .prompt("Phân tích lịch trình công việc hôm nay và tuần này của tôi. Cường độ làm việc như vậy có gây căng thẳng tim mạch không?")
                    .category("STRESS")
                    .icon("Clock")
                    .build(),
            PromptSuggestionDto.builder()
                    .id("quick-relaxation-exercise")
                    .title("Hướng dẫn bài tập thở hạ stress")
                    .prompt("Tôi đang cảm thấy khá căng thẳng vì công việc. Hãy hướng dẫn tôi một bài tập thở ngắn 3 phút để điều hòa nhịp tim.")
                    .category("STRESS")
                    .icon("Heart")
                    .build(),
            PromptSuggestionDto.builder()
                    .id("calorie-tdee-balance")
                    .title("Cân đối Calo so với TDEE")
                    .prompt("So sánh mức năng lượng tôi đã nạp hôm nay với chỉ số TDEE cá nhân. Tôi cần điều chỉnh gì cho bữa tối?")
                    .category("HEART_HEALTH")
                    .icon("Activity")
                    .build()
    );

    /**
     * Retrieves the base system instruction for the AI model.
     */
    public String getSystemInstruction() {
        return BASE_SYSTEM_INSTRUCTION;
    }

    /**
     * Builds a comprehensive prompt by combining the user query with the personal health & schedule context.
     *
     * @param userQuery           The question or request from the user.
     * @param userContextMarkdown Real-time aggregated personal context markdown from HeartCareContextBuilderService.
     * @return Formatted composite prompt.
     */
    public String buildPromptWithContext(String userQuery, String userContextMarkdown) {
        StringBuilder sb = new StringBuilder();

        if (userContextMarkdown != null && !userContextMarkdown.isBlank()) {
            sb.append(">>> DỮ LIỆU THỰC TẾ CỦA TÔI TRÊN HỆ THỐNG LIFESYNC <<<\n");
            sb.append(userContextMarkdown.trim());
            sb.append("\n>>> HẾT DỮ LIỆU THỰC TẾ <<<\n\n");
        }

        sb.append("CÂU HỎI / YÊU CẦU CỦA TÔI:\n");
        sb.append(userQuery != null ? userQuery.trim() : "");

        return sb.toString();
    }

    /**
     * Returns curated prompt suggestions for quick user interaction on the UI.
     */
    public List<PromptSuggestionDto> getSuggestedPrompts() {
        return SUGGESTED_PROMPTS;
    }
}
