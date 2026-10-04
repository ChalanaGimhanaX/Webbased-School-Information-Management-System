package com.sliit.sims.assistant.ai;

/** The assistant is not configured on this server (HTTP 503). */
public class AssistantUnavailableException extends RuntimeException {
    public AssistantUnavailableException(String message) {
        super(message);
    }
}

