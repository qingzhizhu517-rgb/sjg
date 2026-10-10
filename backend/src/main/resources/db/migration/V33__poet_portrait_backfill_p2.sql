-- V33 placeholder asset backfill (P2: 31 poets, 隋唐宋元魏晋)
-- 生成日期: 2026-10-09
-- 计划文档: docs/plans/2026-10-09-placeholder-asset-generation-plan.md
-- 说明: 一律写入相对路径 /images/... 或 /media/...，
--       与 V23/V25/V26 的存储约定一致（本地 public/ 与 OSS 对象键同构）。
--       诗人/文化只改水墨字段；景点改 image_url + image_anime_url 两栏，
--       以彻底清除原本指向 404 OSS 对象的失效引用。
--       本文件由 scripts/placeholder-assets/gen_migration.py 自动生成。

-- poet 回填 31 条（avatar_anime_url）
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/lu_ji_anime.webp' WHERE `id` = 21;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/xie_dao_yun_anime.webp' WHERE `id` = 22;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/liu_zhang_qing_anime.webp' WHERE `id` = 34;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/luo_yin_anime.webp' WHERE `id` = 73;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/liu_yan_anime.webp' WHERE `id` = 81;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/hu_ceng_anime.webp' WHERE `id` = 82;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/pei_di_anime.webp' WHERE `id` = 84;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/han_hong_anime.webp' WHERE `id` = 92;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/li_dong_anime.webp' WHERE `id` = 101;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/xiao_chu_cai_anime.webp' WHERE `id` = 106;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/yuan_zhen_anime.webp' WHERE `id` = 114;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/liu_yu_xi_anime.webp' WHERE `id` = 134;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/shi_jie_anime.webp' WHERE `id` = 23;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/chao_bu_zhi_anime.webp' WHERE `id` = 52;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/xu_jing_heng_anime.webp' WHERE `id` = 53;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/yang_yi_anime.webp' WHERE `id` = 83;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/zhang_yong_anime.webp' WHERE `id` = 102;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/chen_shi_dao_anime.webp' WHERE `id` = 108;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/liu_ke_zhuang_anime.webp' WHERE `id` = 118;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/li_zhi_yi_anime.webp' WHERE `id` = 132;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/li_jiong_anime.webp' WHERE `id` = 16;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/yuan_jue_anime.webp' WHERE `id` = 35;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/wu_shi_dao_anime.webp' WHERE `id` = 36;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/sa_dou_la_anime.webp' WHERE `id` = 37;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/li_hao_wen_anime.webp' WHERE `id` = 85;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/song_jiong_anime.webp' WHERE `id` = 95;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/nai_xian_anime.webp' WHERE `id` = 96;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/wang_yun_anime.webp' WHERE `id` = 109;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/wang_mian_anime.webp' WHERE `id` = 115;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/yang_wei_zhen_anime.webp' WHERE `id` = 116;
UPDATE `poet` SET `avatar_anime_url` = '/images/poets/yu_qin_anime.webp' WHERE `id` = 123;
