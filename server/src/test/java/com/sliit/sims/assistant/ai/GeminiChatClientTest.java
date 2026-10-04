package com.sliit.sims.assistant.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sliit.sims.assistant.dto.ChatTurn;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.net.SocketTimeoutException;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withException;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class GeminiChatClientTest {

    private static final String URL = "https://gemini.test/v1beta/models/test-model:generateContent";
    private final ObjectMapper mapper = new ObjectMapper();
    private MockRestServiceServer server;
    private GeminiChatClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl("https://gemini.test");
        server = MockRestServiceServer.bindTo(builder).build();
        client = new GeminiChatClient(builder.build(), mapper, "secret-key", "test-model");
    }

    private static List<ChatTurn> convo() {
        return List.of(new ChatTurn("user", "hi"), new ChatTurn("assistant", "hello!"), new ChatTurn("user", "what is 2+2?"));
    }

    @Test
    void sendsKeyInHeaderAndMapsRolesAndSystemInstruction() {
        server.expect(requestTo(URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-goog-api-key", "secret-key"))
                .andExpect(jsonPath("$.systemInstruction.parts[0].text").value("SYS"))
                .andExpect(jsonPath("$.contents[0].role").value("user"))
                .andExpect(jsonPath("$.contents[1].role").value("model"))
                .andExpect(jsonPath("$.contents[1].parts[0].text").value("hello!"))
                .andExpect(jsonPath("$.contents[2].parts[0].text").value("what is 2+2?"))
                .andRespond(withSuccess("""
                        {"candidates":[{"content":{"parts":[{"text":"It is **4**."}]},"finishReason":"STOP"}]}
                        """, MediaType.APPLICATION_JSON));

        assertThat(client.generateReply("SYS", convo())).isEqualTo("It is **4**.");
        server.verify();
    }

    @Test
    void apiKeyIsNeverPlacedInTheUrl() {
        server.expect(request -> assertThat(request.getURI().toString()).doesNotContain("secret-key"))
                .andRespond(withSuccess("{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"ok\"}]}}]}", MediaType.APPLICATION_JSON));
        client.generateReply("SYS", convo());
        server.verify();
    }

    @Test
    void skipsThoughtPartsAndJoinsText() {
        server.expect(requestTo(URL)).andRespond(withSuccess("""
                {"candidates":[{"content":{"parts":[
                  {"text":"internal reasoning","thought":true},
                  {"text":"Part one. "},{"text":"Part two."}]},"finishReason":"STOP"}]}
                """, MediaType.APPLICATION_JSON));
        assertThat(client.generateReply("SYS", convo())).isEqualTo("Part one. Part two.");
    }

    @Test
    void safetyFinishReasonBecomesPoliteRefusal() {
        server.expect(requestTo(URL)).andRespond(withSuccess(
                "{\"candidates\":[{\"finishReason\":\"SAFETY\"}]}", MediaType.APPLICATION_JSON));
        assertThat(client.generateReply("SYS", convo())).isEqualTo(GeminiChatClient.SAFETY_REFUSAL);
    }

    @Test
    void blockedPromptBecomesPoliteRefusal() {
        server.expect(requestTo(URL)).andRespond(withSuccess(
                "{\"promptFeedback\":{\"blockReason\":\"SAFETY\"}}", MediaType.APPLICATION_JSON));
        assertThat(client.generateReply("SYS", convo())).isEqualTo(GeminiChatClient.SAFETY_REFUSAL);
    }

    @Test
    void emptyAnswerWithMaxTokensIsReportedAsCutOff() {
        server.expect(requestTo(URL)).andRespond(withSuccess(
                "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"\",\"thought\":true}]},\"finishReason\":\"MAX_TOKENS\"}]}",
                MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> client.generateReply("SYS", convo()))
                .isInstanceOf(AiProviderException.class).hasMessageContaining("cut off");
    }

    @Test
    void unreadableResponseIsProviderError() {
        server.expect(requestTo(URL)).andRespond(withSuccess("<html>oops</html>", MediaType.TEXT_HTML));
        assertThatThrownBy(() -> client.generateReply("SYS", convo()))
                .isInstanceOf(AiProviderException.class).hasMessageContaining("unreadable");
    }

    @Test
    void rateLimitIsMappedToFriendlyMessage() {
        server.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"error\":{\"code\":429,\"message\":\"Resource has been exhausted\"}}"));
        assertThatThrownBy(() -> client.generateReply("SYS", convo()))
                .isInstanceOf(AiProviderException.class).hasMessageContaining("too many requests");
    }

    @Test
    void invalidApiKeyIsMappedToMisconfiguration() {
        server.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"error\":{\"code\":400,\"message\":\"API key not valid. Please pass a valid API key.\"}}"));
        assertThatThrownBy(() -> client.generateReply("SYS", convo()))
                .isInstanceOf(AiProviderException.class).hasMessageContaining("API key rejected");
    }

    @Test
    void unknownModelNamesTheModel() {
        server.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.NOT_FOUND).body("{\"error\":{\"message\":\"not found\"}}"));
        assertThatThrownBy(() -> client.generateReply("SYS", convo()))
                .isInstanceOf(AiProviderException.class).hasMessageContaining("'test-model'");
    }

    @Test
    void serverErrorAndNetworkFailureAreProviderErrors() {
        server.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE).body("overloaded"));
        assertThatThrownBy(() -> client.generateReply("SYS", convo()))
                .isInstanceOf(AiProviderException.class).hasMessageContaining("temporarily unavailable");

        server.reset();
        server.expect(requestTo(URL)).andRespond(withException(new SocketTimeoutException("read timed out")));
        assertThatThrownBy(() -> client.generateReply("SYS", convo()))
                .isInstanceOf(AiProviderException.class).hasMessageContaining("could not be reached");
    }

    @Test
    void missingKeyMeansUnavailableAndNoHttpCall() {
        GeminiChatClient unconfigured = new GeminiChatClient(RestClient.create(), mapper, "  ", null);
        assertThat(unconfigured.isConfigured()).isFalse();
        assertThat(unconfigured.modelName()).isEqualTo(GeminiChatClient.DEFAULT_MODEL);
        assertThatThrownBy(() -> unconfigured.generateReply("SYS", convo()))
                .isInstanceOf(AssistantUnavailableException.class);
    }

    @Test
    void requestBodyHasGenerationConfig() {
        Map<String, Object> body = client.buildRequestBody("SYS", convo());
        assertThat(body).containsKeys("systemInstruction", "contents", "generationConfig");
        assertThat((List<?>) body.get("contents")).hasSize(3);
    }
}

