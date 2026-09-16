package com.lifesync.service.ai.impl;

import com.lifesync.config.GeminiProperties;
import com.lifesync.exception.AiServiceException;
import com.lifesync.service.ai.AiRateLimiterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe in-memory sliding window rate limiter implementation.
 * Tracks timestamps of user requests within a 60-second moving window.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiRateLimiterServiceImpl implements AiRateLimiterService {

    private static final long WINDOW_DURATION_MILLIS = 60_000L; // 1 minute

    private final GeminiProperties geminiProperties;
    private final ConcurrentHashMap<String, Deque<Long>> userRequestTimestamps = new ConcurrentHashMap<>();

    @Override
    public void checkRateLimit(String userKey) {
        if (!tryAcquire(userKey)) {
            int limit = getLimit();
            log.warn("Rate limit exceeded for user key '{}' (Limit: {} requests/min)", userKey, limit);
            throw new AiServiceException(
                    String.format("Bạn đã gửi quá nhiều yêu cầu AI trong thời gian ngắn (tối đa %d yêu cầu/phút). Vui lòng chờ giây lát trước khi thử lại.", limit),
                    HttpStatus.TOO_MANY_REQUESTS
            );
        }
    }

    @Override
    public boolean tryAcquire(String userKey) {
        if (userKey == null || userKey.isBlank()) {
            userKey = "ANONYMOUS";
        }

        int limit = getLimit();
        long now = Instant.now().toEpochMilli();
        long windowStart = now - WINDOW_DURATION_MILLIS;

        Deque<Long> timestamps = userRequestTimestamps.computeIfAbsent(userKey, k -> new ArrayDeque<>());

        synchronized (timestamps) {
            // Evict timestamps outside the sliding window
            while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= limit) {
                return false;
            }

            timestamps.addLast(now);
            return true;
        }
    }

    private int getLimit() {
        if (geminiProperties.getRateLimit() != null && geminiProperties.getRateLimit().getRequestsPerMinute() > 0) {
            return geminiProperties.getRateLimit().getRequestsPerMinute();
        }
        return 10;
    }
}
