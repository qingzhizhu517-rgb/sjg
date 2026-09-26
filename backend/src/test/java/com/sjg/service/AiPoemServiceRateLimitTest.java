package com.sjg.service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AiPoemServiceRateLimitTest {

    @Test
    void checkRateDelegatesToSharedRateLimitService() {
        LlmClient llm = mock(LlmClient.class);
        RateLimitService limiter = mock(RateLimitService.class);
        when(limiter.tryAcquire(eq("198.51.100.7"), eq(10), any(Duration.class))).thenReturn(true);
        AiPoemService service = new AiPoemService(llm, limiter);
        ReflectionTestUtils.setField(service, "windowSeconds", 60);
        ReflectionTestUtils.setField(service, "maxRequests", 10);

        assertTrue(service.checkRate("198.51.100.7"));
        verify(limiter).tryAcquire(eq("198.51.100.7"), eq(10), eq(Duration.ofSeconds(60)));
    }
}
