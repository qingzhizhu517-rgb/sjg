package com.sjg.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.sjg.entity.AiAuditLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;

@Mapper
public interface AiAuditLogMapper extends BaseMapper<AiAuditLog> {
    @Select("SELECT COUNT(*) FROM ai_audit_log WHERE created_at >= #{from}")
    long countSince(LocalDateTime from);

    @Select("SELECT COUNT(*) FROM ai_audit_log WHERE created_at >= #{from} AND status = #{status}")
    long countSinceByStatus(LocalDateTime from, String status);

    @Select("SELECT COUNT(*) FROM ai_audit_log WHERE created_at >= #{from} AND feedback IS NOT NULL")
    long feedbackCountSince(LocalDateTime from);

    @Select("SELECT COUNT(*) FROM ai_audit_log WHERE created_at >= #{from} AND feedback = #{feedback}")
    long feedbackCountSinceByType(LocalDateTime from, String feedback);

    @Select("SELECT AVG(latency_ms) FROM ai_audit_log WHERE created_at >= #{from} AND latency_ms IS NOT NULL")
    Double averageLatencySince(LocalDateTime from);

    @Select("SELECT COUNT(*) FROM ai_audit_log WHERE created_at >= #{from} AND evidence_count = 0")
    long noEvidenceCountSince(LocalDateTime from);
}
