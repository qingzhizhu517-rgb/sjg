-- V27: 内容来源、关联证据与人工审核记录
-- 只新增治理表，不伪造历史来源；历史实体统一进入 needs_review。
-- 手动应用: python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V27__content_provenance.sql

CREATE TABLE IF NOT EXISTS source_document (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_type VARCHAR(30) NOT NULL COMMENT 'book/article/official_site/archive/other',
    title VARCHAR(300) NOT NULL COMMENT '来源名称',
    author_org VARCHAR(300) COMMENT '作者或机构',
    publication_year INT COMMENT '出版或发布年份',
    identifier VARCHAR(120) COMMENT 'ISBN、DOI或档案编号',
    url VARCHAR(1000) COMMENT '公开链接',
    copyright_note VARCHAR(500) COMMENT '版权与使用说明',
    citation TEXT COMMENT '规范引用文本',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_source_type (source_type),
    INDEX idx_source_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='内容来源文献与网页';

CREATE TABLE IF NOT EXISTS content_source_link (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(40) NOT NULL COMMENT 'poem/poet/scenic_spot/event/cultural_item/poem_analysis',
    entity_id BIGINT NOT NULL COMMENT '业务实体ID',
    source_document_id BIGINT NOT NULL COMMENT '来源文献ID',
    locator VARCHAR(200) COMMENT '页码、章节或网页段落定位',
    quote TEXT COMMENT '与实体直接相关的原文摘录',
    note VARCHAR(500) COMMENT '关联说明',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_entity_source_locator (entity_type, entity_id, source_document_id, locator),
    INDEX idx_entity (entity_type, entity_id),
    CONSTRAINT fk_content_source_document FOREIGN KEY (source_document_id)
        REFERENCES source_document(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实体与来源文献关联';

CREATE TABLE IF NOT EXISTS content_review (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(40) NOT NULL COMMENT '被审核实体类型',
    entity_id BIGINT NOT NULL COMMENT '被审核实体ID',
    status VARCHAR(30) NOT NULL DEFAULT 'needs_review' COMMENT 'draft/needs_review/approved/published/archived',
    reviewer_id BIGINT COMMENT '审核用户ID',
    reviewed_at DATETIME COMMENT '审核时间',
    review_note VARCHAR(1000) COMMENT '审核备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_review_entity (entity_type, entity_id),
    INDEX idx_review_status (status),
    INDEX idx_review_reviewer (reviewer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='内容审核状态';

INSERT INTO content_review (entity_type, entity_id, status, review_note)
SELECT 'poem', id, 'needs_review', 'V27 建立审核记录，历史来源待补充' FROM poem
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_review (entity_type, entity_id, status, review_note)
SELECT 'dynasty', id, 'needs_review', 'V27 建立审核记录，历史来源待补充' FROM dynasty
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_review (entity_type, entity_id, status, review_note)
SELECT 'poet', id, 'needs_review', 'V27 建立审核记录，历史来源待补充' FROM poet
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_review (entity_type, entity_id, status, review_note)
SELECT 'scenic_spot', id, 'needs_review', 'V27 建立审核记录，历史来源待补充' FROM scenic_spot
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_review (entity_type, entity_id, status, review_note)
SELECT 'event', id, 'needs_review', 'V27 建立审核记录，历史来源待补充' FROM event
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- cultural_item 和 poem_analysis 可能尚未出现在较早的业务快照中。
-- 用动态 SQL 保护可选历史域，避免旧快照在建立治理表后半途失败。
SET @has_cultural_item := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cultural_item'
);
SET @cultural_review_sql := IF(
    @has_cultural_item > 0,
    'INSERT INTO content_review (entity_type, entity_id, status, review_note) SELECT ''cultural_item'', id, ''needs_review'', ''V27 建立审核记录，历史来源待补充'' FROM cultural_item ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP',
    'SELECT 1'
);
PREPARE stmt_cultural_review FROM @cultural_review_sql;
EXECUTE stmt_cultural_review;
DEALLOCATE PREPARE stmt_cultural_review;

SET @has_poem_analysis := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'poem_analysis'
);
SET @poem_analysis_review_sql := IF(
    @has_poem_analysis > 0,
    'INSERT INTO content_review (entity_type, entity_id, status, review_note) SELECT ''poem_analysis'', id, ''needs_review'', ''AI 赏析默认待人工审核'' FROM poem_analysis ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP',
    'SELECT 1'
);
PREPARE stmt_poem_analysis_review FROM @poem_analysis_review_sql;
EXECUTE stmt_poem_analysis_review;
DEALLOCATE PREPARE stmt_poem_analysis_review;

SELECT entity_type, status, COUNT(*) AS total
FROM content_review
GROUP BY entity_type, status
ORDER BY entity_type, status;

SELECT COUNT(*) AS entities_without_source
FROM content_review r
LEFT JOIN content_source_link l
  ON l.entity_type = r.entity_type AND l.entity_id = r.entity_id
WHERE l.id IS NULL;
