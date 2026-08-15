-- V13: 非遗工艺扩展表(源自 worktree V8, 重编号+索引改为 MySQL 8 条件幂等)
CREATE TABLE IF NOT EXISTS craft_detail (
    item_id BIGINT PRIMARY KEY COMMENT '文化条目ID',
    craft_category VARCHAR(50) COMMENT '工艺类别: 雕刻/编织/刺绣/陶瓷等',
    materials TEXT COMMENT '所需材料',
    tools TEXT COMMENT '所需工具',
    process TEXT COMMENT '工艺流程',
    inheritors TEXT COMMENT '传承人介绍',
    representative_works TEXT COMMENT '代表作品',
    difficulty_level INT DEFAULT 1 COMMENT '难度等级: 1-5',
    learning_resources TEXT COMMENT '学习资源',
    FOREIGN KEY (item_id) REFERENCES cultural_item(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='非遗工艺扩展表';
SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'craft_detail' AND INDEX_NAME = 'idx_craft_category');
SET @ddl := IF(@idx_exists = 0, 'CREATE INDEX idx_craft_category ON craft_detail(craft_category)', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;