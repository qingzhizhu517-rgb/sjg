# Railway Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task in the current session.

**Goal:** 使用试用额度部署现有齐鲁文化平台，由代理完成准备、发布和验证；仅首次登录及缺失的账号资料需用户参与。

**Architecture:** Sites 托管三个前端，通过构建变量直接访问 Railway HTTPS API，后端配置 CORS 的 Spring Boot 后端。Railway 同一项目提供 MySQL；保留现有 JWT、OSS 和 LLM 集成。

**Tech Stack:** Java 17、Spring Boot、MySQL、Docker、Vue/Vite、React/Vite、Sites、Railway CLI。

## Task 1: Prepare backend deployment

**Files:** `backend/Dockerfile`、`backend/.dockerignore`、`backend/railway.json`、`backend/src/main/resources/application.yml`、`docs/deployment-railway.md`。

- [x] 创建 Java 17 多阶段镜像与非 root 运行用户。
- [x] 把 `server.port` 从 `8080` 改为 `${PORT:8080}`。
- [x] 为 Railway 添加 Docker 构建、公开朝代接口健康检查与有限重启配置。
- [x] 记录数据库引用、初始化次序、三个前端的接入方式及试用边界。
- [x] 执行 `JAVA_HOME=/opt/homebrew/opt/openjdk@21 mvn -B -ntp -f backend/pom.xml package`，确认测试与 JAR 打包成功。

## Task 2: Verify frontend builds

**Files:** 三个前端各自现有的 `package.json` 与锁文件；安装产物保持 Git 忽略。

- [x] 对 `display-v2`、`admin-frontend`、`sjg-datav` 分别执行 `npm ci --no-audit --no-fund`。
- [x] 对三个目录分别执行 `npm run build`，确认退出码为 0。
- [x] 执行 `git diff --check`，检查部署改动。

## Task 3: Connect and publish

**Files:** 根据真实后端 URL 为三个 Sites 生成的独立发布目录；每站独立保存 `.openai/hosting.json`。

- [x] 用 Railway CLI 浏览器授权登录；确认试用状态，避免开启付费订阅。
- [x] 创建 MySQL 与后端服务，根据已确认的业务快照导入和补齐缺失迁移。
- [x] 设置数据库引用、随机 JWT 密钥及 OSS 环境变量；LLM 凭据缺失，保留明确的未配置状态。
- [x] 发布后端，验证业务健康检查、六类公开接口、三个站点 CORS 和匿名后台 HTTP 401。
- [ ] 真实管理员登录、OSS 上传和 AI 生成：尚缺验收所需管理员凭据与 LLM 密钥。
- [x] 按 Sites 技能创建三个发布目录，配置直接 API 地址、静态 SPA 和正确的大屏入口。
- [x] 发布三个前端并确认平台返回成功；保持私有访问，浏览器验证登录门禁。内容页需所有者登录后验收。
- [x] 记录最终 URL、试用使用量与仍未通过的验收项。

## Self-review

后端部署入口和本地验证不依赖账号授权，先完成。真实建库、密钥配置和发布依赖 Railway 授权及业务数据确认，不能用单元测试代替。首次登录由用户完成，剩余步骤由当前代理顺序执行。
