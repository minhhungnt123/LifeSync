package com.lifesync.service.ai;

import com.lifesync.dto.ai.HeartCareUserContext;

/**
 * Service interface responsible for aggregating personal health metrics,
 * nutrition records, and schedule workloads into a unified context for the AI Assistant.
 */
public interface HeartCareContextBuilderService {

    /**
     * Builds structured context by User ID.
     *
     * @param userId The ID of the user.
     * @return Fully populated HeartCareUserContext.
     */
    HeartCareUserContext buildContext(Long userId);

    /**
     * Builds structured context by User Email.
     *
     * @param userEmail The email of the user.
     * @return Fully populated HeartCareUserContext.
     */
    HeartCareUserContext buildContext(String userEmail);

    /**
     * Builds formatted Markdown text ready to be injected into an AI Prompt by User ID.
     *
     * @param userId The ID of the user.
     * @return Structured Markdown string containing verified user context.
     */
    String buildFormattedPromptContext(Long userId);

    /**
     * Builds formatted Markdown text ready to be injected into an AI Prompt by User Email.
     *
     * @param userEmail The email of the user.
     * @return Structured Markdown string containing verified user context.
     */
    String buildFormattedPromptContext(String userEmail);
}
