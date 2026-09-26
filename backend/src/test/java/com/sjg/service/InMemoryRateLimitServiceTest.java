package com.sjg.service;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

class InMemoryRateLimitServiceTest {

    @Test
    void limitsRequestsWithinWindowAndAllowsAfterExpiry() throws InterruptedException {
        InMemoryRateLimitService service = new InMemoryRateLimitService(100, 20);

        assertTrue(service.tryAcquire("client-1", 2, Duration.ofMillis(20)));
        assertTrue(service.tryAcquire("client-1", 2, Duration.ofMillis(20)));
        assertFalse(service.tryAcquire("client-1", 2, Duration.ofMillis(20)));

        Thread.sleep(30);
        assertTrue(service.tryAcquire("client-1", 2, Duration.ofMillis(20)));
    }

    @Test
    void evictsOldKeysWhenBoundIsReached() {
        InMemoryRateLimitService service = new InMemoryRateLimitService(2, 60_000);

        assertTrue(service.tryAcquire("one", 1, Duration.ofMinutes(1)));
        assertTrue(service.tryAcquire("two", 1, Duration.ofMinutes(1)));
        assertTrue(service.tryAcquire("three", 1, Duration.ofMinutes(1)));

        assertTrue(service.sizeForTest() <= 2);
    }
}
