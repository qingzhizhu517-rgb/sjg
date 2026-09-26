package com.sjg.service;

import com.sjg.dto.ChatRequest;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ChatServiceRateLimitTest {

    @Test
    void streamUsesSharedRateLimitService() {
        LlmClient llm = mock(LlmClient.class);
        when(llm.isConfigured()).thenReturn(true);
        doAnswer(invocation -> null).when(llm).streamChat(anyList(), any(), any());
        RateLimitService limiter = mock(RateLimitService.class);
        when(limiter.tryAcquire(eq("198.51.100.4"), eq(10), any(Duration.class))).thenReturn(false);
        ChatService service = new ChatService(llm, null, null, null, limiter);
        ReflectionTestUtils.setField(service, "timeoutSeconds", 1);
        ReflectionTestUtils.setField(service, "windowSeconds", 60);
        ReflectionTestUtils.setField(service, "maxRequests", 10);

        SseEmitter ignored = service.stream(
                new ChatRequest("问题", List.of(), Map.of()), "198.51.100.4");

        verify(limiter, timeout(1000)).tryAcquire(eq("198.51.100.4"), eq(10), any(Duration.class));
        verify(llm, never()).streamChat(anyList(), any(), any());
    }
}
