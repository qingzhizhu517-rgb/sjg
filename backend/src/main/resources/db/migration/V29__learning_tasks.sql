-- V29: 一城一课教学任务与学习成果
-- 任务正文使用结构化 JSON 文本保存，发布前由服务层校验步骤、实体和来源绑定。

CREATE TABLE IF NOT EXISTS learning_task (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_code VARCHAR(32) NOT NULL COMMENT '公开分享短ID',
    title VARCHAR(200) NOT NULL,
    city VARCHAR(50) COMMENT '任务主城市',
    goal TEXT COMMENT '学习目标',
    background TEXT COMMENT '任务背景',
    content_json LONGTEXT NOT NULL COMMENT '任务结构化正文 JSON',
    export_template VARCHAR(50) DEFAULT 'markdown',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT 'draft/published/archived',
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_learning_task_code (task_code),
    INDEX idx_learning_task_status (status),
    INDEX idx_learning_task_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='诗词探究教学任务';

CREATE TABLE IF NOT EXISTS learning_submission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    session_key_hash CHAR(64) NOT NULL COMMENT '匿名会话标识 SHA-256',
    user_id BIGINT COMMENT '登录用户ID，可为空',
    answers_json LONGTEXT NOT NULL COMMENT '题目答案 JSON',
    current_step INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT 'draft/submitted',
    ai_feedback_json LONGTEXT COMMENT 'AI反馈 JSON',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_learning_submission_session (task_id, session_key_hash),
    INDEX idx_learning_submission_task (task_id),
    CONSTRAINT fk_learning_submission_task FOREIGN KEY (task_id)
        REFERENCES learning_task(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习任务提交成果';
