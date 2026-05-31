CREATE DATABASE IF NOT EXISTS sjg DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sjg;

-- 鏈濅唬琛?CREATE TABLE dynasty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '鏈濅唬ID',
    name VARCHAR(50) NOT NULL COMMENT '鏈濅唬鍚嶇О',
    start_year INT COMMENT '璧峰骞翠唤',
    end_year INT COMMENT '缁撴潫骞翠唤',
    description TEXT COMMENT '鏈濅唬鎻忚堪'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='鏈濅唬琛?;

-- 璇椾汉琛?CREATE TABLE poet (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '璇椾汉ID',
    name VARCHAR(100) NOT NULL COMMENT '璇椾汉鍚嶇О',
    dynasty_id BIGINT COMMENT '鎵€灞炴湞浠D',
    birth_year INT COMMENT '鍑虹敓骞翠唤',
    death_year INT COMMENT '閫濅笘骞翠唤',
    birthplace VARCHAR(200) COMMENT '鍑虹敓鍦?,
    biography TEXT COMMENT '璇椾汉绠€浠?,
    avatar_url VARCHAR(500) COMMENT '澶村儚鍥剧墖URL',
    avatar_anime_url VARCHAR(500) COMMENT '鍔ㄦ极椋庢牸澶村儚URL',
    style VARCHAR(200) COMMENT '璇楄瘝椋庢牸',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿',
    FOREIGN KEY (dynasty_id) REFERENCES dynasty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='璇椾汉琛?;

-- 鏅偣琛?CREATE TABLE scenic_spot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '鏅偣ID',
    name VARCHAR(200) NOT NULL COMMENT '鏅偣鍚嶇О',
    description TEXT COMMENT '鏅偣鎻忚堪',
    longitude DECIMAL(10,7) COMMENT '缁忓害',
    latitude DECIMAL(10,7) COMMENT '绾害',
    address VARCHAR(500) COMMENT '璇︾粏鍦板潃',
    image_url VARCHAR(500) COMMENT '鏅偣鍥剧墖URL',
    image_anime_url VARCHAR(500) COMMENT '鍔ㄦ极椋庢牸鍥剧墖URL',
    region VARCHAR(50) NOT NULL COMMENT '鎵€灞炲尯鍩?,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='鏅偣琛?;

-- 璇楄瘝琛?CREATE TABLE poem (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '璇楄瘝ID',
    title VARCHAR(200) NOT NULL COMMENT '璇楄瘝鏍囬',
    content TEXT NOT NULL COMMENT '璇楄瘝鍐呭',
    poet_id BIGINT COMMENT '浣滆€匢D',
    dynasty_id BIGINT COMMENT '鎵€灞炴湞浠D',
    spot_id BIGINT COMMENT '鍏宠仈鏅偣ID',
    annotation TEXT COMMENT '璇楄瘝娉ㄩ噴',
    background TEXT COMMENT '鍒涗綔鑳屾櫙',
    audio_url VARCHAR(500) COMMENT '闊抽鏈楄URL',
    video_url VARCHAR(500) COMMENT '瑙嗛URL',
    sentiment_tags JSON COMMENT '鎯呮劅鏍囩',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿',
    FOREIGN KEY (poet_id) REFERENCES poet(id),
    FOREIGN KEY (dynasty_id) REFERENCES dynasty(id),
    FOREIGN KEY (spot_id) REFERENCES scenic_spot(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='璇楄瘝琛?;

-- 鍘嗗彶浜嬩欢琛?CREATE TABLE event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '浜嬩欢ID',
    title VARCHAR(200) NOT NULL COMMENT '浜嬩欢鏍囬',
    description TEXT COMMENT '浜嬩欢鎻忚堪',
    dynasty_id BIGINT COMMENT '鎵€灞炴湞浠D',
    year INT COMMENT '鍙戠敓骞翠唤',
    significance TEXT COMMENT '鍘嗗彶鎰忎箟',
    image_url VARCHAR(500) COMMENT '鐩稿叧鍥剧墖URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿',
    FOREIGN KEY (dynasty_id) REFERENCES dynasty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='鍘嗗彶浜嬩欢琛?;

-- 璇楄瘝-浜嬩欢鍏宠仈琛?CREATE TABLE poem_event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    poem_id BIGINT NOT NULL COMMENT '璇楄瘝ID',
    event_id BIGINT NOT NULL COMMENT '浜嬩欢ID',
    UNIQUE KEY uk_poem_event (poem_id, event_id),
    FOREIGN KEY (poem_id) REFERENCES poem(id),
    FOREIGN KEY (event_id) REFERENCES event(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='璇楄瘝-浜嬩欢鍏宠仈琛?;

-- 鐢ㄦ埛琛?CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '鐢ㄦ埛ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '鐢ㄦ埛鍚?,
    password VARCHAR(200) NOT NULL COMMENT '瀵嗙爜锛圔Crypt鍔犲瘑锛?,
    role VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '瑙掕壊锛坅dmin/user锛?,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '鐘舵€侊紙pending/approved/rejected/disabled锛?,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='鐢ㄦ埛琛?;

-- Seed dynasties
INSERT INTO dynasty (name, start_year, end_year, description) VALUES
('鍏堢Е', -2070, -221, '澶忓晢鍛ㄦ椂鏈?),
('绉︽眽', -221, 220, '绉︽湞涓庢眽鏈?),
('榄忔檵鍗楀寳鏈?, 220, 589, '涓夊浗涓ゆ檵鍗楀寳鏈?),
('闅嬪攼', 581, 907, '闅嬫湞涓庡攼鏈?),
('瀹?, 960, 1279, '鍖楀畫涓庡崡瀹?),
('鍏?, 1271, 1368, '鍏冩湞'),
('鏄?, 1368, 1644, '鏄庢湞'),
('娓?, 1644, 1912, '娓呮湞');

-- 榛樿绠＄悊鍛樿处鍙凤紙瀵嗙爜: admin123锛?INSERT INTO user (username, password, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin', 'approved');
