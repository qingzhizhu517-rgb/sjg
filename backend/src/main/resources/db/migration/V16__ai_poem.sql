-- V16: AI写诗作品表(源自 worktree V11, 重编号; 原生幂等)
CREATE TABLE IF NOT EXISTS ai_poem (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    theme VARCHAR(100) NOT NULL COMMENT '生成主题',
    title VARCHAR(200) NOT NULL COMMENT '诗标题',
    content TEXT NOT NULL COMMENT '诗正文(含标点/换行)',
    author_alias VARCHAR(50) COMMENT 'AI署名(如"AI小文")',
    model VARCHAR(64) COMMENT '使用的AI模型',
    prompt TEXT COMMENT '生成用prompt(可复现)',
    status VARCHAR(20) DEFAULT 'generated' COMMENT 'generated生成/published发布/archived归档',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_theme (theme),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI写诗作品表';