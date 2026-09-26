package com.sjg.controller;

import com.sjg.service.ClientIpResolver;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClientIpResolverTest {

    @Test
    void ignoresForwardedHeadersWhenRemoteAddressIsNotTrusted() {
        MockHttpServletRequest request = request("10.0.0.8", "203.0.113.9, 10.0.0.8");

        assertEquals("10.0.0.8", new ClientIpResolver("").resolve(request));
    }

    @Test
    void usesFirstForwardedAddressOnlyForTrustedProxy() {
        MockHttpServletRequest request = request("10.0.0.8", "203.0.113.9, 10.0.0.8");

        assertEquals("203.0.113.9", new ClientIpResolver("10.0.0.8").resolve(request));
    }

    private MockHttpServletRequest request(String remote, String forwarded) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr(remote);
        request.addHeader("X-Forwarded-For", forwarded);
        return request;
    }
}
