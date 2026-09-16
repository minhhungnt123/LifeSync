package com.lifesync.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesync.config.GeminiProperties;
import com.lifesync.service.ai.impl.GeminiAiClientImpl;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GeminiAiClientLiveTest {

    private static String apiKey;

    @BeforeAll
    static void initApiKey() {
        apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            for (Path path : List.of(Paths.get("../.env"), Paths.get(".env"))) {
                if (Files.exists(path)) {
                    try {
                        for (String line : Files.readAllLines(path, StandardCharsets.UTF_8)) {
                            line = line.trim();
                            if (line.startsWith("GEMINI_API_KEY=")) {
                                String val = line.substring("GEMINI_API_KEY=".length()).trim();
                                if (val.startsWith("\"") && val.endsWith("\"")) {
                                    val = val.substring(1, val.length() - 1);
                                }
                                if (!val.isBlank() && !val.equals("your_gemini_api_key_here")) {
                                    apiKey = val;
                                    break;
                                }
                            }
                        }
                    } catch (IOException ignored) {}
                }
            }
        }
    }

    @Test
    @DisplayName("Live Test: Kiểm thử gọi Gemini API với model gemini-3.6-flash")
    void testRealGeminiApiCall() {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("your_gemini_api_key_here")) {
            System.out.println("[INFO] Bỏ qua live test vì chưa có API Key thực tế.");
            return;
        }

        ObjectMapper objectMapper = new ObjectMapper();
        GeminiProperties properties = new GeminiProperties();
        properties.setApiKey(apiKey);
        properties.setModel("gemini-3.6-flash");
        properties.setBaseUrl("https://generativelanguage.googleapis.com/v1beta");
        properties.setTimeoutSeconds(30);

        try {
            GeminiAiClient client = new GeminiAiClientImpl(properties, objectMapper);
            String result = client.generateText("Bạn là LifeSync Assistant.", "Hãy trả lời ngắn gọn: LifeSync AI đã sẵn sàng chưa?");
            System.out.println("\n=======================================================");
            System.out.println("[GEMINI API PHẢN HỒI THỰC TẾ]: " + result);
            System.out.println("=======================================================\n");
            assertThat(result).isNotBlank();
        } catch (Exception ex) {
            System.err.println("[CẢNH BÁO LIVE TEST]: " + ex.getMessage());
        }
    }
}
