package com.lifesync.service.ai;

/**
 * Interface defining client capabilities for interacting with Google Gemini AI models.
 * Follows Interface Segregation Principle (ISP) and Dependency Inversion Principle (DIP).
 */
public interface GeminiAiClient {

    /**
     * Generates a text response from a text prompt with an optional system instruction.
     *
     * @param systemInstruction Background context or system instructions (can be null).
     * @param userPrompt        User prompt.
     * @return Generated text response.
     */
    String generateText(String systemInstruction, String userPrompt);

    /**
     * Generates a text response from multimodal input (image + text prompt).
     *
     * @param systemInstruction Background context or system instructions (can be null).
     * @param userPrompt        User text prompt.
     * @param imageBytes        Raw image bytes.
     * @param mimeType          MIME type of the image (e.g., "image/jpeg", "image/png").
     * @return Generated text response.
     */
    String generateVision(String systemInstruction, String userPrompt, byte[] imageBytes, String mimeType);

    /**
     * Generates and parses a structured JSON response from multimodal input (image + text prompt).
     *
     * @param systemInstruction Background context or system instructions (can be null).
     * @param userPrompt        User text prompt.
     * @param imageBytes        Raw image bytes (can be null if text-only).
     * @param mimeType          MIME type of the image (can be null if text-only).
     * @param responseClass     Target class type to deserialize JSON into.
     * @param <T>               Type of the response DTO.
     * @return Deserialized DTO instance.
     */
    <T> T generateStructuredJson(String systemInstruction, String userPrompt, byte[] imageBytes, String mimeType, Class<T> responseClass);

    /**
     * Generates and parses a structured JSON response from a text-only prompt.
     *
     * @param systemInstruction Background context or system instructions (can be null).
     * @param userPrompt        User text prompt.
     * @param responseClass     Target class type to deserialize JSON into.
     * @param <T>               Type of the response DTO.
     * @return Deserialized DTO instance.
     */
    <T> T generateStructuredJson(String systemInstruction, String userPrompt, Class<T> responseClass);
}
