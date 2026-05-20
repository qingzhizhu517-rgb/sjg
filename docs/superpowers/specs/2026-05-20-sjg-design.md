# SJG 数字人文平台 — 系统设计文档

**项目全称**: 数字人文视域下黄河流域（山东段）文学景观构建与教学应用研究

**日期**: 2026-05-20

**版本**: v1.1（含双主题切换系统）

---

## 1. 项目概述

### 1.1 目标

为中小学、大学文学教学提供可视化工具，展示黄河流域山东段（9个地区）的诗人、诗词、景点、历史事件之间的关联关系。

### 1.2 范围

- **地理范围**: 黄河流域山东段，覆盖9个地区（菏泽、济宁、泰安、聊城、济南、德州、滨州、淄博、东营）
- **数据范围**: 诗人、景点、诗词、历史事件及它们之间的关联
- **用户**: 管理员（数据维护）、公众/学生（浏览学习）

### 1.3 技术栈

| 层级 | 技术选型 |
|------|---------|
| 后端 | Spring Boot 3.x + Java 17 |
| ORM | MyBatis-Plus |
| 数据库 | MySQL |
| 前端框架 | Vue 3 + Composition API + Vite |
| 管理端UI | Element Plus |
| 展示端UI | 自定义 + Amap JS API |
| 地图 | 高德地图 (Amap) |
| 文件存储 | 阿里云 OSS |
| 认证 | Spring Security + JWT |

---

## 2. 架构设计

### 2.1 整体架构

采用单仓库、单后端、双前端架构。后端按功能分包，控制器层分为 admin（需认证）和 public（公开只读）两个包。

```
sjg/
├── backend/                    # Spring Boot 3.x
│   ├── src/main/java/com/sjg/
│   │   ├── config/             # Security, CORS, MyBatis 配置
│   │   ├── controller/
│   │   │   ├── admin/          # 认证保护的 CRUD 接口
│   │   │   └── public/         # 公开只读接口
│   │   ├── entity/             # 数据库实体
│   │   ├── mapper/             # MyBatis Mapper
│   │   ├── service/            # 业务逻辑
│   │   │   ├── core/           # V1 核心服务
│   │   │   ├── sentiment/      # 情感分析服务 (V1.5)
│   │   │   ├── ai/             # AI 助手服务 (V1.5)
│   │   │   └── oss/            # 文件存储服务
│   │   ├── dto/                # 请求/响应 DTO
│   │   └── util/               # JWT, Excel 解析工具
│   └── pom.xml
├── admin-frontend/             # Vue 3 + Element Plus
│   ├── src/
│   │   ├── views/              # 诗人/景点/诗词/事件 CRUD 页面
│   │   ├── components/         # 表格、表单、上传组件
│   │   ├── api/                # Axios API 层
│   │   └── router/             # 含路由守卫
│   └── package.json
├── display-frontend/           # Vue 3 + Amap + 自定义 UI
│   ├── src/
│   │   ├── views/              # 地图/诗人/诗词/时间线 页面
│   │   ├── components/
│   │   │   ├── map/            # AmapInteractiveMap + InkWashMap 组件
│   │   │   ├── theme/          # ThemeSwitcher 切换按钮组件
│   │   │   ├── poet/           # 诗人卡片、头像组件
│   │   │   ├── poem/           # 诗词卡片、注解组件
│   │   │   └── timeline/       # 时间线组件
│   │   ├── stores/             # Pinia (useThemeStore)
│   │   ├── composables/        # useTheme() composable
│   │   ├── styles/             # themes/real.css, themes/inkwash.css
│   │   └── api/                # 公开 API 调用
│   └── package.json
└── docs/
```

### 2.2 设计原则

- V1 聚焦核心功能（CRUD + 展示），预留扩展接口
- 新功能作为独立 service 包接入，不侵入核心逻辑
- 前端页面懒加载，新页面作为独立路由模块
- API 向后兼容，新功能通过新端点添加

---

## 3. 数据库设计

### 3.1 表结构

#### dynasty (朝代)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| name | VARCHAR(50) | 朝代名称 |
| start_year | INT | 起始年份 |
| end_year | INT | 结束年份 |
| description | TEXT | 描述 |

#### poet (诗人)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| name | VARCHAR(100) | 姓名 |
| dynasty_id | BIGINT FK | 所属朝代 |
| birth_year | INT | 出生年份（可空） |
| death_year | INT | 去世年份（可空） |
| birthplace | VARCHAR(200) | 籍贯 |
| biography | TEXT | 生平简介 |
| avatar_url | VARCHAR(500) | 头像 OSS 地址（真实/历史肖像） |
| avatar_anime_url | VARCHAR(500) | 头像 OSS 地址（动漫水墨风格） |
| style | VARCHAR(200) | 诗词风格 |

#### scenic_spot (景点)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| name | VARCHAR(200) | 景点名称 |
| description | TEXT | 景点介绍 |
| longitude | DECIMAL(10,7) | 经度 |
| latitude | DECIMAL(10,7) | 纬度 |
| address | VARCHAR(500) | 地址 |
| image_url | VARCHAR(500) | 图片 OSS 地址（真实照片） |
| image_anime_url | VARCHAR(500) | 图片 OSS 地址（动漫水墨风格） |
| region | VARCHAR(50) | 所属地区（菏泽/济宁/泰安/聊城/济南/德州/滨州/淄博/东营） |

#### poem (诗词)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| title | VARCHAR(200) | 标题 |
| content | TEXT | 内容 |
| poet_id | BIGINT FK | 作者 |
| dynasty_id | BIGINT FK | 所属朝代 |
| spot_id | BIGINT FK | 创作地点（可空） |
| annotation | TEXT | 注解 |
| background | TEXT | 创作背景 |
| audio_url | VARCHAR(500) | 朗读音频 OSS 地址 |
| video_url | VARCHAR(500) | AI 视频 OSS 地址 |
| sentiment_tags | JSON | 情感标签（V1.5 扩展字段） |

#### event (历史事件)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| title | VARCHAR(200) | 事件标题 |
| description | TEXT | 事件描述 |
| dynasty_id | BIGINT FK | 所属朝代 |
| year | INT | 发生年份 |
| significance | TEXT | 历史意义 |
| image_url | VARCHAR(500) | 图片 OSS 地址 |

#### poem_event (诗词-事件关联表)

| 字段 | 类型 | 说明 |
|------|------|------|
| poem_id | BIGINT FK | 诗词 ID |
| event_id | BIGINT FK | 事件 ID |
| PRIMARY KEY | (poem_id, event_id) | 联合主键 |

### 3.2 关系说明

- Poet → Dynasty (多对一)
- Poem → Poet, Dynasty, ScenicSpot (多对一，spot 可空)
- Event → Dynasty (多对一)
- Poem ↔ Event (多对多，通过 poem_event 关联)

### 3.3 V1.5 扩展表

#### ai_conversation (AI 对话记录)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| session_id | VARCHAR(64) | 会话 ID |
| role | VARCHAR(20) | user / assistant |
| content | TEXT | 消息内容 |
| created_at | DATETIME | 创建时间 |

---

## 4. API 设计

### 4.1 管理端 API (`/api/admin/...`)

需 JWT 认证，Header: `Authorization: Bearer <token>`

#### 认证

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 注册管理员 |
| `/api/auth/login` | POST | 登录，返回 JWT |

#### CRUD 通用模式

每个实体遵循统一的 CRUD 模式：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/{entity}` | GET | 分页列表（支持搜索） |
| `/api/admin/{entity}/{id}` | GET | 详情 |
| `/api/admin/{entity}` | POST | 新增 |
| `/api/admin/{entity}/{id}` | PUT | 修改 |
| `/api/admin/{entity}/{id}` | DELETE | 删除 |
| `/api/admin/{entity}/import` | POST | Excel 批量导入 |

实体: `poets`, `spots`, `poems`, `events`

#### 文件上传

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/upload` | POST | 上传文件到 OSS，返回 URL |

### 4.2 公开端 API (`/api/public/...`)

无需认证，只读。

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/public/spots` | GET | 景点列表（含诗词/诗人计数） |
| `/api/public/spots/{id}` | GET | 景点详情（含关联诗词、诗人） |
| `/api/public/poets` | GET | 诗人列表（支持朝代、姓名筛选） |
| `/api/public/poets/{id}` | GET | 诗人详情（含诗词、出行路线） |
| `/api/public/poems` | GET | 诗词搜索（模糊/精准） |
| `/api/public/poems/{id}` | GET | 诗词详情（含注解、媒体） |
| `/api/public/timeline` | GET | 朝代时间线（含事件、诗人） |
| `/api/public/regions` | GET | 9个地区列表及景点数量 |

所有列表端点支持 `page`、`size` 分页参数。搜索端点支持 `keyword` 参数。

### 4.3 V1.5 扩展 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/public/spots/{id}/emotions` | GET | 景点情感时间轴数据 |
| `/api/public/ai/chat` | POST | AI 助手对话（代理调用外部模型） |

---

## 5. 前端设计

### 5.1 管理端 (admin-frontend)

四个 CRUD 页面，每个页面包含表格视图 + 表单弹窗：

**诗人管理**
- 表格: 姓名、朝代、籍贯、风格
- 表单: 完整生平、头像上传 x2（真实肖像 + 动漫水墨肖像，均上传至 OSS）

**景点管理**
- 表格: 名称、地区、地址
- 表单: 介绍、地图选点（点击设置经纬度）、图片上传 x2（真实照片 + 动漫水墨插画）

**诗词管理**
- 表格: 标题、作者、关联景点
- 表单: 内容、注解（富文本）、创作背景、视频/音频 URL

**事件管理**
- 表格: 标题、朝代、年份
- 表单: 描述、历史意义、图片上传

**批量导入**: 每个实体页面有"导入 Excel"按钮，上传后后端解析并返回成功/错误报告。

**共享组件**: `DataTable`（分页、搜索、排序）、`FormDialog`（表单验证、OSS 上传）、`ImportDialog`（文件上传 + 结果展示）

### 5.2 展示端 (display-frontend)

四个 V1 页面，无需登录。**支持双主题切换**（真实风格 ↔ 动漫水墨风格）。

#### 5.2.0 主题切换系统

页面右上角有一个主题切换按钮（毛笔图标 ↔ 相机图标），点击后触发全页流畅切换动画：

- **切换动画**: Vue `<Transition>` 组件实现，300-500ms 淡出+缩放过渡效果
- **状态管理**: Pinia store (`useThemeStore`) 存储当前主题，持久化到 localStorage
- **图片切换**: 每个图片元素根据主题加载不同 URL（`image_url` / `image_anime_url`，`avatar_url` / `avatar_anime_url`）
- **全局样式**: CSS 自定义变量切换配色方案（真实模式：土金色系；动漫模式：水墨灰白色系+朱砂红点缀）
- **字体**: 真实模式用系统默认字体；动漫模式切换为楷体/行书风格字体

**所需素材（每份图片准备两套）:**
- 诗人头像: 真实历史肖像 + AI 生成的动漫水墨风格肖像
- 景点图片: 真实照片 + AI 生成的水墨动漫风格插画
- 地图: 真实用高德地图；动漫用一张 AI 生成的黄河流域山东段水墨风格全景插画
- 背景装饰: 真实模式简洁；动漫模式加水墨晕染边框、宣纸纹理背景

#### 5.2.1 地图视图 (`/map`)

根据当前主题显示不同的地图实现：

**真实模式 — AmapInteractiveMap 组件:**
- 全屏高德地图，居中显示黄河流域山东段
- 9个地区区域标注
- 每个景点自定义标记（含缩略图）
- 点击标记 → 弹窗显示景点名称、缩略图、诗词数量
- 点击"详情" → 跳转景点详情页

**动漫模式 — InkWashMap 组件:**
- 全屏显示 AI 生成的黄河流域山东段水墨风格全景插画（作为背景图）
- 9个市区标签（济南、东营、德州、聊城、泰安、济宁、菏泽、淄博、滨州）以古风印章/牌匾样式叠加在图片对应位置
- 标签使用 CSS `position: absolute` 定位，坐标写在配置文件中（无需经纬度，按图片比例定位）
- 鼠标悬停标签 → 水墨晕开动画 + 显示该地区景点数量
- 点击标签 → 跳转到该地区的景点列表页面

**切换效果**: 点击主题按钮 → 当前地图淡出 → 另一个地图淡入，整体 400ms 过渡。

#### 5.2.2 诗人列表 (`/poets`)
- 诗人卡片网格（头像、姓名、朝代）
- 头像根据主题切换（真实肖像 / 动漫水墨肖像）
- 支持按朝代筛选、姓名搜索
- 点击 → 诗人详情页（生平、诗词列表、出行路线小地图）

#### 5.2.3 诗词详情 (`/poems/:id`)
- 诗词标题、内容
- 逐行注解切换
- 创作背景介绍
- 嵌入式视频播放器（OSS URL）播放 AI 视频
- 音频播放器播放朗读
- 动漫模式下背景切换为宣纸纹理，文字使用楷体

#### 5.2.4 朝代时间线 (`/timeline`)
- 按朝代纵向时间线
- 每个朝代展开显示：事件、相关诗人、该时期创作的诗词
- 点击任意条目 → 跳转详情页
- 动漫模式下时间线使用水墨风格节点和连线

### 5.3 V1.5 扩展页面

**情感时间轴** (`/spots/:id/emotions`)
- 景点详情子页面
- 展示同一景点不同时期诗词的情感变化曲线
- 使用 ECharts 绘制时间轴图表
- 情感维度: 豪放、婉约、幽思、悲壮、恬淡等
- 示例: 大明湖页面展示杜甫(豪放) → 李清照(婉约) → 蒲松龄(幽思) 的情感演变

**AI 助手** (`/ai-assistant`)
- 聊天界面
- 后端代理调用齐鲁文化大模型 / 山东文学大模型 API
- 支持文学问答、创作辅助

### 5.4 设计风格

- 教育用途，简洁温暖
- 响应式但桌面优先
- 展示端注重沉浸感和可读性

**真实模式配色**: 土金色系（呼应黄河主题），暖色调，系统默认字体

**动漫水墨模式配色**: 水墨灰白为主，朱砂红点缀，宣纸纹理背景，楷体/行书字体，水墨晕染边框装饰

---

## 6. V1 范围与后续规划

### V1 (当前版本)

- 完整的管理端 CRUD + Excel 批量导入（含双图片上传：真实 + 动漫）
- 展示端四个核心页面（地图、诗人、诗词、时间线）
- **双主题切换系统**（真实风格 ↔ 动漫水墨风格，含流畅切换动画）
- **双模式地图**（Amap 交互地图 + 水墨插画标签地图）
- JWT 认证
- OSS 文件上传
- 分页、搜索

### V1.5 (后续扩展)

- 情感时间轴功能
- AI 助手集成（齐鲁文化大模型、山东文学大模型）
- 对话记录持久化
- 诗词情感标签数据标注

### V2 (远期)

- 用户系统（学生账号、收藏、笔记）
- 文学地标虚拟地图（借鉴山东文学大模型）
- AI 数字人互动
- 移动端适配

---

## 7. 非功能需求

- **性能**: 公开端接口响应 < 200ms（P95），地图加载 < 3s
- **安全**: 管理端 JWT 认证，密码 BCrypt 加密，CORS 白名单
- **数据**: 支持 10,000+ 诗词数据量，分页查询
- **存储**: OSS 存储图片、视频、音频文件
