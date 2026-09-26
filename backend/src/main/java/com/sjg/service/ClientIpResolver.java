package com.sjg.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ClientIpResolver {
    private final Set<String> trustedProxies;

    public ClientIpResolver(@Value("${server.trusted-proxies:}") String configuredProxies) {
        this.trustedProxies = Arrays.stream(configuredProxies == null ? new String[0] : configuredProxies.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    public String resolve(HttpServletRequest request) {
        if (request == null) return "anon";
        String remote = trimToNull(request.getRemoteAddr());
        if (remote == null) remote = "anon";
        if (!trustedProxies.contains(remote)) return remote;

        String forwarded = firstAddress(request.getHeader("X-Forwarded-For"));
        if (forwarded != null) return forwarded;
        String real = trimToNull(request.getHeader("X-Real-IP"));
        return real == null ? remote : real;
    }

    private String firstAddress(String value) {
        if (value == null) return null;
        for (String part : value.split(",")) {
            String candidate = trimToNull(part);
            if (candidate != null) return candidate;
        }
        return null;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
