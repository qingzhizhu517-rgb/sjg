-- V26: 将审核过的水墨素材统一到前端已打包的 WebP 路径
--
-- 只规范 anime 字段，不改 real 字段。除两条跨环境兼容的诗人名称匹配外，
-- 其余语句均带主键与名称双重校验；并仅在目标值不一致时更新，重复执行不会产生额外写入。
-- 本迁移不会自动上传或执行素材文件操作；对应 WebP 已随 display-v2 发布。

-- ============================================================
-- 一、诗人头像（10 条）
-- ============================================================

UPDATE poet
SET avatar_anime_url = '/images/poets/su_shi_anime.webp'
WHERE id = 17 AND name = '苏轼'
  AND COALESCE(avatar_anime_url, '') <> '/images/poets/su_shi_anime.webp';

UPDATE poet
SET avatar_anime_url = '/images/poets/xin_qiji_anime.webp'
WHERE name = '辛弃疾'
  AND COALESCE(avatar_anime_url, '') <> '/images/poets/xin_qiji_anime.webp';

UPDATE poet
SET avatar_anime_url = '/images/poets/li_qingzhao_anime.webp'
WHERE name = '李清照'
  AND COALESCE(avatar_anime_url, '') <> '/images/poets/li_qingzhao_anime.webp';

UPDATE poet
SET avatar_anime_url = '/images/poets/pu_songling_anime.webp'
WHERE id = 31 AND name = '蒲松龄'
  AND COALESCE(avatar_anime_url, '') <> '/images/poets/pu_songling_anime.webp';

UPDATE poet
SET avatar_anime_url = '/images/poets/cao_cao_anime.webp'
WHERE id = 51 AND name = '曹操'
  AND COALESCE(avatar_anime_url, '') <> '/images/poets/cao_cao_anime.webp';

UPDATE poet
SET avatar_anime_url = '/images/poets/gu_yanwu_anime.webp'
WHERE id = 71 AND name = '顾炎武'
  AND COALESCE(avatar_anime_url, '') <> '/images/poets/gu_yanwu_anime.webp';

UPDATE poet
SET avatar_anime_url = '/images/poets/wang_shizhen_anime.webp'
WHERE id = 122 AND name = '王士禛'
  AND COALESCE(avatar_anime_url, '') <> '/images/poets/wang_shizhen_anime.webp';

UPDATE poet
SET avatar_anime_url = '/images/poets/li_panlong_anime.webp'
WHERE id = 27 AND name = '李攀龙'
  AND COALESCE(avatar_anime_url, '') <> '/images/poets/li_panlong_anime.webp';

UPDATE poet
SET avatar_anime_url = '/images/poets/han_yu_anime.webp'
WHERE id = 93 AND name = '韩愈'
  AND COALESCE(avatar_anime_url, '') <> '/images/poets/han_yu_anime.webp';

UPDATE poet
SET avatar_anime_url = '/images/poets/wen_tianxiang_anime.webp'
WHERE id = 94 AND name = '文天祥'
  AND COALESCE(avatar_anime_url, '') <> '/images/poets/wen_tianxiang_anime.webp';

-- ============================================================
-- 二、景点配图（5 条）
-- ============================================================

UPDATE scenic_spot
SET image_anime_url = '/images/spots/baotu_spring_anime.webp'
WHERE id = 2 AND name = '趵突泉'
  AND COALESCE(image_anime_url, '') <> '/images/spots/baotu_spring_anime.webp';

UPDATE scenic_spot
SET image_anime_url = '/images/spots/daming_lake_anime.webp'
WHERE id = 1 AND name = '大明湖'
  AND COALESCE(image_anime_url, '') <> '/images/spots/daming_lake_anime.webp';

UPDATE scenic_spot
SET image_anime_url = '/images/spots/mount_tai_anime.webp'
WHERE id = 14 AND name = '泰山'
  AND COALESCE(image_anime_url, '') <> '/images/spots/mount_tai_anime.webp';

UPDATE scenic_spot
SET image_anime_url = '/images/spots/confucius_temple_anime.webp'
WHERE id = 21 AND name = '曲阜孔庙'
  AND COALESCE(image_anime_url, '') <> '/images/spots/confucius_temple_anime.webp';

UPDATE scenic_spot
SET image_anime_url = '/images/spots/thousand_buddha_mountain_anime.webp'
WHERE id = 3 AND name = '千佛山'
  AND COALESCE(image_anime_url, '') <> '/images/spots/thousand_buddha_mountain_anime.webp';

-- ============================================================
-- 三、文化项目配图（5 条）
-- ============================================================

UPDATE cultural_item
SET image_anime_url = '/images/cultural/peony_festival.webp'
WHERE id = 52 AND title = '菏泽国际牡丹文化旅游节（曹州牡丹花会）'
  AND COALESCE(image_anime_url, '') <> '/images/cultural/peony_festival.webp';

UPDATE cultural_item
SET image_anime_url = '/images/cultural/confucius_ceremony.webp'
WHERE id = 53 AND title = '曲阜祭孔大典'
  AND COALESCE(image_anime_url, '') <> '/images/cultural/confucius_ceremony.webp';

UPDATE cultural_item
SET image_anime_url = '/images/cultural/caozhou_dough_art.webp'
WHERE id = 77 AND title = '曹州面塑（面人·曹州面人）'
  AND COALESCE(image_anime_url, '') <> '/images/cultural/caozhou_dough_art.webp';

UPDATE cultural_item
SET image_anime_url = '/images/cultural/lu_brocade_weaving.webp'
WHERE id = 78 AND title = '鲁锦织造技艺'
  AND COALESCE(image_anime_url, '') <> '/images/cultural/lu_brocade_weaving.webp';

UPDATE cultural_item
SET image_anime_url = '/images/cultural/bengrou_rice.webp'
WHERE id = 90 AND title = '甏肉干饭'
  AND COALESCE(image_anime_url, '') <> '/images/cultural/bengrou_rice.webp';
