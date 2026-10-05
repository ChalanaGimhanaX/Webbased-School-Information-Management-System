package com.sliit.sims.assistant.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sliit.sims.assistant.dto.ChatTurn;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * OpenRouter AI implementation of {@link AiChatClient}.
 * Connects to OpenRouter's OpenAI-compatible completions API using the configured API key and model.
 * If the configured model hits a payment requirement (e.g. 0 credit free-tier account),
 * it seamlessly attempts the free variant of the model.
 */
@Slf4j
@Component
@Primary
public class OpenRouterChatClient implements AiChatClient {

    static final String DEFAULT_MODEL = "apodex/apodex-1.1-mini:free";
    static final String FREE_FALLBACK_MODEL = "inclusionai/ling-3.0-flash-sante:free";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    @Autowired
    public OpenRouterChatClient(ObjectMapper objectMapper,
                                @Value("${sims.assistant.openrouter.api-key:}") String apiKey,
                                @Value("${sims.assistant.openrouter.model:" + DEFAULT_MODEL + "}") String model,
                                @Value("${sims.assistant.openrouter.base-url:https://openrouter.ai/api/v1}") String baseUrl,
                                @Value("${sims.assistant.openrouter.timeout-seconds:45}") int timeoutSeconds) {
        this(buildRestClient(baseUrl, timeoutSeconds), objectMapper, apiKey, model);
    }

    OpenRouterChatClient(RestClient restClient, ObjectMapper objectMapper, String apiKey, String model) {
        this.restClient = restClient;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = (model == null || model.isBlank()) ? DEFAULT_MODEL : model.trim();
    }

    private static RestClient buildRestClient(String baseUrl, int timeoutSeconds) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(Math.max(5, timeoutSeconds)));
        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }

    @Override
    public boolean isConfigured() {
        return !apiKey.isEmpty();
    }

    @Override
    public String providerName() {
        return "OpenRouter";
    }

    @Override
    public String modelName() {
        return model;
    }

    @Override
    public String generateReply(String systemInstruction, List<ChatTurn> conversation) {
        if (!isConfigured()) {
            throw new AssistantUnavailableException("The AI assistant is not configured on the server (missing OpenRouter API key).");
        }

        try {
            return executeChatCompletion(model, systemInstruction, conversation);
        } catch (RestClientResponseException ex) {
            int status = ex.getStatusCode().value();
            String body = ex.getResponseBodyAsString();

            // If account has 0 purchased credits and model is non-free, fallback to free tier Ling model
            if (status == 402 && !model.equals(FREE_FALLBACK_MODEL)) {
                log.info("OpenRouter credit check returned 402 for {}. Retrying with free tier model {}", model, FREE_FALLBACK_MODEL);
                try {
                    return executeChatCompletion(FREE_FALLBACK_MODEL, systemInstruction, conversation);
                } catch (Exception retryEx) {
                    log.warn("Fallback to free tier model also failed: {}", retryEx.getMessage());
                }
            }

            log.warn("OpenRouter API returned HTTP {}: {}", status, abbreviate(body));
            throw new AiProviderException(describeHttpFailure(status, body), ex);
        } catch (ResourceAccessException ex) {
            log.warn("OpenRouter API unreachable: {}", ex.getMessage());
            throw new AiProviderException("The AI service could not be reached or took too long to respond. Please try again.", ex);
        } catch (RestClientException ex) {
            log.warn("OpenRouter API call failed: {}", ex.getMessage());
            throw new AiProviderException("The AI service request failed. Please try again.", ex);
        }
    }

    private String executeChatCompletion(String targetModel, String systemInstruction, List<ChatTurn> conversation) {
        String raw = restClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "https://wycherley.lk")
                .header("X-Title", "SIMS Wycherley Study Buddy")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(buildRequestBody(targetModel, systemInstruction, conversation))
                .retrieve()
                .body(String.class);

        return extractReply(raw);
    }

    Map<String, Object> buildRequestBody(String targetModel, String systemInstruction, List<ChatTurn> conversation) {
        List<Map<String, String>> messages = new ArrayList<>();

        if (systemInstruction != null && !systemInstruction.isBlank()) {
            messages.add(Map.of("role", "system", "content", systemInstruction));
        }

        for (ChatTurn turn : conversation) {
            String role = "assistant".equals(turn.role()) ? "assistant" : "user";
            messages.add(Map.of("role", role, "content", turn.content() != null ? turn.content() : ""));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", targetModel);
        body.put("messages", messages);
        body.put("temperature", 0.6);
        body.put("max_tokens", 2048);
        return body;
    }

    String extractReply(String raw) {
        JsonNode root;
        try {
            root = objectMapper.readTree(raw == null ? "" : raw);
        } catch (JsonProcessingException ex) {
            throw new AiProviderException("The AI service returned an unreadable response.", ex);
        }

        if (root == null || root.isMissingNode() || root.isNull()) {
            throw new AiProviderException("The AI service returned an empty response.");
        }

        JsonNode choices = root.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            String errMsg = root.path("error").path("message").asText("");
            if (!errMsg.isEmpty()) {
                throw new AiProviderException("AI error: " + errMsg);
            }
            throw new AiProviderException("The AI service returned no answer. Please try again.");
        }

        JsonNode messageNode = choices.get(0).path("message");
        String content = messageNode.path("content").asText("").trim();

        // If content is empty but model only populated reasoning, extract only the final answer if present
        if (content.isEmpty()) {
            String reasoning = messageNode.path("reasoning").asText("").trim();
            content = extractFinalAnswerFromReasoning(reasoning);
        }

        // Sanitize any leaked thinking/reasoning tags
        content = sanitizeContent(content);

        if (content.isEmpty()) {
            throw new AiProviderException("The AI assistant was preparing your answer but needed more tokens. Please ask a more focused question or try again.");
        }

        return content;
    }

    static String sanitizeContent(String text) {
        if (text == null) return "";
        // Strip xml-like reasoning tags
        String s = text.replaceAll("(?s)<think>.*?</think>", "")
                       .replaceAll("(?s)<thought>.*?</thought>", "")
                       .replaceAll("(?s)<reasoning>.*?</reasoning>", "");

        // Strip "Thinking Process:" blocks if leaked at the start
        if (s.startsWith("Thinking Process:") || s.startsWith("Thinking:")) {
            int idx = s.indexOf("\n\n");
            while (idx != -1 && (s.substring(0, idx).contains("Thinking Process:") || s.substring(0, idx).contains("Thinking:"))) {
                s = s.substring(idx + 2).trim();
                idx = s.indexOf("\n\n");
            }
        }
        return s.trim();
    }

    private static String extractFinalAnswerFromReasoning(String reasoning) {
        if (reasoning == null || reasoning.isBlank()) return "";
        // If reasoning ends with a clear answer section
        int answerIdx = reasoning.lastIndexOf("Answer:");
        if (answerIdx == -1) answerIdx = reasoning.lastIndexOf("Response:");
        if (answerIdx == -1) answerIdx = reasoning.lastIndexOf("Conclusion:");
        if (answerIdx != -1 && answerIdx + 10 < reasoning.length()) {
            return reasoning.substring(answerIdx).trim();
        }
        return "";
    }

    private String describeHttpFailure(int status, String body) {
        String providerMessage = "";
        try {
            providerMessage = objectMapper.readTree(body == null ? "" : body).path("error").path("message").asText("");
        } catch (Exception ignored) {
        }
        String lower = providerMessage.toLowerCase(Locale.ROOT);

        if (status == 429) {
            return "The AI assistant is receiving too many requests right now (rate limit). Please wait a moment and try again.";
        }
        if (status == 401 || (status == 400 && lower.contains("api key"))) {
            return "The AI assistant is misconfigured on the server (invalid OpenRouter API key). Please inform the school IT office.";
        }
        if (status == 402) {
            return "The AI service requires credit purchase on OpenRouter for model '" + model + "'. Please add credits at https://openrouter.ai/settings/credits.";
        }
        if (status == 404) {
            return "The configured AI model '" + model + "' is not available on OpenRouter.";
        }
        if (status >= 500) {
            return "The AI service is temporarily unavailable. Please try again shortly.";
        }
        return "The AI service rejected the request (HTTP " + status + "). " + (providerMessage.isEmpty() ? "Please rephrase and try again." : providerMessage);
    }

    private static String abbreviate(String s) {
        if (s == null) return "";
        String oneLine = s.replaceAll("\\s+", " ").trim();
        return oneLine.length() > 300 ? oneLine.substring(0, 300) + "…" : oneLine;
    }
}
