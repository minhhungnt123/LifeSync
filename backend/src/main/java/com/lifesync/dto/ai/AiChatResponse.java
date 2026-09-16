package com.lifesync.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO returned by the LifeSync AI Heartcare Assistant.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {

    private String reply;

    private String disclaimer;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
