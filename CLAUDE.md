# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**SJG** — 齐鲁文化数字人文平台（黄河流域山东段文学景观）。展示诗人、诗词、景点、历史事件的数字人文展示系统，含 AI 对话助手"AI小文"。

## 项目结构与技术栈

| 目录 | 技术栈 | 端口 | 说明 |
|---|---|---|---|
| `backend/` | Spring Boot 3.2.5 + Java 17 + MyBatis-Plus + MySQL | 8080 | 后端 API |
| `admin-frontend/` | Vue 3 + Vite + Element Plus + Pinia | 5173 | 后台管理 |
| `display-frontend/` | Vue 3 + Vite + ECharts + 高德地图 | 5175 | 展示前端 v1 |
| `display-v2/` | Vue 3 + Vite + ECharts + AntV G6 + Three.js | 5175 | 展示前端 v2（主力） |
| `display-v3/` | Next.js 16 + React 19 + React Three Fiber | 3000 | 展示前端 v3（实验性） |
| `scripts/` | Python | — | 图片生成、DB migration 脚本 |

## 常用命令

### 后端（backend/）
```bash
cd backend
./mvnw spring-boot:run          # 启动开发服务
./mvnw test                     # 运行测试
./mvnw test -Dtest=PoemAnalysisServiceTest  # 运行单个测试类
./mvnw package -DskipTests      # 打包（跳过测试）
```

### 前端（各 Vue/Next 项目通用）
```bash
cd <project-dir>
npm install
npm run dev       # 开发服务器
npm run build     # 生产构建
npm run preview   # 预览构建产物
```

### display-v3（Next.js）
```bash
cd display-v3
npm run lint      # ESLint 检查
```

## 架构要点

### 后端 API 分层
- **`controller/admin/`** — 管理端 CRUD，需 JWT 认证 + admin 角色
- **`controller/pub/`** — 公开只读 API，无需认证（`/api/public/**`）
- **`service/`** — 业务逻辑，含 `LlmClient`（DeepSeek SSE 流式调用）、`ChatService`（RAG + 限流编排）、`OssService`（阿里云 OSS）
- **`mapper/`** — MyBatis-Plus Mapper 接口
- **`entity/`** — 数据实体：Poet, Poem, PoemAnalysis, ScenicSpot, Event, Dynasty, User, PoetRelation

### 统一返回格式
所有 API 返回 `Result<T>`：`{ code: 200, message: "操作成功", data: ... }`。前端 axios 拦截器自动解包。

### 认证机制
- JWT token（HS256），有效期 24h
- 前端通过 `Authorization: Bearer <token>` 请求头传递
- admin 前端在 localStorage 存储 token 和 role
- 公开前端（display-*）不需要认证

### AI 小文（LLM 对话）
- 后端代理调用 DeepSeek API（OpenAI 兼容格式），SSE 流式返回
- 含 RAG 检索上下文（`RagRetrievalService`）和 IP 级滑动窗口限流
- 前端通过 `POST /api/public/chat` 提交，接收 SSE 事件流

### 前端代理配置
所有 Vue 前端的 vite.config.js 配置了 `/api` → `http://localhost:8080` 的代理。开发时需后端同时运行。

### 主题系统
display-frontend 和 display-v2 支持双主题切换：`theme-real`（现代风格）和 `theme-inkwash`（水墨风格），通过 CSS 变量实现。

### 数据库
- MySQL 远程实例：`47.104.207.58:3306/sjg`
- Schema 定义在 `backend/src/main/resources/schema.sql`
- Migration 文件在 `backend/src/main/resources/db/migration/` 和 `display-v2/migrations/`
- ORM 使用 MyBatis-Plus，开启下划线转驼峰

### OSS 静态资源
图片等静态资源存储在阿里云 OSS bucket `shandong-lit-landscape`。display-v2 通过 `.env` 中的 `VITE_OSS_BUCKET_URL` 配置访问地址。

## 注意事项

- 后端启动时会主动清除 SOCKS/HTTP 代理系统属性，避免 Clash 等工具导致 MySQL 和 LLM 连接失败
- `else/` 目录为参考素材和数据采集文档，不参与构建
- `.mcp.json` 已 gitignore，是本地 MCP server 配置
