-- V28: AI 请求审计、耗时与用户反馈
-- 不保存原始客户端 IP；应用层只写入 SHA-256 标识。

CREATE TABLE IF NOT EXISTS ai_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_key_hash CHAR(64) NOT NULL COMMENT '客户端标识 SHA-256',
    query_text VARCHAR(1000) COMMENT '截断后的用户问题',
    context_type VARCHAR(40) COMMENT '页面上下文类型',
    context_entity_id BIGINT COMMENT '页面实体ID',
    context_region VARCHAR(100) COMMENT '页面区域',
    evidence_count INT NOT NULL DEFAULT 0,
    model VARCHAR(100),
    latency_ms BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'running' COMMENT 'running/success/error',
    error_type VARCHAR(200),
    feedback VARCHAR(30) COMMENT 'helpful/unhelpful/factual_error',
    feedback_comment VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    INDEX idx_ai_audit_created (created_at),
    INDEX idx_ai_audit_status (status),
    INDEX idx_ai_audit_feedback (feedback)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 请求审计与反馈';
