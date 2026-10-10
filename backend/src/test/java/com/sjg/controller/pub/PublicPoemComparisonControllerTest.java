package com.sjg.controller.pub;

import com.sjg.dto.PoemComparisonRequest;
import com.sjg.service.ClientIpResolver;
import com.sjg.service.PoemComparisonService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.*;

class PublicPoemComparisonControllerTest {

    @Test
    void comparisonUsesTrustedProxyResolutionAndReturnsTheServiceEmitter() {
        PoemComparisonService service = mock(PoemComparisonService.class);
        var controller = new PublicPoemComparisonController(service, new ClientIpResolver(""));
        var http = new MockHttpServletRequest();
        http.setRemoteAddr("192.0.2.8");
        http.addHeader("X-Forwarded-For", "203.0.113.9");
        var request = new PoemComparisonRequest(List.of(1L, 2L), "emotion", "compare", "");
        var emitter = new SseEmitter();
        when(service.stream(request, "192.0.2.8")).thenReturn(emitter);

        assertSame(emitter, controller.compare(request, http));
        verify(service).stream(request, "192.0.2.8");
    }
}
