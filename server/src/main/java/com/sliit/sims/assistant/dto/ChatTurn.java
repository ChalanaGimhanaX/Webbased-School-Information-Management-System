package com.sliit.sims.assistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * One previous message in the conversation, sent back by the browser.
 * The history is untrusted client data: it only ever contains the student's own chat,
 * and personal records are always re-read on the server for every request.
 */
public record ChatTurn(
        @NotBlank(message = "role is required")
        @Pattern(regexp = "user|assistant", message = "role must be 'user' or 'assistant'")
        String role,

        @NotNull(message = "content is required")
        @Size(max = 4000, message = "each history message must be at most 4000 characters")
        String content
) {}

