-- V23: 6 景点双风格素材回填(inkwash 由用户 AI 生成, real 来自 Wikimedia Commons, 2026-08)
-- 存储约定: 本地路径 /images/spots/<slug>[_anime].jpg, 由 useImage 的 public/images 白名单解析;
-- 未来 OSS 迁移时把路径前缀替换为 bucket URL 即可(同构约定)。
-- 幂等: 纯 UPDATE。

UPDATE scenic_spot SET image_anime_url = '/images/spots/baotu_spring_anime.jpg', image_url = '/images/spots/baotu_spring.jpg' WHERE id = 2;   -- 趵突泉
UPDATE scenic_spot SET image_anime_url = '/images/spots/taishan_river_anime.jpg' WHERE id = 66;    -- 泰山·岱顶观河
UPDATE scenic_spot SET image_anime_url = '/images/spots/confucius_temple_anime.jpg' WHERE id = 21; -- 曲阜孔庙
UPDATE scenic_spot SET image_anime_url = '/images/spots/yellow_river_estuary_anime.jpg' WHERE id = 65; -- 黄河大堤(东营·河口)
UPDATE scenic_spot SET image_anime_url = '/images/spots/mata_lake_anime.jpg' WHERE id = 63;        -- 马踏湖
UPDATE scenic_spot SET image_anime_url = '/images/spots/caozhou_peony_anime.jpg' WHERE id = 54;    -- 曹州牡丹