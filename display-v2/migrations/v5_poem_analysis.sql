-- V5 Migration: poem_analysis table (AI 赏析卡 cache)
-- Idempotent: CREATE TABLE IF NOT EXISTS

CREATE TABLE IF NOT EXISTS poem_analysis (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  poem_id BIGINT NOT NULL UNIQUE,
  analysis JSON NOT NULL COMMENT '结构化赏析: {lines:[{line,解读}], sentiment, background, annotations}',
  model VARCHAR(64) COMMENT '生成模型',
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  version INT DEFAULT 1 COMMENT '赏析版本, 用于失效',
  FOREIGN KEY (poem_id) REFERENCES poem(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
