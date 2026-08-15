-- V17: 清理 V12 引入的冗余索引与危险的默认值(幂等)
--
-- 背景(code review 发现):
-- 1) V6 已有 idx_category_status(category,status) 复合索引, 其最左前缀已覆盖单列 category 查询;
--    V12 的 idx_cultural_item_category(category) 完全冗余。
-- 2) V6 已有 idx_region(region), V12 的 idx_cultural_item_region(region) 与之重复。
--    idx_cultural_item_status(status) 保留: status 单独查询不被复合索引左前缀覆盖。
-- 3) V12 把 status 默认值 draft→published: 任何未显式指定状态的直插都会误公开发布。
--    应用层 CulturalItemService.create 已显式默认 draft, 此处把 DB 默认值改回 draft 双重保险。
--    (种子数据均显式 'published', 不受默认值影响)

-- 删除冗余索引 idx_cultural_item_category
SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cultural_item'
                      AND INDEX_NAME = 'idx_cultural_item_category');
SET @ddl := IF(@idx_exists > 0, 'DROP INDEX idx_cultural_item_category ON cultural_item', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- 删除重复索引 idx_cultural_item_region
SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cultural_item'
                      AND INDEX_NAME = 'idx_cultural_item_region');
SET @ddl := IF(@idx_exists > 0, 'DROP INDEX idx_cultural_item_region ON cultural_item', 'SELECT 1');
PREPARE _sjg_stmt FROM @ddl;
EXECUTE _sjg_stmt;
DEALLOCATE PREPARE _sjg_stmt;

-- 默认值回退: status → 'draft'(重设默认值天然幂等)
ALTER TABLE cultural_item ALTER COLUMN status SET DEFAULT 'draft';