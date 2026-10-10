-- V32 placeholder asset backfill (spots: 14 generated + 2 reused nine-sights)
-- 生成日期: 2026-10-09
-- 计划文档: docs/plans/2026-10-09-placeholder-asset-generation-plan.md
-- 说明: 一律写入相对路径 /images/... 或 /media/...，
--       与 V23/V25/V26 的存储约定一致（本地 public/ 与 OSS 对象键同构）。
--       诗人/文化只改水墨字段；景点改 image_url + image_anime_url 两栏，
--       以彻底清除原本指向 404 OSS 对象的失效引用。
--       本文件由 scripts/placeholder-assets/gen_migration.py 自动生成。

-- scenic_spot 回填 16 条（image_url, image_anime_url）
UPDATE `scenic_spot` SET `image_url` = '/images/spots/dong_ming_xian_anime.webp', `image_anime_url` = '/images/spots/dong_ming_xian_anime.webp' WHERE `id` = 35;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/dong_ming_anime.webp', `image_anime_url` = '/images/spots/dong_ming_anime.webp' WHERE `id` = 37;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/dong_ming_wu_ba_gang_anime.webp', `image_anime_url` = '/images/spots/dong_ming_wu_ba_gang_anime.webp' WHERE `id` = 38;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/yun_cheng_anime.webp', `image_anime_url` = '/images/spots/yun_cheng_anime.webp' WHERE `id` = 39;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/pu_zhou_anime.webp', `image_anime_url` = '/images/spots/pu_zhou_anime.webp' WHERE `id` = 44;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/pu_shui_anime.webp', `image_anime_url` = '/images/spots/pu_shui_anime.webp' WHERE `id` = 46;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/cao_zhi_du_shu_tai_anime.webp', `image_anime_url` = '/images/spots/cao_zhi_du_shu_tai_anime.webp' WHERE `id` = 47;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/gu_hui_tai_anime.webp', `image_anime_url` = '/images/spots/gu_hui_tai_anime.webp' WHERE `id` = 48;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/ning_xiang_yuan_anime.webp', `image_anime_url` = '/images/spots/ning_xiang_yuan_anime.webp' WHERE `id` = 53;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/dong_e_anime.webp', `image_anime_url` = '/images/spots/dong_e_anime.webp' WHERE `id` = 55;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/e_jiao_anime.webp', `image_anime_url` = '/images/spots/e_jiao_anime.webp' WHERE `id` = 56;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/gao_tang_anime.webp', `image_anime_url` = '/images/spots/gao_tang_anime.webp' WHERE `id` = 57;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/huang_he_gu_du_anime.webp', `image_anime_url` = '/images/spots/huang_he_gu_du_anime.webp' WHERE `id` = 62;
UPDATE `scenic_spot` SET `image_url` = '/images/spots/qing_dao___lao_shan_anime.webp', `image_anime_url` = '/images/spots/qing_dao___lao_shan_anime.webp' WHERE `id` = 70;
UPDATE `scenic_spot` SET `image_url` = '/media/inkwash/sights/dongying-dongjin.webp', `image_anime_url` = '/media/inkwash/sights/dongying-dongjin.webp' WHERE `id` = 64;
UPDATE `scenic_spot` SET `image_url` = '/media/inkwash/sights/binzhou-jieshi.webp', `image_anime_url` = '/media/inkwash/sights/binzhou-jieshi.webp' WHERE `id` = 71;
