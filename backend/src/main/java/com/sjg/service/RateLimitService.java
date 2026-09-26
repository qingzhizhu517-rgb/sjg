package com.sjg.service;

import java.time.Duration;

public interface RateLimitService {
    boolean tryAcquire(String key, int limit, Duration window);
}
