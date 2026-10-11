CREATE TABLE user (id BIGINT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(50) NOT NULL UNIQUE,
 password VARCHAR(200) NOT NULL, role VARCHAR(20) NOT NULL DEFAULT 'user', status VARCHAR(20) NOT NULL DEFAULT 'pending',
 credential_version BIGINT NOT NULL DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE poem (id BIGINT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(200), content TEXT, poet_id BIGINT,
 dynasty_id BIGINT, spot_id BIGINT, annotation TEXT, background TEXT, audio_url TEXT, video_url TEXT,
 sentiment_tags TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE content_review (id BIGINT PRIMARY KEY AUTO_INCREMENT, entity_type VARCHAR(40), entity_id BIGINT,
 status VARCHAR(20), reviewer_id BIGINT, reviewed_at DATETIME, review_note TEXT,
 created_at DATETIME, updated_at DATETIME, UNIQUE(entity_type,entity_id));
CREATE TABLE source_document (id BIGINT PRIMARY KEY AUTO_INCREMENT, source_type VARCHAR(30), title VARCHAR(300),
 author_org VARCHAR(300), publication_year INT, identifier VARCHAR(120), url VARCHAR(1000), copyright_note VARCHAR(500),
 citation TEXT, created_at DATETIME, updated_at DATETIME);
CREATE TABLE content_source_link (id BIGINT PRIMARY KEY AUTO_INCREMENT, entity_type VARCHAR(40), entity_id BIGINT,
 source_document_id BIGINT, locator VARCHAR(200), quote TEXT, note VARCHAR(500), created_at DATETIME);
CREATE TABLE poem_analysis (id BIGINT PRIMARY KEY AUTO_INCREMENT, poem_id BIGINT UNIQUE, analysis JSON,
 model VARCHAR(100), generated_at DATETIME, version INT);
CREATE TABLE poet (id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100), dynasty_id BIGINT,
 birth_year INT, death_year INT, birthplace VARCHAR(200), biography TEXT, avatar_url TEXT, avatar_anime_url TEXT,
 style VARCHAR(200), completeness INT, created_at DATETIME, updated_at DATETIME);
CREATE TABLE scenic_spot (id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(200), description TEXT,
 longitude DECIMAL(10,7), latitude DECIMAL(10,7), address VARCHAR(200), image_url TEXT, image_anime_url TEXT,
 video_url TEXT, region VARCHAR(50), created_at DATETIME, updated_at DATETIME);
CREATE TABLE cultural_item (id BIGINT PRIMARY KEY AUTO_INCREMENT, category VARCHAR(20), title VARCHAR(200), summary VARCHAR(500),
 content TEXT, region VARCHAR(50), image_url TEXT, image_anime_url TEXT, tags JSON, sort_order INT,
 status VARCHAR(20), source VARCHAR(20), created_at DATETIME, updated_at DATETIME);
CREATE TABLE event (id BIGINT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(200), description TEXT,
 dynasty_id BIGINT, year INT, significance TEXT, image_url TEXT, created_at DATETIME, updated_at DATETIME);
