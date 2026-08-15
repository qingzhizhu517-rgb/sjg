-- V15: 饮食戏曲扩展表(源自 worktree V10, 重编号+索引改为 MySQL 8 条件幂等)
CREATE TABLE IF NOT EXISTS food_opera_detail (
    item_id BIGINT PRIMARY KEY COMMENT '文化条目ID',
    sub_category VARCHAR(50) COMMENT '子类别: food美食/opera戏曲',
    cuisine_type VARCHAR(50) COMMENT '菜系/剧种',
    ingredients TEXT COMMENT '食材/演员要求',
    preparation_method TEXT COMMENT '制作方法/表演技巧',
    representative_dishes TEXT COMMENT '代表菜品/剧目',
    historical_origin TEXT COMMENT '历史渊源',
    current_status TEXT COMMENT '现状',
    preservation_level VARCHAR(20) COMMENT '保护级别: national省级市级等',
    FOREIGN KEY (item_id) REFERENCES cultural_item(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='饮食戏曲扩展表';
SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'food_opera_detail' AND INDEX_NAME = 'idx_food_opera_sub_category');
SET @ddl := IF(@idx_exists = 0, 'CREATE INDEX idx_food_opera_sub_category ON food_opera_detail(sub_category)', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'food_opera_detail' AND INDEX_NAME = 'idx_food_opera_cuisine_type');
SET @ddl := IF(@idx_exists = 0, 'CREATE INDEX idx_food_opera_cuisine_type ON food_opera_detail(cuisine_type)', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;