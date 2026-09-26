package com.sjg.service;

import com.sjg.mapper.AiAuditLogMapper;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AiMetricsServiceTest {
    private final AiAuditLogMapper mapper = mock(AiAuditLogMapper.class);
    private final AiMetricsService service = new AiMetricsService(mapper);

    @Test
    void summaryBoundsWindowAndCalculatesRates() {
        when(mapper.countSince(any(LocalDateTime.class))).thenReturn(10L);
        when(mapper.countSinceByStatus(any(LocalDateTime.class), eq("success"))).thenReturn(7L);
        when(mapper.countSinceByStatus(any(LocalDateTime.class), eq("error"))).thenReturn(2L);
        when(mapper.averageLatencySince(any(LocalDateTime.class))).thenReturn(123.4);
        when(mapper.noEvidenceCountSince(any(LocalDateTime.class))).thenReturn(3L);
        when(mapper.feedbackCountSince(any(LocalDateTime.class))).thenReturn(4L);
        when(mapper.feedbackCountSinceByType(any(LocalDateTime.class), eq("helpful"))).thenReturn(3L);
        when(mapper.feedbackCountSinceByType(any(LocalDateTime.class), eq("unhelpful"))).thenReturn(1L);
        when(mapper.feedbackCountSinceByType(any(LocalDateTime.class), eq("factual_error"))).thenReturn(0L);

        Map<String, Object> result = service.summary(99999);

        assertEquals(720, result.get("hours"));
        assertEquals(0.2, result.get("errorRate"));
        assertEquals(1L, result.get("runningRequests"));
        assertEquals(123L, result.get("averageLatencyMs"));
        assertEquals(0.4, result.get("feedbackRate"));
        assertEquals(3L, result.get("helpfulFeedbackCount"));
        assertEquals(1L, result.get("unhelpfulFeedbackCount"));
        assertEquals(0L, result.get("factualErrorCount"));
        assertEquals(0.75, result.get("helpfulRate"));
    }
}
