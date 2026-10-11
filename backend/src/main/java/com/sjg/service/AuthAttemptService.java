package com.sjg.service;

import com.sjg.exception.TooManyRequestsException;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.Normalizer;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class AuthAttemptService {
    private static final Logger log = LoggerFactory.getLogger(AuthAttemptService.class);
    private final RateLimitService limiter;
    @Autowired(required = false) private MeterRegistry meters;
    public AuthAttemptService(RateLimitService limiter) { this.limiter = limiter; }

    public void check(String action, String address, String account) {
        String canonical = Normalizer.normalize(account == null ? "" : account.trim(), Normalizer.Form.NFKD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
        String ipKey = digest(address == null ? "anon" : address);
        String accountKey = digest(canonical);
        if (!limiter.tryAcquire("auth:" + action + ":ip:" + ipKey, 5, Duration.ofMinutes(1))
                || !limiter.tryAcquire("auth:" + action + ":account:" + accountKey, 5, Duration.ofMinutes(1))) {
            record(action, "limited", accountKey);
            throw new TooManyRequestsException();
        }
    }

    public void record(String action, String outcome, String account) {
        if (meters != null) meters.counter("sjg.auth.attempts", "action", action, "outcome", outcome).increment();
        log.info("security_event action={} outcome={} account_digest={}", action, outcome, digest(account == null ? "" : account));
    }

    private static String digest(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException("SHA-256 unavailable", e); }
    }
}
