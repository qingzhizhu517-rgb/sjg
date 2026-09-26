-- V30: 诗人关系来源与审核治理初始化
-- 关系是独立的多态实体；这里只建立待审核记录，不伪造来源关联。
-- 手动应用: python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V30__poet_relation_provenance.sql

INSERT INTO content_review (entity_type, entity_id, status, review_note)
SELECT 'poet_relation', id, 'needs_review', 'V30 建立关系审核记录，来源待补充'
FROM poet_relation
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
