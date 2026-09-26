package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_audit_log")
public class AiAuditLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String clientKeyHash;
    private String queryText;
    private String contextType;
    private Long contextEntityId;
    private String contextRegion;
    private Integer evidenceCount;
    private String model;
    private Long latencyMs;
    private String status;
    private String errorType;
    private String feedback;
    private String feedbackComment;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
