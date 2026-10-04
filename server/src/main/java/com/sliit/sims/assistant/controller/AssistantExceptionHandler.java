package com.sliit.sims.assistant.controller;

import com.sliit.sims.assistant.ai.AiProviderException;
import com.sliit.sims.assistant.ai.AssistantUnavailableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;

/** RFC 7807 responses for assistant failures, matching the style of GlobalExceptionHandler. */
@RestControllerAdvice
public class AssistantExceptionHandler {

    @ExceptionHandler(AssistantUnavailableException.class)
    public ProblemDetail handleUnavailable(AssistantUnavailableException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
        problem.setTitle("AI Assistant Unavailable");
        problem.setType(URI.create("https://sims.wycherley.edu/errors/assistant-unavailable"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(AiProviderException.class)
    public ProblemDetail handleProvider(AiProviderException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_GATEWAY, ex.getMessage());
        problem.setTitle("AI Provider Error");
        problem.setType(URI.create("https://sims.wycherley.edu/errors/assistant-provider"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}

