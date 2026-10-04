package com.sliit.sims.assistant.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AssistantChatRequest(
        @NotBlank(message = "message is required")
        @Size(max = 2000, message = "message must be at most 2000 characters")
        String message,

        @Size(max = 40, message = "history may contain at most 40 messages")
        List<@Valid ChatTurn> history
) {}

