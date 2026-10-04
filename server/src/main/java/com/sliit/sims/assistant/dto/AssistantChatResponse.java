package com.sliit.sims.assistant.dto;

import java.time.Instant;

public record AssistantChatResponse(String reply, String model, Instant generatedAt) {}

