package com.lifesync.service.ai;

import com.lifesync.config.GeminiProperties;
import com.lifesync.exception.AiServiceException;
import com.lifesync.service.ai.impl.AiRateLimiterServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AiRateLimiterServiceTest {

    private GeminiProperties geminiProperties;
    private AiRateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        geminiProperties = new GeminiProperties();
        GeminiProperties.RateLimit rateLimit = new GeminiProperties.RateLimit();
        rateLimit.setRequestsPerMinute(3); // set limit to 3 for testing
        geminiProperties.setRateLimit(rateLimit);

        rateLimiterService = new AiRateLimiterServiceImpl(geminiProperties);
    }

    @Test
    @DisplayName("tryAcquire: Cho phép các request trong giới hạn rate limit")
    void tryAcquire_WithinLimit_ReturnsTrue() {
        String user = "user1@lifesync.com";

        assertThat(rateLimiterService.tryAcquire(user)).isTrue();
        assertThat(rateLimiterService.tryAcquire(user)).isTrue();
        assertThat(rateLimiterService.tryAcquire(user)).isTrue();
    }

    @Test
    @DisplayName("tryAcquire: Từ chối khi vượt quá giới hạn rate limit")
    void tryAcquire_ExceedsLimit_ReturnsFalse() {
        String user = "user2@lifesync.com";

        assertThat(rateLimiterService.tryAcquire(user)).isTrue();
        assertThat(rateLimiterService.tryAcquire(user)).isTrue();
        assertThat(rateLimiterService.tryAcquire(user)).isTrue();

        // 4th request exceeds limit of 3
        assertThat(rateLimiterService.tryAcquire(user)).isFalse();
    }

    @Test
    @DisplayName("checkRateLimit: Ném AiServiceException với status 429 khi vượt quá hạn mức")
    void checkRateLimit_ThrowsAiServiceException_WhenExceeded() {
        String user = "user3@lifesync.com";

        rateLimiterService.checkRateLimit(user);
        rateLimiterService.checkRateLimit(user);
        rateLimiterService.checkRateLimit(user);

        assertThatThrownBy(() -> rateLimiterService.checkRateLimit(user))
                .isInstanceOf(AiServiceException.class)
                .satisfies(ex -> {
                    AiServiceException aiEx = (AiServiceException) ex;
                    assertThat(aiEx.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
                    assertThat(aiEx.getMessage()).contains("quá nhiều yêu cầu AI");
                });
    }

    @Test
    @DisplayName("tryAcquire: Các người dùng khác nhau có quota độc lập")
    void tryAcquire_IndependentUsers() {
        String userA = "userA@lifesync.com";
        String userB = "userB@lifesync.com";

        assertThat(rateLimiterService.tryAcquire(userA)).isTrue();
        assertThat(rateLimiterService.tryAcquire(userA)).isTrue();
        assertThat(rateLimiterService.tryAcquire(userA)).isTrue();
        assertThat(rateLimiterService.tryAcquire(userA)).isFalse();

        // User B is fresh and should succeed
        assertThat(rateLimiterService.tryAcquire(userB)).isTrue();
    }
}
