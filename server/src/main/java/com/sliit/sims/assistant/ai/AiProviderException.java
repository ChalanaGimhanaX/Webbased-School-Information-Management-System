package com.sliit.sims.assistant.ai;

/** The AI provider failed; the message is safe to show to students (HTTP 502). */
public class AiProviderException extends RuntimeException {
    public AiProviderException(String message) {
        super(message);
    }

    public AiProviderException(String message, Throwable cause) {
        super(message, cause);
    }
}

