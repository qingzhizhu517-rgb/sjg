CREATE DATABASE IF NOT EXISTS sjg DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sjg;

CREATE TABLE dynasty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_year INT,
    end_year INT,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE poet (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dynasty_id BIGINT,
    birth_year INT,
    death_year INT,
    birthplace VARCHAR(200),
    biography TEXT,
    avatar_url VARCHAR(500),
    avatar_anime_url VARCHAR(500),
    style VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dynasty_id) REFERENCES dynasty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE scenic_spot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    longitude DECIMAL(10,7),
    latitude DECIMAL(10,7),
    address VARCHAR(500),
    image_url VARCHAR(500),
    image_anime_url VARCHAR(500),
    region VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE poem (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    poet_id BIGINT,
    dynasty_id BIGINT,
    spot_id BIGINT,
    annotation TEXT,
    background TEXT,
    audio_url VARCHAR(500),
    video_url VARCHAR(500),
    sentiment_tags JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (poet_id) REFERENCES poet(id),
    FOREIGN KEY (dynasty_id) REFERENCES dynasty(id),
    FOREIGN KEY (spot_id) REFERENCES scenic_spot(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    dynasty_id BIGINT,
    year INT,
    significance TEXT,
    image_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dynasty_id) REFERENCES dynasty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE poem_event (
    poem_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    PRIMARY KEY (poem_id, event_id),
    FOREIGN KEY (poem_id) REFERENCES poem(id),
    FOREIGN KEY (event_id) REFERENCES event(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
