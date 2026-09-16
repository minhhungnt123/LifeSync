package com.lifesync.service.ai.impl;

import com.lifesync.dto.ai.FoodScanResponse;
import com.lifesync.dto.ai.NutritionMacrosDto;
import com.lifesync.exception.BadRequestException;
import com.lifesync.service.ai.FoodScanService;
import com.lifesync.service.ai.GeminiAiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

/**
 * Implementation of FoodScanService using Gemini Multimodal Vision.
 * Handles validation, AI prompting, and response post-processing.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FoodScanServiceImpl implements FoodScanService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final long MIN_FILE_SIZE = 100; // 100 bytes minimum
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif"
    );

    private static final String SYSTEM_PROMPT = """
            Bạn là chuyên gia dinh dưỡng và thị giác máy tính thực phẩm hàng đầu thế giới của hệ thống LifeSync AI, am hiểu sâu sắc các món ăn Việt Nam, Châu Á và quốc tế.
            
            Nhiệm vụ của bạn:
            1. Quan sát hình ảnh và nhận diện chính xác món ăn (đặc biệt nhận diện tốt các món ăn truyền thống Việt Nam như Phở, Bún, Cơm tấm, Bánh mì, v.v.).
            2. Ước lượng kích thước khẩu phần thực tế dựa trên đĩa/tô và các vật thể xung quanh.
            3. Ước tính năng lượng (calories - kcal) và các chất đa lượng (macros: protein, carbs, fat bằng gram).
            4. Ước tính hàm lượng Natri (sodium bằng mg) - tiêu chí cực kỳ quan trọng cho chế độ ăn DASH bảo vệ tim mạch.
            5. Liệt kê các thành phần chính nhận diện được trong đĩa thức ăn.
            6. Đưa ra một lời khuyên thiết thực cho sức khỏe tim mạch (heartHealthTip) dựa trên món ăn (ví dụ: cảnh báo lượng muối, dầu mỡ, khuyến khích thêm rau xanh).
            7. Đánh giá thang điểm sức khỏe tim mạch (healthScore từ 1 đến 100).
            
            LƯU Ý ĐẶC BIỆT:
            - Nếu hình ảnh chụp không phải là món ăn, thực phẩm hoặc đồ uống, hãy đặt "isFood": false.
            - Phải trả về dữ liệu tuân thủ định dạng JSON theo đúng schema được yêu cầu.
            """;

    private static final String USER_PROMPT = "Hãy phân tích chi tiết món ăn trong bức ảnh này và ước tính chỉ số dinh dưỡng theo tiêu chuẩn tim mạch.";

    private final GeminiAiClient geminiAiClient;

    @Override
    public FoodScanResponse scanFoodImage(MultipartFile file) {
        validateFile(file);

        try {
            byte[] imageBytes = file.getBytes();
            String mimeType = file.getContentType();
            return scanFoodImageBytes(imageBytes, mimeType);
        } catch (IOException ex) {
            log.error("Failed to read bytes from uploaded meal image: {}", ex.getMessage(), ex);
            throw new BadRequestException("Không thể đọc tệp hình ảnh tải lên: " + ex.getMessage());
        }
    }

    @Override
    public FoodScanResponse scanFoodImageBytes(byte[] imageBytes, String mimeType) {
        if (imageBytes == null || imageBytes.length == 0) {
            throw new BadRequestException("Dữ liệu hình ảnh món ăn không được để trống!");
        }

        if (imageBytes.length < MIN_FILE_SIZE) {
            throw new BadRequestException("Tệp hình ảnh quá nhỏ hoặc không hợp lệ (tối thiểu 100 bytes)!");
        }

        validateImageSignature(imageBytes);

        String normalizedMimeType = normalizeMimeType(mimeType);

        log.info("Scanning meal image via Gemini Vision (Size: {} bytes, Type: {})", imageBytes.length, normalizedMimeType);

        FoodScanResponse response = geminiAiClient.generateStructuredJson(
                SYSTEM_PROMPT,
                USER_PROMPT,
                imageBytes,
                normalizedMimeType,
                FoodScanResponse.class
        );

        if (response == null || Boolean.FALSE.equals(response.getIsFood()) || response.getFoodName() == null || response.getFoodName().isBlank()) {
            throw new BadRequestException("Hình ảnh được tải lên không nhận diện được món ăn hoặc quá mờ. Vui lòng chụp rõ nét hơn đĩa thức ăn của bạn.");
        }

        // Ensure default fallbacks for nested fields
        if (response.getMacros() == null) {
            response.setMacros(new NutritionMacrosDto());
        }
        if (response.getCalories() == null) {
            response.setCalories(0.0);
        }

        log.info("Successfully identified meal: '{}', Calories: {} kcal, Score: {}",
                response.getFoodName(), response.getCalories(), response.getHealthScore());

        return response;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng tải lên một tệp hình ảnh món ăn!");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Dung lượng hình ảnh không được vượt quá 10MB!");
        }

        if (file.getSize() < MIN_FILE_SIZE) {
            throw new BadRequestException("Tệp hình ảnh quá nhỏ hoặc không hợp lệ (tối thiểu 100 bytes)!");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Định dạng hình ảnh không được hỗ trợ. Vui lòng tải lên file ảnh JPG, PNG, WEBP hoặc HEIC.");
        }
    }

    /**
     * Inspects magic bytes / file signature to prevent MIME-type spoofing.
     */
    private void validateImageSignature(byte[] bytes) {
        if (bytes.length < 12) {
            throw new BadRequestException("Tệp hình ảnh không hợp lệ hoặc dữ liệu bị thiếu!");
        }

        // JPEG: FF D8 FF
        boolean isJpeg = (bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF);
        // PNG: 89 50 4E 47
        boolean isPng = (bytes[0] == (byte) 0x89 && bytes[1] == (byte) 0x50 && bytes[2] == (byte) 0x4E && bytes[3] == (byte) 0x47);
        // WEBP: 'R','I','F','F' ... 'W','E','B','P'
        boolean isWebp = (bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P');
        // HEIC / HEIF: 'f','t','y','p' at index 4
        boolean isHeic = (bytes[4] == 'f' && bytes[5] == 't' && bytes[6] == 'y' && bytes[7] == 'p');

        if (!isJpeg && !isPng && !isWebp && !isHeic) {
            throw new BadRequestException("Tệp tải lên không phải là định dạng hình ảnh hợp lệ (chữ ký tệp không khớp JPEG, PNG, WEBP hoặc HEIC)!");
        }
    }

    private String normalizeMimeType(String mimeType) {
        if (mimeType == null || mimeType.isBlank()) {
            return "image/jpeg";
        }
        String lower = mimeType.toLowerCase();
        if (ALLOWED_MIME_TYPES.contains(lower)) {
            return lower;
        }
        return "image/jpeg";
    }
}
