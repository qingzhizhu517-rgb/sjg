-- V25: 20 张高质量水墨风格素材回填
--
-- 来源: 历史 prompt 驱动生成的 20 张 PNG；WebP 已落盘到 display-v2/public/images/ 对应子目录。
-- 路径格式: 本地相对路径 /images/poets|spots|cultural/xxx_anime.png，
--         与 useImage.js 的 glob 白名单一致；生产环境通过 VITE_OSS_BUCKET_URL 切 OSS 时路径同构。
--
-- 幂等策略: 每条 UPDATE 都带 name 二次校验 + 只填空值（IS NULL OR = ''）。
--         重复执行影响 0 行。已有的值（V24 之前逐张补的）不会被覆盖。
--
-- 三类:
--   A. 诗人头像 avatar_anime_url (10 位: 苏轼/辛弃疾/李清照/蒲松龄/曹操/顾炎武
--                                王士禛/李攀龙/韩愈/文天祥)
--   B. 景点配图 image_anime_url (5 处: 趵突泉/大明湖/泰山/曲阜孔庙/千佛山)
--   C. 文化条目配图 image_anime_url (5 条: 牡丹节/祭孔大典/曹州面塑/鲁锦织造/甏肉干饭)

-- ============================================================
-- A. 诗人头像 avatar_anime_url（10 位）
-- ============================================================

-- 苏轼（已有值的跳过，下同）
UPDATE poet
SET avatar_anime_url = '/images/poets/su_shi_anime.png'
WHERE id = 17
  AND name = '苏轼'
  AND (avatar_anime_url IS NULL OR avatar_anime_url = '');

-- 辛弃疾
UPDATE poet
SET avatar_anime_url = '/images/poets/xin_qiji_anime.png'
WHERE name = '辛弃疾'
  AND (avatar_anime_url IS NULL OR avatar_anime_url = '');

-- 李清照
UPDATE poet
SET avatar_anime_url = '/images/poets/li_qingzhao_anime.png'
WHERE name = '李清照'
  AND (avatar_anime_url IS NULL OR avatar_anime_url = '');

-- 蒲松龄
UPDATE poet
SET avatar_anime_url = '/images/poets/pu_songling_anime.png'
WHERE id = 31
  AND name = '蒲松龄'
  AND (avatar_anime_url IS NULL OR avatar_anime_url = '');

-- 曹操
UPDATE poet
SET avatar_anime_url = '/images/poets/cao_cao_anime.png'
WHERE id = 51
  AND name = '曹操'
  AND (avatar_anime_url IS NULL OR avatar_anime_url = '');

-- 顾炎武
UPDATE poet
SET avatar_anime_url = '/images/poets/gu_yanwu_anime.png'
WHERE id = 71
  AND name = '顾炎武'
  AND (avatar_anime_url IS NULL OR avatar_anime_url = '');

-- 王士禛
UPDATE poet
SET avatar_anime_url = '/images/poets/wang_shizhen_anime.png'
WHERE id = 122
  AND name = '王士禛'
  AND (avatar_anime_url IS NULL OR avatar_anime_url = '');

-- 李攀龙
UPDATE poet
SET avatar_anime_url = '/images/poets/li_panlong_anime.png'
WHERE id = 27
  AND name = '李攀龙'
  AND (avatar_anime_url IS NULL OR avatar_anime_url = '');

-- 韩愈
UPDATE poet
SET avatar_anime_url = '/images/poets/han_yu_anime.png'
WHERE id = 93
  AND name = '韩愈'
  AND (avatar_anime_url IS NULL OR avatar_anime_url = '');

-- 文天祥
UPDATE poet
SET avatar_anime_url = '/images/poets/wen_tianxiang_anime.png'
WHERE id = 94
  AND name = '文天祥'
  AND (avatar_anime_url IS NULL OR avatar_anime_url = '');

-- ============================================================
-- B. 景点配图 image_anime_url（5 处）
-- ============================================================

-- 趵突泉 (id=2)
UPDATE scenic_spot
SET image_anime_url = '/images/spots/baotu_spring_anime.png'
WHERE id = 2
  AND name = '趵突泉'
  AND (image_anime_url IS NULL OR image_anime_url = '');

-- 大明湖 (id=1)
UPDATE scenic_spot
SET image_anime_url = '/images/spots/daming_lake_anime.png'
WHERE id = 1
  AND name = '大明湖'
  AND (image_anime_url IS NULL OR image_anime_url = '');

-- 泰山 (id=14)
UPDATE scenic_spot
SET image_anime_url = '/images/spots/mount_tai_anime.png'
WHERE id = 14
  AND name = '泰山'
  AND (image_anime_url IS NULL OR image_anime_url = '');

-- 曲阜孔庙 (id=21)
UPDATE scenic_spot
SET image_anime_url = '/images/spots/confucius_temple_anime.png'
WHERE id = 21
  AND name = '曲阜孔庙'
  AND (image_anime_url IS NULL OR image_anime_url = '');

-- 千佛山 (id=3，当前值是 JSON 数组形式的 real 图，anime 字段非空但不是水墨图 → 覆盖为新生成的水墨图)
UPDATE scenic_spot
SET image_anime_url = '/images/spots/thousand_buddha_mountain_anime.png'
WHERE id = 3
  AND name = '千佛山';

-- ============================================================
-- C. 文化条目配图 image_anime_url（5 条）
-- ============================================================

-- 菏泽国际牡丹文化旅游节（曹州牡丹花会）(id=52)
UPDATE cultural_item
SET image_anime_url = '/images/cultural/peony_festival.png'
WHERE id = 52
  AND title = '菏泽国际牡丹文化旅游节（曹州牡丹花会）'
  AND (image_anime_url IS NULL OR image_anime_url = '');

-- 曲阜祭孔大典 (id=53)
UPDATE cultural_item
SET image_anime_url = '/images/cultural/confucius_ceremony.png'
WHERE id = 53
  AND title = '曲阜祭孔大典'
  AND (image_anime_url IS NULL OR image_anime_url = '');

-- 曹州面塑（面人·曹州面人）(id=77)
UPDATE cultural_item
SET image_anime_url = '/images/cultural/caozhou_dough_art.png'
WHERE id = 77
  AND title = '曹州面塑（面人·曹州面人）'
  AND (image_anime_url IS NULL OR image_anime_url = '');

-- 鲁锦织造技艺 (id=78)
UPDATE cultural_item
SET image_anime_url = '/images/cultural/lu_brocade_weaving.png'
WHERE id = 78
  AND title = '鲁锦织造技艺'
  AND (image_anime_url IS NULL OR image_anime_url = '');

-- 甏肉干饭 (id=90)
UPDATE cultural_item
SET image_anime_url = '/images/cultural/bengrou_rice.png'
WHERE id = 90
  AND title = '甏肉干饭'
  AND (image_anime_url IS NULL OR image_anime_url = '');
