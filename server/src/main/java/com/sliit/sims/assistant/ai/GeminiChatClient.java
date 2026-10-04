package com.sliit.sims.assistant.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sliit.sims.assistant.dto.ChatTurn;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import java.util.Set;

/**
 * Google Gemini (Generative Language API) implementation of {@link AiChatClient}.
 * The API key is sent in the {@code x-goog-api-key} header (never in the URL, so it never ends up in logs).
 */
@Slf4j
@Component
public class GeminiChatClient implements AiChatClient {

    static final String DEFAULT_MODEL = "gemini-flash-latest";
    static final String SAFETY_REFUSAL = "Sorry, I can't help with that request. If something is worrying you, "
            + "please talk to your class teacher, the school counsellor, or a trusted adult.";
    private static final Set<String> SAFETY_FINISH_REASONS =
            Set.of("SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII", "RECITATION", "IMAGE_SAFETY");

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    @Autowired
    public GeminiChatClient(ObjectMapper objectMapper,
                            @Value("${sims.assistant.gemini.api-key:}") String apiKey,
                            @Value("${sims.assistant.gemini.model:" + DEFAULT_MODEL + "}") String model,
                            @Value("${sims.assistant.gemini.base-url:https://generativelanguage.googleapis.com}") String baseUrl,
                            @Value("${sims.assistant.gemini.timeout-seconds:45}") int timeoutSeconds) {
        this(buildRestClient(baseUrl, timeoutSeconds), objectMapper, apiKey, model);
    }

    /** Test seam: lets tests inject a RestClient bound to a mock server. */
    GeminiChatClient(RestClient restClient, ObjectMapper objectMapper, String apiKey, String model) {
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
        return "Google Gemini";
    }

    @Override
    public String modelName() {
        return model;
    }

    @Override
    public String generateReply(String systemInstruction, List<ChatTurn> conversation) {
        if (!isConfigured()) {
            throw new AssistantUnavailableException("The AI assistant is not configured on the server (missing GEMINI_API_KEY).");
        }
        String raw;
        try {
            raw = restClient.post()
                    .uri("/v1beta/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(buildRequestBody(systemInstruction, conversation))
                    .retrieve()
                    .body(String.class);
        } catch (RestClientResponseException ex) {
            int status = ex.getStatusCode().value();
            String body = ex.getResponseBodyAsString();
            log.warn("Gemini API returned HTTP {}: {}", status, abbreviate(body));
            throw new AiProviderException(describeHttpFailure(status, body), ex);
        } catch (ResourceAccessException ex) {
            log.warn("Gemini API unreachable: {}", ex.getMessage());
            throw new AiProviderException("The AI service could not be reached or took too long to respond. Please try again.", ex);
        } catch (RestClientException ex) {
            log.warn("Gemini API call failed: {}", ex.getMessage());
            throw new AiProviderException("The AI service request failed. Please try again.", ex);
        }
        return extractReply(raw);
    }

    Map<String, Object> buildRequestBody(String systemInstruction, List<ChatTurn> conversation) {
        List<Map<String, Object>> contents = new ArrayList<>();
        for (ChatTurn turn : conversation) {
            String role = "assistant".equals(turn.role()) ? "model" : "user";
            contents.add(Map.of("role", role, "parts", List.of(Map.of("text", turn.content()))));
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));
        body.put("contents", contents);
        body.put("generationConfig", Map.of("temperature", 0.6, "topP", 0.95));
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

        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            if (!root.path("promptFeedback").path("blockReason").asText("").isEmpty()) {
                return SAFETY_REFUSAL;
            }
            throw new AiProviderException("The AI service returned no answer. Please rephrase and try again.");
        }

        JsonNode candidate = candidates.get(0);
        StringBuilder text = new StringBuilder();
        for (JsonNode part : candidate.path("content").path("parts")) {
            if (part.path("thought").asBoolean(false)) continue; // internal reasoning, never shown
            String piece = part.path("text").asText("");
            if (!piece.isEmpty()) text.append(piece);
        }

        String reply = text.toString().trim();
        String finishReason = candidate.path("finishReason").asText("");
        if (reply.isEmpty()) {
            if (SAFETY_FINISH_REASONS.contains(finishReason)) return SAFETY_REFUSAL;
            if ("MAX_TOKENS".equals(finishReason)) {
                throw new AiProviderException("The AI answer was cut off before it finished. Try asking a shorter or more specific question.");
            }
            throw new AiProviderException("The AI service returned an empty answer. Please try again.");
        }
        return reply;
    }

    private String describeHttpFailure(int status, String body) {
        String providerMessage = "";
        try {
            providerMessage = objectMapper.readTree(body == null ? "" : body).path("error").path("message").asText("");
        } catch (JsonProcessingException | IllegalArgumentException ignored) {
            // non-JSON error body
        }
        String lower = providerMessage.toLowerCase(Locale.ROOT);

        if (status == 429) {
            return "The AI assistant is receiving too many requests right now (rate limit/quota). Please wait a moment and try again.";
        }
        if (status == 401 || status == 403 || (status == 400 && lower.contains("api key"))) {
            return "The AI assistant is misconfigured on the server (API key rejected). Please inform the school IT office.";
        }
        if (status == 404) {
            return "The configured AI model '" + model + "' is not available. Please inform the school IT office (check GEMINI_MODEL).";
        }
        if (status >= 500) {
            return "The AI service is temporarily unavailable. Please try again shortly.";
        }
        return "The AI service rejected the request (HTTP " + status + "). Please rephrase and try again.";
    }

    private static String abbreviate(String s) {
        if (s == null) return "";
        String oneLine = s.replaceAll("\\s+", " ").trim();
        return oneLine.length() > 300 ? oneLine.substring(0, 300) + "…" : oneLine;
    }
}

