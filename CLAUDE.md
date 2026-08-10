# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**SJG** - 齐鲁文化数字人文平台（黄河流域山东段文学景观）。展示诗人、诗词、景点、历史事件的数字人文展示系统，含 AI 对话助手"AI小文"。

## 项目结构与技术栈

| 目录 | 技术栈 | 端口 | 说明 |
|---|---|---|---|
| `backend/` | Spring Boot 3.2.5 + Java 17 + MyBatis-Plus + MySQL | 8080 | 后端 API |
| `admin-frontend/` | Vue 3 + Vite + Element Plus + Pinia | 5173 | 后台管理 |
| `display-v2/` | Vue 3 + Vite + ECharts + AntV G6 + Three.js | 5175 | 展示前端（主力） |
| `sjg-datav/` | React 19 + TypeScript + Vite + React Three Fiber + ECharts + zustand/swr | 5180 | 数据大屏（display-v2 有悬浮按钮入口） |
| `scripts/` | Python | - | 图片生成、DB migration 脚本 |
| `else/` | - | - | 参考素材与数据采集文档，不参与构建（含 `sc-datav-main` DataV 参考工程） |

## 常用命令

### 后端（backend/）
```bash
cd backend
./mvnw spring-boot:run          # 启动开发服务
./mvnw test                     # 运行测试
./mvnw test -Dtest=PoemAnalysisServiceTest  # 运行单个测试类
./mvnw package -DskipTests      # 打包（跳过测试）
```

### 前端（各 Vue/Next 项目通用；sjg-datav 为 React+TS，`build` 先跑 `tsc -b`）
```bash
cd <project-dir>
npm install
npm run dev       # 开发服务器
npm run build     # 生产构建
npm run preview   # 预览构建产物
```

### display-v2 测试与单测
display-v2 用 Node 内置 test runner（非 Vitest），测试在 `tests/` 目录：
```bash
cd display-v2
npm test          # 跑全部测试 + 覆盖率
npm run test:unit # 跑全部测试（无覆盖率）
node --test tests/foo.test.js   # 跑单个测试文件
```

## 架构要点

### 后端 API 分层与鉴权
- **`controller/admin/`** - 管理端 CRUD。`/api/admin/**` 的 GET 请求需登录，非 GET（写操作）需 `admin` 角色（见 `SecurityConfig.java`）。
- **`controller/pub/`** - 公开只读 API，无需认证（`/api/public/**`）。展示前端全部走这里。
- **`controller/`** 根目录下 `AuthController` 处理 `/api/auth/register`、`/api/auth/login`（permitAll）。
- **`service/`** - 业务逻辑：`LlmClient`（DeepSeek SSE 流式调用）、`ChatService`（RAG + 限流编排）、`RagRetrievalService`、`OssService`（阿里云 OSS）、`PoemAnalysisService`、`PoetRelationService`。
- **`mapper/`** - MyBatis-Plus Mapper 接口；XML 在 `resources/mapper/`。
- **`entity/`** - 数据实体：Poet, Poem, PoemAnalysis, ScenicSpot, Event, Dynasty, PoetRelation, PoemEvent, User。

### 统一返回格式
所有 API 返回 `Result<T>`：`{ code: 200, message: "操作成功", data: ... }`。前端 axios 拦截器（`display-v2/src/api/index.js`）自动解包 `data`，业务错误（`code !== 200`）转为 rejected Promise；`admin-frontend` 同样自动解包。

### 认证机制
- JWT token（HS256），有效期 24h，密钥与过期时间在 `application.yml` 的 `jwt.*`。
- 前端通过 `Authorization: Bearer <token>` 请求头传递。
- admin 前端在 localStorage 存储 token 和 role；后端从 token 解析 username 后查 `UserMapper` 还原权限。
- 公开前端（display-*）不需要认证。

### AI 小文（LLM 对话）
- 后端代理调用 DeepSeek API（OpenAI 兼容格式），SSE 流式返回。配置见 `application.yml` 的 `llm.*`：默认模型 `deepseek-v4-flash`，`temperature 0.6`，超时 60s。
- system prompt 内嵌 `{rag_context}` 占位符，由 `RagRetrievalService` 检索（默认 top 3）填充。
- IP 级滑动窗口限流：默认 60s 内 10 次（`llm.rate-limit.*`）。
- 前端通过 `POST /api/public/chat` 提交，接收 SSE 事件流；`AiChatBox.vue` 组件挂载于 `MapView`。

### 双主题系统（real / inkwash）
display-v2 支持双主题：`real`（现代实景风）与 `inkwash`（水墨风）。
- **样式层**：CSS 变量 + `.theme-real` / `.theme-inkwash` 类。`display-v2/src/styles/` 下 `variables.css`（token）、`real.css`、`inkwash.css`。主题类上提到 `<html>`，使 fixed/teleport 出 `.app-root` 的元素也吃到 token。
- **状态层**：`display-v2/src/composables/useTheme.js` 是**零依赖单例**（不用 Pinia）的响应式主题状态，持久化到 `localStorage('sjg-theme')`。提供 `imageFor(realUrl, animeUrl)` 帮主题选图。
- **图片层**：后端实体有 `imageUrl` / `imageAnimeUrl` 双字段（诗人 `avatarUrl`/`avatarAnimeUrl` 同理）。`useImage.js` 负责解析（支持 JSON 数组字符串、裸 URL、本地相对路径）并按主题挑选。⚠️ 当前 `useImage.js` 用硬编码本地文件白名单 + `_anime` 后缀 hack 兜底，OSS 迁移与 ThemeProfile 重构进行中（见 `docs/plans/2026-08-05-*`）。

### 双风格媒体素材（display-v2）
- 素材落在 `display-v2/public/media/{real,inkwash}/`，路径与后期 OSS 同构（bucket 内保持相同相对路径），前端通过 `.env` 的 `VITE_OSS_BUCKET_URL` 切换，零改代码。
- AI 生成素材有已知坑（output_dir 不可靠、默认带水印、视频体积过大），生成后需 ffmpeg 后处理。完整流程见 `.workbuddy/skills/sjg-media-assets/SKILL.md`（含裁水印、压缩、导 poster 的 ffmpeg 命令）。生成前需告知用户积分消耗。

### display-v2 前端结构要点
- **路由**（`src/router/index.js`）：`/` 重定向到 `/map`（地图即首页）。其余：`/poets`、`/poets/all`、`/poets/:id`、`/poems/:id`、`/spots/:id`、`/timeline`、`/regions/:region`。全部懒加载。
- **API 层**：`src/api/index.js` 单 axios 实例，baseURL `/api/public`，10s 超时。
- **composables**：`useTheme`（主题）、`useImage`（图片解析）、`useReveal`（滚动入场动画，GSAP）、`usePoetEnrichment` / `useCityEnrichment`（后端字段 → 前端展示增强）。
- **首页组件**：`src/components/homepage/` 下按类型组织（`*Hero`、`*Card`、`*Rail`、`SkeletonBlock`、`ErrorState` 等）。
- **构建分包**：`vite.config.js` 的 `manualChunks` 把 echarts/g6/three 拆成独立 vendor chunk（`chunkSizeWarningLimit` 提到 1500）。改可视化模块时注意别把三者打进同一个 chunk。
- **mock 兜底**：`src/config/mockFallbackDb.js` 等为后端不可用时的降级数据，属过渡产物。

### 数据库与 Migration
- MySQL 远程实例：`47.104.207.58:3306/sjg`，可通过 `.mcp.json` 配置的 `mysql_query` MCP 工具只读查询（凭证已 gitignore）。
- Schema 定义在 `backend/src/main/resources/schema.sql`（+ `schema_utf8.sql`）。
- Migration：`backend/src/main/resources/db/migration/` 与 `display-v2/migrations/`，文件以 `v4_`、`v5_` 版本前缀命名（如 `v4_poet_relation.sql`、`v5_poem_analysis.sql`）。
- ORM 用 MyBatis-Plus，开启 `map-underscore-to-camel-case`。

### 前端代理配置
所有 Vue 前端的 vite.config.js 配置了 `/api` -> `http://localhost:8080` 的代理。开发时需后端同时运行。

## 文档与记忆
- `docs/data_interfaces.md` - 完整 API 接口与实体字段规范（公开展示端 + 管理端）。
- `docs/superpowers/plans/` 与 `docs/superpowers/specs/` - 历史设计文档与实现计划（按日期命名）。
- `docs/plans/` - 当前进行中的任务级进度追踪（`[x]`/`[ ]`/`[~]`/`⏸` 标注）。
- `.workbuddy/memory/` - 按日期记录的工作记忆；`.workbuddy/skills/` - 项目专用技能（如媒体素材生成）。

## 注意事项

- 后端启动时会主动清除 SOCKS/HTTP 代理系统属性，避免 Clash 等工具导致 MySQL 和 LLM 连接失败。
- `else/` 目录为参考素材和数据采集文档，不参与构建。
- `.mcp.json` 与 `.claude/` 已 gitignore，是本地 MCP server 配置与 Claude Code 设置。
- `else/sc-datav-main/` 是参考的 DataV 开源工程，勿当成本项目代码修改。
