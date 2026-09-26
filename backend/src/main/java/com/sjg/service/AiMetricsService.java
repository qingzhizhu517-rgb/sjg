package com.sjg.service;

import com.sjg.mapper.AiAuditLogMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AiMetricsService {
    private final AiAuditLogMapper mapper;

    public AiMetricsService(AiAuditLogMapper mapper) { this.mapper = mapper; }

    public Map<String, Object> summary(int hours) {
        int boundedHours = Math.max(1, Math.min(hours, 24 * 30));
        LocalDateTime from = LocalDateTime.now().minusHours(boundedHours);
        long total = mapper.countSince(from);
        long success = mapper.countSinceByStatus(from, "success");
        long errors = mapper.countSinceByStatus(from, "error");
        Double avgLatency = mapper.averageLatencySince(from);
        long feedbackCount = mapper.feedbackCountSince(from);
        long helpfulFeedbackCount = mapper.feedbackCountSinceByType(from, "helpful");
        long unhelpfulFeedbackCount = mapper.feedbackCountSinceByType(from, "unhelpful");
        long factualErrorCount = mapper.feedbackCountSinceByType(from, "factual_error");
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("hours", boundedHours);
        result.put("totalRequests", total);
        result.put("successRequests", success);
        result.put("errorRequests", errors);
        result.put("errorRate", total == 0 ? 0 : (double) errors / total);
        result.put("runningRequests", Math.max(0, total - success - errors));
        result.put("averageLatencyMs", avgLatency == null ? 0 : Math.round(avgLatency));
        result.put("noEvidenceRequests", mapper.noEvidenceCountSince(from));
        result.put("feedbackCount", feedbackCount);
        result.put("feedbackRate", total == 0 ? 0 : (double) feedbackCount / total);
        result.put("helpfulFeedbackCount", helpfulFeedbackCount);
        result.put("unhelpfulFeedbackCount", unhelpfulFeedbackCount);
        result.put("factualErrorCount", factualErrorCount);
        result.put("helpfulRate", feedbackCount == 0 ? 0 : (double) helpfulFeedbackCount / feedbackCount);
        return result;
    }
}
