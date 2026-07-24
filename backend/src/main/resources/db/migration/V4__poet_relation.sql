-- V4: 诗人关系图谱 - poet_relation 表 + 关键关系种子
-- 路线图 #7 Phase 1: 诗人-诗人关系(师承/交游/并称/亲属)
-- 手动应用(Flyway 不在 pom): python3 pymysql 脚本, 同 V3 模式
-- 幂等: CREATE IF NOT EXISTS + INSERT ON DUPLICATE KEY UPDATE

CREATE TABLE IF NOT EXISTS poet_relation (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  poet_a_id BIGINT NOT NULL COMMENT '诗人A(取较小id保序)',
  poet_b_id BIGINT NOT NULL COMMENT '诗人B(取较大id保序)',
  relation_type VARCHAR(16) NOT NULL COMMENT '师承/交游/并称/亲属',
  description VARCHAR(128) COMMENT '关系说明(文化味)',
  source VARCHAR(16) NOT NULL DEFAULT 'seed' COMMENT 'seed=人工录入, derived=派生(Phase2)',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_pair_type (poet_a_id, poet_b_id, relation_type),
  KEY idx_poet_a (poet_a_id),
  KEY idx_poet_b (poet_b_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='诗人关系图谱';

-- 12 对关键关系(已按在库真实诗人策展, poet_a_id < poet_b_id)
INSERT INTO poet_relation (poet_a_id, poet_b_id, relation_type, description, source) VALUES
  (1,   6,   '并称', '李杜齐鲁相会',                         'seed'),
  (1,   105, '交游', '梁宋同游(李白/杜甫/高适)',             'seed'),
  (6,   105, '交游', '梁宋同游(李白/杜甫/高适)',             'seed'),
  (3,   17,  '并称', '唐宋八大家',                           'seed'),
  (15,  17,  '亲属', '三苏兄弟(苏洵/苏轼/苏辙)',             'seed'),
  (17,  18,  '师承', '苏黄, 黄庭坚出苏轼门下(苏门四学士)',   'seed'),
  (31,  32,  '交游', '山东清初同代(淄博诗人圈)',             'seed'),
  (31,  122, '交游', '王士禛评《聊斋志异》',                 'seed'),
  (32,  122, '亲属', '赵执信为王士禛甥婿',                   'seed'),
  (27,  41,  '并称', '明后七子',                             'seed'),
  (27,  56,  '并称', '明后七子',                             'seed'),
  (41,  56,  '并称', '明后七子',                             'seed')
ON DUPLICATE KEY UPDATE description = VALUES(description), source = VALUES(source);
