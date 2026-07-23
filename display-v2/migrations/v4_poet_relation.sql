-- V4 Migration: poet_relation table + 13 seed relationships
-- Idempotent: CREATE TABLE IF NOT EXISTS + INSERT IGNORE

CREATE TABLE IF NOT EXISTS poet_relation (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  poet_a_id BIGINT NOT NULL,
  poet_b_id BIGINT NOT NULL,
  relation_type VARCHAR(16) NOT NULL COMMENT '师承/交游/并称/亲属',
  description VARCHAR(128),
  source VARCHAR(16) DEFAULT 'seed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_pair_type (poet_a_id, poet_b_id, relation_type),
  KEY idx_a (poet_a_id), KEY idx_b (poet_b_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13 seed relationships (poet_a_id < poet_b_id guaranteed)
INSERT IGNORE INTO poet_relation (poet_a_id, poet_b_id, relation_type, description, source) VALUES
  (1,   6,   '并称', '李杜齐鲁相会',             'seed'),  -- 杜甫 / 李白
  (6,   105, '交游', '梁宋同游',                 'seed'),  -- 李白 / 高适
  (1,   105, '交游', '梁宋同游',                 'seed'),  -- 杜甫 / 高适
  (17,  18,  '师承', '苏黄, 庭坚出苏轼门下',     'seed'),  -- 苏轼 / 黄庭坚
  (15,  17,  '亲属', '三苏兄弟',                 'seed'),  -- 苏辙 / 苏轼
  (3,   17,  '并称', '唐宋八大家',               'seed'),  -- 曾巩 / 苏轼
  (31,  122, '交游', '王士禛评《聊斋》',         'seed'),  -- 蒲松龄 / 王士禛
  (31,  32,  '交游', '山东清初同代',             'seed'),  -- 蒲松龄 / 赵执信
  (32,  122, '亲属', '赵执信为王士禛甥婿',       'seed'),  -- 赵执信 / 王士禛
  (27,  41,  '并称', '明后七子',                 'seed'),  -- 李攀龙 / 王世贞
  (27,  56,  '并称', '明后七子',                 'seed'),  -- 李攀龙 / 谢榛
  (41,  56,  '并称', '明后七子',                 'seed'),  -- 王世贞 / 谢榛
  (5,   7,   '交游', '金元之际(待考, 或删)',     'seed');  -- 赵孟頫 / 元好问
