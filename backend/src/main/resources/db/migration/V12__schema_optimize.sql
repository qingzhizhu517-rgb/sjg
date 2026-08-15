-- V12: 数据库结构优化(源自 worktree V7, 重编号避免与主线 V7-V10 冲突)
-- 软删除字段/扩展字段/新表/索引/默认值
-- 幂等: MySQL 8 不支持 ADD COLUMN IF NOT EXISTS / CREATE INDEX IF NOT EXISTS(MariaDB 语法),
--       改用 information_schema 条件判断 + 动态 SQL 实现真正的幂等, 可重复执行。
-- 应用: python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V12__schema_optimize.sql

-- dynasty.deleted
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dynasty' AND COLUMN_NAME = 'deleted');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE dynasty ADD COLUMN deleted TINYINT(1) DEFAULT 0 COMMENT ''软删除标志: 0正常, 1已删除''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- poet.deleted
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poet' AND COLUMN_NAME = 'deleted');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE poet ADD COLUMN deleted TINYINT(1) DEFAULT 0 COMMENT ''软删除标志''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- poet.achievement
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poet' AND COLUMN_NAME = 'achievement');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE poet ADD COLUMN achievement TEXT COMMENT ''主要成就''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- poet.influence
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poet' AND COLUMN_NAME = 'influence');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE poet ADD COLUMN influence TEXT COMMENT ''影响力''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- poet.literary_school
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poet' AND COLUMN_NAME = 'literary_school');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE poet ADD COLUMN literary_school VARCHAR(100) COMMENT ''文学流派''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- scenic_spot.deleted
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'scenic_spot' AND COLUMN_NAME = 'deleted');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE scenic_spot ADD COLUMN deleted TINYINT(1) DEFAULT 0 COMMENT ''软删除标志''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- scenic_spot.opening_hours
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'scenic_spot' AND COLUMN_NAME = 'opening_hours');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE scenic_spot ADD COLUMN opening_hours VARCHAR(200) COMMENT ''开放时间''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- scenic_spot.ticket_info
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'scenic_spot' AND COLUMN_NAME = 'ticket_info');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE scenic_spot ADD COLUMN ticket_info VARCHAR(500) COMMENT ''门票信息''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- scenic_spot.visit_tips
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'scenic_spot' AND COLUMN_NAME = 'visit_tips');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE scenic_spot ADD COLUMN visit_tips TEXT COMMENT ''游览建议''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- scenic_spot.category
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'scenic_spot' AND COLUMN_NAME = 'category');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE scenic_spot ADD COLUMN category VARCHAR(50) COMMENT ''景点类型: 自然景观/历史古迹/文化遗址等''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- poem.deleted
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poem' AND COLUMN_NAME = 'deleted');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE poem ADD COLUMN deleted TINYINT(1) DEFAULT 0 COMMENT ''软删除标志''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- poem.word_count
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poem' AND COLUMN_NAME = 'word_count');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE poem ADD COLUMN word_count INT COMMENT ''字数''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- poem.line_count
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poem' AND COLUMN_NAME = 'line_count');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE poem ADD COLUMN line_count INT COMMENT ''行数''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- poem.poem_type
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poem' AND COLUMN_NAME = 'poem_type');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE poem ADD COLUMN poem_type VARCHAR(50) COMMENT ''诗词类型: 五言律诗/七言绝句/词/曲等''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- poem.difficulty_level
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poem' AND COLUMN_NAME = 'difficulty_level');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE poem ADD COLUMN difficulty_level INT DEFAULT 1 COMMENT ''难度等级: 1-5''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- event.deleted
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event' AND COLUMN_NAME = 'deleted');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE event ADD COLUMN deleted TINYINT(1) DEFAULT 0 COMMENT ''软删除标志''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- user.deleted
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'deleted');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE user ADD COLUMN deleted TINYINT(1) DEFAULT 0 COMMENT ''软删除标志''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- cultural_item.related_poets
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cultural_item' AND COLUMN_NAME = 'related_poets');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE cultural_item ADD COLUMN related_poets JSON COMMENT ''关联诗人ID数组''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- cultural_item.related_spots
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cultural_item' AND COLUMN_NAME = 'related_spots');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE cultural_item ADD COLUMN related_spots JSON COMMENT ''关联景点ID数组''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- cultural_item.related_poems
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cultural_item' AND COLUMN_NAME = 'related_poems');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE cultural_item ADD COLUMN related_poems JSON COMMENT ''关联诗词ID数组''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- cultural_item.view_count
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cultural_item' AND COLUMN_NAME = 'view_count');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE cultural_item ADD COLUMN view_count INT DEFAULT 0 COMMENT ''浏览次数''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- cultural_item.like_count
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cultural_item' AND COLUMN_NAME = 'like_count');
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE cultural_item ADD COLUMN like_count INT DEFAULT 0 COMMENT ''点赞次数''', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- 新表(MySQL 8 原生幂等)
CREATE TABLE IF NOT EXISTS user_collection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    item_type VARCHAR(20) NOT NULL COMMENT '收藏类型: poem/poet/spot/cultural_item',
    item_id BIGINT NOT NULL COMMENT '收藏条目ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_item (user_id, item_type, item_id),
    KEY idx_user_id (user_id),
    KEY idx_item (item_type, item_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';

CREATE TABLE IF NOT EXISTS user_note (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    poem_id BIGINT NOT NULL COMMENT '诗词ID',
    content TEXT NOT NULL COMMENT '笔记内容',
    is_public TINYINT(1) DEFAULT 0 COMMENT '是否公开',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_user_poem (user_id, poem_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (poem_id) REFERENCES poem(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户笔记表';

CREATE TABLE IF NOT EXISTS ai_poem_analysis_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    poem_id BIGINT NOT NULL COMMENT '诗词ID',
    analysis_type VARCHAR(30) NOT NULL COMMENT '分析类型: sentiment/imagery/technique/translation/background/related',
    content TEXT NOT NULL COMMENT '分析内容',
    model_used VARCHAR(64) COMMENT '使用的AI模型',
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    version INT DEFAULT 1 COMMENT '版本号',
    UNIQUE KEY uk_poem_type_version (poem_id, analysis_type, version),
    KEY idx_poem_id (poem_id),
    FOREIGN KEY (poem_id) REFERENCES poem(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI诗词分析详细表';

CREATE TABLE IF NOT EXISTS cultural_item_detail (
    item_id BIGINT PRIMARY KEY COMMENT '文化条目ID',
    origin TEXT COMMENT '起源渊源',
    process TEXT COMMENT '工艺流程/习俗步骤',
    significance TEXT COMMENT '文化意义',
    inheritors TEXT COMMENT '传承人介绍',
    materials TEXT COMMENT '所需材料/食材',
    representative_works TEXT COMMENT '代表作品',
    audio_url VARCHAR(500) COMMENT '音频URL',
    video_url VARCHAR(500) COMMENT '视频URL',
    FOREIGN KEY (item_id) REFERENCES cultural_item(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文化条目详情表';

CREATE TABLE IF NOT EXISTS poet_relation_detail (
    relation_id BIGINT PRIMARY KEY COMMENT '关系ID',
    detailed_description TEXT COMMENT '详细描述',
    historical_context TEXT COMMENT '历史背景',
    related_poems JSON COMMENT '相关诗词ID数组',
    related_events JSON COMMENT '相关事件ID数组',
    FOREIGN KEY (relation_id) REFERENCES poet_relation(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='诗人关系详情表';
-- 索引(条件幂等)
SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poem' AND INDEX_NAME = 'idx_poem_poet_id');
SET @ddl := IF(@idx_exists = 0, 'CREATE INDEX idx_poem_poet_id ON poem(poet_id)', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poem' AND INDEX_NAME = 'idx_poem_dynasty_id');
SET @ddl := IF(@idx_exists = 0, 'CREATE INDEX idx_poem_dynasty_id ON poem(dynasty_id)', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poem' AND INDEX_NAME = 'idx_poem_spot_id');
SET @ddl := IF(@idx_exists = 0, 'CREATE INDEX idx_poem_spot_id ON poem(spot_id)', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cultural_item' AND INDEX_NAME = 'idx_cultural_item_category');
SET @ddl := IF(@idx_exists = 0, 'CREATE INDEX idx_cultural_item_category ON cultural_item(category)', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cultural_item' AND INDEX_NAME = 'idx_cultural_item_region');
SET @ddl := IF(@idx_exists = 0, 'CREATE INDEX idx_cultural_item_region ON cultural_item(region)', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cultural_item' AND INDEX_NAME = 'idx_cultural_item_status');
SET @ddl := IF(@idx_exists = 0, 'CREATE INDEX idx_cultural_item_status ON cultural_item(status)', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poet_relation' AND INDEX_NAME = 'idx_poet_relation_type');
SET @ddl := IF(@idx_exists = 0, 'CREATE INDEX idx_poet_relation_type ON poet_relation(relation_type)', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- 默认值(重设默认值天然幂等)
ALTER TABLE cultural_item ALTER COLUMN status SET DEFAULT 'published';
ALTER TABLE cultural_item ALTER COLUMN source SET DEFAULT 'manual';
