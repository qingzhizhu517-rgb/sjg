-- V3: 修复 OSS 资产坏文件名(双后缀 / 错误后缀)
-- .jpg.jpg -> .jpg ; .jpg.jpeg -> .jpeg ; .jpg.mp4 -> .mp4
-- REPLACE 幂等, 二次执行无匹配行, 安全。

UPDATE scenic_spot SET image_url = REPLACE(image_url, '.jpg.jpg', '.jpg') WHERE image_url LIKE '%.jpg.jpg%';
UPDATE scenic_spot SET image_url = REPLACE(image_url, '.jpg.jpeg', '.jpeg') WHERE image_url LIKE '%.jpg.jpeg%';
UPDATE scenic_spot SET image_anime_url = REPLACE(image_anime_url, '.jpg.jpg', '.jpg') WHERE image_anime_url LIKE '%.jpg.jpg%';
UPDATE scenic_spot SET image_anime_url = REPLACE(image_anime_url, '.jpg.jpeg', '.jpeg') WHERE image_anime_url LIKE '%.jpg.jpeg%';
UPDATE poet SET avatar_url = REPLACE(avatar_url, '.jpg.jpg', '.jpg') WHERE avatar_url LIKE '%.jpg.jpg%';
UPDATE poet SET avatar_url = REPLACE(avatar_url, '.jpg.jpeg', '.jpeg') WHERE avatar_url LIKE '%.jpg.jpeg%';
UPDATE poem SET video_url = REPLACE(video_url, '.jpg.mp4', '.mp4') WHERE video_url LIKE '%.jpg.mp4%';
