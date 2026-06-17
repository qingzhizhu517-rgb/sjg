-- Feature 1: Multi-image support - change VARCHAR to TEXT for JSON arrays
ALTER TABLE scenic_spot MODIFY image_url TEXT COMMENT '景点图片URL列表(JSON数组)';
ALTER TABLE scenic_spot MODIFY image_anime_url TEXT COMMENT '动漫风格图片URL列表(JSON数组)';
ALTER TABLE poet MODIFY avatar_url TEXT COMMENT '头像图片URL列表(JSON数组)';
ALTER TABLE poet MODIFY avatar_anime_url TEXT COMMENT '动漫风格头像URL列表(JSON数组)';
ALTER TABLE event MODIFY image_url TEXT COMMENT '相关图片URL列表(JSON数组)';

-- Data migration: wrap existing single URLs into JSON arrays
UPDATE scenic_spot SET image_url = CONCAT('["', image_url, '"]')
  WHERE image_url IS NOT NULL AND image_url NOT LIKE '[%';
UPDATE scenic_spot SET image_anime_url = CONCAT('["', image_anime_url, '"]')
  WHERE image_anime_url IS NOT NULL AND image_anime_url NOT LIKE '[%';
UPDATE poet SET avatar_url = CONCAT('["', avatar_url, '"]')
  WHERE avatar_url IS NOT NULL AND avatar_url NOT LIKE '[%';
UPDATE poet SET avatar_anime_url = CONCAT('["', avatar_anime_url, '"]')
  WHERE avatar_anime_url IS NOT NULL AND avatar_anime_url NOT LIKE '[%';
UPDATE event SET image_url = CONCAT('["', image_url, '"]')
  WHERE image_url IS NOT NULL AND image_url NOT LIKE '[%';

-- Feature 2: Video URL for scenic_spot
ALTER TABLE scenic_spot ADD COLUMN video_url TEXT COMMENT '景点视频URL' AFTER image_anime_url;
