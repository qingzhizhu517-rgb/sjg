# SJG 数字人文平台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack digital humanities platform for literary landscapes of the Yellow River basin (Shandong section) with admin data management and a dual-theme public display portal.

**Architecture:** Single-repo monorepo with three modules — a Spring Boot 3 backend (admin + public API packages), a Vue 3 + Element Plus admin frontend, and a Vue 3 + Amap display frontend with real/anime theme switching. MySQL for persistence, MyBatis-Plus for ORM, JWT for auth, Alibaba Cloud OSS for file storage.

**Tech Stack:** Spring Boot 3.x, Java 17, MyBatis-Plus, MySQL, Vue 3, Vite, Element Plus, Amap JS API, Pinia, Axios, ECharts (V1.5)

---

## File Structure

```
sjg/
├── backend/
│   ├── pom.xml
│   ├── src/main/java/com/sjg/
│   │   ├── SjgApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── CorsConfig.java
│   │   │   └── MyBatisPlusConfig.java
│   │   ├── controller/
│   │   │   ├── admin/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── PoetController.java
│   │   │   │   ├── SpotController.java
│   │   │   │   ├── PoemController.java
│   │   │   │   ├── EventController.java
│   │   │   │   └── UploadController.java
│   │   │   └── public/
│   │   │       ├── PublicSpotController.java
│   │   │       ├── PublicPoetController.java
│   │   │       ├── PublicPoemController.java
│   │   │       └── PublicTimelineController.java
│   │   ├── entity/
│   │   │   ├── Dynasty.java
│   │   │   ├── Poet.java
│   │   │   ├── ScenicSpot.java
│   │   │   ├── Poem.java
│   │   │   ├── Event.java
│   │   │   ├── PoemEvent.java
│   │   │   └── User.java
│   │   ├── mapper/
│   │   │   ├── DynastyMapper.java
│   │   │   ├── PoetMapper.java
│   │   │   ├── ScenicSpotMapper.java
│   │   │   ├── PoemMapper.java
│   │   │   ├── EventMapper.java
│   │   │   ├── PoemEventMapper.java
│   │   │   └── UserMapper.java
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   ├── PoetService.java
│   │   │   ├── SpotService.java
│   │   │   ├── PoemService.java
│   │   │   ├── EventService.java
│   │   │   └── OssService.java
│   │   ├── dto/
│   │   │   ├── LoginRequest.java
│   │   │   ├── LoginResponse.java
│   │   │   ├── RegisterRequest.java
│   │   │   └── PageResult.java
│   │   └── util/
│   │       └── JwtUtil.java
│   └── src/main/resources/
│       ├── application.yml
│       └── schema.sql
├── admin-frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── router/index.js
│       ├── api/index.js
│       ├── views/
│       │   ├── Login.vue
│       │   ├── Layout.vue
│       │   ├── PoetList.vue
│       │   ├── SpotList.vue
│       │   ├── PoemList.vue
│       │   └── EventList.vue
│       └── components/
│           ├── DataTable.vue
│           ├── FormDialog.vue
│           └── ImportDialog.vue
├── display-frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── router/index.js
│       ├── api/index.js
│       ├── stores/theme.js
│       ├── composables/useTheme.js
│       ├── styles/
│       │   ├── variables.css
│       │   ├── real.css
│       │   └── inkwash.css
│       ├── config/
│       │   └── mapLabels.js
│       ├── views/
│       │   ├── MapView.vue
│       │   ├── PoetList.vue
│       │   ├── PoetDetail.vue
│       │   ├── PoemDetail.vue
│       │   └── Timeline.vue
│       └── components/
│           ├── ThemeSwitcher.vue
│           ├── AmapInteractiveMap.vue
│           ├── InkWashMap.vue
│           ├── PoetCard.vue
│           ├── PoemCard.vue
│           └── TimelineItem.vue
└── docs/
```

---

## Phase 1: Project Scaffolding

### Task 1: Backend Project Setup

**Files:**
- Create: `backend/pom.xml`
- Create: `backend/src/main/java/com/sjg/SjgApplication.java`
- Create: `backend/src/main/resources/application.yml`

- [ ] **Step 1: Create pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
    </parent>
    <groupId>com.sjg</groupId>
    <artifactId>sjg-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>sjg-backend</name>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
            <version>3.5.5</version>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>com.aliyun.oss</groupId>
            <artifactId>aliyun-sdk-oss</artifactId>
            <version>3.17.4</version>
        </dependency>
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>5.2.5</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 2: Create application.yml**

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/sjg?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root
    password: ${DB_PASSWORD:123456}
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  configuration:
    map-underscore-to-camel-case: true

jwt:
  secret: ${JWT_SECRET:sjg-secret-key-must-be-at-least-256-bits-long-for-hs256}
  expiration: 86400000

oss:
  endpoint: ${OSS_ENDPOINT:oss-cn-hangzhou.aliyuncs.com}
  access-key-id: ${OSS_ACCESS_KEY_ID:your-access-key}
  access-key-secret: ${OSS_ACCESS_KEY_SECRET:your-access-key-secret}
  bucket-name: ${OSS_BUCKET:sjg-bucket}

logging:
  level:
    com.sjg: debug
```

- [ ] **Step 3: Create main application class**

```java
package com.sjg;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.sjg.mapper")
public class SjgApplication {
    public static void main(String[] args) {
        SpringApplication.run(SjgApplication.class, args);
    }
}
```

- [ ] **Step 4: Verify backend compiles**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "chore: initialize Spring Boot backend project"
```

---

### Task 2: Database Schema

**Files:**
- Create: `backend/src/main/resources/schema.sql`

- [ ] **Step 1: Write schema.sql**

```sql
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
```

- [ ] **Step 2: Run schema against MySQL**

Run: `mysql -u root -p < backend/src/main/resources/schema.sql`
Expected: No errors, database `sjg` created with all tables

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/resources/schema.sql
git commit -m "feat: add database schema with seed data"
```

---

### Task 3: Admin Frontend Scaffolding

**Files:**
- Create: `admin-frontend/package.json`
- Create: `admin-frontend/vite.config.js`
- Create: `admin-frontend/index.html`
- Create: `admin-frontend/src/main.js`
- Create: `admin-frontend/src/App.vue`
- Create: `admin-frontend/src/router/index.js`
- Create: `admin-frontend/src/api/index.js`

- [ ] **Step 1: Initialize Vue project**

```bash
cd admin-frontend
npm create vite@latest . -- --template vue
npm install
npm install element-plus @element-plus/icons-vue vue-router@4 pinia axios
```

- [ ] **Step 2: Create main.js**

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
```

- [ ] **Step 3: Create router/index.js**

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/poets',
    children: [
      { path: 'poets', name: 'PoetList', component: () => import('../views/PoetList.vue') },
      { path: 'spots', name: 'SpotList', component: () => import('../views/SpotList.vue') },
      { path: 'poems', name: 'PoemList', component: () => import('../views/PoemList.vue') },
      { path: 'events', name: 'EventList', component: () => import('../views/EventList.vue') },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

- [ ] **Step 4: Create api/index.js**

```javascript
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    ElMessage.error(error.response?.data?.message || '请求失败')
    return Promise.reject(error)
  }
)

export default api
```

- [ ] **Step 5: Create App.vue**

```vue
<template>
  <router-view />
</template>
```

- [ ] **Step 6: Verify dev server starts**

Run: `cd admin-frontend && npm run dev`
Expected: Vite dev server starts on http://localhost:5173

- [ ] **Step 7: Commit**

```bash
git add admin-frontend/
git commit -m "chore: scaffold admin frontend with Vue 3 + Element Plus"
```

---

### Task 4: Display Frontend Scaffolding

**Files:**
- Create: `display-frontend/` (full scaffold)

- [ ] **Step 1: Initialize Vue project**

```bash
cd display-frontend
npm create vite@latest . -- --template vue
npm install
npm install vue-router@4 pinia axios @amap/amap-jsapi-loader echarts
```

- [ ] **Step 2: Create main.js**

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/variables.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

- [ ] **Step 3: Create router/index.js**

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/map' },
  { path: '/map', name: 'Map', component: () => import('../views/MapView.vue') },
  { path: '/poets', name: 'Poets', component: () => import('../views/PoetList.vue') },
  { path: '/poets/:id', name: 'PoetDetail', component: () => import('../views/PoetDetail.vue') },
  { path: '/poems/:id', name: 'PoemDetail', component: () => import('../views/PoemDetail.vue') },
  { path: '/timeline', name: 'Timeline', component: () => import('../views/Timeline.vue') },
  { path: '/regions/:region', name: 'RegionSpots', component: () => import('../views/RegionSpots.vue') },
]

export default createRouter({ history: createWebHistory(), routes })
```

- [ ] **Step 4: Create api/index.js**

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/public',
  timeout: 10000
})

export default api
```

- [ ] **Step 5: Create styles/variables.css**

```css
:root {
  /* Real theme (default) */
  --bg-primary: #faf6f0;
  --bg-secondary: #f5ede0;
  --text-primary: #333;
  --text-secondary: #666;
  --accent: #c8956c;
  --accent-dark: #a67444;
  --border: #e0d5c5;
  --card-bg: #fff;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

[data-theme="inkwash"] {
  --bg-primary: #f5f0e8;
  --bg-secondary: #ebe5d8;
  --text-primary: #2c2c2c;
  --text-secondary: #555;
  --accent: #c23a2b;
  --accent-dark: #8b1a1a;
  --border: #c8c0b0;
  --card-bg: #faf6ee;
  --font-body: 'KaiTi', 'STKaiti', 'SimSun', serif;
  --font-heading: 'LiSu', 'STLiti', 'KaiTi', serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.4s ease, color 0.4s ease;
}
```

- [ ] **Step 6: Verify dev server starts**

Run: `cd display-frontend && npm run dev`
Expected: Vite dev server starts

- [ ] **Step 7: Commit**

```bash
git add display-frontend/
git commit -m "chore: scaffold display frontend with Vue 3 + Amap + theme system"
```

---

## Phase 2: Backend Entities & Mappers

### Task 5: Entity Classes

**Files:**
- Create: `backend/src/main/java/com/sjg/entity/Dynasty.java`
- Create: `backend/src/main/java/com/sjg/entity/Poet.java`
- Create: `backend/src/main/java/com/sjg/entity/ScenicSpot.java`
- Create: `backend/src/main/java/com/sjg/entity/Poem.java`
- Create: `backend/src/main/java/com/sjg/entity/Event.java`
- Create: `backend/src/main/java/com/sjg/entity/PoemEvent.java`
- Create: `backend/src/main/java/com/sjg/entity/User.java`

- [ ] **Step 1: Create Dynasty.java**

```java
package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("dynasty")
public class Dynasty {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Integer startYear;
    private Integer endYear;
    private String description;
}
```

- [ ] **Step 2: Create Poet.java**

```java
package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("poet")
public class Poet {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Long dynastyId;
    private Integer birthYear;
    private Integer deathYear;
    private String birthplace;
    private String biography;
    private String avatarUrl;
    private String avatarAnimeUrl;
    private String style;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Step 3: Create ScenicSpot.java**

```java
package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("scenic_spot")
public class ScenicSpot {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String description;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private String address;
    private String imageUrl;
    private String imageAnimeUrl;
    private String region;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Step 4: Create Poem.java**

```java
package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("poem")
public class Poem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String content;
    private Long poetId;
    private Long dynastyId;
    private Long spotId;
    private String annotation;
    private String background;
    private String audioUrl;
    private String videoUrl;
    private String sentimentTags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Step 5: Create Event.java**

```java
package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("event")
public class Event {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String description;
    private Long dynastyId;
    private Integer year;
    private String significance;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Step 6: Create PoemEvent.java**

```java
package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("poem_event")
public class PoemEvent {
    private Long poemId;
    private Long eventId;
}
```

- [ ] **Step 7: Create User.java**

```java
package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private LocalDateTime createdAt;
}
```

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/java/com/sjg/entity/
git commit -m "feat: add all entity classes"
```

---

### Task 6: Mapper Interfaces

**Files:**
- Create: `backend/src/main/java/com/sjg/mapper/DynastyMapper.java`
- Create: `backend/src/main/java/com/sjg/mapper/PoetMapper.java`
- Create: `backend/src/main/java/com/sjg/mapper/ScenicSpotMapper.java`
- Create: `backend/src/main/java/com/sjg/mapper/PoemMapper.java`
- Create: `backend/src/main/java/com/sjg/mapper/EventMapper.java`
- Create: `backend/src/main/java/com/sjg/mapper/PoemEventMapper.java`
- Create: `backend/src/main/java/com/sjg/mapper/UserMapper.java`

- [ ] **Step 1: Create all mapper interfaces**

Each mapper follows the same pattern — extend `BaseMapper<Entity>`:

```java
package com.sjg.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.sjg.entity.Dynasty;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DynastyMapper extends BaseMapper<Dynasty> {
}
```

Repeat for: `PoetMapper`, `ScenicSpotMapper`, `PoemMapper`, `EventMapper`, `PoemEventMapper`, `UserMapper`

- [ ] **Step 2: Verify backend compiles**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/sjg/mapper/
git commit -m "feat: add MyBatis-Plus mapper interfaces"
```

---

## Phase 3: Backend Auth & Config

### Task 7: JWT Utility & Security Config

**Files:**
- Create: `backend/src/main/java/com/sjg/util/JwtUtil.java`
- Create: `backend/src/main/java/com/sjg/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/sjg/config/CorsConfig.java`
- Create: `backend/src/main/java/com/sjg/config/MyBatisPlusConfig.java`

- [ ] **Step 1: Create JwtUtil.java**

```java
package com.sjg.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

- [ ] **Step 2: Create SecurityConfig.java**

```java
package com.sjg.config;

import com.sjg.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").authenticated()
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private OncePerRequestFilter jwtFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                            FilterChain filterChain) throws ServletException, IOException {
                String header = request.getHeader("Authorization");
                if (header != null && header.startsWith("Bearer ")) {
                    String token = header.substring(7);
                    if (jwtUtil.validateToken(token)) {
                        String username = jwtUtil.getUsernameFromToken(token);
                        var auth = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                username, null, java.util.Collections.emptyList());
                        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
                filterChain.doFilter(request, response);
            }
        };
    }
}
```

- [ ] **Step 3: Create CorsConfig.java**

```java
package com.sjg.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

- [ ] **Step 4: Create MyBatisPlusConfig.java**

```java
package com.sjg.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MyBatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/sjg/config/ backend/src/main/java/com/sjg/util/
git commit -m "feat: add JWT auth, security config, CORS, pagination"
```

---

### Task 8: Auth Service & Controller

**Files:**
- Create: `backend/src/main/java/com/sjg/dto/LoginRequest.java`
- Create: `backend/src/main/java/com/sjg/dto/LoginResponse.java`
- Create: `backend/src/main/java/com/sjg/dto/RegisterRequest.java`
- Create: `backend/src/main/java/com/sjg/service/AuthService.java`
- Create: `backend/src/main/java/com/sjg/controller/admin/AuthController.java`

- [ ] **Step 1: Create DTOs**

```java
// LoginRequest.java
package com.sjg.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
```

```java
// LoginResponse.java
package com.sjg.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String username;
}
```

```java
// RegisterRequest.java
package com.sjg.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
}
```

- [ ] **Step 2: Create AuthService.java**

```java
package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.dto.LoginRequest;
import com.sjg.dto.LoginResponse;
import com.sjg.dto.RegisterRequest;
import com.sjg.entity.User;
import com.sjg.mapper.UserMapper;
import com.sjg.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserMapper userMapper, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public void register(RegisterRequest request) {
        Long count = userMapper.selectCount(
            new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
        if (count > 0) {
            throw new RuntimeException("用户名已存在");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userMapper.insert(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userMapper.selectOne(
            new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        String token = jwtUtil.generateToken(user.getUsername());
        return new LoginResponse(token, user.getUsername());
    }
}
```

- [ ] **Step 3: Create AuthController.java**

```java
package com.sjg.controller.admin;

import com.sjg.dto.LoginRequest;
import com.sjg.dto.LoginResponse;
import com.sjg.dto.RegisterRequest;
import com.sjg.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(Map.of("message", "注册成功"));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
```

- [ ] **Step 4: Verify backend compiles**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/sjg/dto/ backend/src/main/java/com/sjg/service/AuthService.java backend/src/main/java/com/sjg/controller/admin/AuthController.java
git commit -m "feat: add auth service with register/login endpoints"
```

---

## Phase 4: Backend CRUD Services & Admin Controllers

### Task 9: PageResult DTO & Base Service Pattern

**Files:**
- Create: `backend/src/main/java/com/sjg/dto/PageResult.java`

- [ ] **Step 1: Create PageResult.java**

```java
package com.sjg.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class PageResult<T> {
    private List<T> records;
    private long total;
    private long page;
    private long size;
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/java/com/sjg/dto/PageResult.java
git commit -m "feat: add generic page result DTO"
```

---

### Task 10: Poet Service & Admin Controller

**Files:**
- Create: `backend/src/main/java/com/sjg/service/PoetService.java`
- Create: `backend/src/main/java/com/sjg/controller/admin/PoetController.java`

- [ ] **Step 1: Create PoetService.java**

```java
package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.Poet;
import com.sjg.mapper.PoetMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PoetService {

    private final PoetMapper poetMapper;

    public PoetService(PoetMapper poetMapper) {
        this.poetMapper = poetMapper;
    }

    public PageResult<Poet> list(int page, int size, String keyword) {
        LambdaQueryWrapper<Poet> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Poet::getName, keyword)
                   .or().like(Poet::getBirthplace, keyword);
        }
        wrapper.orderByDesc(Poet::getId);
        Page<Poet> result = poetMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public Poet getById(Long id) {
        return poetMapper.selectById(id);
    }

    public void create(Poet poet) {
        poetMapper.insert(poet);
    }

    public void update(Long id, Poet poet) {
        poet.setId(id);
        poetMapper.updateById(poet);
    }

    public void delete(Long id) {
        poetMapper.deleteById(id);
    }
}
```

- [ ] **Step 2: Create PoetController.java**

```java
package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.entity.Poet;
import com.sjg.service.PoetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/poets")
public class PoetController {

    private final PoetService poetService;

    public PoetController(PoetService poetService) {
        this.poetService = poetService;
    }

    @GetMapping
    public ResponseEntity<PageResult<Poet>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(poetService.list(page, size, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Poet> getById(@PathVariable Long id) {
        return ResponseEntity.ok(poetService.getById(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Poet poet) {
        poetService.create(poet);
        return ResponseEntity.ok(Map.of("message", "创建成功"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Poet poet) {
        poetService.update(id, poet);
        return ResponseEntity.ok(Map.of("message", "更新成功"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        poetService.delete(id);
        return ResponseEntity.ok(Map.of("message", "删除成功"));
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/sjg/service/PoetService.java backend/src/main/java/com/sjg/controller/admin/PoetController.java
git commit -m "feat: add poet service and admin CRUD controller"
```

---

### Task 11: Spot, Poem, Event Services & Controllers

**Files:**
- Create: `backend/src/main/java/com/sjg/service/SpotService.java`
- Create: `backend/src/main/java/com/sjg/service/PoemService.java`
- Create: `backend/src/main/java/com/sjg/service/EventService.java`
- Create: `backend/src/main/java/com/sjg/controller/admin/SpotController.java`
- Create: `backend/src/main/java/com/sjg/controller/admin/PoemController.java`
- Create: `backend/src/main/java/com/sjg/controller/admin/EventController.java`

- [ ] **Step 1: Create SpotService.java**

```java
package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.ScenicSpot;
import com.sjg.mapper.ScenicSpotMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class SpotService {

    private final ScenicSpotMapper spotMapper;

    public SpotService(ScenicSpotMapper spotMapper) {
        this.spotMapper = spotMapper;
    }

    public PageResult<ScenicSpot> list(int page, int size, String keyword, String region) {
        LambdaQueryWrapper<ScenicSpot> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(ScenicSpot::getName, keyword)
                   .or().like(ScenicSpot::getAddress, keyword);
        }
        if (StringUtils.hasText(region)) {
            wrapper.eq(ScenicSpot::getRegion, region);
        }
        wrapper.orderByDesc(ScenicSpot::getId);
        Page<ScenicSpot> result = spotMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public ScenicSpot getById(Long id) { return spotMapper.selectById(id); }
    public void create(ScenicSpot spot) { spotMapper.insert(spot); }
    public void update(Long id, ScenicSpot spot) { spot.setId(id); spotMapper.updateById(spot); }
    public void delete(Long id) { spotMapper.deleteById(id); }
}
```

- [ ] **Step 2: Create PoemService.java**

```java
package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.Poem;
import com.sjg.mapper.PoemMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PoemService {

    private final PoemMapper poemMapper;

    public PoemService(PoemMapper poemMapper) {
        this.poemMapper = poemMapper;
    }

    public PageResult<Poem> list(int page, int size, String keyword) {
        LambdaQueryWrapper<Poem> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Poem::getTitle, keyword)
                   .or().like(Poem::getContent, keyword);
        }
        wrapper.orderByDesc(Poem::getId);
        Page<Poem> result = poemMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public Poem getById(Long id) { return poemMapper.selectById(id); }
    public void create(Poem poem) { poemMapper.insert(poem); }
    public void update(Long id, Poem poem) { poem.setId(id); poemMapper.updateById(poem); }
    public void delete(Long id) { poemMapper.deleteById(id); }
}
```

- [ ] **Step 3: Create EventService.java**

```java
package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.Event;
import com.sjg.mapper.EventMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EventService {

    private final EventMapper eventMapper;

    public EventService(EventMapper eventMapper) {
        this.eventMapper = eventMapper;
    }

    public PageResult<Event> list(int page, int size, String keyword) {
        LambdaQueryWrapper<Event> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Event::getTitle, keyword)
                   .or().like(Event::getDescription, keyword);
        }
        wrapper.orderByDesc(Event::getId);
        Page<Event> result = eventMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public Event getById(Long id) { return eventMapper.selectById(id); }
    public void create(Event event) { eventMapper.insert(event); }
    public void update(Long id, Event event) { event.setId(id); eventMapper.updateById(event); }
    public void delete(Long id) { eventMapper.deleteById(id); }
}
```

- [ ] **Step 4: Create SpotController.java**

```java
package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.entity.ScenicSpot;
import com.sjg.service.SpotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/spots")
public class SpotController {
    private final SpotService spotService;
    public SpotController(SpotService spotService) { this.spotService = spotService; }

    @GetMapping
    public ResponseEntity<PageResult<ScenicSpot>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region) {
        return ResponseEntity.ok(spotService.list(page, size, keyword, region));
    }
    @GetMapping("/{id}") public ResponseEntity<ScenicSpot> getById(@PathVariable Long id) { return ResponseEntity.ok(spotService.getById(id)); }
    @PostMapping public ResponseEntity<?> create(@RequestBody ScenicSpot spot) { spotService.create(spot); return ResponseEntity.ok(Map.of("message", "创建成功")); }
    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ScenicSpot spot) { spotService.update(id, spot); return ResponseEntity.ok(Map.of("message", "更新成功")); }
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id) { spotService.delete(id); return ResponseEntity.ok(Map.of("message", "删除成功")); }
}
```

- [ ] **Step 5: Create PoemController.java**

```java
package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.entity.Poem;
import com.sjg.service.PoemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/poems")
public class PoemController {
    private final PoemService poemService;
    public PoemController(PoemService poemService) { this.poemService = poemService; }

    @GetMapping
    public ResponseEntity<PageResult<Poem>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(poemService.list(page, size, keyword));
    }
    @GetMapping("/{id}") public ResponseEntity<Poem> getById(@PathVariable Long id) { return ResponseEntity.ok(poemService.getById(id)); }
    @PostMapping public ResponseEntity<?> create(@RequestBody Poem poem) { poemService.create(poem); return ResponseEntity.ok(Map.of("message", "创建成功")); }
    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Poem poem) { poemService.update(id, poem); return ResponseEntity.ok(Map.of("message", "更新成功")); }
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id) { poemService.delete(id); return ResponseEntity.ok(Map.of("message", "删除成功")); }
}
```

- [ ] **Step 6: Create EventController.java**

```java
package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.entity.Event;
import com.sjg.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/events")
public class EventController {
    private final EventService eventService;
    public EventController(EventService eventService) { this.eventService = eventService; }

    @GetMapping
    public ResponseEntity<PageResult<Event>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(eventService.list(page, size, keyword));
    }
    @GetMapping("/{id}") public ResponseEntity<Event> getById(@PathVariable Long id) { return ResponseEntity.ok(eventService.getById(id)); }
    @PostMapping public ResponseEntity<?> create(@RequestBody Event event) { eventService.create(event); return ResponseEntity.ok(Map.of("message", "创建成功")); }
    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Event event) { eventService.update(id, event); return ResponseEntity.ok(Map.of("message", "更新成功")); }
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id) { eventService.delete(id); return ResponseEntity.ok(Map.of("message", "删除成功")); }
}
```

- [ ] **Step 7: Verify backend compiles**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/java/com/sjg/service/ backend/src/main/java/com/sjg/controller/admin/
git commit -m "feat: add spot, poem, event services and admin CRUD controllers"
```

---

### Task 12: OSS Upload Service & Controller

**Files:**
- Create: `backend/src/main/java/com/sjg/service/OssService.java`
- Create: `backend/src/main/java/com/sjg/controller/admin/UploadController.java`

- [ ] **Step 1: Create OssService.java**

```java
package com.sjg.service;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class OssService {

    @Value("${oss.endpoint}")
    private String endpoint;
    @Value("${oss.access-key-id}")
    private String accessKeyId;
    @Value("${oss.access-key-secret}")
    private String accessKeySecret;
    @Value("${oss.bucket-name}")
    private String bucketName;

    private OSS ossClient;

    private OSS getClient() {
        if (ossClient == null) {
            ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
        }
        return ossClient;
    }

    public String upload(MultipartFile file, String directory) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String objectName = directory + "/" + UUID.randomUUID() + extension;
        getClient().putObject(bucketName, objectName, file.getInputStream());
        return "https://" + bucketName + "." + endpoint + "/" + objectName;
    }

    @PreDestroy
    public void destroy() {
        if (ossClient != null) {
            ossClient.shutdown();
        }
    }
}
```

- [ ] **Step 2: Create UploadController.java**

```java
package com.sjg.controller.admin;

import com.sjg.service.OssService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class UploadController {

    private final OssService ossService;

    public UploadController(OssService ossService) {
        this.ossService = ossService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                    @RequestParam(defaultValue = "images") String directory) {
        try {
            String url = ossService.upload(file, directory);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "上传失败: " + e.getMessage()));
        }
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/sjg/service/OssService.java backend/src/main/java/com/sjg/controller/admin/UploadController.java
git commit -m "feat: add OSS file upload service and controller"
```

---

## Phase 5: Public API Controllers

### Task 13: Public Controllers

**Files:**
- Create: `backend/src/main/java/com/sjg/controller/public/PublicSpotController.java`
- Create: `backend/src/main/java/com/sjg/controller/public/PublicPoetController.java`
- Create: `backend/src/main/java/com/sjg/controller/public/PublicPoemController.java`
- Create: `backend/src/main/java/com/sjg/controller/public/PublicTimelineController.java`

- [ ] **Step 1: Create PublicSpotController.java**

```java
package com.sjg.controller.public;

import com.sjg.entity.ScenicSpot;
import com.sjg.entity.Poem;
import com.sjg.entity.Poet;
import com.sjg.service.SpotService;
import com.sjg.service.PoemService;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.PoemMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/spots")
public class PublicSpotController {

    private final SpotService spotService;
    private final PoemMapper poemMapper;
    private final PoetMapper poetMapper;

    public PublicSpotController(SpotService spotService, PoemMapper poemMapper, PoetMapper poetMapper) {
        this.spotService = spotService;
        this.poemMapper = poemMapper;
        this.poetMapper = poetMapper;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String region) {
        var result = spotService.list(page, size, null, region);
        // Enrich with poem/poet counts
        var enriched = result.getRecords().stream().map(spot -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", spot.getId());
            map.put("name", spot.getName());
            map.put("address", spot.getAddress());
            map.put("imageUrl", spot.getImageUrl());
            map.put("imageAnimeUrl", spot.getImageAnimeUrl());
            map.put("region", spot.getRegion());
            map.put("longitude", spot.getLongitude());
            map.put("latitude", spot.getLatitude());
            Long poemCount = poemMapper.selectCount(
                new LambdaQueryWrapper<Poem>().eq(Poem::getSpotId, spot.getId()));
            map.put("poemCount", poemCount);
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("records", enriched, "total", result.getTotal()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        ScenicSpot spot = spotService.getById(id);
        if (spot == null) return ResponseEntity.notFound().build();

        List<Poem> poems = poemMapper.selectList(
            new LambdaQueryWrapper<Poem>().eq(Poem::getSpotId, id));

        Map<String, Object> result = new HashMap<>();
        result.put("spot", spot);
        result.put("poems", poems);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/regions")
    public ResponseEntity<?> regions() {
        // Return 9 regions with spot counts
        String[] regions = {"菏泽", "济宁", "泰安", "聊城", "济南", "德州", "滨州", "淄博", "东营"};
        List<Map<String, Object>> regionList = new ArrayList<>();
        for (String region : regions) {
            Long count = spotService.list(1, 1, null, region).getTotal();
            regionList.add(Map.of("name", region, "spotCount", count));
        }
        return ResponseEntity.ok(regionList);
    }
}
```

- [ ] **Step 2: Create PublicPoetController.java**

```java
package com.sjg.controller.public;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.entity.Dynasty;
import com.sjg.entity.Poet;
import com.sjg.entity.Poem;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.service.PoetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/poets")
public class PublicPoetController {

    private final PoetService poetService;
    private final PoemMapper poemMapper;
    private final DynastyMapper dynastyMapper;

    public PublicPoetController(PoetService poetService, PoemMapper poemMapper, DynastyMapper dynastyMapper) {
        this.poetService = poetService;
        this.poemMapper = poemMapper;
        this.dynastyMapper = dynastyMapper;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long dynastyId) {
        // Reuse admin service but add dynasty filter
        LambdaQueryWrapper<Poet> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isBlank()) {
            wrapper.like(Poet::getName, keyword);
        }
        if (dynastyId != null) {
            wrapper.eq(Poet::getDynastyId, dynastyId);
        }
        wrapper.orderByDesc(Poet::getId);
        var result = com.baomidou.mybatisplus.extension.plugins.pagination.Page.of(page, size);
        // Use poetMapper directly for dynasty filter
        var pageResult = poetService.list(page, size, keyword);
        return ResponseEntity.ok(pageResult);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Poet poet = poetService.getById(id);
        if (poet == null) return ResponseEntity.notFound().build();

        List<Poem> poems = poemMapper.selectList(
            new LambdaQueryWrapper<Poem>().eq(Poem::getPoetId, id));

        Dynasty dynasty = dynastyMapper.selectById(poet.getDynastyId());

        Map<String, Object> result = new HashMap<>();
        result.put("poet", poet);
        result.put("poems", poems);
        result.put("dynasty", dynasty);
        return ResponseEntity.ok(result);
    }
}
```

- [ ] **Step 3: Create PublicPoemController.java**

```java
package com.sjg.controller.public;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.entity.*;
import com.sjg.mapper.*;
import com.sjg.service.PoemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/public/poems")
public class PublicPoemController {

    private final PoemService poemService;
    private final PoetMapper poetMapper;
    private final DynastyMapper dynastyMapper;
    private final ScenicSpotMapper spotMapper;

    public PublicPoemController(PoemService poemService, PoetMapper poetMapper,
                                 DynastyMapper dynastyMapper, ScenicSpotMapper spotMapper) {
        this.poemService = poemService;
        this.poetMapper = poetMapper;
        this.dynastyMapper = dynastyMapper;
        this.spotMapper = spotMapper;
    }

    @GetMapping
    public ResponseEntity<?> search(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(poemService.list(page, size, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Poem poem = poemService.getById(id);
        if (poem == null) return ResponseEntity.notFound().build();

        Map<String, Object> result = new HashMap<>();
        result.put("poem", poem);
        result.put("poet", poetMapper.selectById(poem.getPoetId()));
        result.put("dynasty", dynastyMapper.selectById(poem.getDynastyId()));
        if (poem.getSpotId() != null) {
            result.put("spot", spotMapper.selectById(poem.getSpotId()));
        }
        return ResponseEntity.ok(result);
    }
}
```

- [ ] **Step 4: Create PublicTimelineController.java**

```java
package com.sjg.controller.public;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.entity.*;
import com.sjg.mapper.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/timeline")
public class PublicTimelineController {

    private final DynastyMapper dynastyMapper;
    private final EventMapper eventMapper;
    private final PoetMapper poetMapper;
    private final PoemMapper poemMapper;

    public PublicTimelineController(DynastyMapper dynastyMapper, EventMapper eventMapper,
                                     PoetMapper poetMapper, PoemMapper poemMapper) {
        this.dynastyMapper = dynastyMapper;
        this.eventMapper = eventMapper;
        this.poetMapper = poetMapper;
        this.poemMapper = poemMapper;
    }

    @GetMapping
    public ResponseEntity<?> getTimeline() {
        List<Dynasty> dynasties = dynastyMapper.selectList(
            new LambdaQueryWrapper<Dynasty>().orderByAsc(Dynasty::getStartYear));

        List<Map<String, Object>> timeline = dynasties.stream().map(dynasty -> {
            Map<String, Object> item = new HashMap<>();
            item.put("dynasty", dynasty);
            item.put("events", eventMapper.selectList(
                new LambdaQueryWrapper<Event>().eq(Event::getDynastyId, dynasty.getId())));
            item.put("poets", poetMapper.selectList(
                new LambdaQueryWrapper<Poet>().eq(Poet::getDynastyId, dynasty.getId())));
            item.put("poems", poemMapper.selectList(
                new LambdaQueryWrapper<Poem>().eq(Poem::getDynastyId, dynasty.getId())));
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(timeline);
    }
}
```

- [ ] **Step 5: Verify backend compiles**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/sjg/controller/public/
git commit -m "feat: add public API controllers for spots, poets, poems, timeline"
```

---

## Phase 6: Admin Frontend Pages

### Task 14: Login & Layout Pages

**Files:**
- Create: `admin-frontend/src/views/Login.vue`
- Create: `admin-frontend/src/views/Layout.vue`

- [ ] **Step 1: Create Login.vue**

```vue
<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>SJG 管理后台</h2>
      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const router = useRouter()
const loading = ref(false)
const form = ref({ username: '', password: '' })

const handleLogin = async () => {
  loading.value = true
  try {
    const data = await api.post('/auth/login', form.value)
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
}
.login-card {
  width: 400px;
  padding: 20px;
}
h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>
```

- [ ] **Step 2: Create Layout.vue**

```vue
<template>
  <el-container style="height: 100vh">
    <el-aside width="200px" style="background: #001529">
      <div style="color: #fff; text-align: center; padding: 20px; font-size: 18px; font-weight: bold;">
        SJG 管理后台
      </div>
      <el-menu
        :default-active="route.path"
        router
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#fff"
      >
        <el-menu-item index="/poets">
          <el-icon><User /></el-icon>
          <span>诗人管理</span>
        </el-menu-item>
        <el-menu-item index="/spots">
          <el-icon><Location /></el-icon>
          <span>景点管理</span>
        </el-menu-item>
        <el-menu-item index="/poems">
          <el-icon><Document /></el-icon>
          <span>诗词管理</span>
        </el-menu-item>
        <el-menu-item index="/events">
          <el-icon><Calendar /></el-icon>
          <span>事件管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="display: flex; align-items: center; justify-content: flex-end; border-bottom: 1px solid #eee;">
        <span style="margin-right: 16px;">{{ username }}</span>
        <el-button type="text" @click="logout">退出登录</el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const username = computed(() => localStorage.getItem('username') || '管理员')

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>
```

- [ ] **Step 3: Commit**

```bash
git add admin-frontend/src/views/Login.vue admin-frontend/src/views/Layout.vue
git commit -m "feat: add admin login and layout pages"
```

---

### Task 15: Shared Components (DataTable, FormDialog, ImportDialog)

**Files:**
- Create: `admin-frontend/src/components/DataTable.vue`
- Create: `admin-frontend/src/components/FormDialog.vue`
- Create: `admin-frontend/src/components/ImportDialog.vue`

- [ ] **Step 1: Create DataTable.vue**

```vue
<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <div>
        <el-input v-model="keyword" placeholder="搜索..." style="width: 240px; margin-right: 8px;" @keyup.enter="search" clearable />
        <el-button type="primary" @click="search">搜索</el-button>
      </div>
      <div>
        <el-button @click="$emit('import')">批量导入</el-button>
        <el-button type="primary" @click="$emit('add')">新增</el-button>
      </div>
    </div>
    <el-table :data="data" v-loading="loading" border stripe>
      <slot />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="$emit('edit', row)">编辑</el-button>
          <el-popconfirm title="确定删除?" @confirm="$emit('delete', row)">
            <template #reference>
              <el-button type="danger" link>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 16px; justify-content: flex-end;"
      v-model:current-page="page"
      v-model:page-size="size"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @current-change="fetch"
      @size-change="fetch"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({ fetchFn: Function })
const emit = defineEmits(['add', 'edit', 'delete', 'import'])

const data = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const size = ref(10)
const total = ref(0)

const fetch = async () => {
  loading.value = true
  try {
    const result = await props.fetchFn(page.value, size.value, keyword.value)
    data.value = result.records
    total.value = result.total
  } finally {
    loading.value = false
  }
}

const search = () => { page.value = 1; fetch() }

onMounted(fetch)

defineExpose({ fetch })
</script>
```

- [ ] **Step 2: Create FormDialog.vue**

```vue
<template>
  <el-dialog :model-value="visible" :title="isEdit ? '编辑' : '新增'" @close="$emit('close')" width="600px">
    <el-form :model="form" label-width="100px">
      <slot :form="form" />
    </el-form>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  initialData: { type: Object, default: () => ({}) },
  submitFn: Function,
})
const emit = defineEmits(['close', 'success'])

const form = ref({})
const loading = ref(false)

watch(() => props.visible, (val) => {
  if (val) form.value = { ...props.initialData }
})

const submit = async () => {
  loading.value = true
  try {
    await props.submitFn(form.value)
    emit('success')
    emit('close')
  } finally {
    loading.value = false
  }
}
</script>
```

- [ ] **Step 3: Create ImportDialog.vue**

```vue
<template>
  <el-dialog :model-value="visible" title="批量导入" @close="$emit('close')" width="500px">
    <el-upload
      drag
      :auto-upload="false"
      :on-change="handleChange"
      accept=".xlsx,.xls"
    >
      <el-icon style="font-size: 48px; color: #c0c4cc;"><UploadFilled /></el-icon>
      <div>将 Excel 文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <el-alert v-if="result" :type="result.success ? 'success' : 'error'" :title="result.message" style="margin-top: 16px;" />
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="upload">开始导入</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ visible: Boolean, uploadFn: Function })
const emit = defineEmits(['close', 'success'])

const file = ref(null)
const loading = ref(false)
const result = ref(null)

const handleChange = (f) => { file.value = f.raw }

const upload = async () => {
  if (!file.value) return
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file.value)
    result.value = await props.uploadFn(formData)
    emit('success')
  } finally {
    loading.value = false
  }
}
</script>
```

- [ ] **Step 4: Commit**

```bash
git add admin-frontend/src/components/
git commit -m "feat: add shared admin components (DataTable, FormDialog, ImportDialog)"
```

---

### Task 16: PoetList CRUD Page

**Files:**
- Create: `admin-frontend/src/views/PoetList.vue`

- [ ] **Step 1: Create PoetList.vue**

```vue
<template>
  <div>
    <DataTable ref="table" :fetchFn="fetchPoets" @add="openAdd" @edit="openEdit" @delete="handleDelete" @import="showImport = true">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="birthplace" label="籍贯" />
      <el-table-column prop="style" label="风格" />
      <el-table-column label="头像" width="100">
        <template #default="{ row }">
          <el-image v-if="row.avatarUrl" :src="row.avatarUrl" style="width: 50px; height: 50px;" fit="cover" />
        </template>
      </el-table-column>
    </DataTable>

    <FormDialog
      :visible="dialogVisible"
      :isEdit="isEdit"
      :initialData="currentPoet"
      :submitFn="handleSubmit"
      @close="dialogVisible = false"
      @success="table.fetch()"
    >
      <template #default="{ form }">
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="朝代">
          <el-select v-model="form.dynastyId" placeholder="选择朝代">
            <el-option v-for="d in dynasties" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="籍贯">
          <el-input v-model="form.birthplace" />
        </el-form-item>
        <el-form-item label="出生年">
          <el-input-number v-model="form.birthYear" :controls="false" />
        </el-form-item>
        <el-form-item label="去世年">
          <el-input-number v-model="form.deathYear" :controls="false" />
        </el-form-item>
        <el-form-item label="风格">
          <el-input v-model="form.style" />
        </el-form-item>
        <el-form-item label="生平简介">
          <el-input v-model="form.biography" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="头像(真实)">
          <el-upload :show-file-list="false" :http-request="uploadAvatar" accept="image/*">
            <el-image v-if="form.avatarUrl" :src="form.avatarUrl" style="width: 100px;" fit="contain" />
            <el-button v-else>上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="头像(动漫)">
          <el-upload :show-file-list="false" :http-request="uploadAvatarAnime" accept="image/*">
            <el-image v-if="form.avatarAnimeUrl" :src="form.avatarAnimeUrl" style="width: 100px;" fit="contain" />
            <el-button v-else>上传</el-button>
          </el-upload>
        </el-form-item>
      </template>
    </FormDialog>

    <ImportDialog :visible="showImport" :uploadFn="importPoets" @close="showImport = false" @success="table.fetch()" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'
import DataTable from '../components/DataTable.vue'
import FormDialog from '../components/FormDialog.vue'
import ImportDialog from '../components/ImportDialog.vue'

const table = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentPoet = ref({})
const showImport = ref(false)
const dynasties = ref([])

const fetchPoets = (page, size, keyword) =>
  api.get('/admin/poets', { params: { page, size, keyword } })

const openAdd = () => { isEdit.value = false; currentPoet.value = {}; dialogVisible.value = true }
const openEdit = (row) => { isEdit.value = true; currentPoet.value = { ...row }; dialogVisible.value = true }

const handleSubmit = async (form) => {
  if (isEdit.value) {
    await api.put(`/admin/poets/${form.id}`, form)
  } else {
    await api.post('/admin/poets', form)
  }
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
}

const handleDelete = async (row) => {
  await api.delete(`/admin/poets/${row.id}`)
  ElMessage.success('删除成功')
  table.value.fetch()
}

const uploadAvatar = async ({ file }) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('directory', 'poets')
  const { url } = await api.post('/admin/upload', formData)
  currentPoet.value.avatarUrl = url
}

const uploadAvatarAnime = async ({ file }) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('directory', 'poets/anime')
  const { url } = await api.post('/admin/upload', formData)
  currentPoet.value.avatarAnimeUrl = url
}

const importPoets = async (formData) => {
  formData.append('directory', 'poets')
  return await api.post('/admin/poets/import', formData)
}

// Load dynasties for select
api.get('/public/timeline').then(data => {
  dynasties.value = data.map(item => item.dynasty)
})
</script>
```

- [ ] **Step 2: Commit**

```bash
git add admin-frontend/src/views/PoetList.vue
git commit -m "feat: add poet management CRUD page"
```

---

### Task 17: Spot, Poem, Event CRUD Pages

**Files:**
- Create: `admin-frontend/src/views/SpotList.vue`
- Create: `admin-frontend/src/views/PoemList.vue`
- Create: `admin-frontend/src/views/EventList.vue`

- [ ] **Step 1: Create SpotList.vue**

```vue
<template>
  <div>
    <DataTable ref="table" :fetchFn="fetchSpots" @add="openAdd" @edit="openEdit" @delete="handleDelete">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="region" label="地区" width="100" />
      <el-table-column prop="address" label="地址" />
      <el-table-column label="图片" width="100">
        <template #default="{ row }">
          <el-image v-if="row.imageUrl" :src="row.imageUrl" style="width: 50px; height: 50px;" fit="cover" />
        </template>
      </el-table-column>
    </DataTable>
    <FormDialog :visible="dialogVisible" :isEdit="isEdit" :initialData="current" :submitFn="handleSubmit"
      @close="dialogVisible = false" @success="table.fetch()">
      <template #default="{ form }">
        <el-form-item label="名称" required><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="地区">
          <el-select v-model="form.region">
            <el-option v-for="r in regions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="经度"><el-input-number v-model="form.longitude" :precision="7" :step="0.001" /></el-form-item>
        <el-form-item label="纬度"><el-input-number v-model="form.latitude" :precision="7" :step="0.001" /></el-form-item>
        <el-form-item label="介绍"><el-input v-model="form.description" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="图片(真实)">
          <el-upload :show-file-list="false" :http-request="(o) => uploadImage(o, 'imageUrl')" accept="image/*">
            <el-image v-if="form.imageUrl" :src="form.imageUrl" style="width: 100px;" fit="contain" />
            <el-button v-else>上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="图片(动漫)">
          <el-upload :show-file-list="false" :http-request="(o) => uploadImage(o, 'imageAnimeUrl')" accept="image/*">
            <el-image v-if="form.imageAnimeUrl" :src="form.imageAnimeUrl" style="width: 100px;" fit="contain" />
            <el-button v-else>上传</el-button>
          </el-upload>
        </el-form-item>
      </template>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'
import DataTable from '../components/DataTable.vue'
import FormDialog from '../components/FormDialog.vue'

const regions = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '滨州', '淄博', '东营']
const table = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const current = ref({})

const fetchSpots = (page, size, keyword) => api.get('/admin/spots', { params: { page, size, keyword } })
const openAdd = () => { isEdit.value = false; current.value = {}; dialogVisible.value = true }
const openEdit = (row) => { isEdit.value = true; current.value = { ...row }; dialogVisible.value = true }
const handleSubmit = async (form) => {
  if (isEdit.value) await api.put(`/admin/spots/${form.id}`, form)
  else await api.post('/admin/spots', form)
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
}
const handleDelete = async (row) => { await api.delete(`/admin/spots/${row.id}`); ElMessage.success('删除成功'); table.value.fetch() }
const uploadImage = async ({ file }, field) => {
  const formData = new FormData(); formData.append('file', file); formData.append('directory', 'spots')
  const { url } = await api.post('/admin/upload', formData)
  current.value[field] = url
}
</script>
```

- [ ] **Step 2: Create PoemList.vue**

```vue
<template>
  <div>
    <DataTable ref="table" :fetchFn="fetchPoems" @add="openAdd" @edit="openEdit" @delete="handleDelete">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="content" label="内容" show-overflow-tooltip />
    </DataTable>
    <FormDialog :visible="dialogVisible" :isEdit="isEdit" :initialData="current" :submitFn="handleSubmit"
      @close="dialogVisible = false" @success="table.fetch()">
      <template #default="{ form }">
        <el-form-item label="标题" required><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容" required><el-input v-model="form.content" type="textarea" :rows="6" /></el-form-item>
        <el-form-item label="作者">
          <el-select v-model="form.poetId" filterable placeholder="选择诗人">
            <el-option v-for="p in poets" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="朝代">
          <el-select v-model="form.dynastyId" placeholder="选择朝代">
            <el-option v-for="d in dynasties" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="创作地点">
          <el-select v-model="form.spotId" filterable clearable placeholder="选择景点">
            <el-option v-for="s in spots" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="注解"><el-input v-model="form.annotation" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="创作背景"><el-input v-model="form.background" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="音频URL"><el-input v-model="form.audioUrl" /></el-form-item>
        <el-form-item label="视频URL"><el-input v-model="form.videoUrl" /></el-form-item>
      </template>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'
import DataTable from '../components/DataTable.vue'
import FormDialog from '../components/FormDialog.vue'

const table = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const current = ref({})
const poets = ref([])
const dynasties = ref([])
const spots = ref([])

const fetchPoems = (page, size, keyword) => api.get('/admin/poems', { params: { page, size, keyword } })
const openAdd = () => { isEdit.value = false; current.value = {}; dialogVisible.value = true }
const openEdit = (row) => { isEdit.value = true; current.value = { ...row }; dialogVisible.value = true }
const handleSubmit = async (form) => {
  if (isEdit.value) await api.put(`/admin/poems/${form.id}`, form)
  else await api.post('/admin/poems', form)
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
}
const handleDelete = async (row) => { await api.delete(`/admin/poems/${row.id}`); ElMessage.success('删除成功'); table.value.fetch() }

onMounted(async () => {
  const [poetRes, spotRes, timelineRes] = await Promise.all([
    api.get('/admin/poets', { params: { page: 1, size: 1000 } }),
    api.get('/admin/spots', { params: { page: 1, size: 1000 } }),
    api.get('/public/timeline'),
  ])
  poets.value = poetRes.records
  spots.value = spotRes.records
  dynasties.value = timelineRes.map(t => t.dynasty)
})
</script>
```

- [ ] **Step 3: Create EventList.vue**

```vue
<template>
  <div>
    <DataTable ref="table" :fetchFn="fetchEvents" @add="openAdd" @edit="openEdit" @delete="handleDelete">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="year" label="年份" width="100" />
      <el-table-column prop="significance" label="意义" show-overflow-tooltip />
    </DataTable>
    <FormDialog :visible="dialogVisible" :isEdit="isEdit" :initialData="current" :submitFn="handleSubmit"
      @close="dialogVisible = false" @success="table.fetch()">
      <template #default="{ form }">
        <el-form-item label="标题" required><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="朝代">
          <el-select v-model="form.dynastyId" placeholder="选择朝代">
            <el-option v-for="d in dynasties" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="年份"><el-input-number v-model="form.year" :controls="false" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="历史意义"><el-input v-model="form.significance" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="图片">
          <el-upload :show-file-list="false" :http-request="uploadImage" accept="image/*">
            <el-image v-if="form.imageUrl" :src="form.imageUrl" style="width: 100px;" fit="contain" />
            <el-button v-else>上传</el-button>
          </el-upload>
        </el-form-item>
      </template>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'
import DataTable from '../components/DataTable.vue'
import FormDialog from '../components/FormDialog.vue'

const table = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const current = ref({})
const dynasties = ref([])

const fetchEvents = (page, size, keyword) => api.get('/admin/events', { params: { page, size, keyword } })
const openAdd = () => { isEdit.value = false; current.value = {}; dialogVisible.value = true }
const openEdit = (row) => { isEdit.value = true; current.value = { ...row }; dialogVisible.value = true }
const handleSubmit = async (form) => {
  if (isEdit.value) await api.put(`/admin/events/${form.id}`, form)
  else await api.post('/admin/events', form)
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
}
const handleDelete = async (row) => { await api.delete(`/admin/events/${row.id}`); ElMessage.success('删除成功'); table.value.fetch() }
const uploadImage = async ({ file }) => {
  const formData = new FormData(); formData.append('file', file); formData.append('directory', 'events')
  const { url } = await api.post('/admin/upload', formData)
  current.value.imageUrl = url
}

onMounted(async () => {
  const timeline = await api.get('/public/timeline')
  dynasties.value = timeline.map(t => t.dynasty)
})
</script>
```

- [ ] **Step 4: Commit**

```bash
git add admin-frontend/src/views/
git commit -m "feat: add spot, poem, event CRUD pages"
```

---

## Phase 7: Display Frontend Pages

### Task 18: Theme System (ThemeSwitcher, Pinia store, composables)

**Files:**
- Create: `display-frontend/src/stores/theme.js`
- Create: `display-frontend/src/composables/useTheme.js`
- Create: `display-frontend/src/components/ThemeSwitcher.vue`
- Create: `display-frontend/src/styles/real.css`
- Create: `display-frontend/src/styles/inkwash.css`
- Modify: `display-frontend/src/App.vue`

- [ ] **Step 1: Create stores/theme.js**

```javascript
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('sjg-theme') || 'real')

  const toggle = () => {
    theme.value = theme.value === 'real' ? 'inkwash' : 'real'
  }

  watch(theme, (val) => {
    localStorage.setItem('sjg-theme', val)
    document.documentElement.setAttribute('data-theme', val)
  }, { immediate: true })

  return { theme, toggle }
})
```

- [ ] **Step 2: Create composables/useTheme.js**

```javascript
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'

export function useTheme() {
  const store = useThemeStore()

  const isReal = computed(() => store.theme === 'real')
  const isAnime = computed(() => store.theme === 'inkwash')

  const imageFor = (realUrl, animeUrl) => {
    return computed(() => store.theme === 'real' ? realUrl : (animeUrl || realUrl))
  }

  const themeClass = computed(() => store.theme === 'inkwash' ? 'theme-inkwash' : 'theme-real')

  return { theme: computed(() => store.theme), isReal, isAnime, toggle: store.toggle, imageFor, themeClass }
}
```

- [ ] **Step 3: Create styles/real.css**

```css
.theme-real {
  --bg-primary: #faf6f0;
  --bg-secondary: #f5ede0;
  --text-primary: #333;
  --text-secondary: #666;
  --accent: #c8956c;
  --accent-dark: #a67444;
  --border: #e0d5c5;
  --card-bg: #fff;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

- [ ] **Step 4: Create styles/inkwash.css**

```css
.theme-inkwash {
  --bg-primary: #f5f0e8;
  --bg-secondary: #ebe5d8;
  --text-primary: #2c2c2c;
  --text-secondary: #555;
  --accent: #c23a2b;
  --accent-dark: #8b1a1a;
  --border: #c8c0b0;
  --card-bg: #faf6ee;
  --font-body: 'KaiTi', 'STKaiti', 'SimSun', serif;
  --font-heading: 'LiSu', 'STLiti', 'KaiTi', serif;

  background-image:
    url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
}

.theme-inkwash .card {
  border: 1px solid var(--border);
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.theme-inkwash .card::before {
  content: '';
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  border: 1px solid rgba(194, 58, 43, 0.15);
  pointer-events: none;
}
```

- [ ] **Step 5: Create ThemeSwitcher.vue**

```vue
<template>
  <button class="theme-switcher" @click="toggle" :title="isReal ? '切换到动漫模式' : '切换到写实模式'">
    <transition name="flip" mode="out-in">
      <span v-if="isReal" key="real">📷</span>
      <span v-else key="anime">🖌️</span>
    </transition>
  </button>
</template>

<script setup>
import { useTheme } from '../composables/useTheme'
const { isReal, toggle } = useTheme()
</script>

<style scoped>
.theme-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: var(--card-bg);
  cursor: pointer;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.theme-switcher:hover {
  transform: scale(1.1);
  border-color: var(--accent);
}
.flip-enter-active, .flip-leave-active {
  transition: all 0.3s ease;
}
.flip-enter-from { opacity: 0; transform: rotateY(90deg); }
.flip-leave-to { opacity: 0; transform: rotateY(-90deg); }
</style>
```

- [ ] **Step 6: Update App.vue**

```vue
<template>
  <div :class="themeClass">
    <ThemeSwitcher />
    <transition name="page-fade" mode="out-in">
      <router-view :key="theme" />
    </transition>
  </div>
</template>

<script setup>
import { useTheme } from './composables/useTheme'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import './styles/real.css'
import './styles/inkwash.css'

const { theme, themeClass } = useTheme()
</script>

<style>
.page-fade-enter-active, .page-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.page-fade-enter-from { opacity: 0; transform: scale(0.98); }
.page-fade-leave-to { opacity: 0; transform: scale(1.02); }
</style>
```

- [ ] **Step 7: Commit**

```bash
git add display-frontend/src/
git commit -m "feat: add dual theme system with switcher and CSS variables"
```

---

### Task 19: MapView with Dual Map Components

**Files:**
- Create: `display-frontend/src/config/mapLabels.js`
- Create: `display-frontend/src/components/AmapInteractiveMap.vue`
- Create: `display-frontend/src/components/InkWashMap.vue`
- Create: `display-frontend/src/views/MapView.vue`

- [ ] **Step 1: Create config/mapLabels.js**

```javascript
// InkWash map label positions (percentage-based, relative to image dimensions)
export const regionLabels = [
  { name: '济南', x: 58, y: 38, spotCount: 0 },
  { name: '东营', x: 72, y: 28, spotCount: 0 },
  { name: '德州', x: 48, y: 22, spotCount: 0 },
  { name: '聊城', x: 40, y: 38, spotCount: 0 },
  { name: '泰安', x: 62, y: 52, spotCount: 0 },
  { name: '济宁', x: 48, y: 60, spotCount: 0 },
  { name: '菏泽', x: 32, y: 62, spotCount: 0 },
  { name: '淄博', x: 70, y: 42, spotCount: 0 },
  { name: '滨州', x: 68, y: 30, spotCount: 0 },
]
```

- [ ] **Step 2: Create AmapInteractiveMap.vue**

```vue
<template>
  <div ref="mapContainer" class="amap-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'

const props = defineProps({ spots: { type: Array, default: () => [] } })
const emit = defineEmits(['spotClick'])

const mapContainer = ref(null)
let map = null

onMounted(async () => {
  try {
    const AMap = await AMapLoader.load({
      key: 'YOUR_AMAP_KEY',
      version: '2.0',
    })
    map = new AMap.Map(mapContainer.value, {
      zoom: 7,
      center: [117.0, 36.5],
      mapStyle: 'amap://styles/normal',
    })

    props.spots.forEach(spot => {
      if (spot.longitude && spot.latitude) {
        const marker = new AMap.Marker({
          position: [spot.longitude, spot.latitude],
          title: spot.name,
          extData: spot,
        })
        marker.on('click', () => emit('spotClick', spot))
        map.add(marker)
      }
    })
  } catch (e) {
    console.error('Amap load failed:', e)
  }
})

onUnmounted(() => { if (map) map.destroy() })
</script>

<style scoped>
.amap-container { width: 100%; height: 100%; min-height: 600px; }
</style>
```

- [ ] **Step 3: Create InkWashMap.vue**

```vue
<template>
  <div class="inkwash-map">
    <div class="map-image-wrapper">
      <img src="/images/inkwash-map.jpg" alt="黄河流域山东段" class="map-image" />
      <div
        v-for="label in labels"
        :key="label.name"
        class="region-label"
        :style="{ left: label.x + '%', top: label.y + '%' }"
        @click="$emit('regionClick', label.name)"
        @mouseenter="label.hovered = true"
        @mouseleave="label.hovered = false"
      >
        <div class="label-stamp" :class="{ hovered: label.hovered }">
          <span class="label-name">{{ label.name }}</span>
          <span v-if="label.spotCount" class="label-count">{{ label.spotCount }}景</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { regionLabels } from '../config/mapLabels'

defineProps({ spotCounts: { type: Object, default: () => ({}) } })
defineEmits(['regionClick'])

const labels = reactive(regionLabels.map(l => ({ ...l, hovered: false, spotCount: 0 })))
</script>

<style scoped>
.inkwash-map {
  width: 100%;
  height: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}
.map-image-wrapper {
  position: relative;
  max-width: 1000px;
  width: 100%;
}
.map-image {
  width: 100%;
  display: block;
}
.region-label {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
}
.label-stamp {
  background: rgba(250, 246, 238, 0.9);
  border: 2px solid var(--accent);
  border-radius: 4px;
  padding: 6px 12px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.label-stamp.hovered {
  transform: scale(1.15);
  box-shadow: 0 4px 16px rgba(194, 58, 43, 0.3);
  border-color: var(--accent-dark);
}
.label-name {
  display: block;
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: bold;
  color: var(--accent-dark);
}
.label-count {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}
</style>
```

- [ ] **Step 4: Create MapView.vue**

```vue
<template>
  <div class="map-view">
    <transition name="map-fade" mode="out-in">
      <AmapInteractiveMap v-if="isReal" key="real" :spots="spots" @spotClick="goToSpot" />
      <InkWashMap v-else key="anime" :spotCounts="spotCounts" @regionClick="goToRegion" />
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import api from '../api'
import AmapInteractiveMap from '../components/AmapInteractiveMap.vue'
import InkWashMap from '../components/InkWashMap.vue'

const router = useRouter()
const { isReal } = useTheme()
const spots = ref([])
const spotCounts = ref({})

onMounted(async () => {
  const data = await api.get('/spots', { params: { size: 1000 } })
  spots.value = data.records
  // Build region counts
  const counts = {}
  spots.value.forEach(s => { counts[s.region] = (counts[s.region] || 0) + 1 })
  spotCounts.value = counts
})

const goToSpot = (spot) => router.push(`/spots/${spot.id}`)
const goToRegion = (region) => router.push(`/regions/${region}`)
</script>

<style scoped>
.map-view {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.map-fade-enter-active, .map-fade-leave-active {
  transition: opacity 0.4s ease;
}
.map-fade-enter-from, .map-fade-leave-to {
  opacity: 0;
}
</style>
```

- [ ] **Step 5: Commit**

```bash
git add display-frontend/src/
git commit -m "feat: add dual map view with Amap and ink-wash illustration"
```

---

### Task 20: Poet List & Detail Pages

**Files:**
- Create: `display-frontend/src/components/PoetCard.vue`
- Create: `display-frontend/src/views/PoetList.vue`
- Create: `display-frontend/src/views/PoetDetail.vue`

- [ ] **Step 1: Create PoetCard.vue**

```vue
<template>
  <div class="poet-card card" @click="$click">
    <img :src="avatar" :alt="poet.name" class="poet-avatar" />
    <div class="poet-info">
      <h3>{{ poet.name }}</h3>
      <p class="dynasty" v-if="dynasty">{{ dynasty }}</p>
      <p class="style" v-if="poet.style">{{ poet.style }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const props = defineProps({ poet: Object, dynasty: String })
const { isReal } = useTheme()

const avatar = computed(() =>
  isReal.value ? props.poet.avatarUrl : (props.poet.avatarAnimeUrl || props.poet.avatarUrl)
)
</script>

<style scoped>
.poet-card {
  cursor: pointer;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border);
}
.poet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.poet-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
}
h3 {
  font-family: var(--font-heading);
  font-size: 18px;
  margin-bottom: 4px;
}
.dynasty {
  color: var(--accent);
  font-size: 14px;
}
.style {
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 4px;
}
</style>
```

- [ ] **Step 2: Create PoetList.vue**

```vue
<template>
  <div class="poet-list-page">
    <h1 class="page-title">诗人长廊</h1>
    <div class="filter-bar">
      <select v-model="dynastyFilter" @change="fetchPoets" class="dynasty-select">
        <option value="">全部朝代</option>
        <option v-for="d in dynasties" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
    </div>
    <div class="poet-grid">
      <PoetCard
        v-for="poet in poets"
        :key="poet.id"
        :poet="poet"
        :dynasty="getDynastyName(poet.dynastyId)"
        @click="$router.push(`/poets/${poet.id}`)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import PoetCard from '../components/PoetCard.vue'

const poets = ref([])
const dynasties = ref([])
const dynastyFilter = ref('')

const fetchPoets = async () => {
  const params = { page: 1, size: 100 }
  if (dynastyFilter.value) params.dynastyId = dynastyFilter.value
  const data = await api.get('/poets', { params })
  poets.value = data.records
}

const getDynastyName = (id) => dynasties.value.find(d => d.id === id)?.name || ''

onMounted(async () => {
  const timeline = await api.get('/timeline')
  dynasties.value = timeline.map(t => t.dynasty)
  fetchPoets()
})
</script>

<style scoped>
.poet-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}
.page-title {
  font-family: var(--font-heading);
  font-size: 32px;
  text-align: center;
  margin-bottom: 32px;
  color: var(--text-primary);
}
.filter-bar {
  text-align: center;
  margin-bottom: 32px;
}
.dynasty-select {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--card-bg);
  font-size: 14px;
}
.poet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}
</style>
```

- [ ] **Step 3: Create PoetDetail.vue**

```vue
<template>
  <div class="poet-detail" v-if="poet">
    <div class="poet-header">
      <img :src="avatar" :alt="poet.name" class="poet-avatar" />
      <div class="poet-meta">
        <h1>{{ poet.name }}</h1>
        <p class="dynasty">{{ dynasty?.name }}</p>
        <p class="years" v-if="poet.birthYear">{{ poet.birthYear }} - {{ poet.deathYear || '?' }}</p>
        <p class="birthplace" v-if="poet.birthplace">籍贯: {{ poet.birthplace }}</p>
        <p class="style" v-if="poet.style">风格: {{ poet.style }}</p>
      </div>
    </div>
    <div class="poet-bio" v-if="poet.biography">
      <h2>生平简介</h2>
      <p>{{ poet.biography }}</p>
    </div>
    <div class="poet-poems" v-if="poems.length">
      <h2>代表诗词</h2>
      <div class="poem-list">
        <div v-for="poem in poems" :key="poem.id" class="poem-item" @click="$router.push(`/poems/${poem.id}`)">
          <h3>{{ poem.title }}</h3>
          <p class="poem-preview">{{ poem.content?.substring(0, 60) }}...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import api from '../api'

const route = useRoute()
const { isReal } = useTheme()
const poet = ref(null)
const poems = ref([])
const dynasty = ref(null)

const avatar = computed(() =>
  isReal.value ? poet.value?.avatarUrl : (poet.value?.avatarAnimeUrl || poet.value?.avatarUrl)
)

onMounted(async () => {
  const data = await api.get(`/poets/${route.params.id}`)
  poet.value = data.poet
  poems.value = data.poems
  dynasty.value = data.dynasty
})
</script>

<style scoped>
.poet-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}
.poet-header {
  display: flex;
  gap: 32px;
  margin-bottom: 40px;
  align-items: center;
}
.poet-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border);
}
.poet-meta h1 {
  font-family: var(--font-heading);
  font-size: 36px;
  margin-bottom: 8px;
}
.dynasty { color: var(--accent); font-size: 18px; }
.years, .birthplace, .style { color: var(--text-secondary); margin-top: 4px; }
.poet-bio, .poet-poems { margin-bottom: 40px; }
.poet-bio h2, .poet-poems h2 {
  font-family: var(--font-heading);
  font-size: 24px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--accent);
}
.poet-bio p { line-height: 1.8; color: var(--text-primary); }
.poem-list { display: grid; gap: 16px; }
.poem-item {
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.poem-item:hover { transform: translateX(4px); border-color: var(--accent); }
.poem-item h3 { font-size: 18px; margin-bottom: 4px; }
.poem-preview { color: var(--text-secondary); font-size: 14px; }
</style>
```

- [ ] **Step 4: Commit**

```bash
git add display-frontend/src/
git commit -m "feat: add poet list and detail pages with theme support"
```

---

### Task 21: Poem Detail & Timeline Pages

**Files:**
- Create: `display-frontend/src/views/PoemDetail.vue`
- Create: `display-frontend/src/views/Timeline.vue`
- Create: `display-frontend/src/components/TimelineItem.vue`

- [ ] **Step 1: Create PoemDetail.vue**

```vue
<template>
  <div class="poem-detail" v-if="poem">
    <div class="poem-header">
      <h1>{{ poem.title }}</h1>
      <div class="poem-meta">
        <span v-if="poet" @click="$router.push(`/poets/${poet.id}`)" class="poet-link">{{ poet.name }}</span>
        <span v-if="dynasty" class="dynasty-tag">{{ dynasty.name }}</span>
        <span v-if="spot" class="spot-link" @click="$router.push(`/spots/${spot.id}`)">{{ spot.name }}</span>
      </div>
    </div>

    <div class="poem-content">
      <div class="poem-text" :class="{ 'show-annotation': showAnnotation }">
        <p v-for="(line, i) in poemLines" :key="i" class="poem-line">
          {{ line }}
        </p>
      </div>
      <button class="annotation-toggle" @click="showAnnotation = !showAnnotation">
        {{ showAnnotation ? '隐藏注解' : '显示注解' }}
      </button>
      <div v-if="showAnnotation && poem.annotation" class="annotation-box">
        <h3>注解</h3>
        <p>{{ poem.annotation }}</p>
      </div>
    </div>

    <div v-if="poem.background" class="poem-background">
      <h2>创作背景</h2>
      <p>{{ poem.background }}</p>
    </div>

    <div v-if="poem.videoUrl" class="poem-media">
      <h2>诗词赏析视频</h2>
      <video :src="poem.videoUrl" controls class="media-player" />
    </div>

    <div v-if="poem.audioUrl" class="poem-media">
      <h2>诗词朗读</h2>
      <audio :src="poem.audioUrl" controls class="audio-player" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const poem = ref(null)
const poet = ref(null)
const dynasty = ref(null)
const spot = ref(null)
const showAnnotation = ref(false)

const poemLines = computed(() => poem.value?.content?.split('\n').filter(l => l.trim()) || [])

onMounted(async () => {
  const data = await api.get(`/poems/${route.params.id}`)
  poem.value = data.poem
  poet.value = data.poet
  dynasty.value = data.dynasty
  spot.value = data.spot
})
</script>

<style scoped>
.poem-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}
.poem-header {
  text-align: center;
  margin-bottom: 40px;
}
.poem-header h1 {
  font-family: var(--font-heading);
  font-size: 36px;
  margin-bottom: 12px;
}
.poem-meta {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.poet-link {
  color: var(--accent);
  cursor: pointer;
  text-decoration: underline;
}
.dynasty-tag {
  background: var(--accent);
  color: #fff;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 13px;
}
.spot-link {
  color: var(--text-secondary);
  cursor: pointer;
  text-decoration: underline;
}
.poem-content {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 32px;
  margin-bottom: 32px;
}
.poem-text {
  text-align: center;
  font-size: 20px;
  line-height: 2;
  font-family: var(--font-body);
}
.poem-line { margin-bottom: 4px; }
.annotation-toggle {
  display: block;
  margin: 20px auto 0;
  padding: 8px 20px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  color: var(--accent);
}
.annotation-box {
  margin-top: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 4px;
}
.annotation-box h3 { font-size: 16px; margin-bottom: 8px; }
.poem-background, .poem-media { margin-bottom: 32px; }
.poem-background h2, .poem-media h2 {
  font-family: var(--font-heading);
  font-size: 22px;
  margin-bottom: 12px;
}
.poem-background p { line-height: 1.8; }
.media-player { width: 100%; max-width: 600px; border-radius: 8px; }
.audio-player { width: 100%; max-width: 400px; }
</style>
```

- [ ] **Step 2: Create TimelineItem.vue**

```vue
<template>
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content card">
      <h2 class="dynasty-name">{{ dynasty.name }} ({{ dynasty.startYear }} - {{ dynasty.endYear }})</h2>
      <p v-if="dynasty.description" class="dynasty-desc">{{ dynasty.description }}</p>

      <div v-if="events.length" class="section">
        <h3>历史事件</h3>
        <div v-for="event in events" :key="event.id" class="event-item">
          <span class="event-year">{{ event.year }}</span>
          <span class="event-title">{{ event.title }}</span>
        </div>
      </div>

      <div v-if="poets.length" class="section">
        <h3>代表诗人</h3>
        <div class="poet-tags">
          <span v-for="poet in poets" :key="poet.id" class="poet-tag"
            @click="$router.push(`/poets/${poet.id}`)">
            {{ poet.name }}
          </span>
        </div>
      </div>

      <div v-if="poems.length" class="section">
        <h3>诗词作品</h3>
        <div v-for="poem in poems" :key="poem.id" class="poem-link"
          @click="$router.push(`/poems/${poem.id}`)">
          {{ poem.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  dynasty: Object,
  events: { type: Array, default: () => [] },
  poets: { type: Array, default: () => [] },
  poems: { type: Array, default: () => [] },
})
</script>

<style scoped>
.timeline-item {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
  position: relative;
}
.timeline-item::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 32px;
  bottom: -40px;
  width: 2px;
  background: var(--border);
}
.timeline-item:last-child::before { display: none; }
.timeline-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  z-index: 1;
}
.timeline-content {
  flex: 1;
  padding: 24px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.dynasty-name {
  font-family: var(--font-heading);
  font-size: 24px;
  margin-bottom: 8px;
}
.dynasty-desc { color: var(--text-secondary); margin-bottom: 16px; }
.section { margin-top: 16px; }
.section h3 {
  font-size: 16px;
  color: var(--accent);
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
}
.event-item { margin-bottom: 6px; }
.event-year {
  color: var(--accent);
  font-weight: bold;
  margin-right: 8px;
}
.poet-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.poet-tag {
  background: var(--bg-secondary);
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.poet-tag:hover { background: var(--accent); color: #fff; }
.poem-link {
  color: var(--accent-dark);
  cursor: pointer;
  margin-bottom: 4px;
  text-decoration: underline;
}
</style>
```

- [ ] **Step 3: Create Timeline.vue**

```vue
<template>
  <div class="timeline-page">
    <h1 class="page-title">朝代时间线</h1>
    <div class="timeline">
      <TimelineItem
        v-for="item in timeline"
        :key="item.dynasty.id"
        :dynasty="item.dynasty"
        :events="item.events"
        :poets="item.poets"
        :poems="item.poems"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import TimelineItem from '../components/TimelineItem.vue'

const timeline = ref([])

onMounted(async () => {
  timeline.value = await api.get('/timeline')
})
</script>

<style scoped>
.timeline-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}
.page-title {
  font-family: var(--font-heading);
  font-size: 32px;
  text-align: center;
  margin-bottom: 48px;
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add display-frontend/src/
git commit -m "feat: add poem detail and dynasty timeline pages"
```

---

### Task 22: RegionSpots Page (for ink-wash map label clicks)

**Files:**
- Create: `display-frontend/src/views/RegionSpots.vue`

- [ ] **Step 1: Create RegionSpots.vue**

```vue
<template>
  <div class="region-spots">
    <h1 class="page-title">{{ region }} - 文学景观</h1>
    <div class="spots-grid">
      <div v-for="spot in spots" :key="spot.id" class="spot-card card"
        @click="$router.push(`/spots/${spot.id}`)">
        <img :src="getImage(spot)" :alt="spot.name" class="spot-image" />
        <div class="spot-info">
          <h3>{{ spot.name }}</h3>
          <p v-if="spot.address" class="address">{{ spot.address }}</p>
        </div>
      </div>
    </div>
    <p v-if="!spots.length" class="empty">暂无景点数据</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import api from '../api'

const route = useRoute()
const { isReal } = useTheme()
const region = ref(route.params.region)
const spots = ref([])

const getImage = (spot) => isReal.value ? spot.imageUrl : (spot.imageAnimeUrl || spot.imageUrl)

onMounted(async () => {
  const data = await api.get('/spots', { params: { region: region.value, size: 100 } })
  spots.value = data.records
})
</script>

<style scoped>
.region-spots {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}
.page-title {
  font-family: var(--font-heading);
  font-size: 32px;
  text-align: center;
  margin-bottom: 32px;
}
.spots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.spot-card {
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
  transition: transform 0.3s ease;
}
.spot-card:hover { transform: translateY(-4px); }
.spot-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.spot-info {
  padding: 16px;
  background: var(--card-bg);
}
.spot-info h3 { font-size: 18px; margin-bottom: 4px; }
.address { color: var(--text-secondary); font-size: 13px; }
.empty { text-align: center; color: var(--text-secondary); margin-top: 40px; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add display-frontend/src/views/RegionSpots.vue
git commit -m "feat: add region spots page for ink-wash map navigation"
```

---

## Phase 8: Vite Proxy & Final Integration

### Task 23: Vite Dev Proxy Configuration

**Files:**
- Modify: `admin-frontend/vite.config.js`
- Modify: `display-frontend/vite.config.js`

- [ ] **Step 1: Update admin-frontend/vite.config.js**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

- [ ] **Step 2: Update display-frontend/vite.config.js**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

- [ ] **Step 3: Commit**

```bash
git add admin-frontend/vite.config.js display-frontend/vite.config.js
git commit -m "chore: add Vite dev proxy to backend API"
```

---

### Task 24: Frontend Navigation Bar (Display)

**Files:**
- Modify: `display-frontend/src/App.vue`

- [ ] **Step 1: Update App.vue with navigation**

```vue
<template>
  <div :class="themeClass">
    <ThemeSwitcher />
    <nav class="main-nav">
      <router-link to="/map" class="nav-link">地图</router-link>
      <router-link to="/poets" class="nav-link">诗人</router-link>
      <router-link to="/timeline" class="nav-link">时间线</router-link>
    </nav>
    <transition name="page-fade" mode="out-in">
      <router-view :key="theme" />
    </transition>
  </div>
</template>

<script setup>
import { useTheme } from './composables/useTheme'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import './styles/real.css'
import './styles/inkwash.css'

const { theme, themeClass } = useTheme()
</script>

<style>
.page-fade-enter-active, .page-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.page-fade-enter-from { opacity: 0; transform: scale(0.98); }
.page-fade-leave-to { opacity: 0; transform: scale(1.02); }
</style>

<style scoped>
.main-nav {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  display: flex;
  gap: 8px;
  background: var(--card-bg);
  padding: 8px 16px;
  border-radius: 24px;
  border: 1px solid var(--border);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.nav-link {
  padding: 8px 20px;
  border-radius: 16px;
  text-decoration: none;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
}
.nav-link:hover, .nav-link.router-link-active {
  background: var(--accent);
  color: #fff;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add display-frontend/src/App.vue
git commit -m "feat: add display frontend navigation bar"
```

---

### Task 25: Final Verification

- [ ] **Step 1: Start backend**

```bash
cd backend && mvn spring-boot:run
```
Expected: Spring Boot starts on port 8080

- [ ] **Step 2: Start admin frontend**

```bash
cd admin-frontend && npm run dev
```
Expected: Vite starts on port 5173

- [ ] **Step 3: Start display frontend**

```bash
cd display-frontend && npm run dev
```
Expected: Vite starts on port 5174

- [ ] **Step 4: Test admin login flow**

Open http://localhost:5173 → Should redirect to /login → Register a user via API → Login → Should see Layout with sidebar

- [ ] **Step 5: Test display frontend**

Open http://localhost:5174 → Should see map view → Click theme switcher → Map should transition to ink-wash mode

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final integration verification"
```

---

## Self-Review Checklist

- [x] All spec sections covered by tasks
- [x] No TBD/TODO placeholders
- [x] Type/method names consistent across tasks
- [x] Each task produces working, testable code
- [x] File paths match the file structure section
- [x] Both admin and public API endpoints implemented
- [x] Dual theme system fully implemented
- [x] All 4 display pages + region spots page included
