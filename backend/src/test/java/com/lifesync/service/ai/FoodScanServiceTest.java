package com.lifesync.service.ai;

import com.lifesync.dto.ai.FoodScanResponse;
import com.lifesync.dto.ai.NutritionMacrosDto;
import com.lifesync.exception.BadRequestException;
import com.lifesync.service.ai.impl.FoodScanServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FoodScanServiceTest {

    @Mock
    private GeminiAiClient geminiAiClient;

    private FoodScanService foodScanService;

    @BeforeEach
    void setUp() {
        foodScanService = new FoodScanServiceImpl(geminiAiClient);
    }

    private byte[] createValidJpegBytes(int size) {
        byte[] bytes = new byte[Math.max(120, size)];
        bytes[0] = (byte) 0xFF;
        bytes[1] = (byte) 0xD8;
        bytes[2] = (byte) 0xFF;
        return bytes;
    }

    @Test
    @DisplayName("scanFoodImage: Quét và bóc tách thành công thông tin món ăn từ ảnh")
    void scanFoodImage_Success() {
        // Given
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "pho_bo.jpg",
                "image/jpeg",
                createValidJpegBytes(200)
        );

        FoodScanResponse mockAiResponse = FoodScanResponse.builder()
                .isFood(true)
                .foodName("Phở Bò Tái")
                .portion("1 tô vừa ~450g")
                .calories(480.0)
                .confidence(0.95)
                .macros(NutritionMacrosDto.builder()
                        .protein(28.0)
                        .carbs(65.0)
                        .fat(12.0)
                        .sodium(1450.0)
                        .build())
                .ingredients(List.of("Bánh phở", "Thịt bò tái", "Nước dùng xương", "Hành lá"))
                .heartHealthTip("Nước dùng chứa lượng muối tương đối cao, nên hạn chế húp cạn nước để bảo vệ huyết áp.")
                .healthScore(75)
                .build();

        when(geminiAiClient.generateStructuredJson(anyString(), anyString(), any(), anyString(), eq(FoodScanResponse.class)))
                .thenReturn(mockAiResponse);

        // When
        FoodScanResponse result = foodScanService.scanFoodImage(mockFile);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFoodName()).isEqualTo("Phở Bò Tái");
        assertThat(result.getCalories()).isEqualTo(480.0);
        assertThat(result.getMacros().getProtein()).isEqualTo(28.0);
        assertThat(result.getMacros().getSodium()).isEqualTo(1450.0);
        assertThat(result.getHeartHealthTip()).contains("bảo vệ huyết áp");
        assertThat(result.getHealthScore()).isEqualTo(75);
    }

    @Test
    @DisplayName("scanFoodImage: Ném BadRequestException khi tệp rỗng")
    void scanFoodImage_ThrowsBadRequest_WhenFileEmpty() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.jpg", "image/jpeg", new byte[0]);

        assertThatThrownBy(() -> foodScanService.scanFoodImage(emptyFile))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Vui lòng tải lên một tệp hình ảnh món ăn");
    }

    @Test
    @DisplayName("scanFoodImage: Ném BadRequestException khi tệp quá nhỏ (< 100 bytes)")
    void scanFoodImage_ThrowsBadRequest_WhenFileTooSmall() {
        MockMultipartFile tinyFile = new MockMultipartFile("file", "tiny.jpg", "image/jpeg", new byte[50]);

        assertThatThrownBy(() -> foodScanService.scanFoodImage(tinyFile))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("quá nhỏ");
    }

    @Test
    @DisplayName("scanFoodImage: Ném BadRequestException khi chữ ký tệp giả mạo không phải ảnh")
    void scanFoodImage_ThrowsBadRequest_WhenMagicBytesInvalid() {
        byte[] fakeBytes = new byte[200]; // no jpeg/png magic bytes
        MockMultipartFile fakeFile = new MockMultipartFile("file", "fake.jpg", "image/jpeg", fakeBytes);

        assertThatThrownBy(() -> foodScanService.scanFoodImage(fakeFile))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("chữ ký tệp không khớp");
    }

    @Test
    @DisplayName("scanFoodImage: Ném BadRequestException khi định dạng file không được hỗ trợ (ví dụ PDF)")
    void scanFoodImage_ThrowsBadRequest_WhenUnsupportedMimeType() {
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                new byte[200]
        );

        assertThatThrownBy(() -> foodScanService.scanFoodImage(pdfFile))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Định dạng hình ảnh không được hỗ trợ");
    }

    @Test
    @DisplayName("scanFoodImage: Ném BadRequestException khi AI kết luận ảnh không chứa món ăn")
    void scanFoodImage_ThrowsBadRequest_WhenNotFoodImage() {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "car.jpg",
                "image/jpeg",
                createValidJpegBytes(200)
        );

        FoodScanResponse notFoodResponse = FoodScanResponse.builder()
                .isFood(false)
                .foodName(null)
                .build();

        when(geminiAiClient.generateStructuredJson(anyString(), anyString(), any(), anyString(), eq(FoodScanResponse.class)))
                .thenReturn(notFoodResponse);

        assertThatThrownBy(() -> foodScanService.scanFoodImage(mockFile))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Hình ảnh được tải lên không nhận diện được món ăn");
    }
}
