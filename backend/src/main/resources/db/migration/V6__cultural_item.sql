-- V6: 文化板块扩展 - cultural_item 公共表 + festival_detail 扩展表
-- 设计文档: docs/plans/2026-08-08-cultural-expansion-design.md
-- 手动应用(Flyway 不在 pom): python3 pymysql 脚本, 同 V4 模式
-- 幂等: CREATE IF NOT EXISTS

CREATE TABLE IF NOT EXISTS cultural_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(20) NOT NULL COMMENT 'festival节庆/craft非遗/literature民间文学/food_opera饮食戏曲',
    title VARCHAR(200) NOT NULL COMMENT '名称',
    summary VARCHAR(500) COMMENT '一句话简介（卡片用）',
    content TEXT COMMENT '详细介绍正文',
    region VARCHAR(50) COMMENT '所属区域（沿黄九市，NULL=全域性内容）',
    image_url VARCHAR(500) COMMENT '实景图',
    image_anime_url VARCHAR(500) COMMENT '水墨风图',
    tags JSON COMMENT '标签数组',
    sort_order INT DEFAULT 0 COMMENT '排序权重',
    status VARCHAR(20) DEFAULT 'draft' COMMENT 'draft草稿/published已发布',
    source VARCHAR(20) DEFAULT 'ai' COMMENT 'ai生成/manual人工',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_status (category, status),
    INDEX idx_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文化条目公共表';

-- 民俗节庆扩展表（1:1，详情页才 JOIN）
CREATE TABLE IF NOT EXISTS festival_detail (
    item_id BIGINT PRIMARY KEY,
    festival_date VARCHAR(100) COMMENT '节庆时间（如"农历正月初一""每年4月"）',
    origin TEXT COMMENT '起源渊源',
    customs TEXT COMMENT '习俗活动',
    food TEXT COMMENT '节庆饮食',
    FOREIGN KEY (item_id) REFERENCES cultural_item(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='民俗节庆扩展表';
