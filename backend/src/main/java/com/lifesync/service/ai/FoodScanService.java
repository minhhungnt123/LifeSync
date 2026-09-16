package com.lifesync.service.ai;

import com.lifesync.dto.ai.FoodScanResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service interface for scanning and analyzing meals from images using AI Vision.
 * Follows Single Responsibility and Interface Segregation principles.
 */
public interface FoodScanService {

    /**
     * Scans an uploaded meal image file and extracts nutritional information.
     *
     * @param file Uploaded image multipart file.
     * @return Detailed nutritional analysis and heart-health tips.
     */
    FoodScanResponse scanFoodImage(MultipartFile file);

    /**
     * Scans raw meal image bytes and extracts nutritional information.
     *
     * @param imageBytes Raw image byte array.
     * @param mimeType   MIME type of the image (e.g., image/jpeg, image/png).
     * @return Detailed nutritional analysis and heart-health tips.
     */
    FoodScanResponse scanFoodImageBytes(byte[] imageBytes, String mimeType);
}
