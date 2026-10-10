# Railway 试用部署说明

采用 Sites 托管三个前端、Railway 同一项目运行 Java 后端和 MySQL 的方案。保留现有业务架构，减少试用额度中的静态资源流量与前端容器成本。

## 已准备的后端入口

- 服务根目录为 `backend`，Dockerfile 与 `railway.json` 都在该目录。
- 容器使用 Java 17，以非 root 用户运行 Spring Boot。
- HTTP 端口读取平台的 `PORT`，本地未设置时仍为 8080。
- 健康检查为 `GET /api/public/dynasties`，该接口同时验证业务数据库查询；必须先完成数据库初始化再发布后端。
- JVM 堆上限为容器可用内存的 65%。实际总内存与并发能力仍需通过部署后的指标确认。

## 平台连接与环境变量

首次登录 Railway 需要账号持有人完成浏览器授权。之后可以用 CLI 创建项目、MySQL、后端服务和域名。已有 GitHub 登录不等于 Railway 已授权。

在后端服务的 Variables 中设置以下内容；假设数据库服务名为 `MySQL`：

```text
SPRING_DATASOURCE_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
```

这些引用在 Railway 控制台解析，不要将其当作 shell 命令执行。还需通过平台变量配置：

| 变量 | 用途 |
| --- | --- |
| `JWT_SECRET` | 新生成的高强度随机值，用于现有业务 JWT |
| `LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL` | AI 对话、诗词生成与赏析 |
| `OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET` | 现有阿里云媒体上传 |
| `CORS_ALLOWED_ORIGINS` | 最终发布的前端域名，逗号分隔；浏览器直连后端时必需 |

不要将密钥写进代码、此文档、镜像或前端构建变量。仅有平台试用额度不会提供 LLM 调用额度。

## 数据库发布顺序

1. 创建 Railway MySQL，确认服务已就绪，并选用已经确认来源和可用性的业务快照。
2. 根据快照现有表和迁移状态，应用缺失的 SQL。仓库目前没有自动执行这些 SQL 的 Flyway 依赖，不应将启动后端当成完成建库。
3. 核验 `source_document`、`content_source_link`、`content_review`、`ai_audit_log`、`learning_task` 和 `learning_submission` 等当前业务所需表。
4. 检查公开内容的 `published` 状态。历史内容会被治理迁移设置为待审核，不能为了显示内容直接批量绕过审核。
5. 发布后端，确认健康检查、公开列表、管理员登录、AI 流式输出和上传成功。

## 三个前端

每个前端独立构建并发布到 Sites。三个 Vite 前端通过公开构建变量 `VITE_BACKEND_URL` 直接访问 Railway HTTPS API；Axios 与原生流式 fetch 均使用此地址。后端 `CORS_ALLOWED_ORIGINS` 明确允许三个 Sites 域名。Sites 托管静态 `dist`，不运行 API 代理。

- `display-v2`：主站。构建时将 `VITE_DATAV_URL` 设置为大屏最终域名；`VITE_OSS_BUCKET_URL` 只在已确认素材同步完整时配置。
- `admin-frontend`：管理后台，继续由后端校验管理员角色。
- `sjg-datav`：数据大屏。
- Vue 主站和后台使用 Sites 静态站点的 SPA 路由回退；API 请求直接发往后端。
- 三个站点均保持 owner-private，需要创建站点的 ChatGPT 账号登录。用户明确要求公开后，再变更相应站点的访问范围。

## 试用边界与验收

2026-10-10 核对官方文档：Railway 新用户有最多 30 天、一次性 5 美元试用额度，先到期限或额度耗尽即结束；之后 Free 计划每月提供 1 美元。试用账号网络能力取决于平台验证结果，需实际验证 LLM、OSS 的外部连接。

- 不绑定付费订阅、不自动升级。创建服务后检查账户试用状态和使用量。
- 正式部署前保留数据库备份；试用结束后的数据留存不能作为长期保障。
- 本地构建与单元测试不代表云端部署已经成功，须以平台部署状态和真实接口验收为准。

官方资料：

- https://docs.railway.com/pricing/free-trial
- https://docs.railway.com/guides/spring-boot
- https://docs.railway.com/databases/mysql
- https://docs.railway.com/config-as-code/reference

## 本轮验证与平台状态（2026-10-10）

- 后端 `mvn package` 成功：138 项测试通过，0 失败；新增真实 Spring 容器构造器注入回归测试，修复 CulturalItemService 的两个必选构造器造成的启动失败。
- 主站 124 项测试通过；三个前端通过 Sites 官方构建与打包流程，源码提交与发布版本对应。
- Railway CLI 已授权，账号为试用状态：首次查询为 30 天、5 美元余额。未启用付费订阅。
- Railway 云端 Java 17 多阶段镜像已构建成功，应用成功连接 MySQL。完成建库前的业务健康检查失败已定位为缺少业务表。初始化后重启部署成功，真实 HTTPS 朝代、诗人、诗词、景点、文化与事件接口均 HTTP 200 / 业务码 200。
- 本机 TCP/SSH 连接受网络环境影响，因此使用 Railway 内网的一次性初始化容器；快照校验 SHA-256 后导入，执行 25 个缺失迁移（V2、V4 已包含于快照）。初始化记录表保存快照及迁移校验和，非空且无匹配记录时拒绝覆盖。
- 导入后核验：poet 129、poem 203、scenic_spot 71、event 3、cultural_item 44、content_review 494。内容治理规则保持不变，历史内容待审核。
- 数据库实际版本为 MySQL 9.7.2。调整缓冲池、连接数和 performance_schema 以减少试用内存用量；后端 Hikari 最大 5、最小 1。
- OSS 环境凭据已通过平台变量配置；LLM 凭据缺失，AI 对话和生成仍未启用，真实管理员登录与媒体上传尚未验收。
- 三个 Sites 部署状态均为 succeeded，访问范围 owner-private；浏览器已验证私有站点登录门禁，内容页验收需要站点所有者登录。

| 服务 | 地址 |
| --- | --- |
| 主站 | https://qilu-wenmai-qzzhu.noisyamber1.chatgpt.site |
| 管理后台 | https://qilu-wenmai-admin-qzzhu.noisyamber1.chatgpt.site |
| 数据大屏 | https://qilu-wenmai-datav-qzzhu.noisyamber1.chatgpt.site |
| 后端 | https://sjg-api-production.up.railway.app |
| Railway 项目 | https://railway.com/project/a20a55f3-ba67-4817-8a4e-b352e41121c8 |

三个域名的 CORS 预检均 HTTP 200，允许来源与对应域名完全一致；匿名后台访问返回 HTTP 401，不存在的学习任务返回 HTTP 404。公开列表为空是待审核内容过滤的预期结果。

资源 ID、源码 SHA、版本 ID 与部署 ID 见 `docs/deployment-state.json`。三个独立发布目录位于 Git 忽略的 `.local/sites/`，公开 API 地址和大屏链接写入各自 `.env.production`；不要在前端构建变量中保存密钥。

本轮试用使用量查询：约 0.00234 美元，剩余额度约 4.998 美元，剩余试用天数 30。此为查询时点值，不表示额度可支撑持续运行满 30 天。

临时数据库 TCP 公网代理与初始化服务均已删除，数据库继续仅通过 Railway 内网供后端使用。初始化上传用的本地快照副本已移除，原始业务备份保留。AI SSE 已实测返回明确的缺少 LLM_API_KEY 错误事件，流式传输通路可用。
