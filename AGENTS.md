# AGENTS.md

This is the shared project guidance for coding agents.

- 回答问题使用中文。
- 主目录默认检出 `master`；主干必须包含当前已验证的代码与运行时素材。开始工作先核对 `git status`，提交时纳入需要的新文件，勿仅按远端提交推断最新工作区。
- 本地账号配置、密钥、数据库快照、构建产物与宣传片渲染中间文件不提交。

## 项目概述

**SJG** - 齐鲁文化数字人文平台（黄河流域山东段文学景观）。展示诗人、诗词、景点、历史事件、五类文化条目（节庆/工艺/文学/饮食戏曲）的数字人文系统，含 AI 对话助手「AI小文」与 AI 诗词赏析。

## 项目结构与技术栈

| 目录 | 技术栈 | 端口 | 说明 |
|---|---|---|---|
| `backend/` | Spring Boot 4.1.1 + Java 17 + MyBatis-Plus 3.5.17 + MySQL | 8080 | 后端 API |
| `admin-frontend/` | Vue 3 + Vite + Element Plus + axios | 5173 | 后台管理 |
| `display-v2/` | Vue 3 + Vite + ECharts + AntV G6 v5 + Three.js + GSAP | 5175 | 展示前端（主力） |
| `sjg-datav/` | React 19 + TS + Vite + ECharts + SWR | 5180 | 数据大屏（display-v2 导航栏外链入口） |
| `scripts/` | Python / Node | - | seed SQL 生成、migration 应用及维护脚本 |
| `docs/` | - | - | 接口规范、计划、DB 搭建说明 |
| 工作区外归档 | - | - | 历史素材、旧备份与废弃生成流程，不参与构建 |

四个项目彼此独立，**不是 monorepo/workspace**（各自独立 `npm install`）。但**根目录现有一个 `package.json`**（`sjg-human-ai-platform`），它含仓库级 ESLint/Prettier/jscpd/Playwright 质量工具，不聚合子项目，仍通过 npm scripts 门面，把各子项目的 build/test 与仓库级质量关卡（AI 评测、迁移校验、治理契约测试等）串成 `npm run verify:all`（见「质量关卡」）。

## 常用命令

### 后端（backend/）
**已有 Maven Wrapper**（backend/mvnw、mvnw.cmd，固定 Maven 3.9.16）。推荐 Java 17（CI 同版本）；目标 Java 17。后端目录运行 `./mvnw test`，完整验收为 `./mvnw -Pintegration,quality verify`（Docker 必须可用，不静默跳过集成测试）。原 mvn 命令仍可用：
```bash
mvn spring-boot:run                      # 启动（需本地 MySQL 已起 + SPRING_DATASOURCE_PASSWORD）
mvn test                                 # 纯 Mockito/JUnit5，不需要 DB
mvn test -Dtest=PoemAnalysisServiceTest   # 单个测试类
mvn package -DskipTests
```
默认 `mvn test` 运行不依赖数据库的单元测试与真实 WebMvcTest 切片；`-Pintegration verify` 另起 Testcontainers MySQL 8.4 和完整 SpringBootTest + 嵌入式 Tomcat，验证认证、发布门禁、Actuator/OpenAPI、迁移幂等性及小数据集性能预算。

⚠️ **因此 `mvn test` 全绿 ≠ 能启动**。Spring 装配错误只在 `spring-boot:run` 时暴露——实例：`CulturalItemService` 曾有两个 `@Autowired` 构造器，此前测试 137/137 通过但启动即 `Invalid autowire-marked constructor`。治理层给多个 service 加了「无治理依赖的旧构造器（供测试）+ 带治理依赖的新构造器」重载，**一个类只能有一个 `@Autowired` 构造器**。新增 `CulturalItemServiceContextTest` 使用真实 Spring 容器检查该构造器装配；改 service 构造器后仍须验证真实启动。

启动必需环境变量：`SPRING_DATASOURCE_PASSWORD`（`application.yml` 里密码无默认值；URL/用户名默认已指向 `127.0.0.1:3306/sjg01` + `root`）。登录相关还需要 `JWT_SECRET`（≥32 字节，缺失或过短时启动失败）。AI 功能需要 `LLM_API_KEY`（缺失只 WARN）。

### 前端
```bash
cd <project-dir> && npm install
npm run dev / npm run build / npm run preview
```
`sjg-datav` 的 `build` 是 `tsc -b && vite build`（`strict` + `noUnusedLocals` + `noUnusedParameters`，`tsconfig.app.json` 的 `include` 是整个 `src`），**类型错误会阻断构建**。三前端已有仓库级 ESLint 安全与复杂度关卡；`admin-frontend` 与 `display-v2` 仍无类型检查。

### display-v2 测试
用 **Node 内置 test runner**（非 Vitest），`tests/` 下 ~35 个测试文件（另有 `tests/helpers/`）：
```bash
npm test          # node --test --experimental-test-coverage tests/*.test.js
npm run test:unit # 无覆盖率
node --test tests/mediaBase.test.js   # 单文件
```
纯工具函数直接由 Node 测试；`tests/helpers/componentSetup.js` 使用 Vue compiler 执行真实 SFC setup，并注入网络、路由及 window 事件边界。它可以覆盖表单、请求状态和路由逻辑，但不代替真实浏览器的 DOM、Canvas 或视觉验收。

### 质量关卡
**CI**（`.github/workflows/ci.yml`）与根目录 `npm run verify:all` 执行同一批门禁：根目录及三前端 `npm ci` → 依赖扫描 → 仓库契约与迁移测试 → lint/格式/重复率 → display-v2 覆盖率 → 三前端构建 → Maven Wrapper 的单元/真实 MySQL 集成/静态分析 → 四页面无障碍 → 空白检查。

新增门禁：根 npm ci、npm/OSV 成分扫描（真实 Maven SBOM）、ESLint、共享代码 Prettier、jscpd 重复率≤3%、display-v2 已加载源码行覆盖率≥60%、后端 Checkstyle/PMD/SpotBugs、Testcontainers 集成测试和五页面 axe 无障碍检查（含批量审核结果页）。`npm run verify:all` 全部执行；需要 Node≥22.13、Java 17、Docker、OSV-Scanner 2.4.0 和浏览器。报告在 `.local/quality` / `backend/target`，不提交。契约测试仍是纯断言；完整上下文/SQL/HTTP 由集成测试验证。

## 后端架构

### 分层与鉴权
- `controller/pub/`（**12 个**）- 公开只读 `/api/public/**`，permitAll。三个展示前端全部走这里；含 `PublicDynastyController`、`PublicEventController`、`PublicPoetRelationController`、`PublicLearningTaskController`（一城一课学习任务，`task_code` 短 ID 分享）。⚠️ **公开列表现已强制「只返回已发布内容」**（见下文治理层）——`PoemService`/`CulturalItemService` 等的 `listInternal(..., publishedOnly=true)` 会用 `content_review.status='published'` 子查询过滤，未发布实体在前台不可见。
- `controller/admin/`（12 个）- `/api/admin/**`。**全部请求（含 GET）都要求 admin**。新增 `ContentReviewController`（内容审核工作台）、`AiMetricsController`（AI 指标）、`LearningTaskAdminController`、`PoemAnalysisAdminController`。`AuthController` 虽在 admin 包下，但路径是 `/api/auth`（register/login permitAll）。
- `service/`（22 个）- 只有 `AiPoemService` 用了 MyBatis-Plus `ServiceImpl`，其余全是手写 mapper 调用。新增治理/审计/学习/检索一族：`ContentReviewService`、`ContentGovernanceCleanupService`、`AiAuditService`、`AiMetricsService`、`LearningTaskService`、`KnowledgeRetrievalService`、`ClientIpResolver`、`RateLimitService`+`InMemoryRateLimitService`。
- `mapper/`：大部分继承 `BaseMapper<T>`；`AiAuditLogMapper` 使用参数化 `@Select` 聚合。没有 mapper XML，已删除不存在目录的 `mapper-locations` 配置。常规查询使用 `LambdaQueryWrapper`，发布过滤使用固定 `.inSql(...)` 子查询。
- `dto/`（10 个）有 `Result`/`PageResult`/各种 Request；**没有 `vo/` 包**，公开接口大量直接返回手拼的 `Map<String,Object>`（`PublicSpotController:67,97`、`PublicPoemController:63`、`PublicPoetController:72`、`PublicTimelineController:46` 等）。
- `util/`：`JwtUtil`（jjwt 0.13 API）、`PoetCompletenessCalculator`（诗人资料完整度 0-100 评分）。

鉴权细节：authority 是 DB 里的裸 `role` 字符串（JWT filter 直接 `new SimpleGrantedAuthority(user.getRole())`），用 `hasAuthority("admin")` 而**不是** `hasRole`（没有 `ROLE_` 前缀）。JWT filter 每个请求都查一次 `UserMapper`，校验 `user.status=approved`、身份/密码哈希/角色/状态与 `credential_version` 的 HMAC 绑定；改密、重置、禁用/重新启用都会使旧 token 失效。V35 必须在部署新后端前应用。401 响应体是硬编码 JSON，不走 `Result`。

### 统一返回与异常
`Result<T>` = `{ code, message, data }`，`error(String)` 默认 code 500。Controller 返回 `ResponseEntity<Result<>>`，HTTP status 与 `Result.code` 是两处独立设置，会漂移。

`GlobalExceptionHandler`（在 `config/` 包下）：`DataIntegrityViolationException` / `SQLIntegrityConstraintViolationException` → 400，靠字符串匹配外键报错里的表名列名给出中文提示；**明确的 `BusinessException` → 400 中文业务提示；其他 RuntimeException → 500 固定文案+日志**。Auth/User service 的已知业务错误已迁入专用类型，不得恢复通用异常消息透传。

兜底的 `Exception` handler 已从暴露 `e.getMessage()` 改成固定文案「服务器内部错误，请稍后重试」+ `log.error` 打完整栈；两个 DataIntegrity handler 也有 `log.warn`。别把这个安全处理当 bug 回滚。

认证入口已使用 `@Valid` + DTO 字段边界，业务层仍保留密码规则。注册/改密/管理员重置统一至少15字符、常见弱口令拦截、BCrypt 72字节上限；旧密码登录不强制重设。登录与注册按 IP 和规范化用户名双维度限制5次/分钟，429 携 Retry-After；当前仍为单实例内存态。

### 前端适配器共用 Result 解包
- `display-v2/src/api/index.js` - axios 响应拦截器：`code===200` 就 **`return res.data`**，所以 `api.get()` 拿到的是 payload 本体，没有 `.data`。业务错误转 rejected `Error`（带 `.code`）。文件唯一导出是 `export default api`，**没有按域封装的 API 函数**，各组件直接 `api.get('/poets')`。
- 同文件挂了两个额外方法：`api.swrGet()` 返回的是 **`{ data, isStale }`**（与 `api.get` 形状不同，最容易搞错），`api.prefetch()` 是 fire-and-forget。底层是 `src/api/cache.js`（60s TTL + 请求去重 + idle 预取），**cache key 带 theme 后缀**（主题已锁死，故实际恒定）。
- `admin-frontend/src/api/index.js` - 同样解包；请求拦截器注入 `Bearer`；**401 清 token 并跳登录；403 保留会话并提示无权访问**。
- `sjg-datav/src/api/index.ts` - 原生 `fetch` 适配器使用共享 `unwrapResult`，附带 `fetchAllPaginated` 分页累加（`maxPages=50` 兜底）。三工程通过独立的 `file:../shared` 本地包复用 Result 解包，不引入 npm workspace。`getPoets`/`getPoems`/`getSpots` 走分页累加。

### AI 相关（两条独立的 LLM 通路）
- `LlmClient` 用 JDK 自带 `java.net.http.HttpClient`（刻意不引新依赖）。`streamChat` 是**阻塞式**的（`http.send(...)` 同步，在调用线程上逐行读 SSE）。`llm.api-key` 为空时启动只 WARN 不失败——聊天返回 error 事件、赏析返回 fallback。
- `ChatService`：`SseEmitter` + `newCachedThreadPool`；发送命名事件 `delta` / `evidence` / `error` / `done`。上游 `[DONE]` 由 `LlmClient` 消费，前端按事件与连接关闭处理完成。客户端历史只允许 user/assistant，限制条数与长度；所有 LLM 输出经过跨 chunk 凭据泄露过滤，但不等于语义内容审核。system prompt 缺少 `{rag_context}` 时会 WARN 并追加资料（测试锁定该行为）。
- **限流已抽成 `RateLimitService` 接口**（唯一实现 `InMemoryRateLimitService`），`ChatService` 与 `AiPoemService` 各自注入一个实例（默认构造走 `new InMemoryRateLimitService()`），仍是内存滑动窗口 60s/10 次、重启清零。客户端标识不再直读可伪造的 `X-Forwarded-For`，而是经 `ClientIpResolver` 统一解析。旧文档「两份独立 `rateMap` 拷贝」已过时。
- **两套 RAG 检索并存**：V36 建立 ngram 索引后可设置 `RAG_FULLTEXT_ENABLED=true`，两条检索通路使用参数化全文检索；默认 false 保持旧库兼容。老的 `RagRetrievalService` 默认仍是 SQL `LIKE` 关键词检索（`extractKeywords` 整串 + 全部 2-gram 最多 8 个，`CONCAT(IFNULL(...)) LIKE '%kw%'` OR，用不上索引、全表扫 poet/poem/scenic_spot）。新增 `KnowledgeRetrievalService` 是**带来源的证据检索**：返回 `EvidenceSnippet`（携 `content_source_link` 溯源），`ChatService` 现会把证据/来源随对话下发（`display-v2` 的 `SourceList.vue` + `utils/source.js` 消费）。改检索行为要分清动的是哪一套。
- `PoemAnalysisService`：以 `poem_analysis` 表为缓存（`poem_id` UNIQUE，查询 `.last("LIMIT 1")`），`CURRENT_VERSION = 2`（`:40`）——**改这个常量等于让全部 ~195 首重新走付费生成**。fallback JSON（含 `raw` 字段）永不落库（`:143-146`），避免缺 key 时污染缓存。

**AI 赏析自动发布（2026-10-10 用户确认）**：只有已发布诗词才能触发公开赏析生成。有效生成结果缓存后，赏析审核记录直接为 `published`；重新生成也自动发布。缺密钥、错误或非法 JSON 返回 fallback，绝不落库；证据检索只使用 published 赏析。AI 生成身份与原诗来源须保持可见，不把模型解读冒充原始文献。其他文化内容与学习任务继续遵循人工审核规则。

### 内容治理 / 审计 / 学习任务（人机协同平台层，多在工作树中）
平台层对应 `docs/superpowers/plans/2026-09-04-human-ai-platform-goal.md` 与 `docs/superpowers/specs/2026-09-05-content-governance-workbench-design.md`。代码与迁移均纳入主干；迁移仍须在每个数据库环境手动应用，以实际数据库状态为准。

- **内容审核状态机**：`ContentReviewService` 用 `content_review` 表按 `(entity_type, entity_id)` 记录状态，合法流转 `draft → needs_review → approved → published → archived`（`ALLOWED_TRANSITIONS` 白名单，非法流转抛异常）。受治理实体：`dynasty/poem/poet/scenic_spot/event/cultural_item/poem_analysis/poet_relation`。
- **发布即可见门禁**：公开端查询强制 `publishedOnly=true`——`PoemService.listInternal` 用 `.inSql("id","SELECT entity_id FROM content_review WHERE entity_type='poem' AND status='published'")` 过滤；`CulturalItemService` 额外要求 `cultural_item.status='published'` 且其 `content_review` 也为 `published` 才允许改状态。**新增/编辑实体会自动 `ensureNeedsReview` / `resetReviewForEdit`**（`ContentGovernanceCleanupService`），即改过的内容会退回待审、前台隐藏，直到重新发布。
- **来源溯源**：`source_document`（书/文章/官网/档案）+ `content_source_link`（实体↔来源多态关联）。`V27` 只建表、不伪造历史来源，历史实体统一进 `needs_review`；`V30` 为存量 `poet_relation` 建待审记录。前端 `SourceList.vue` 展示来源。
- **AI 审计**：`AiAuditService` 写 `ai_audit_log`——**不落原始 IP**，只存 `client_key_hash`（SHA-256）、截断后的 `query_text`、上下文类型、耗时、用户反馈（`ChatFeedbackRequest`）。`AiMetricsService`/`AiMetricsController` 出聚合指标供 admin `AiMetrics.vue`。
- **一城一课学习任务**：`LearningTask`/`LearningSubmission`，公开端 `PublicLearningTaskController`（`task_code` 短 ID 分享）、admin 端 `LearningTaskAdminController`。任务正文是结构化 JSON 文本，**发布前由服务层校验步骤/实体/来源绑定**。前端 `LearningTaskIndex.vue`/`LearningTaskView.vue` + `utils/learning*.js`。
- **仓库级契约测试**（node `--test`，纯断言无后端）：根/scripts 下 `ai-eval*`、`learning-task-check*`、`content-ledger-check*`、`migration-check*`、`ci-contract*`；admin 下 `sourceGovernance`/`apiErrorHandling`/`accessControlContract`/`dataTableErrorState`/`aiMetricsContract`（`*.test.mjs`）；display-v2 `tests/` 下新增 `sse`/`source`/`learning*`/`chatEvidence`/`craft*` 等。这些锁定治理契约，改治理逻辑前先看它们期望什么。

### 后端删除/查询/治理副作用（勿当 bug 回滚）
- **写操作自动触发治理**：poem/poet/spot/event/cultural 的 create/update 会调用 `ContentGovernanceCleanupService` 把实体置回 `needs_review`，delete 会级联清理其 `content_review`/`content_source_link`。看到「刚编辑的内容前台消失了」是设计，不是 bug——需在审核台重新 `published`。

### 前端代理
三个前端开发时通过 vite 把 `/api` 代理到 `http://localhost:8080`。生产构建使用公开 `VITE_BACKEND_URL` 访问 HTTPS 后端；后端配置对应的 CORS 域名。`admin-frontend` 与 `display-v2` 额外配了 `allowedHosts: ['.cpolar.top', '.cpolar.cn']`（cpolar 隧道）。

### 启动时清代理
`SjgApplication.clearProxySystemProperties()` 在 `SpringApplication.run` **之前**（`:14-15`）清掉 socks/http/https 六个 proxy 系统属性并设 `java.net.useSystemProxies=false`。原因：MySQL 的 `StandardSocketFactory` 会读 `socksProxyHost`，Clash 类工具或 IDE 注入的代理会让 MySQL 和 LLM 连接全挂。真正需要走代理的东西必须在自己的 client 上配，别指望系统属性。

### CORS
CORS 是独立的 `CorsFilter` bean（不是 `http.cors()`）：读 `@Value("${cors.allowed-origins:...}")` 逐个 `addAllowedOrigin`，**仅精确域名白名单，无 localhost 通配符**，方法收窄到 `GET/POST/PUT/DELETE/OPTIONS`，加了 `setMaxAge(3600)`。`allowCredentials(false)`，认证仅 Bearer header，不采用浏览器自动附带的 Cookie。prod profile 校验 HTTPS CORS、MySQL VERIFY_IDENTITY 与数据库凭据；Swagger 生产默认关闭，启用时也仅 admin 可访问。

## display-v2 架构

### 路由
`/` 重定向到 `/map`。⚠️ **`/map`（`MapView.vue`，~260 行）已改成轻量「图册」首页**（`AtlasGlyph` + `config/nineSights.js`），**原 3D 沙盘整体搬到 `/river-sandbox`（`RiverSandbox.vue`）**——`RiverHero`/`useThreeSandbox`/`FamousCities`/`CityDetailCard` 现都只被它引用。其余：`/poets`（`/poets/all` 重定向到 `/poets?view=all`）、`/poets/:id`、`/poems`、`/poems/:id`、`/spots/:id`、`/timeline`、`/culture`、`/festivals`、`/crafts`（`CraftList.vue` 列表）、`/crafts/workshop`（`CraftWorkshop.vue`，**必须排在 `/crafts/:id` 之前**）、`/literature`、`/food-opera`（四类各带 `/:id`）、`/regions/:region`、`/cities/:region`、`/compose`、`/learn`、`/learn/:taskCode`（一城一课）。全部懒加载。

两个坑：**四条文化详情路由共用 `CulturalDetail.vue`**；**`:region` 参数是中文城市名**（`/regions/济南`），所以 URL 实际是百分号编码的，`cityAliases.js` 存在就是为了把出生地字符串归一到规范的九市名（规范列表见 `src/config/nineCities.js`）。

**导航**：顶栏已从 `App.vue` 抽到 `components/layout/SiteHeader.vue`，四大板块（山河探索/诗文名士/齐鲁文化/研学创作）及其子链接、高亮前缀定义在 `config/siteNavigation.js`（另含 `safeReturnPath` 校验详情页返回链接只允许站内相对路径）。加页面要同步改这里。

**设计预览模式 `?preview=inkwash`**：`config/atlasPreview.js` 的 `isAtlasPreview(route)` 为真时，多数视图改用本地样本数据（`previewPoets`/`previewPoems`/`previewSpots`…，配图在 `public/media/inkwash/atlas/*.webp`），`App.vue` 显示「设计预览 · 样本内容」条。站内链接一律经 `atlasLink(path, route)` 生成以保留该 query——**新增 `router-link` 要包 `atlasLink`，否则点一下就退出预览**。文件头声明这些样本**永不作为 API 失败的降级**，内容也未经审核。

路由过渡逻辑在 `App.vue` 而非 router 里（`<transition>` 包一层 `:key` div）。两处是踩坑换来的、**不要改**：
- 绝不加 `mode="out-in"`。它要等旧页 leave 完成才挂新页，详情页返回时若 `transitionend` 丢失就整页空白。
- `afterEach` 里 800ms/1600ms 两次 `sweepStuckTransition` 强制清除残留的 `page-*-enter-from` 等 class，防止子组件中途换根节点导致页面永久 `opacity:0`。

### 主题系统：已收敛为单一 inkwash
状态层是 `src/composables/useTheme.js`，**零依赖单例**（不用 Pinia），且**已硬编码锁死**：`const THEME = 'inkwash'`（`:17`），`toggle`/`switchTheme` 都是 `noop`（`:43,56-57`），加载时清除 `localStorage('sjg-theme')`（`:20-22`），`isReal` 恒 `false`（`:34`），`isAnime` 恒 `true`（`:35`）。

命名地雷：暴露出来的计算属性叫 **`isAnime`（含义是 inkwash）**，不叫 `isInkwash`；`_anime` 文件后缀、`anime-layout` CSS class 同理，都是早期「动漫风」改名成「水墨」后留下的化石。搜 `isInkwash` 找不到有用的东西。

主题 class 由 `useTheme.js` 模块加载时一次性打在 **`<html>`** 上（`theme-inkwash` + `data-theme="inkwash"`），这样 fixed/teleport 出 `.app-root` 的元素也能吃到 token。

**「一页一貌」治理已执行完毕，且比旧文档记录的走得更远。当前真相：**
- **全站已无双主题分支页面**。`RiverSandbox.vue`/`RiverHero.vue` 里残留的 `sn-sticky-real` / `real-3d-container` 之类只是命名化石，不是条件分支。
- **`RegionSpots.vue` 已重写为单一版式**，旧的双布局与死 CSS 均已删。
- `PoemDetail`（根 class `poem-detail--inkwash`）、`PoetDetail`（`pd--inkwash`）、`Timeline`（渲染 `InkTimeline`）都是恒定 inkwash，real 分支及样式已删。
- 列表页 / 文化页 / 图谱统一「日式纸面」（细线 + 印章 + 留白）。

**已从磁盘删除**（旧文档说「保留待删确认」的都已删，改它们不存在的版本没有意义）：`components/timeline/RealTimeline.vue`、`views/FestivalDetail.vue`、`components/ThemeSwitcher.vue`、`components/ThemeTransition.vue`、`styles/inkwash.css`、`styles/real.css`。

仍存活的双轨**基础设施**（不是页面分支，暂勿清理）：`themes/manifest.js` 的 `resolveAsset(key, theme)` 与 `MEDIA_PREF = { real: 'video-first', inkwash: 'image-first' }`（`:53,70`）、`src/content/{real,inkwash}/` 双语文案（经 `resolveContent(scope, key, theme)`，`RiverSandbox`/`RegionSpots` 在用）。

### 样式与 token
`src/styles/`（`interactions.css` 已存在于基线，修改以 `git status` 为准）：
- `variables.css`（`main.js:5` 加载）—— **全部 token 都在 `:root`，已不存在 `.theme-inkwash` 覆盖块**（单主题后无需覆盖）。约 13 个派生 token 用 `color-mix(in srgb, var(--accent) …)` 构建（`:38,42-54`），硬依赖 `color-mix()`，无 fallback。
- `theme.css`（`App.vue` import）—— **纯装饰性全局规则，按其文件头声明不定义任何 token**：纸纹 `body::before`、`.card` 朱红内环、`.divider` 印章字、`.section-heading` 笔刷下划线、`.hover-lift`、`prefers-reduced-motion` 兜底。
- `interactions.css`（`App.vue` import）—— 共享阅读/交互层（控件高度、页边距等少量 token + 通用交互规则），装饰性绘制仍留在页面组件内。
- 写死 `rgba(184,134,11,.08)` 而不用 `var(--accent-soft)` 会无声破坏 token 体系。

### 图片与媒体（三套机制并存）
1. `public/media/{real,inkwash}/` —— **主题化场景资产**，只通过 `src/themes/manifest.js` 的 `import.meta.glob('/public/media/{real,inkwash}/**/*.{mp4,jpg,jpeg,png,webp}')` 自动注册，`resolveAsset(key, theme)` 取用（key 是去扩展名、去 `-poster` 的 base 名），加资产不用改代码。OSS 内保持相同相对路径，靠 `.env` 的 `VITE_OSS_BUCKET_URL` 切换（dev 下 `resolveMediaBase` 恒返回 `''` 即用本地 `public/`）。
2. `public/images/{poets,spots,cultural,solar-terms}/` —— **按实体的图**，路径来自数据库 `imageUrl`/`avatarUrl`（及 `*AnimeUrl`）列，由 `useImage.js` 用构建期 glob 白名单校验存在性。
3. `public/media/inkwash/atlas/*.webp` —— 新「图册」版式的手绘插画，被 `atlasPreview.js` 样本数据和部分详情页（如 `PoetDetail`/`SpotDetail` 的 `PORTRAITS` 名→文件映射）直接按路径引用。

`useImage.js` 现状（已重写，旧文档描述的「`.png` 被改写成 `.jpg` 导致 `_anime.png` 永远取不到」**已修复**）：白名单同时覆盖 `/public/images/**` 与 `/public/media/**`（含 webp/avif）；候选路径由纯函数 `utils/imageCandidates.js` 的 `buildLocalImageCandidates` 生成——先试同名 `.webp` 再试原路径，inkwash 下再追加 `_anime.{webp,png,jpg}`。**统一入口是 `resolveFirstImage(values[], kind, { placeholder })`**：按顺序取第一个可用值（`http(s)` 直接返回，本地路径须命中白名单），全落空则返回印章 SVG 占位（`placeholder:false` 时返回 `null`）。`resolveImage(url)` 与旧契约 `getImageUrl(url, isAnime)` 都只是它的薄包装。`parseFirstUrl`/`firstMediaValue` 负责处理后端那种「JSON 数组字符串」列（`'["https://a.jpg","b.jpg"]'`）。

**字段优先级约定：`*AnimeUrl` 优先、`imageUrl`/`avatarUrl` 兜底**（库里现有水墨图多在 anime 字段）——`themeAdapter.js`、`RegionSpots`、`SpotDetail`、`PoetDetail`、`CulturalDetail`、`CultureCollection` 都按 `resolveFirstImage([x.imageAnimeUrl, x.imageUrl], …)` 写。所以 `imageAnimeUrl`/`avatarAnimeUrl` **目前不是待删字段**（admin `PoetList.vue` 已删掉该表单项，但前台仍读）。改字段策略前先确认方向。

### 其他 display-v2 要点
- **没有任何路径别名**，`@/components/...` 不解析，全用相对路径。
- `components/homepage/` 名不副实——`ErrorState`、`SkeletonBlock`、`EmptyState` 这三个复用最广的基元就在里面，全站都在用。
- `components/InkPlaceholder.vue`：纯 CSS/SVG 程序化水墨占位图，按 `seed + kind` 哈希出墨渍位置，朱红印章字按 kind 取 `节/诗/艺/文/味/景`。零素材成本，用来替代缺图。
- `src/config/nineCities.js` 导出 `NINE_CITIES`（上游→下游九市），**已被 5 个视图引用**（`CultureGalleryView`、`CityCulture`、`FestivalList`、`LiteratureList`、`FoodOperaList`），不是死代码。
- 重可视化各自只有一个引用方：ECharts 只在 `SpotDetail.vue`（经 `charts/spotEcharts.js` 按需注册折线图），G6 只在 `PoetList.vue`（`?view=graph` tab），Three.js 在 `RiverSandbox.vue`（`useThreeSandbox.js` 沙盘）与 `CraftWorkshop.vue`/`craft/CraftStage.vue`（`useGlbScene.js` + DRACO）。`vite.config.js:23-32` 的 `manualChunks` 把 echarts/g6/three 拆成独立 vendor chunk（`chunkSizeWarningLimit: 1500` 就是为了压住它们的告警），改可视化模块时别把三者打进同一个 chunk。
- G6 是 v5 API（`import { Graph }`、`node`/`edge` 而非 `defaultNode`、`behaviors` 而非 `modes`、`setSize` 而非 `changeSize`）。**Canvas 渲染读不到 CSS 变量，所以 `graphTheme` 必须写字面量 hex。**
- `AiChatBox.vue` 绕过 axios 直接用 `fetch` + `ReadableStream` 解 SSE（axios 不支持流），输出经 `marked` + `DOMPurify.sanitize`。它挂在 `App.vue` 全局。
- `src/config/mockDetailData.js` 是**在用**的客户端文案补充（按中文景点名索引，补后端没有的 `verticalText`/`history`/`play`），不是网络降级 mock；景点改名就静默失效（`'泰山'` 和 `'泰山风景区'` 两条重复条目就是这么来的）。曾被提到的 `mockFallbackDb.js` **不存在**。
- **`.env` 现有两个自定义变量**（不再是一个）：`VITE_OSS_BUCKET_URL`、`VITE_DATAV_URL`。数据大屏入口是 `components/layout/SiteHeader.vue` 里的 `import.meta.env.VITE_DATAV_URL || 'http://localhost:5180'`（导航栏外链）。
- 共享页面标题基元 `components/ui/PageHeading.vue`；`components/homepage/` 仍是历史杂物间。
- `public/media/real/` **存在**（有 `hero-map.mp4` / `hero-map-poster.jpg` / `spots/`），但其下**没有 `cities/` 子目录**，而 `cityIllustrations.js` 和 `resolveCityHeroMedia` 都在找它——所以"城市 hero 视频不显示"是缺目录，不是代码 bug。

## sjg-datav 要点
- 无 router，`App.tsx` 只渲染 `<DataV />`。
- **舞台缩放/信箱适配**：`src/hooks/useAutoFit.ts` + `src/components/AutoFit.tsx`，设计稿 **1920×1080**。用 `ResizeObserver` 量**外层容器的 `clientWidth/Height`**（`:19-21`，刻意不用 `window.innerWidth`，避免 iframe/滚动条误差），`scale = min(w/1920, h/1080)` 即 contain + 居中，永不裁切。这修的是 1699×828 之类窗口下"只显示一半"的问题。舞台内部可以放心写死 px。
- **2026-09 已整体重做（`feat-datav-overhaul` 合入）**：旧的 zustand store、`test*.tsx` 试验文件、`TimelineChart.tsx` 均已删除，zustand 依赖也已移除。现结构：`pages/DataV/panel/{Header,LeftPanel,RightPanel}.tsx` 三栏 + `components/`（`ShanheMapChart` 地图、`DynastyRibbon`、`SentimentCloud`、`PanelKit` 面板基元、`Chart` 通用 ECharts 容器、`GradientWaves` 用 `ogl` 的 WebGL 背景）。
- **数据流**：`src/api/index.ts` 的 `useResource` 包 SWR，所有 hook 统一返回 `{data, isLoading, error, mutate}`（`mutate` 用于错误态「重新加载」）。`hooks/useDashboardData.ts` 汇总全部原始数据，再用纯函数 `buildView(raw, filter)` 按 `DashboardFilter { region, dynastyId }` 派生整屏视图——**筛选全在前端内存完成**，只有五脉文华计数例外：`/api/public/cultural/categories?region=` 由后端下钻，SWR key 带区域后缀分城缓存。
- **九城顺序的权威来源是后端 `/api/public/spots/regions`**（`PublicSpotController` 的硬编码数组），前端 `FALLBACK_REGION_ORDER` 只是兜底；regions 请求失败不计入整屏 error。
- **主题单一真源**：token 在 `src/styles/global.css` 的 `:root`（`--dv-*` 水墨青金）。ECharts 读不到 CSS 变量，所以 `theme/chartTheme.ts` 在模块加载时从 `:root` 读一次 token 导出 `T`/`PALETTE`/`alpha()` 及 `tooltipBase`/`gridBase` 等通用样式——**改色只改 `global.css`**，图表跟随；别再往组件里写字面量 hex。
- **ECharts 按需注册集中在 `theme/echartsSetup.ts`**（`echarts/core` + `echarts.use([...])`，同时注册山东 GeoJSON `assets/shandong.json`）。新增图表类型/组件只改这里，否则会出现「A 组件依赖 B 组件注册的类型」的隐式依赖。
- 标题字 `DvSerif` 是按项目用字子集化的 Noto Serif SC（`public/fonts/dv-serif.woff2`），新增大量生僻字会回落系统字体。
- **无任何 mock 降级**：后端挂了 hook 返回 `[]`，面板显示 0/`—`。
- dev server 只监听 IPv6 `::1`：浏览器用 `http://localhost:5180`，`127.0.0.1:5180` 连不上。

## admin-frontend 要点
- 路由守卫纯 localStorage 驱动（`token`/`username`/`role`），`/users` 带 `meta.requireAdmin`。**这只是装饰**，真实权限靠后端 `/api/admin/**` 的 JWT+role 校验。注册自助（`/api/auth/register`）后进 `pending`，需 admin 在 `UserList` 审批。
- Pinia 已装且 `main.js:12` 的 `app.use(createPinia())` 已跑，但**零个 `defineStore`、没有 `stores/` 目录**，认证状态是 `Layout.vue:82-83` 里裸读 localStorage 的 `computed()`（不响应 storage 变化）。别以为已经接好了。
- CRUD 靠三个组合组件而非 composables（本项目**零个 composable、无 `composables/` 目录**）：`DataTable.vue`（自管分页/搜索，调**作为 prop 传入**的 `fetchFn`——不是 `inject()`，期望 `{records, total}`，`defineExpose({fetch})` 供父组件刷新）、`FormDialog.vue`、`ImportDialog.vue`（xlsx 导入）。
- **图片上传到 OSS**：`MultiImageUpload.vue` 的 `v-model` 是 **`string[]`**（`modelValue: Array`），`VideoUpload.vue` 的 `v-model` 是 **JSON 字符串**（emit 前 `JSON.stringify`）——互换会静默损坏数据。两者都 `POST /api/admin/upload`（FormData 带 `file` + `directory`），`OssService` 回 `{url}`。directory 是按实体的约定字符串：`poets`/`spots`/`spots/anime`/`spots/videos`/`events`。
- **DB 里 `avatarUrl`/`imageUrl`/`imageAnimeUrl`/`videoUrl` 存的是 JSON 数组字符串**，`PoetList` / `EventList` / `SpotList` / `VideoUpload` 已共用 `@sjg/shared` 的 `parseMediaUrls` / `firstMediaUrl`。修改解析规则只改共享包，并保留图片组件数组、视频组件 JSON 字符串的 v-model 契约。
- 五个列表页 `CulturalList`/`EventList`/`PoemList`/`PoetList`/`SpotList` 的 `handleDelete` 都有完整 `ElMessageBox.confirm` 二次确认（含 try/catch 吞掉取消）。`PoetList` 已删掉 `avatarAnimeUrl`/`avatarAnimeUrlArray` 表单项与序列化，label 为「头像」。
- 朝代选项来自 `GET /api/public/timeline` 映射 `t.dynasty`（`PoetList:176-177`、`EventList:161`、`PoemList:140`）——**即便新的 `PublicDynastyController` 已加，admin 端仍未改用 `/api/public/dynasties`**。
- Element Plus 图标全局注册在 `main.js`，模板里直接用 `<el-icon><User /></el-icon>` 无需 import。
- `traditional.css`（647 行）全局引入（`main.js:5`）并 `@import` Google Fonts，离线/墙内会回落 KaiTi/SimSun。它的 token（`--color-zhu #C23B22`、`--color-jin #B8860B`、`--color-mo #2C2A2E`）与 sjg-datav 的 `--dv-*`、display-v2 的主题 token 是**三套互不相干的设计系统**，没有共享包。

## 数据库与 Migration
- 本地 MySQL：`127.0.0.1:3306`，user `root`，主力库 **`sjg01`**（生产数据完整副本）；`sjg` 为小型测试库。两台开发机：Windows（MySQL 8.0.46，服务名 `MySQL80`）与 macOS（MySQL 9.0.1，`/usr/local/mysql/bin/mysql`，不在默认 PATH）。完整搭建步骤见 `docs/local_db_setup.md`，口令只通过环境变量提供。
- **从全量导出恢复**（macOS 实测流程）：`db-export/<时间戳>/sjg01_full.sql`（已 gitignore，勿提交）自带 `CREATE DATABASE sjg01` + `USE`，但**不含治理层表**，导入后必须补跑 V27–V30。用 `mysql -uroot --default-character-set=utf8mb4 -e "source <file>"` 导入（不带 utf8mb4 中文会乱码）；`apply_migration.py` 需要 `pymysql`，没装时直接用 mysql 客户端 `source` 迁移文件即可（V27–V30 无 `DELIMITER`）。
- ⚠️ **导入后前台全空是正常的**：V27 把所有历史实体写成 `content_review.status='needs_review'`，公开接口只返回 `published`。本地开发若要看数据，在本地库执行 `UPDATE content_review SET status='published', review_note='LOCAL-DEV 批量发布' WHERE status='needs_review'`（用该 note 可回滚），或在 admin 审核台逐条发布。`poem_analysis` 导出为空，首次访问赏析会触发付费 LLM 生成。
- ⚠️ **库名有三种说法**：`application.yml:7` 默认 `sjg01`，`schema.sql:1-2` 创建并 `USE sjg`，脚本默认使用 `DB_NAME=sjg01`，均可由环境变量覆盖。
- 旧远程实例已弃用；`scripts/apply_migration.py` 默认连接本机 `127.0.0.1:3306`，并使用环境变量 `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME` 覆盖，不再携带远程地址或默认口令。
- **Flyway 不是依赖**。`db/migration/` 是 Flyway 命名风格但没人自动应用，全靠 `python scripts/apply_migration.py <file>` 手动跑（env: `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`）。该脚本结尾的 "verify" 块（`:47-57`）硬编码查 `poet_relation`，对非 V4 的 migration 是无意义噪音。
- 现有 `V2`–`V4`、`V6`–`V10`、`V12`–`V34`。V31–V34 是素材路径回填，执行前确认实体 ID 与目标库匹配。**缺口仍是 V1 / V5 / V11**：V1 相当于 `schema.sql`；**V5（`poem_analysis` 建表）和 v4 在 `display-v2/migrations/` 下**，小写 `v4_poet_relation.sql` / `v5_poem_analysis.sql`；V12–V16 是从某 worktree 的 V7–V11 重编号来的。**V25/V26 是 inkwash 素材回填**；**V27–V30 是人机协同平台层**（`V27` 内容来源/证据/审核表、`V28` AI 审计、`V29` 学习任务、`V30` 诗人关系待审记录）。macOS 本地 `sjg01` 已应用到 V30；其他机器上的库功能改动前先确认迁移是否已跑（`SHOW TABLES LIKE 'content_review'`）。
- **`V24__imagegen_asset_backfill.sql`**：把 OSS 上新生成的素材回填到空字段，三段共 33 行（21 条 `scenic_spot.image_url`、9 条 `poet.avatar_url`、3 条 `event.image_url`），每条 `WHERE name = '...' AND (field IS NULL OR field = '')` 保证幂等。
- 所有 migration 都在文件头注明幂等策略且**必须幂等**。MySQL 8 没有 `ADD COLUMN IF NOT EXISTS`，所以 V12 之后的标准做法是查 `information_schema.COLUMNS/STATISTICS` + `SET @ddl := IF(...)` + `PREPARE/EXECUTE/DEALLOCATE PREPARE`（照抄 V12–V16）。文化条目 seed（V18–V21）的幂等靠「按 `(category,title)` DELETE 再 INSERT」+ 详情表 `ON DELETE CASCADE`。
- `schema.sql` / `schema_utf8.sql` **不幂等**（裸 `CREATE TABLE`），只含 7 张基础表，且种了默认 admin 账号。`poem_analysis`/`poet_relation`/`cultural_item` 及四张详情表都不在里面——要到当前 schema 得 `schema.sql` + `display-v2/migrations/` + V2..V30（含治理层 `source_document`/`content_source_link`/`content_review`/`ai_audit_log`/`learning_task`/`learning_submission`）。`_utf8` 变体是为 Windows/MySQL 字符集问题准备的。
- V12 给多张表加了 `deleted` 列，但**全项目零个 `@TableLogic`**，删除全是物理删除，服务层手写级联。查询也不过滤 `deleted = 0`——一旦有人开始写这个列，数据就会诡异地"复活"。
- ORM 用 MyBatis-Plus，`map-underscore-to-camel-case: true`（`application.yml:19`）。分页依赖 `MyBatisPlusConfig:14` 的 `PaginationInnerInterceptor`，**移掉这个 bean 会让所有 `selectPage` 静默返回全量数据**。

### 后端删除与查询行为（勿当 bug 回滚）
- `SpotService.delete` **原先只是 `deleteById`（零级联）**，现改为先把引用该景点的 `poem.spot_id` 置空再删景点，并加了 `@Transactional`（新注入 `PoemMapper`）。
- `PoetService.delete` 原先只删诗+删诗人，现补上删 `poet_relation`（poetA/poetB 两侧，新注入 `PoetRelationMapper`），三步级联。
- `PublicSpotController.list` 修掉了 N+1：从每个景点一次 `selectCount` 改为单次 `selectList ... IN(spotIds)` + stream 分组。

## scripts/
- `apply_migration.py` —— 见上；`apply_migration_test.py` 是它的 preflight 单测（CI/verify:all 会跑，`python3` 直接执行）。
- `gen_cultural_migration.mjs` —— 当前在用的文化 seed 生成器（Node，零依赖，JSON → 幂等 DELETE+INSERT SQL）：`node scripts/gen_cultural_migration.mjs <input.json> festival V18`，产物落 `scripts/output/`（本地生成目录，已忽略），然后**首字母大写复制**到 `backend/src/main/resources/db/migration/`（`v18__festival_seed.sql` → `V18__festival_seed.sql`，两处内容逐字节相同）。
- **平台质量门禁工具**（均 node `--test` 或纯 node 脚本，被根 `package.json` scripts 与 CI 调用）：`ai-eval.mjs`/`ai-eval-cli.mjs`（AI 评测，评测集 `docs/ai-evaluation-set.json`）、`check-migrations.mjs`+`migration-check.mjs`（迁移编号/幂等静态校验）、`content-ledger-check.mjs`（来源台账）、`learning-task-check.mjs`（学习任务 JSON 校验）、`ci-contract.test.mjs`（校验 CI 与 verify:all 门禁一致）、`verify-all.sh`（本地全量门禁）、`run-ai-eval.sh`。
- 旧的 Python seed 生成器、图片批处理脚本和素材库存已移出仓库并保存在工作区外归档；当前仓库只保留可复现的 Node seed 生成器、migration 应用脚本和已落盘的运行时素材。

## 素材生成（有真金白银成本）
`.workbuddy/skills/sjg-media-assets/SKILL.md` 是规范来源。**生成前必须先向用户报价并确认**（约 50-100 积分/5 秒视频、5-10 积分/图）。四个必做后处理，每个都是踩过的坑：
1. `output_dir` 参数不可靠（曾经落错目录、real/inkwash 互换）—— 生成后立刻移动到 `display-v2/public/media/{real,inkwash}/` 并核对。
2. ImageGen 输出底部约 8% 有「AI生成 WORKBUDDY」水印 —— `ffmpeg -vf "crop=iw:trunc(ih*0.92/2)*2:0:0"` 裁掉（横图 1536×1024 → 1216×764）。
3. VideoGen 5s/1080p 约 20MB 太大 —— `-c:v libx264 -crf 28 -preset slow -an -movflags +faststart` 压到 ≤3MB。
4. 用 `ffmpeg -ss <中点> -frames:v 1 -q:v 4` 导 poster 帧。

性能预算（用户已确认）：LCP < 2.5s，单页媒体增量 < 3MB。素材回填一律走 V23+ 幂等 migration，不直改库。

历史生成素材及其使用状态说明已随工作区外归档保存；运行时使用的图片已分别落在 `display-v2/public/images/` 与 `display-v2/public/media/`。已知遗留：`image_anime_url` 历史数据仍需按当前字段迁移策略处理；id71（无棣碣石山）仍无实景图。

## 文档
- `docs/data_interfaces.md` —— 接口与实体字段规范。**已部分过时**：只覆盖最初 5 个实体和 4 组公开接口，`cultural`/`dynasties`/`events`/`ai-poem`/`chat`/`poet-relations` 都没写。
- `docs/plans/2026-08-20-display-v2-visual-overhaul.md` —— 当前最新的执行规格（非提案，条条带 file:line 证据）。三项前置决策已确认：收敛单一 inkwash 主题（删 real）、文化走廊用零成本程序化视觉（AI 生成另行报价）、sjg-datav 只加导航入口不合并工程。结构是 Phase 0（token 层 + 主题收敛，必须先做）→ 批次 A/B/C/D（导航+hero+datav 入口 / 诗人诗词详情 / 文化走廊 / 时间轴长卷）→ Phase E 验收。它实际接管了 `2026-08-15-theme-strategy.md` 的方向。
- `docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md` —— 文件自称**进度唯一源**（`:5`）。标记约定 `[x]` 完成 ｜ `[ ]` 未完成 ｜ `[~]` 进行中 ｜ `⏸` 阻塞/后期。仍开放：P2-M5~M9（批量素材/OSS，全部 `⏸`）、B-1~B-3（后端 `?style=` 参数、`/api/public/theme-assets`、admin 双风格上传，全部 `⏸`）。⚠️ **B-1~B-3 都是为双风格服务的，主题已收敛单一 inkwash，这三项事实上已作废，但该文件尚未更新**。
- `docs/plans/2026-08-15-{theme-strategy,beautify-plan,media-visual-plan,nine-cities-display-proposal}.md` —— theme-strategy 已执行完毕（且被 08-20 规格接管），其余三个仍是待执行提案。
- `docs/plans/2026-08-14-codex-*.md` 是历史自动运行日志，**其 V7–V11 编号与仓库实际不符**（对应仓库的 V12–V16），只当技术债清单看。
- `docs/superpowers/{plans,specs}/` —— 历史 + 当前设计文档，按日期命名。**当前平台方向的权威文档在此**：`plans/2026-09-04-human-ai-platform-goal.md`（人机协同平台总目标）、`specs/2026-09-05-content-governance-workbench-design.md`（内容治理工作台设计）。另有 `docs/development.md`（开发流程 + verify:all）、`docs/ai-evaluation.md`（AI 评测规范）、`docs/goal-environment-checklist.md`。
- 仓库根还散着几个**过程性 markdown**（未提交、非规范来源，随时会变）：`findings.md`、`progress.md`、`task_plan.md`——当草稿看，别当权威。
- `.workbuddy/memory/` —— 按日期的工作记忆；`.workbuddy/artifacts/` 有三份审计报告（backend 审计列了 83 个问题，其中多个文件正在被改）。

## 其他注意事项
- 历史 `else/`、生成库存、旧生成器和过时 SQL dump 已从仓库移除，并在工作区外保留可恢复归档；其中历史配置文档可能含敏感凭证，禁止回显或重新提交。
- `output/`、`display-v2/output/`、`scripts/imagegen/` 与本地备份文件已加入 `.gitignore`，运行时素材必须落在 `display-v2/public/`。
- 数据库快照已移至工作区外归档（2026-08-13 生产全量，9 张表）；导入说明见 `docs/local_db_setup.md`。
- `PublicSpotController.regions()`（路径 `/api/public/spots/regions`）硬编码九市（上游→下游 `菏泽 济宁 泰安 聊城 济南 德州 淄博 滨州 东营`），计数已改为单次 `SpotService.countByRegion()` 内存分组（且只计已发布景点）。加城市要改这个数组，它同时是 sjg-datav 九城排序的权威来源；V10 就是为了让 `scenic_spot.region` 对齐这个列表。已知性能项：`PublicTimelineController` 每朝代 4 次查询且返回全量不分页。
- 公开端新增统计口径时，**必须同时套治理过滤**（`content_review.status='published'` 的 `inSql`/`apply` 子查询），否则大屏/首页计数会把待审内容算进去、与列表对不上。`countByRegion`、`categoryStats(region)` 都是这么做的。
- `PublicPoemController:22` 与 `PublicPoemAnalysisController:27` **共用 `/api/public/poems` 基路径**，靠子路由区分（前者 `/` 与 `/{id}`，后者 `/{id}/analysis`）。往其中一个加路由前先看另一个，否则可能启动时 ambiguous mapping 失败。
- `PoemService.list`（`:57-77`）的 region 过滤有非直观语义：命中「景点在该区域的诗」**或**「无景点且诗人出生地 LIKE 该区域」，两者都空时注入 `id = -1` 强制返回空集。V22 的 seed 数据必须遵循同一规则。
- 工作区已按功能拆分提交；后续排查请以当前 `git status` 和提交内容为准，**别拿旧提交的状态推断当前代码**。
- **display-v2 白屏排查顺序**（已实测各成因的区别特征）：
  - **完全纯白、连顶部导航都没有、控制台只有一条 504 `Outdated Optimize Dep` 或红色 `net::ERR_ABORTED`** → Vite 预构建依赖缓存陈旧（`node_modules/.vite/deps` 的 `browserHash` 与页面请求的 `?v=` 不匹配）。这类失败**不会**触发 `main.js` 里的 DEV 红条（红条依赖 Vue 已挂载），所以看起来"什么报错都没有"。解法：停掉 dev server → `rm -rf node_modules/.vite` → 重启。改 `vite.config.js`、切分支、装卸依赖后高发。
  - **顶部导航在、下面整块空白** → 路由组件动态 import 失败（dev 下是 `Failed to fetch dynamically imported module`，生产下是 `assets/MapView-*.js` 404，通常因为 `index.html` 与 assets 不同批次部署）。
  - **一行英文 `Blocked request. This host is not allowed`** → Vite host 校验，往 `server.allowedHosts` 加域名。
  - **页面结构在、只是没数据/图** → 后端或 OSS 问题，不是白屏。后端全挂时首页仍能渲染（文案与配图是前端内置的），只有 console 里几条 `[API] 网络连接失败`。
  - 反例澄清：`file://` 直接双击 `dist/index.html` 必然纯白（构建产物用绝对路径 `/assets/...`，且 module 脚本受 CORS 限制），这不是 bug。

## 工作区维护

- `AGENTS.md` 是项目指导的唯一完整来源；`CLAUDE.md` 引用它，避免重复维护。
- 清理执行记录见 `docs/workspace-maintenance.md`；评测 CLI、文化 seed 生成器、原始交付材料、数据库导出和宣传片工程均有用途，勿仅凭零 import 删除。
- Sites/Railway 部署记录见 `docs/deployment-railway.md` 与 `docs/deployment-state.json`。主干更新不会自动更新当前通过独立 Sites 源码库及 Railway 上传发布的线上版本。

## 2026-10-11 ISO整改运行约束

- V35 用户凭据版本必须先迁移后发布；V36 全文索引可幂等执行，确认 ngram_token_size=2 后设置 RAG_FULLTEXT_ENABLED=true。默认保留 LIKE 兼容路径；JSON赏析和关系检索仍走原过滤逻辑。
- Maven/MyBatis升级使用 Boot4 starter，ServiceImpl 位于 mybatisplus.spring 包；Jackson3 在 tools.jackson 下，annotation 包仍为 com.fasterxml.jackson.annotation。
- 每周 Dependabot；npm run check:security 检查四份 npm 锁文件及 Maven SBOM；不得通过关闭扫描或全局豁免掩盖失败。
- 完整整改状态与尚待线上接入的备份、告警、TLS、发布见 docs/2026-10-11-iso-remediation-results.md 和 docs/security-operations.md。不宣称ISO认证。

## 统一发布

目标与依赖以 `ops/release.json` 为准。根 `npm run release -- <阶段>` 按MySQL备份/TLS→受限V35/V36 pre-deploy→后端健康/同SHA→Sites大屏/后台/主站发布。Sites独立源码内打包shared副本；公开配置、版本标记与journal统一，详情见 `docs/unified-deployment.md`。禁止把Actions artifact当成上线；密钥保留平台变量。历史DB迁移仍需逐环境审核，pre-deploy不会重放V31等素材或内容发布迁移。

- 批量审核可显式传 `allowUnreferenced=true`，以“来源待补充”方式发布；默认及单条发布仍要求来源。未关联来源的公开内容不进入 KnowledgeRetrievalService 的 AI 证据检索，详情页必须显示来源待补充说明。
