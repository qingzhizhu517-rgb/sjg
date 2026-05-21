CREATE DATABASE IF NOT EXISTS sjg DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sjg;

-- 朝代表
CREATE TABLE dynasty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '朝代ID',
    name VARCHAR(50) NOT NULL COMMENT '朝代名称',
    start_year INT COMMENT '起始年份',
    end_year INT COMMENT '结束年份',
    description TEXT COMMENT '朝代描述'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='朝代表';

-- 诗人表
CREATE TABLE poet (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '诗人ID',
    name VARCHAR(100) NOT NULL COMMENT '诗人名称',
    dynasty_id BIGINT COMMENT '所属朝代ID',
    birth_year INT COMMENT '出生年份',
    death_year INT COMMENT '逝世年份',
    birthplace VARCHAR(200) COMMENT '出生地',
    biography TEXT COMMENT '诗人简介',
    avatar_url VARCHAR(500) COMMENT '头像图片URL',
    avatar_anime_url VARCHAR(500) COMMENT '动漫风格头像URL',
    style VARCHAR(200) COMMENT '诗词风格',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (dynasty_id) REFERENCES dynasty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='诗人表';

-- 景点表
CREATE TABLE scenic_spot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '景点ID',
    name VARCHAR(200) NOT NULL COMMENT '景点名称',
    description TEXT COMMENT '景点描述',
    longitude DECIMAL(10,7) COMMENT '经度',
    latitude DECIMAL(10,7) COMMENT '纬度',
    address VARCHAR(500) COMMENT '详细地址',
    image_url VARCHAR(500) COMMENT '景点图片URL',
    image_anime_url VARCHAR(500) COMMENT '动漫风格图片URL',
    region VARCHAR(50) NOT NULL COMMENT '所属区域',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='景点表';

-- 诗词表
CREATE TABLE poem (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '诗词ID',
    title VARCHAR(200) NOT NULL COMMENT '诗词标题',
    content TEXT NOT NULL COMMENT '诗词内容',
    poet_id BIGINT COMMENT '作者ID',
    dynasty_id BIGINT COMMENT '所属朝代ID',
    spot_id BIGINT COMMENT '关联景点ID',
    annotation TEXT COMMENT '诗词注释',
    background TEXT COMMENT '创作背景',
    audio_url VARCHAR(500) COMMENT '音频朗诵URL',
    video_url VARCHAR(500) COMMENT '视频URL',
    sentiment_tags JSON COMMENT '情感标签',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (poet_id) REFERENCES poet(id),
    FOREIGN KEY (dynasty_id) REFERENCES dynasty(id),
    FOREIGN KEY (spot_id) REFERENCES scenic_spot(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='诗词表';

-- 历史事件表
CREATE TABLE event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '事件ID',
    title VARCHAR(200) NOT NULL COMMENT '事件标题',
    description TEXT COMMENT '事件描述',
    dynasty_id BIGINT COMMENT '所属朝代ID',
    year INT COMMENT '发生年份',
    significance TEXT COMMENT '历史意义',
    image_url VARCHAR(500) COMMENT '相关图片URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (dynasty_id) REFERENCES dynasty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='历史事件表';

-- 诗词-事件关联表
CREATE TABLE poem_event (
    poem_id BIGINT NOT NULL COMMENT '诗词ID',
    event_id BIGINT NOT NULL COMMENT '事件ID',
    PRIMARY KEY (poem_id, event_id),
    FOREIGN KEY (poem_id) REFERENCES poem(id),
    FOREIGN KEY (event_id) REFERENCES event(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='诗词-事件关联表';

-- 用户表
CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(200) NOT NULL COMMENT '密码（BCrypt加密）',
    role VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '角色（admin/user）',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态（pending/approved/rejected/disabled）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- Seed dynasties
INSERT INTO dynasty (name, start_year, end_year, description) VALUES
('先秦', -2070, -221, '夏商周时期'),
('秦汉', -221, 220, '秦朝与汉朝'),
('魏晋南北朝', 220, 589, '三国两晋南北朝'),
('隋唐', 581, 907, '隋朝与唐朝'),
('宋', 960, 1279, '北宋与南宋'),
('元', 1271, 1368, '元朝'),
('明', 1368, 1644, '明朝'),
('清', 1644, 1912, '清朝');

-- 默认管理员账号（密码: admin123）
INSERT INTO user (username, password, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin', 'approved');
