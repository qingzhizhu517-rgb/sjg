package com.sjg.service;

import com.sjg.dto.ChatMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LlmClientStreamCompletionTest {
    private final HttpClient http = mock(HttpClient.class);
    private final LlmClient llm = new LlmClient();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(llm, "http", http);
        ReflectionTestUtils.setField(llm, "baseUrl", "https://llm.invalid");
        ReflectionTestUtils.setField(llm, "apiKey", "test-only-placeholder");
        ReflectionTestUtils.setField(llm, "model", "test-model");
        ReflectionTestUtils.setField(llm, "timeoutSeconds", 1);
    }

    @Test
    void doneMarkerOrStopReasonSignalsCompletion() throws Exception {
        for (String terminal : List.of("data: [DONE]\n\n",
                "data: {\"choices\":[{\"delta\":{},\"finish_reason\":\"stop\"}]}\n\n")) {
            upstream(delta("完整答复") + terminal);
            AtomicBoolean completed = new AtomicBoolean();
            List<String> output = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            llm.streamChat(List.of(new ChatMessage("user", "测试")), output::add, errors::add,
                    () -> completed.set(true));
            assertEquals(List.of("完整答复"), output);
            assertTrue(completed.get());
            assertTrue(errors.isEmpty());
        }
    }

    @Test
    void eofWithoutTerminalOrTokenLimitNeverSignalsCompletion() throws Exception {
        for (String terminal : List.of("", "data: {\"choices\":[{\"delta\":{},\"finish_reason\":\"length\"}]}\n\n"
                + "data: [DONE]\n\n")) {
            upstream(delta("未完成答复") + terminal);
            AtomicBoolean completed = new AtomicBoolean();
            List<String> output = new ArrayList<>();
            llm.streamChat(List.of(new ChatMessage("user", "测试")), output::add,
                    error -> fail("不应转发内部错误"), () -> completed.set(true));
            assertEquals(List.of("未完成答复"), output);
            assertFalse(completed.get());
        }
    }

    @Test
    void legacyThreeArgumentCallRetainsItsEofBehavior() throws Exception {
        upstream(delta("旧聊天响应"));
        List<String> output = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        llm.streamChat(List.of(new ChatMessage("user", "测试")), output::add, errors::add);
        assertEquals(List.of("旧聊天响应"), output);
        assertTrue(errors.isEmpty());
    }

    @Test
    void explicitUpstreamErrorPreventsCompletionEvenWhenFollowedByDone() throws Exception {
        upstream(delta("已有部分内容") + "data: {\"error\":{\"message\":\"private provider details\"}}\n\n"
                + "data: [DONE]\n\n");
        List<String> output = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        AtomicBoolean completed = new AtomicBoolean();
        llm.streamChat(List.of(new ChatMessage("user", "测试")), output::add, errors::add,
                () -> completed.set(true));
        assertEquals(List.of("已有部分内容"), output);
        assertEquals(List.of("大模型响应出错"), errors);
        assertFalse(completed.get());
    }

    @Test
    void providerCredentialLeakIsRejectedBeforeAnyDeltaIsReleased() throws Exception {
        upstream(delta("sk-1234567890abcdefghijklmnop") + "data: [DONE]\n\n");
        List<String> output = new ArrayList<>(); List<String> errors = new ArrayList<>();
        llm.streamChat(List.of(new ChatMessage("user", "测试")), output::add, errors::add);
        assertTrue(output.isEmpty());
        assertFalse(errors.isEmpty());
    }

    @SuppressWarnings("unchecked")
    private void upstream(String body) throws Exception {
        HttpResponse<InputStream> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(200);
        when(response.body()).thenReturn(new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8)));
        when(http.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(response);
    }

    private String delta(String text) {
        return "data: {\"choices\":[{\"delta\":{\"content\":\"" + text + "\"}}]}\n\n";
    }
}
