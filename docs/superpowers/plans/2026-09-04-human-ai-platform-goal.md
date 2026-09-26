# 齐鲁文脉人文 AI 平台升级 Goal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 SJG 从数字人文展示平台升级为可追溯、可解释、面向教学与研究的人文 AI 探索平台。

**Architecture:** 保留现有 Spring Boot + MyBatis-Plus 后端、Vue 展示端、Vue 管理端和 React 数据大屏。新增一层内容来源与审核模型，把实体数据、证据片段、AI 解释和用户学习成果分开；AI 小文通过结构化实体上下文和证据检索工作，不直接把模型输出当作事实库内容。实施拆成五个可独立验收的子项目，先建立交付基线，再建设可信内容和 AI 能力，最后做教学闭环。

**Tech Stack:** Java 17, Spring Boot 3.2, MyBatis-Plus, MySQL 8, Vue 3, React 19, Vite, Node test runner, JUnit 5, SSE, OpenAI-compatible LLM API。

---

## 0. 目标边界与成功标准

### 产品成功标准

- 用户可以从一首诗、一个诗人、一个景点或一座城市进入探究任务。
- AI 回答能明确区分平台事实、来源证据、模型解释和创作内容。
- 文化条目、历史事件、人物关系和页面实体都能被 AI 检索到。
- 教师可以生成并分享一份“诗词探究任务”，学生可以完成并导出学习成果。
- AI 生成内容默认不进入事实知识库；公开发布必须经过人工审核。

### 工程成功标准

- 三个前端和后端均可在干净环境完成构建。
- 关键 API 有集成测试，AI 检索有离线回归集。
- 数据库迁移可重复执行，并有明确的迁移版本记录。
- AI 请求具备用量、耗时、错误和反馈记录。
- 不破坏现有 `/api/public/**`、管理端鉴权和展示端路由。

### 明确不做

- 第一阶段不引入复杂微前端或 GraphQL。
- 第一阶段不同时开发五个小游戏。
- 第一阶段不把 AI 生成诗歌自动发布为历史文化资料。
- 第一阶段不以更换大模型作为主要质量方案。

---

## 1. 子项目 A：交付与质量基线

**目标:** 让项目在干净环境可安装、可构建、可测试，为后续功能建立可靠反馈回路。

**Files:**
- Create: `/Users/a1/develop/vibecoding/sjg/package.json`
- Create: `/Users/a1/develop/vibecoding/sjg/scripts/verify-all.sh`
- Create: `/Users/a1/develop/vibecoding/sjg/.github/workflows/ci.yml`
- Create: `/Users/a1/develop/vibecoding/sjg/docs/development.md`
- Modify: `/Users/a1/develop/vibecoding/sjg/display-v2/package-lock.json`
- Modify: `/Users/a1/develop/vibecoding/sjg/admin-frontend/package-lock.json`
- Modify: `/Users/a1/develop/vibecoding/sjg/sjg-datav/package-lock.json`
- Test: `/Users/a1/develop/vibecoding/sjg/backend/src/test/java/com/sjg/controller/ApiSmokeTest.java`

- [x] **Step 1: 固定四个子项目的安装和验证命令**
  - 根脚本按顺序执行三个 `npm ci`、`display-v2` 单测、三个前端构建和 `backend/mvn test`。
  - 验证脚本只读取环境，不写入业务数据；失败时输出项目名和失败阶段。

- [x] **Step 2: 修复依赖锁文件与干净安装差异**
  - 在干净临时目录分别执行 `npm ci`。
  - 确认 `hanzi-writer` 和 `ogl` 从 lockfile 安装成功。
  - 不通过修改 Vite external 配置掩盖缺失依赖。

- [x] **Step 3: 增加后端 API 冒烟测试**
  - 使用测试配置启动 Spring 上下文。
  - 覆盖公开列表、公开详情、文化条目过滤、未授权管理写操作四类接口。
  - 外部 LLM 调用使用 stub，不访问真实模型。

- [x] **Step 4: 建立 CI 质量门槛**
  - CI 至少执行 `npm ci`、`npm run test:unit`、三个 `npm run build`、`mvn test` 和 `git diff --check`。
  - CI 不要求连接真实 MySQL、OSS 或 LLM。

**验收:** 新环境下所有依赖可安装；当前已知的本地 `hanzi-writer`/`ogl` 缺失问题消失；CI 能阻止构建、单测或契约测试失败的提交。

**状态（2026-09-04）:** 已完成。`npm run verify:all` 通过；展示端 65 项单测、后端 25 项测试和 4 项 API 冒烟测试均通过。依赖审计仍有既有漏洞和构建体积警告，暂不阻塞本里程碑。

---

## 2. 子项目 B：内容来源、审核与数据治理

**目标:** 把“内容是否可信”从文档约定变成数据库和管理端的真实能力。

**Files:**
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/resources/db/migration/V27__content_provenance.sql`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/entity/SourceDocument.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/entity/ContentSourceLink.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/entity/ContentReview.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/service/ContentReviewService.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/controller/admin/ContentReviewController.java`
- Modify: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/entity/CulturalItem.java`
- Modify: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/service/CulturalItemService.java`
- Modify: `/Users/a1/develop/vibecoding/sjg/admin-frontend/src/views/CulturalList.vue`
- Create: `/Users/a1/develop/vibecoding/sjg/admin-frontend/src/views/SourceDocumentList.vue`

- [x] **Step 1: 定义来源与审核数据模型**
  - `source_document` 保存来源名称、作者/机构、出版年份、URL、版权说明和来源类型。
  - `content_source_link` 以 `entity_type + entity_id` 关联诗人、诗词、景点、事件和文化条目。
  - `content_review` 记录状态、审核人、审核时间和审核备注。
  - 保留现有 `source=ai/manual` 字段作为生成方式，不把它当作事实来源。

- [x] **Step 2: 编写幂等迁移与数据回填策略**
  - 所有新增表使用 `CREATE TABLE IF NOT EXISTS`。
  - 不直接修改现有业务数据；历史内容先标记为 `needs_review`，来源未知时不伪造来源。
  - migration 末尾附带来源缺失统计 SQL。

- [x] **Step 3: 增加管理端审核流转**
  - 支持 `draft -> needs_review -> approved -> published` 和 `published -> archived`。
  - AI 生成内容默认 `needs_review`。
  - 发布操作必须显示来源缺失和未审核字段提示。

- [x] **Step 4: 为公开 API 输出证据摘要**
  - 在不破坏旧字段的前提下，为详情接口增加 `sources` 数组。
  - 每个来源包含名称、年份、URL、关联字段和审核状态。
- 没有来源时返回空数组，不返回虚构的“官方来源”。

**状态（2026-09-04）:** 后端治理 API、AI 内容默认待审核、诗词和文化条目详情的 `sources` 摘要已完成；管理端可视化来源列表和更多实体详情接入仍待后续迭代。

**验收:** 管理员能够查看、关联、审核和发布内容；公开详情能够看到来源；任何 AI 生成内容都有审核状态；现有旧前端不因新增字段失败。

---

## 3. 子项目 C：证据型 AI 与统一 RAG

**目标:** 让 AI 小文真正理解当前页面和完整文化知识，而不是只对三张表做模糊匹配。

**Files:**
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/dto/EntityContext.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/dto/EvidenceSnippet.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/service/KnowledgeRetrievalService.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/service/AiAuditService.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/resources/db/migration/V28__ai_audit.sql`
- Modify: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/dto/ChatRequest.java`
- Modify: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/service/ChatService.java`
- Modify: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/service/RagRetrievalService.java`
- Modify: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/controller/pub/PublicChatController.java`
- Modify: `/Users/a1/develop/vibecoding/sjg/display-v2/src/components/AiChatBox.vue`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/test/java/com/sjg/service/KnowledgeRetrievalServiceTest.java`

- [x] **Step 1: 建立结构化页面上下文**
  - `EntityContext` 至少包含 `type`、`entityId`、`region`、`dynastyId`。
  - 保留现有 `context` 字段的兼容解析。
  - 后端根据 `entityId` 主动查询当前诗、诗人、景点或文化条目，不仅注入页面类型文字。

- [x] **Step 2: 扩展检索域**
  - 检索诗人、诗词、景点、历史事件、文化条目、诗人关系和已审核赏析。
  - 先采用 MySQL 全文索引 + 精确实体/地域/朝代过滤，不立即引入向量数据库。
  - `LIKE` 作为兼容回退，不再作为唯一检索路径。

- [x] **Step 3: 定义证据片段协议**
  - 每个片段包含 `entityType`、`entityId`、`title`、`snippet`、`sourceIds`、`score`。
  - 排序优先级为当前页面实体 > 精确实体匹配 > 地域/朝代过滤 > 文本相关度。
  - 输出最多 6 个片段，并限制总字符数，避免把检索结果无界塞进 prompt。

- [x] **Step 4: 改造 SSE 事件协议**
  - 增加命名事件：`evidence`、`delta`、`done`、`error`。
  - `evidence` 事件只发送来源摘要，不发送敏感配置和完整内部字段。
  - 前端同时兼容旧的无名 `data` 事件，完成平滑迁移。

- [ ] **Step 5: 增加 AI 审计和反馈**
  - [x] 记录请求上下文、检索实体数量、模型、耗时和错误类型；客户端标识仅保存 SHA-256。
  - [x] 增加“有帮助/无帮助”和“事实有误”反馈接口，前端保存 `auditId` 并提供反馈操作。
  - [ ] 限流从未验证的 `X-Forwarded-For` 和进程内 map 迁移到可信代理 IP + Redis/Caffeine 方案；第一版至少抽成统一限流服务。

- [x] **Step 6: 前端展示依据与边界**
  - AI 小文消息下方显示“本次依据”折叠区。
  - 无证据时明确提示“平台暂未收录相关资料”，不伪装成权威回答。
- AI 写诗和 AI 赏析显示不同的内容类型标签。

**状态（2026-09-04）:** 上下文解析、实体检索、证据摘要、SSE 命名事件、展示端依据折叠区、AI 审计记录和反馈接口已完成；可信代理限流及更多详情实体接入仍待后续迭代。

**验收:** 在城市、诗人、诗词、景点和文化详情页提问时，AI 能使用对应实体上下文；文化条目和事件可被检索；回答可查看依据；离线检索测试覆盖命中、无命中和错误降级。

---

## 4. 子项目 D：诗词探究教学闭环

**目标:** 用一个可完成、可分享、可评价的学习流程证明“AI + 数字人文 + 教学应用”的价值。

**推荐 MVP:** “一城一课：诗词文学景观探究任务”。首批选择济南或泰安，控制在 3 首诗、3 个地点、1 条历史时间线内。

**Files:**
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/resources/db/migration/V29__learning_tasks.sql`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/entity/LearningTask.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/entity/LearningSubmission.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/service/LearningTaskService.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/controller/pub/PublicLearningTaskController.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/controller/admin/LearningTaskAdminController.java`
- Create: `/Users/a1/develop/vibecoding/sjg/display-v2/src/views/LearningTaskView.vue`
- Create: `/Users/a1/develop/vibecoding/sjg/display-v2/src/components/learning/EvidenceStep.vue`
- Create: `/Users/a1/develop/vibecoding/sjg/display-v2/src/components/learning/CompareStep.vue`
- Create: `/Users/a1/develop/vibecoding/sjg/display-v2/src/components/learning/ReflectionStep.vue`
- Modify: `/Users/a1/develop/vibecoding/sjg/display-v2/src/router/index.js`
- Modify: `/Users/a1/develop/vibecoding/sjg/display-v2/src/components/AiChatBox.vue`

- [x] **Step 1: 定义任务内容结构**
  - 任务由目标、背景、证据资源、问题步骤、参考答案要点和导出模板组成。
  - 每个问题绑定实体 ID 和来源 ID，不允许只保存一段自由文本。
  - 题目分为事实识别、证据比较、个人解释三类。

- [x] **Step 2: 实现公开任务读取和匿名草稿**
  - 任务可通过短 ID 分享。
  - 学生未登录时使用浏览器本地草稿，完成时以匿名会话哈希同步到 `learning_submission`。
  - 不在第一版引入复杂班级、成绩和社交系统。

- [x] **Step 3: 实现三个学习步骤**
  - 证据步骤：查看任务绑定的诗句、人物、地点或来源摘要。
  - 比较步骤：比较两份材料，并要求引用证据。
  - 反思步骤：用户提交自己的判断，AI 只提供反馈和遗漏证据，不直接代写答案。

- [x] **Step 4: 实现学习成果导出**
  - 生成包含题目、用户答案、引用来源和 AI 反馈的 Markdown 文档。
  - 页面保留现有水墨视觉，但学习内容优先于装饰。

- [x] **Step 5: 管理端维护任务**
  - 管理员可编辑问题 JSON、绑定证据、发布、下架和删除任务。
  - 发布前检查：每题至少一个正整数实体 ID 和来源 ID，三种步骤各出现一次。
  - 后续增强：校验实体/来源实际存在，并提供任务复制操作。

**状态（2026-09-05）:** 任务模型、公开读取、匿名草稿同步、三步学习页面、反思 AI 反馈、Markdown 成果导出和管理端编辑/发布已完成；首批真实济南/泰安任务内容、实体/来源存在性校验和任务复制仍待内容运营阶段补齐。

**验收:** 用户可以从 `/learn/:taskCode` 完成一次完整任务；每个答案都能回到证据；刷新后草稿可恢复；可导出学习成果；管理员可以发布和撤回任务。

---

## 5. 子项目 E：AI 评估、观测与旗舰互动体验

**目标:** 让 AI 质量可以被持续衡量，再决定是否扩展小游戏和更复杂的模型能力。

**Files:**
- Create: `/Users/a1/develop/vibecoding/sjg/docs/ai-evaluation-set.json`
- Create: `/Users/a1/develop/vibecoding/sjg/docs/ai-evaluation.md`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/test/java/com/sjg/ai/AiEvaluationFixtureTest.java`
- Create: `/Users/a1/develop/vibecoding/sjg/backend/src/main/java/com/sjg/service/AiMetricsService.java`
- Modify: `/Users/a1/develop/vibecoding/sjg/backend/src/main/resources/application.yml`
- Modify: `/Users/a1/develop/vibecoding/sjg/admin-frontend/src/views/Layout.vue`

- [x] **Step 1: 建立离线评估集**
  - 至少 50 个问题，覆盖人物、诗词、景点、城市、文化条目、历史事件、关系、无资料问题和页面上下文。
  - 每题保存期望命中实体、必须引用的来源、禁止出现的事实和允许的“不知道”。

- [x] **Step 2: 定义质量指标**
  - 证据命中率、引用覆盖率、无依据断言率、上下文命中率、平均响应时间、错误率和用户有帮助率。
  - 每次 prompt、检索器或模型变更都运行回归。

- [x] **Step 3: 增加运营观测**
  - 管理端查看请求量、错误、平均耗时、限流次数、无证据问题和用户负反馈。
  - 任何日志不得记录 API key、完整 Authorization header 或不必要的个人信息。

- [x] **Step 4: 选择一个旗舰互动体验**
  - 教学主线完成前，不并行开发五个小游戏。
  - 若教学效果优先，直接把“诗词探究任务”作为旗舰互动产品。
  - 若需要面向公众的传播样板，再基于现有 `CraftWorkshop.vue` 做东昌葫芦工艺工坊，并复用既有 Three.js 工序状态机。

**状态（2026-09-05）:** 已建立 54 题结构化评估集、指标定义、AI 审计指标接口和管理端概览；东昌葫芦工坊补齐工序完成态和探索记录导出。当前已具备可重复的结构/运行观测基础，但尚未接入真实模型批量回归，旗舰体验的内容效果仍需人工走查。

**验收:** 有固定评估集和可重复结果；管理员能看到 AI 运行健康度；旗舰体验有明确用户目标、完成状态和成果产出，而不是只有动画展示。

---

## 6. 阶段顺序与里程碑

### Milestone 1：可交付基线（1 周）

- 完成子项目 A。
- 目标：干净环境安装、三个前端构建、后端测试和 API 冒烟全部通过。

### Milestone 2：可信内容底座（2 周）

- 完成子项目 B 的数据模型、迁移和文化条目审核流。
- 目标：至少 20 条核心内容完成来源关联和人工审核；新 AI 内容默认进入待审核状态。

### Milestone 3：证据型 AI（2-3 周）

- 完成子项目 C 的实体上下文、统一检索、证据 SSE 和反馈。
- 目标：54 个评估问题中，证据命中率达到 90% 以上，无依据断言率低于 10%。

### Milestone 4：教学闭环（2-3 周）

- 完成子项目 D 的一城一课 MVP 框架。
- 当前已支持公开分享、草稿恢复、证据浏览、比较、反思 AI 反馈和成果导出。
- 待内容运营：录入首批济南或泰安真实任务，并完成实体/来源存在性校验。

### Milestone 5：评估与旗舰体验（1-2 周）

- 完成子项目 E 的工程基础。
- 当前已支持评估集校验、运行指标概览和东昌葫芦旗舰体验成果导出。
- 待完成：连接真实模型执行 50+ 题回归，记录实际命中率/断言率，并完成桌面与移动端人工走查。

---

## 7. 每阶段统一验收清单

- [ ] 代码、迁移、测试和文档属于同一个提交边界。
- [ ] 后端 `mvn test` 通过。
- [ ] `display-v2` 的 `npm run test:unit` 和 `npm run build` 通过。
- [ ] 修改了 `admin-frontend` 或 `sjg-datav` 时，分别执行对应构建。
- [ ] API 返回保持 `{ code, message, data }` 兼容，新增字段不破坏旧客户端。
- [ ] 公开内容只返回已发布记录。
- [ ] AI 输出不会被写入事实知识库，除非经过审核流转。
- [ ] 至少完成一次桌面和移动端人工走查。
- [ ] 更新对应阶段文档，记录数据量、来源覆盖率、AI 评估结果和已知限制。

## 8. 首批执行任务（历史记录）

以下任务已在 2026-09-04 至 2026-09-05 完成，保留在计划中作为决策依据，不再作为当前待办：

1. 处理依赖安装和三个前端构建基线。
2. 设计并评审 `V27__content_provenance.sql`。
3. 建立内容来源、审核、证据检索和 AI 审计模型。
4. 设计 `EntityContext` 和 `EvidenceSnippet` API 契约。
5. 准备 54 条 AI 评估问题，并建立指标概览页。

这些任务完成后，项目已具备继续做真实内容运营和质量验证的工程基础。

## 9. 当前执行计划（2026-09-05 起）

本阶段按“先保证发布正确性，再补运营能力，最后用真实内容和真实模型验收”的顺序推进。每个任务都应独立提交并在提交前执行对应测试；不在真实内容和评估结果出来前把 Goal 标记为完成。

### Task 9.1：任务发布的实体与来源存在性校验

**Files:**
- Modify: `backend/src/main/java/com/sjg/service/LearningTaskService.java`
- Modify: `backend/src/main/java/com/sjg/mapper/SourceDocumentMapper.java`（仅在需要增加批量查询方法时修改）
- Use: `backend/src/main/java/com/sjg/mapper/PoetMapper.java`, `PoemMapper.java`, `ScenicSpotMapper.java`, `CulturalItemMapper.java`, `EventMapper.java`
- Test: `backend/src/test/java/com/sjg/service/LearningTaskServiceTest.java`

- [x] **Step 1: 为发布校验补充失败用例**
  - 为不存在的 `entityIds` 增加测试，期望异常信息包含实体类型和 ID。
  - 为不存在的 `sourceIds` 增加测试，期望异常信息包含来源 ID。
  - 为草稿文化条目或未审核内容增加测试，期望发布失败。
  - 保留现有三步结构、`prompt`、正整数校验用例。

- [x] **Step 2: 注入各领域 Mapper 并建立类型白名单**
  - 支持 `poet`、`poem`、`spot`/`scenic_spot`、`cultural_item`、`event` 五种任务实体类型。
  - 优先使用 `entityRefs: [{ type, id }]` 支持一道题绑定不同类型实体；兼容单类型的 `entityType + entityIds`。
  - 对每个 ID 使用 `selectById` 或批量查询确认记录存在；未知 `entityType` 直接拒绝发布。
  - 所有 `sourceIds` 必须在 `source_document` 中存在。

- [x] **Step 3: 检查公开可用状态**
  - `cultural_item` 必须为 `published`，其他实体必须通过现有公开查询约束；不能引用已归档或未审核内容。
  - 错误信息必须指出具体问题，不能只返回“发布失败”。

- [x] **Step 4: 运行后端定向测试和全量测试**
  - 运行 `cd backend && mvn -q -Dtest=LearningTaskServiceTest test`，预期全部通过。
  - 运行 `cd backend && mvn -q test`，预期无回归。

**Task 9.1 状态（2026-09-05）:** 已完成。发布校验已覆盖实体存在性、来源存在性、文化条目发布状态、审核状态和混合 `entityRefs`；定向测试与后端全量测试通过。

### Task 9.2：学习任务复制能力

**Files:**
- Modify: `backend/src/main/java/com/sjg/service/LearningTaskService.java`
- Modify: `backend/src/main/java/com/sjg/controller/admin/LearningTaskAdminController.java`
- Modify: `admin-frontend/src/views/LearningTaskList.vue`
- Test: `backend/src/test/java/com/sjg/service/LearningTaskServiceTest.java`

- [x] **Step 1: 定义复制契约**
  - 新增 `POST /api/admin/learning-tasks/{id}/copy`。
  - 复制标题、城市、目标、背景、任务 JSON 和导出模板；新任务状态强制为 `draft`。
  - 自动生成不冲突的 `taskCode`，规则为原 code 加 `-copy-` 和 6 位小写随机串。
  - 不复制提交记录、审核时间和原任务 ID。

- [x] **Step 2: 写服务层测试**
  - 覆盖复制已发布任务、复制不存在任务、生成唯一草稿 code 三种情况。

- [x] **Step 3: 增加管理端操作**
  - 在任务行操作中增加“复制”命令，成功后刷新列表并打开新草稿的编辑框。
  - 复制失败时展示后端返回的具体错误。

- [x] **Step 4: 验证接口与构建**
  - 运行定向测试、`mvn test` 和 `npm --prefix admin-frontend run build`。

**Task 9.2 状态（2026-09-05）:** 已完成。新增复制接口和管理端操作，复制结果为独立草稿且不复制学习提交；服务层测试和管理端构建通过。

### Task 9.3：统一可信代理限流

**Files:**
- Create: `backend/src/main/java/com/sjg/service/RateLimitService.java`
- Create: `backend/src/main/java/com/sjg/service/InMemoryRateLimitService.java`
- Modify: `backend/src/main/java/com/sjg/service/ChatService.java`
- Modify: `backend/src/main/java/com/sjg/controller/pub/PublicChatController.java`
- Modify: `backend/src/main/java/com/sjg/controller/pub/PublicLearningTaskController.java`
- Modify: `backend/src/main/java/com/sjg/controller/pub/PublicAiPoemController.java`
- Modify: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/com/sjg/service/InMemoryRateLimitServiceTest.java`, `backend/src/test/java/com/sjg/controller/ClientIpResolverTest.java`

- [x] **Step 1: 抽象限流接口**
  - 定义 `boolean tryAcquire(String key, int limit, Duration window)`。
  - 内存实现必须有过期清理和最大 key 数，避免当前 `ConcurrentHashMap` 无限增长。

- [x] **Step 2: 固定客户端 IP 解析策略**
  - 默认只使用 `HttpServletRequest.getRemoteAddr()`。
  - 仅当 `server.trusted-proxies` 配置匹配请求来源时，才解析 `X-Forwarded-For`/`X-Real-IP`；未配置时忽略这些头。
  - 将解析逻辑放入一个可测试的组件，三个公开控制器复用同一实现。

- [x] **Step 3: 迁移 ChatService 和其他 AI 入口**
  - 删除 `ChatService` 私有 `rateMap` 和 `checkRate`。
  - Chat、学习任务反馈、AI 写诗都使用统一服务；限流失败仍返回现有中文错误语义。

- [x] **Step 4: 预留多实例实现边界**
  - 第一版使用有界内存实现，不在没有基础设施配置时强行引入 Redis。
  - 在 `application.yml` 写明后续可替换为 Caffeine/Redis 的配置键和默认值。

- [x] **Step 5: 验证安全回归**
  - 测试伪造 `X-Forwarded-For` 不会绕过默认限流，可信代理配置生效时才采用转发地址。
  - 运行 `cd backend && mvn -q -Dtest=InMemoryRateLimitServiceTest,ClientIpResolverTest,ApiSmokeTest test`。

**Task 9.3 状态（2026-09-05）:** 已完成。聊天、学习反馈和 AI 写诗共用有界内存限流与可信代理解析；伪造转发头默认无效。定向测试和冒烟测试通过。多实例 Redis/Caffeine 适配仍保留为后续容量升级项。

### Task 9.4：首批真实“一城一课”内容运营

**Artifacts:**
- Create: `docs/content/first-learning-task.md`
- Create: `docs/content/first-task-source-ledger.csv`
- Modify: `docs/learning-task-example.json`（仅在任务结构契约发生调整时）
- Data: 通过管理端来源、实体和任务接口录入，不把环境相关自增 ID 写死进代码迁移。

- [ ] **Step 1: 选择城市和范围**
  - 首批只选济南或泰安一个城市。
  - 内容范围固定为 3 首诗、3 个地点、1 条历史时间线，避免任务变成资料堆积。

- [ ] **Step 2: 建立来源台账**
  - 每条材料记录题名、作者/机构、出版年份、标识信息、URL 或馆藏信息、版权说明和可引用页码。
  - 来源必须先进入 `source_document`，再与实体建立 `content_source_link` 关联。

- [ ] **Step 3: 完成人工审核**
  - 对诗词、人物、地点、历史事件和文化条目逐项确认公开状态与来源关联。
  - AI 生成内容只能作为草稿素材，不能直接作为任务证据。

- [ ] **Step 4: 编写可完成任务**
  - `evidence` 步骤让学生定位事实，`compare` 步骤要求引用两条不同来源，`reflection` 步骤只要求自己的判断和证据链。
  - 每题绑定真实 `entityIds` 和 `sourceIds`，并用发布接口校验通过后再发布。

- [ ] **Step 5: 记录内容验收数据**
  - 台账记录实体数、来源数、来源覆盖率、审核人和发布日期。
  - 通过 `/learn/:taskCode` 完成一次匿名任务并导出 Markdown，保存人工检查结果。

**Task 9.4 状态（2026-09-05）:** 未开始录入。当前工作区没有可用的 MySQL 客户端，归档数据库备份也不在文件系统内，无法核验环境相关的实体 ID 和审核状态；在获得数据库访问后按本任务执行，不使用占位 ID 冒充真实内容。

### Task 9.5：真实 AI 回归评估

**Files:**
- Create: `scripts/run-ai-eval.sh`
- Create: `scripts/ai-eval.mjs`
- Create: `scripts/ai-eval-cli.mjs`
- Test: `scripts/ai-eval.test.mjs`
- Modify: `docs/ai-evaluation.md`
- Modify: `scripts/verify-all.sh`
- Modify: `backend/src/test/java/com/sjg/ai/AiEvaluationFixtureTest.java`（增加真实运行开关时）
- Use: `docs/ai-evaluation-set.json`

- [x] **Step 1: 增加显式开关和前置检查**
  - 只有设置 `SJG_AI_EVAL_ENABLED=true` 且存在 LLM 配置时才调用真实模型。
  - 未配置密钥时只运行结构校验，脚本明确输出“跳过真实模型评估”，不伪造结果。

- [x] **Step 2: 准备 54 题回归执行器并记录原始结果**
  - 每题保存命中实体、引用来源、是否出现禁止事实、上下文是否命中、耗时和错误类型。
  - 结果文件放在本地评估目录，不提交 API key、完整提示词中的个人信息或敏感响应头。

- [ ] **Step 3: 执行 54 题真实回归并记录结果**
  - 仅在真实数据库、后端服务和 LLM 配置就绪后执行 `scripts/run-ai-eval.sh`。
  - 运行结果必须保存 54 题逐题明细和聚合指标，不以空环境或模拟响应代替。

- [ ] **Step 4: 计算并判定指标**
  - 证据命中率目标 `>= 90%`，引用覆盖率目标 `>= 85%`，无依据断言率 `< 10%`，上下文命中率 `>= 90%`。
  - 任何指标未达标时，先定位是数据缺口、检索排序还是提示词问题，再决定是否改模型。

- [ ] **Step 5: 更新管理端观测说明**
  - 在 `docs/ai-evaluation.md` 记录运行时间、模型、样本版本、指标和失败题号。
  - 管理端 `/ai-metrics` 只展示聚合结果，不展示敏感请求内容。

**Task 9.5 状态（2026-09-05）:** 评估执行器、SSE 解析、逐题指标汇总、质量门槛和本地结果落盘已完成并接入 `npm run verify:all`；真实 54 题运行仍等待业务数据库和 LLM 配置。

### Task 9.7：公开 AI 审核态隔离

**Files:**
- Modify: `backend/src/main/java/com/sjg/service/KnowledgeRetrievalService.java`
- Modify: `backend/src/main/java/com/sjg/service/ChatService.java`
- Test: `backend/src/test/java/com/sjg/service/KnowledgeRetrievalServiceTest.java`
- Test: `backend/src/test/java/com/sjg/service/ChatServiceProvenanceTest.java`

- [x] **Step 1: 关闭统一检索器存在时的旧版 RAG 回退**
  - `ChatService` 只有在兼容构造器未注入 `KnowledgeRetrievalService` 时才使用旧版 `RagRetrievalService`。
  - 生产 Spring 注入路径始终优先走带来源链的统一检索。

- [x] **Step 2: 过滤未发布实体**
  - `KnowledgeRetrievalService` 通过 `content_review` 查询实体审核状态。
  - 仅 `published` 记录进入公开证据；缺失审核记录或查询异常均排除。
  - 单测覆盖 `needs_review` 排除和 `published` 保留。

- [x] **Step 3: 验证回归**
  - 覆盖“统一检索无结果时不注入旧版未审核资料”的编排测试。
  - 运行后端全量测试和 `npm run verify:all`。

**Task 9.7 状态（2026-09-05）:** 已完成。公开 AI 的检索与回退均受审核状态和来源链约束；定向测试及 `npm run verify:all` 均通过，后端测试共 63 项通过。

### Task 9.6：桌面/移动端人工走查

**Scope:** `display-v2` `/learn/:taskCode`、`display-v2` `/crafts`、`admin-frontend` `/learning-tasks` 和 `/ai-metrics`

- [ ] **Step 1: 启动本地服务并准备测试数据**
  - 使用已有开发脚本启动展示端、管理端和后端；端口冲突时改用未占用端口。
  - 准备一个已发布真实任务、一个草稿任务和一条有证据的 AI 对话。

- [ ] **Step 2: 桌面端走查**
  - 检查路由进入、步骤切换、证据展开、反思 SSE 成功/失败、草稿恢复、Markdown 导出、复制/发布/下架和指标页筛选。

- [ ] **Step 3: 移动端走查**
  - 使用窄屏检查长标题、来源列表、按钮、文本输入、步骤导航和错误提示是否溢出或遮挡。
  - 检查刷新后仍能恢复草稿，导出操作有明确成功反馈。

- [ ] **Step 4: 记录并修复阻塞问题**
  - 在 `docs/ai-evaluation.md` 追加走查日期、视口、结果和已知限制。
  - 发现阻塞问题必须修复并重新运行 `npm run verify:all`。

## 10. Goal 完成门槛

只有全部条件满足后，才将 Goal 标记为完成：

- [ ] 任务发布会拒绝不存在、未发布或未审核的实体/来源；复制任务生成独立草稿。
- [ ] 公开 AI 入口共用可信代理限流，伪造转发头不能绕过限制。
- [ ] 至少一条济南或泰安真实任务已发布，包含 3 首诗、3 个地点、1 条时间线和可核验来源台账。
- [ ] 54 题真实模型回归完成，证据命中率 `>= 90%`、引用覆盖率 `>= 85%`、无依据断言率 `< 10%`、上下文命中率 `>= 90%`；任一指标未达标时 Goal 保持 active。
- [ ] 学习任务、葫芦工坊和管理端新增页面完成桌面与移动端人工走查。
- [ ] `npm run verify:all`、`git diff --check` 和对应的数据库迁移检查全部通过。
- [ ] 文档记录数据量、来源覆盖率、评估结果、人工走查结果和已知限制。

## 11. 推荐路线执行摘要（2026-09-05）

当前 Goal 按以下依赖顺序执行：

`可用数据库/LLM 配置 -> 首批真实“一城一课” -> 54 题真实 AI 回归 -> 桌面/移动端人工走查 -> 关闭检查`。

### 当前已完成

- 工程基线：依赖安装、三个前端构建、后端测试、API 冒烟和 CI 质量门槛。
- 可信内容底座：来源、审核、发布约束和公开详情来源摘要。
- 证据型 AI：结构化上下文、统一检索、证据 SSE、审计、反馈和可信代理限流。
- 教学与运营框架：学习任务三步流程、匿名草稿、成果导出、任务复制、54 题评估集和 AI 指标页。

### 当前待执行

1. **真实内容运营**：只选择济南或泰安一个城市，录入 3 首诗、3 个地点、1 条时间线及可核验来源台账；发布前使用现有实体/来源/审核校验。
2. **真实模型回归**：显式开启后运行 54 题，保存原始结果和失败题号，按既定四项阈值判定，不以结构测试代替真实质量。
3. **人工走查**：在真实服务和真实数据下走查 `/learn/:taskCode`、`/crafts`、`/learning-tasks`、`/ai-metrics` 的桌面与移动端主流程。
4. **关闭检查**：复核构建、测试、迁移、兼容性、来源覆盖率、AI 指标和走查记录；全部满足后再将 Goal 标记为完成。

详细的阶段清单、交付物和阻塞条件同步维护在仓库根目录的 `task_plan.md`、`findings.md` 和 `progress.md`。

## 12. 阶段 1 前置质量门（2026-09-05）

为避免真实内容运营时把模板或测试数据带入发布流程，新增离线任务内容检查器：

- `scripts/learning-task-check.mjs`：检查任务 JSON 的三步结构、实体/来源绑定、比较题材料数量和未替换占位文本。
- `scripts/learning-task-check.test.mjs`：5 项 Node 测试覆盖有效任务、步骤重复、非法绑定、比较题不足和占位文本。
- `npm run test:learning-task`：已接入 `scripts/verify-all.sh`，每次统一验证都会运行。

该检查器不查询数据库，不能替代发布接口对实体存在性、来源存在性、审核状态和公开状态的校验；两道门必须都通过后才能发布真实任务。

## 13. 内容治理工作台（2026-09-05）

为使来源与审核治理真正可运营，新增统一管理端工作台，设计见 [内容来源与审核工作台设计](../specs/2026-09-05-content-governance-workbench-design.md)。

- [x] 后端补齐来源编辑、实体来源查询、实体存在性校验和重复关联拦截。
- [x] 管理端新增 `/content-governance`，包含来源文献、实体关联、审核队列三个标签页。
- [x] 路由、侧栏、响应式表单和审核状态操作接入现有管理端。
- [x] 服务层定向测试和管理端构建通过。
- [ ] 在真实数据库下录入首批来源并完成桌面/移动端人工走查。

该工作台解决“有治理接口但无法运营”的缺口；真实来源、实体和审核结果仍是阶段 0/1 的外部验收内容。
