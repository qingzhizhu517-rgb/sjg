-- V14: 民间文学扩展表(源自 worktree V9, 重编号+索引改为 MySQL 8 条件幂等)
CREATE TABLE IF NOT EXISTS literature_detail (
    item_id BIGINT PRIMARY KEY COMMENT '文化条目ID',
    genre VARCHAR(50) COMMENT '体裁: 传说/故事/歌谣/谚语等',
    origin_region VARCHAR(100) COMMENT '流传地区',
    main_characters TEXT COMMENT '主要人物',
    plot_summary TEXT COMMENT '故事梗概',
    cultural_significance TEXT COMMENT '文化价值',
    related_scenic_spots JSON COMMENT '关联景点ID数组',
    collection_source VARCHAR(200) COMMENT '采集来源',
    FOREIGN KEY (item_id) REFERENCES cultural_item(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='民间文学扩展表';
SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'literature_detail' AND INDEX_NAME = 'idx_literature_genre');
SET @ddl := IF(@idx_exists = 0, 'CREATE INDEX idx_literature_genre ON literature_detail(genre)', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'literature_detail' AND INDEX_NAME = 'idx_literature_region');
SET @ddl := IF(@idx_exists = 0, 'CREATE INDEX idx_literature_region ON literature_detail(origin_region)', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;