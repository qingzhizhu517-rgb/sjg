-- V34 placeholder asset backfill (P3-a: 30 Ming poets)
-- 生成日期: 2026-10-09
-- 计划文档: docs/plans/2026-10-09-placeholder-asset-generation-plan.md
-- 说明: 一律写入相对路径 /images/... 或 /media/...，
--       与 V23/V25/V26 的存储约定一致（本地 public/ 与 OSS 对象键同构）。
--       诗人/文化只改水墨字段；景点改 image_url + image_anime_url 两栏，
--       以彻底清除原本指向 404 OSS 对象的失效引用。
--       本文件由 scripts/placeholder-assets/gen_migration.py 自动生成。

-- poet 回填 30 条（avatar_anime_url）
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/yan_bi_anime.webp' WHERE `id` = 4;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/song_lian_anime.webp' WHERE `id` = 24;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/fang_xiao_ru_anime.webp' WHERE `id` = 25;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/xu_wen_tong_anime.webp' WHERE `id` = 26;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/xu_zhong_hang_anime.webp' WHERE `id` = 28;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/li_hua_long_anime.webp' WHERE `id` = 29;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/li_zhong_hang_anime.webp' WHERE `id` = 30;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/hu_guang_anime.webp' WHERE `id` = 39;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/xu_zhen_qing_anime.webp' WHERE `id` = 40;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/gao_chu_anime.webp' WHERE `id` = 42;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/tao_an_anime.webp' WHERE `id` = 54;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/yang_wei_anime.webp' WHERE `id` = 55;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/xie_zhen_anime.webp' WHERE `id` = 56;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/yang_yu_run_anime.webp' WHERE `id` = 57;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/wang_xiang_chun_anime.webp' WHERE `id` = 58;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/chen_feng_wu_anime.webp' WHERE `id` = 66;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/xue_xuan_anime.webp' WHERE `id` = 67;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/dai_jing_anime.webp' WHERE `id` = 69;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/li_ru_gui_anime.webp' WHERE `id` = 76;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/gong_mian_anime.webp' WHERE `id` = 77;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/yin_yun_xiao_anime.webp' WHERE `id` = 80;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/he_jing_ming_anime.webp' WHERE `id` = 86;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/chen_qi_you_anime.webp' WHERE `id` = 87;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/shi_xing_anime.webp' WHERE `id` = 88;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/li_xian_fang_anime.webp' WHERE `id` = 89;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/tang_zhi_chun_anime.webp' WHERE `id` = 97;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/hou_qi_anime.webp' WHERE `id` = 98;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/he_ying_rui_anime.webp' WHERE `id` = 110;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/wu_kai_anime.webp' WHERE `id` = 119;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/zhang_zhong_anime.webp' WHERE `id` = 124;
