package com.sliit.sims.assistant.ai;

import com.sliit.sims.assistant.dto.ChatTurn;

import java.util.List;

/** Abstraction over the LLM provider so the assistant can be tested without network access. */
public interface AiChatClient {

    boolean isConfigured();

    String providerName();

    String modelName();

    /**
     * @param systemInstruction tutor rules + the student's own record
     * @param conversation      alternating turns, starting with "user" and ending with the new "user" message
     * @return the assistant's reply text
     * @throws AssistantUnavailableException when the provider is not configured
     * @throws AiProviderException           when the provider call fails
     */
    String generateReply(String systemInstruction, List<ChatTurn> conversation);
}

