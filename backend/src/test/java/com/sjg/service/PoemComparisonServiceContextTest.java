package com.sjg.service;

import com.sjg.controller.pub.PublicAiStatusController;
import com.sjg.controller.pub.PublicPoemComparisonController;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.PoetMapper;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.concurrent.ExecutorService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class PoemComparisonServiceContextTest {

    @Test
    void springAssemblesBothPublicEndpointsAndClosesTheComparisonExecutor() {
        ExecutorService executor;
        ExecutorService watchdog;
        try (var context = new AnnotationConfigApplicationContext()) {
            context.registerBean(LlmClient.class, () -> mock(LlmClient.class));
            context.registerBean(PoemService.class, () -> mock(PoemService.class));
            context.registerBean(ContentReviewService.class, () -> mock(ContentReviewService.class));
            context.registerBean(PoetMapper.class, () -> mock(PoetMapper.class));
            context.registerBean(DynastyMapper.class, () -> mock(DynastyMapper.class));
            context.registerBean(RateLimitService.class, InMemoryRateLimitService::new);
            context.registerBean(AiAuditService.class, () -> mock(AiAuditService.class));
            context.register(PoemComparisonService.class, PublicPoemComparisonController.class,
                    PublicAiStatusController.class, ClientIpResolver.class);

            assertDoesNotThrow(context::refresh);
            assertNotNull(context.getBean(PublicPoemComparisonController.class));
            assertNotNull(context.getBean(PublicAiStatusController.class));
            executor = (ExecutorService) ReflectionTestUtils.getField(
                    context.getBean(PoemComparisonService.class), "executor");
            assertNotNull(executor);
            assertFalse(executor.isShutdown());
            watchdog = (ExecutorService) ReflectionTestUtils.getField(
                    context.getBean(PoemComparisonService.class), "watchdog");
            assertNotNull(watchdog);
            assertFalse(watchdog.isShutdown());
        }
        assertTrue(executor.isShutdown());
        assertTrue(watchdog.isShutdown());
    }
}
