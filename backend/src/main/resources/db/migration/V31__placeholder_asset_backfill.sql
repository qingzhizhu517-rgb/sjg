-- V31 placeholder asset backfill
-- 生成日期: 2026-10-09
-- 计划文档: docs/plans/2026-10-09-placeholder-asset-generation-plan.md
-- 说明: 仅回填水墨字段 (*_anime_url)，写入相对路径 /images/...，
--       与 V23/V25/V26 的存储约定一致（本地 public/ 与 OSS 对象键同构）。
--       本文件由 scripts/placeholder-assets/gen_migration.py 自动生成。

-- poet.avatar_anime_url 回填 1 条
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/wang_zhi_huan_anime.webp' WHERE `id` = 133;

-- cultural_item.image_anime_url 回填 1 条
UPDATE `cultural_item` SET `image_anime_url` = '/images/cultural/wei_fang_feng_zheng_zhi_zuo_ji_yi.webp' WHERE `id` = 33;
