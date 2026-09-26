package com.sjg.service;

import com.sjg.dto.ChatRequest;
import com.sjg.dto.EvidenceSnippet;
import com.sjg.entity.AiAuditLog;
import com.sjg.mapper.AiAuditLogMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AiAuditServiceTest {

    private final AiAuditLogMapper mapper = mock(AiAuditLogMapper.class);
    private final AiAuditService service = new AiAuditService(mapper);

    @Test
    void startStoresHashedClientKeyAndRequestContext() {
        when(mapper.insert(any(AiAuditLog.class))).thenAnswer(invocation -> {
            AiAuditLog log = invocation.getArgument(0);
            log.setId(9L);
            return 1;
        });

        AiAuditLog log = service.start(new ChatRequest("济南诗词", List.of(),
                Map.of("type", "city", "city", "济南")), "192.0.2.1");

        assertEquals(9L, log.getId());
        assertNotEquals("192.0.2.1", log.getClientKeyHash());
        assertEquals("city", log.getContextType());
        verify(mapper).insert(log);
    }

    @Test
    void feedbackAcceptsOnlyKnownValues() {
        when(mapper.selectById(9L)).thenReturn(new AiAuditLog());

        service.recordFeedback(9L, "helpful", "回答清楚");
        verify(mapper).updateById(any(AiAuditLog.class));

        assertThrows(IllegalArgumentException.class,
                () -> service.recordFeedback(9L, "unknown", null));
    }

    @Test
    void completeRecordsEvidenceAndLatency() {
        AiAuditLog log = new AiAuditLog();
        log.setId(3L);
        service.complete(log, List.of(new EvidenceSnippet("poem", 1L, "《静夜思》",
                "床前明月光", List.of(), 100)), "deepseek-v4-flash", null);

        assertEquals("deepseek-v4-flash", log.getModel());
        assertEquals(1, log.getEvidenceCount());
        verify(mapper).updateById(log);
    }
}
