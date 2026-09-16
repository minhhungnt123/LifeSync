package com.lifesync.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for Google Gemini AI API integration.
 */
@Configuration
@ConfigurationProperties(prefix = "gemini")
@Getter
@Setter
public class GeminiProperties {

    /**
     * API Key for Google Gemini API.
     */
    private String apiKey;

    /**
     * Default model identifier (e.g., gemini-3.6-flash, gemini-2.5-flash-lite).
     */
    private String model = "gemini-3.6-flash";

    /**
     * Base URL for Google Generative Language API.
     */
    private String baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    /**
     * HTTP client connection and read timeout in seconds.
     */
    private int timeoutSeconds = 30;
}
