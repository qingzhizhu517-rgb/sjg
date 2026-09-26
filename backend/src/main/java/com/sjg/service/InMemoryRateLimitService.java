package com.sjg.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryRateLimitService implements RateLimitService {
    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final int maxKeys;
    private final long cleanupIntervalMillis;
    private long lastCleanupMillis;

    @Autowired
    public InMemoryRateLimitService(
            @Value("${llm.rate-limit.max-keys:10000}") int maxKeys,
            @Value("${llm.rate-limit.cleanup-interval-millis:60000}") long cleanupIntervalMillis) {
        this.maxKeys = Math.max(1, maxKeys);
        this.cleanupIntervalMillis = Math.max(1, cleanupIntervalMillis);
        this.lastCleanupMillis = System.currentTimeMillis();
    }

    public InMemoryRateLimitService() {
        this(10_000, 60_000);
    }

    @Override
    public boolean tryAcquire(String key, int limit, Duration window) {
        if (limit <= 0 || window == null || window.isZero() || window.isNegative()) return false;
        String normalizedKey = key == null || key.isBlank() ? "anon" : key.trim();
        long now = System.currentTimeMillis();
        long windowMillis = Math.max(1, window.toMillis());
        synchronized (windows) {
            cleanup(now);
            Window current = windows.get(normalizedKey);
            if (current == null) {
                evictIfFull();
                current = new Window();
                windows.put(normalizedKey, current);
            }
            current.timestamps.removeIf(timestamp -> now - timestamp >= windowMillis);
            if (current.timestamps.size() >= limit) {
                current.lastTouched = now;
                return false;
            }
            current.timestamps.addLast(now);
            current.lastTouched = now;
            return true;
        }
    }

    int sizeForTest() {
        synchronized (windows) {
            return windows.size();
        }
    }

    private void cleanup(long now) {
        if (now - lastCleanupMillis < cleanupIntervalMillis) return;
        windows.entrySet().removeIf(entry -> entry.getValue().timestamps.isEmpty()
                || now - entry.getValue().lastTouched >= cleanupIntervalMillis);
        lastCleanupMillis = now;
    }

    private void evictIfFull() {
        if (windows.size() < maxKeys) return;
        String oldestKey = null;
        long oldest = Long.MAX_VALUE;
        for (Map.Entry<String, Window> entry : windows.entrySet()) {
            if (entry.getValue().lastTouched < oldest) {
                oldest = entry.getValue().lastTouched;
                oldestKey = entry.getKey();
            }
        }
        if (oldestKey != null) windows.remove(oldestKey);
    }

    private static final class Window {
        private final Deque<Long> timestamps = new ArrayDeque<>();
        private long lastTouched = System.currentTimeMillis();
    }
}
