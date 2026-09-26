package com.sjg.service;

import com.sjg.dto.ChatMessage;
import com.sjg.dto.ChatRequest;
import com.sjg.dto.EvidenceSnippet;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ChatServiceProvenanceTest {

    @Test
    void configuredKnowledgeRetrievalDoesNotFallBackToUnreviewedLegacyRag() throws Exception {
        LlmClient llm = mock(LlmClient.class);
        RagRetrievalService legacyRag = mock(RagRetrievalService.class);
        KnowledgeRetrievalService knowledge = mock(KnowledgeRetrievalService.class);
        when(llm.isConfigured()).thenReturn(true);
        when(knowledge.retrieve(anyString(), any())).thenReturn(List.<EvidenceSnippet>of());
        when(legacyRag.retrieve("问题")).thenReturn("未审核旧资料");

        @SuppressWarnings("unchecked")
        var captured = (org.mockito.ArgumentCaptor<List<ChatMessage>>) (Object)
                org.mockito.ArgumentCaptor.forClass(List.class);
        doAnswer(invocation -> {
            invocation.<java.util.function.Consumer<String>>getArgument(1).accept("回答");
            return null;
        }).when(llm).streamChat(anyList(), any(), any());

        ChatService service = new ChatService(llm, legacyRag, knowledge, null,
                new InMemoryRateLimitService());
        ReflectionTestUtils.setField(service, "systemPrompt", "资料：{rag_context}");
        ReflectionTestUtils.setField(service, "timeoutSeconds", 1);
        ReflectionTestUtils.setField(service, "windowSeconds", 60);
        ReflectionTestUtils.setField(service, "maxRequests", 10);

        SseEmitter emitter = service.stream(new ChatRequest("问题", List.of(), Map.of()), "test-client");
        TimeUnit.MILLISECONDS.sleep(20);

        verify(llm, timeout(1000)).streamChat(captured.capture(), any(), any());
        String systemPrompt = captured.getValue().get(0).content();
        assertFalse(systemPrompt.contains("未审核旧资料"));
    }
}
