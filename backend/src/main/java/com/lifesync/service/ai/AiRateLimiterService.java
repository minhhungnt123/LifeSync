package com.lifesync.service.ai;

/**
 * Service interface for enforcing user-level rate limits on AI operations
 * to prevent quota exhaustion and abuse.
 */
public interface AiRateLimiterService {

    /**
     * Checks if a request is allowed for the given user key.
     * Throws an AiServiceException with HTTP 429 if the rate limit is exceeded.
     *
     * @param userKey Identifier for the rate limit subject (e.g., user email).
     */
    void checkRateLimit(String userKey);

    /**
     * Attempts to acquire a request token within the rate limit window.
     *
     * @param userKey Identifier for the rate limit subject.
     * @return true if allowed, false if limit exceeded.
     */
    boolean tryAcquire(String userKey);
}
