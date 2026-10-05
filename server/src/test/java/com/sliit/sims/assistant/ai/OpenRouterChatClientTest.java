package com.sliit.sims.assistant.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sliit.sims.assistant.dto.ChatTurn;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class OpenRouterChatClientTest {

    private static final String URL = "https://openrouter.test/chat/completions";
    private final ObjectMapper mapper = new ObjectMapper();
    private MockRestServiceServer server;
    private OpenRouterChatClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl("https://openrouter.test");
        server = MockRestServiceServer.bindTo(builder).build();
        client = new OpenRouterChatClient(builder.build(), mapper, "sk-test-key", "apodex/apodex-1.1-mini:free");
    }

    private static List<ChatTurn> convo() {
        return List.of(new ChatTurn("user", "hi"), new ChatTurn("assistant", "hello!"), new ChatTurn("user", "what is 2+2?"));
    }

    @Test
    void sendsBearerHeaderAndMapsRolesAndSystemInstruction() {
        server.expect(requestTo(URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer sk-test-key"))
                .andExpect(jsonPath("$.model").value("apodex/apodex-1.1-mini:free"))
                .andExpect(jsonPath("$.messages[0].role").value("system"))
                .andExpect(jsonPath("$.messages[0].content").value("SYS"))
                .andExpect(jsonPath("$.messages[1].role").value("user"))
                .andExpect(jsonPath("$.messages[1].content").value("hi"))
                .andExpect(jsonPath("$.messages[2].role").value("assistant"))
                .andExpect(jsonPath("$.messages[2].content").value("hello!"))
                .andExpect(jsonPath("$.messages[3].role").value("user"))
                .andExpect(jsonPath("$.messages[3].content").value("what is 2+2?"))
                .andRespond(withSuccess("""
                        {"choices":[{"message":{"role":"assistant","content":"It is 4."}}]}
                        """, MediaType.APPLICATION_JSON));

        assertThat(client.generateReply("SYS", convo())).isEqualTo("It is 4.");
        server.verify();
    }

    @Test
    void providerAndModelNamesAreReported() {
        assertThat(client.providerName()).isEqualTo("OpenRouter");
        assertThat(client.modelName()).isEqualTo("apodex/apodex-1.1-mini:free");
        assertThat(client.isConfigured()).isTrue();
    }
<<<<<<< HEAD
=======

    @Test
    void sanitizesThinkingTagsAndReasoningBlocks() {
        String dirty1 = "<think>internal reasoning steps</think>Hello! Here is your answer.";
        assertThat(OpenRouterChatClient.sanitizeContent(dirty1)).isEqualTo("Hello! Here is your answer.");

        String dirty2 = "Thinking Process:\nAnalyzing user query...\n\nHello Kasun!";
        assertThat(OpenRouterChatClient.sanitizeContent(dirty2)).isEqualTo("Hello Kasun!");
    }
>>>>>>> 5eacfec731619621d70d9674e40f4c4bec09880d
}
