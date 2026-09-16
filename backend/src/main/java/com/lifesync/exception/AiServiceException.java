package com.lifesync.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Custom runtime exception thrown when an AI provider call fails.
 */
@Getter
public class AiServiceException extends RuntimeException {

    private final HttpStatus status;

    public AiServiceException(String message) {
        super(message);
        this.status = HttpStatus.BAD_GATEWAY;
    }

    public AiServiceException(String message, HttpStatus status) {
        super(message);
        this.status = status != null ? status : HttpStatus.BAD_GATEWAY;
    }

    public AiServiceException(String message, Throwable cause) {
        super(message, cause);
        this.status = HttpStatus.BAD_GATEWAY;
    }
}
