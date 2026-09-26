package com.sjg.service;

import com.sjg.dto.ChatRequest;
import com.sjg.dto.EntityContext;
import com.sjg.dto.EvidenceSnippet;
import com.sjg.entity.AiAuditLog;
import com.sjg.mapper.AiAuditLogMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Service
public class AiAuditService {

    private static final int MAX_QUERY_LENGTH = 1000;
    private final AiAuditLogMapper mapper;

    public AiAuditService(AiAuditLogMapper mapper) {
        this.mapper = mapper;
    }

    public AiAuditLog start(ChatRequest request, String clientKey) {
        AiAuditLog log = new AiAuditLog();
        log.setClientKeyHash(hash(clientKey == null ? "anon" : clientKey));
        log.setQueryText(truncate(request == null ? null : request.message(), MAX_QUERY_LENGTH));
        EntityContext context = EntityContext.from(request == null ? null : request.context());
        log.setContextType(context.type());
        log.setContextEntityId(context.entityId());
        log.setContextRegion(context.region());
        log.setEvidenceCount(0);
        log.setStatus("running");
        log.setCreatedAt(LocalDateTime.now());
        mapper.insert(log);
        return log;
    }

    public void complete(AiAuditLog log, List<EvidenceSnippet> evidence,
                         String model, String errorType) {
        if (log == null) return;
        log.setEvidenceCount(evidence == null ? 0 : evidence.size());
        log.setModel(truncate(model, 100));
        log.setErrorType(truncate(errorType, 200));
        log.setStatus(StringUtils.hasText(errorType) ? "error" : "success");
        log.setCompletedAt(LocalDateTime.now());
        if (log.getCreatedAt() != null) {
            log.setLatencyMs(java.time.Duration.between(log.getCreatedAt(), log.getCompletedAt()).toMillis());
        }
        mapper.updateById(log);
    }

    public void recordFeedback(Long auditId, String feedback, String comment) {
        if (auditId == null || auditId <= 0) throw new IllegalArgumentException("auditId 必须为正数");
        if (!SetValues.FEEDBACK.contains(feedback)) {
            throw new IllegalArgumentException("feedback 仅支持 helpful/unhelpful/factual_error");
        }
        AiAuditLog log = mapper.selectById(auditId);
        if (log == null) throw new IllegalArgumentException("审计记录不存在");
        log.setFeedback(feedback);
        log.setFeedbackComment(truncate(comment, 500));
        mapper.updateById(log);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 不可用", e);
        }
    }

    private String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() > max ? value.substring(0, max) : value;
    }

    private static final class SetValues {
        private static final java.util.Set<String> FEEDBACK = java.util.Set.of(
                "helpful", "unhelpful", "factual_error");
    }
}
