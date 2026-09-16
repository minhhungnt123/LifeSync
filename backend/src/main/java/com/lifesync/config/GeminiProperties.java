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
     * Fallback model used when primary model fails or encounters transient rate limits.
     */
    private String fallbackModel = "gemini-2.5-flash";

    /**
     * Base URL for Google Generative Language API.
     */
    private String baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    /**
     * HTTP client connection and read timeout in seconds.
     */
    private int timeoutSeconds = 30;

    /**
     * Maximum retry attempts for transient errors (e.g. 503, timeout).
     */
    private int maxRetries = 2;

    /**
     * User-level rate limiting settings.
     */
    private RateLimit rateLimit = new RateLimit();

    @Getter
    @Setter
    public static class RateLimit {
        /**
         * Maximum allowed AI requests per minute per user.
         */
        private int requestsPerMinute = 10;
    }
}
